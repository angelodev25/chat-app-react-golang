package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/middleware"
	"github.com/gofiber/websocket/v2"
)

type Client struct {
	ID         string
	UserID     string
	ChatID     string
	Conn       *websocket.Conn
	MessagesDB *sql.DB
	Send       chan []byte
}

type ChatsHub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Rooms      map[string]map[string]*Client
	Mu         sync.RWMutex
}

func NewChatsHub() *ChatsHub {
	return &ChatsHub{
		Clients:    make(map[string]*Client),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Rooms:      make(map[string]map[string]*Client),
	}
}

func (h *ChatsHub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.ID] = client
			if _, ok := h.Rooms[client.ChatID]; !ok {
				h.Rooms[client.ChatID] = make(map[string]*Client)
			}
			h.Rooms[client.ChatID][client.ID] = client
			log.Printf("Cliente registrado - ID: %s, User: %s, Chat: %s",
				client.ID[:8], client.UserID, client.ChatID)
			log.Printf("   Total clientes: %d, En sala %s: %d",
				len(h.Clients), client.ChatID, len(h.Rooms[client.ChatID]))
		case client := <-h.Unregister:
			if client, ok := h.Clients[client.ID]; ok {
				delete(h.Clients, client.ID)
				delete(h.Rooms[client.ChatID], client.ID)
				client.MessagesDB.Close()
				close(client.Send)
			}
		}
	}
}

func generateClientID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func (h *ChatsHub) Connect(conn *websocket.Conn) {
	chatId := conn.Params("chatId")
	tokenString := conn.Query("token")

	if tokenString == "" {
		conn.WriteMessage(websocket.CloseMessage, []byte("No hay token de autorizacion"))
		conn.Close()
		return
	}

	userId, _, err := middleware.ExtractClaims(tokenString)
	if err != nil {
		conn.WriteMessage(websocket.CloseMessage, []byte("Token inválido"))
		conn.Close()
		return
	}

	userDB, err := database.InitMessagesDB(userId)
	if err != nil {
		log.Println("Error al cargar DB de mensajes: ", err)
		conn.WriteMessage(websocket.CloseMessage, []byte("Error de base de datos"))
		conn.Close()
		return
	}

	client := &Client{
		ID:         generateClientID(),
		UserID:     userId,
		ChatID:     chatId,
		Conn:       conn,
		MessagesDB: userDB,
		Send:       make(chan []byte, 256),
	}

	h.Register <- client

	conn.SetReadLimit(4096)
	conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	go h.writeMessage(client)
	h.readMessage(client)
}

func (h *ChatsHub) writeMessage(client *Client) {
	ticker := time.NewTicker(30 * time.Second)

	go func() {
		defer func() {
			defer ticker.Stop()
			h.Unregister <- client
			client.Conn.Close()
		}()

		for {
			select {
			case message, ok := <-client.Send:
				if !ok {
					client.Conn.WriteMessage(websocket.CloseMessage, []byte{})
					return
				}

				client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
					return
				}

			case <-ticker.C:
				client.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
				if err := client.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
					return
				}
			}
		}
	}()
}

func (h *ChatsHub) readMessage(client *Client) {
	defer func() {
		h.Unregister <- client
		client.Conn.Close()
	}()

	for {
		_, msg, err := client.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error lectura cliente %s: %v", client.ID[:8], err)
			}
			break
		}

		var incoming struct {
			Code       string `json:"code"`
			Content    string `json:"content"`
			TargetUser string `json:"target"`
		}
		if err := json.Unmarshal(msg, &incoming); err != nil {
			log.Println("Error parseando mensaje: ", err)
			return
		}

		switch incoming.Code {
		case "send":
			go h.SaveMessage(client, incoming.Content, incoming.TargetUser)
		case "readed":
			go h.MarkMessagesAsReaded(client.UserID, client.ChatID)
		case "delete-all":
			go h.DeleteMessageForBothUsers(client.ChatID, incoming.Content, incoming.TargetUser)
		case "delete-single":
			go h.DeleteMessageForSingleUser(client.ChatID, incoming.Content, client)
		}
	}
}
