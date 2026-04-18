package services

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/angedev25/chat-backend/middleware"
	"github.com/angedev25/chat-backend/models"
	"github.com/gofiber/websocket/v2"
)

type InfoChannel struct {
	UserID string
	Chat   *models.ChatWithOtherUser
}

type UsersHub struct {
	UsersOnline map[string]*websocket.Conn
	Add         chan InfoChannel
	Remove      chan models.Chat
	mu          sync.RWMutex
}

func NewUsersHub() *UsersHub {
	return &UsersHub{
		UsersOnline: make(map[string]*websocket.Conn),
		Add:         make(chan InfoChannel),
		Remove:      make(chan models.Chat),
	}
}

func (u *UsersHub) Listen() {
	for {
		select {
		case data := <-u.Add:
			go u.SendChatToClient(data)
		case chat := <-u.Remove:
			go u.SendDeleteChat(chat)
		}
	}
}

func (u *UsersHub) SetOnline(conn *websocket.Conn) {
	tokenString := conn.Query("token")
	if tokenString == "" {
		log.Println("token vacio: ", tokenString)
		conn.WriteMessage(websocket.CloseMessage, []byte("No hay token de autorizacion"))
		conn.Close()
		return
	}

	userId, _, err := middleware.ExtractClaims(tokenString)
	if err != nil {
		log.Println("token mal formado: ", tokenString, " - ", err)
		conn.WriteMessage(websocket.CloseMessage, []byte("Token inválido"))
		conn.Close()
		return
	}

	u.mu.Lock()
	u.UsersOnline[userId] = conn
	u.mu.Unlock()

	log.Println("Usuario añadido en linea")

	defer func() {
		u.mu.Lock()
		delete(u.UsersOnline, userId)
		u.mu.Unlock()
		conn.Close()
		log.Printf("Usuario %s desconectado del hub de chats", userId)
	}()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error leyendo mensajes: ", err)
			break
		}
	}

}

func (u *UsersHub) SendChatToClient(data InfoChannel) {
	if userConn, ok := IsOnline(data.UserID); ok {
		parsed, err := json.Marshal(data)
		if err != nil {
			log.Println("Error parseando struct InfoChannel: ", err)
			return
		}
		userConn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		if err := userConn.WriteMessage(websocket.TextMessage, parsed); err != nil {
			log.Println("Error al enviar informacion: ", err)
			return
		}
	} else {
		log.Println("El usuario no esta en linea")
	}
}

func (u *UsersHub) SendDeleteChat(chat models.Chat) {
	users := []string{chat.UserOne, chat.UserTwo}

	for _, id := range users {
		u.mu.RLock()
		conn, ok := IsOnline(id)
		u.mu.RUnlock()
		if ok && conn != nil {
			data := struct {
				Code string      `json:"code"`
				Chat models.Chat `json:"chat"`
			}{Code: "delete", Chat: chat}

			marshaled, err := json.Marshal(data)
			if err != nil {
				log.Println("Error convirtiendo a json: ", err)
				break
			}

			conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err = conn.WriteMessage(websocket.TextMessage, marshaled); err != nil {
				log.Printf("Error enviando mensaje a %s: %v", id, err)
				u.mu.Lock()
				delete(u.UsersOnline, id)
				u.mu.Unlock()
				continue
			}
		} else {
			log.Println("Conexion nula")
		}
	}
}
