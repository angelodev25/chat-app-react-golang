package services

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/models"
	"github.com/angedev25/chat-backend/utils"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

func SaveMessage(hub *ChatsHub, sender *Client, content, targetUser string) {
	message := models.Message{
		ID:        uuid.NewString(),
		ChatID:    sender.ChatID,
		SenderID:  sender.UserID,
		Content:   content,
		Timestamp: time.Now(),
		Readed:    true,
	}

	var isThere = false

	outgoing, _ := json.Marshal(message)
	hub.Mu.RLock()
	room, ok := hub.Rooms[sender.ChatID]
	hub.Mu.RUnlock()
	if ok {
		for _, client := range room {
			if client.UserID == targetUser {
				isThere = true
			}
			go func(db *sql.DB) {
				query := `INSERT INTO messages (id, chat_id, sender_id, content, timestamp, readed) VALUES ($1, $2, $3, $4, $5, $6)`
				_, err := db.Exec(query, message.ID, message.ChatID, message.SenderID, message.Content, message.Timestamp, message.Readed)
				if err != nil {
					log.Printf("Error al guardar mensaje para usuario: %s, error: %v", client.UserID, err)
				}
			}(client.MessagesDB)
			select {
			case client.Send <- outgoing:
			default:
				log.Println("Buffer lleno del client: ", client.ID[:8])
			}
		}
		if !isThere {
			go SendMessageToDisconnected(targetUser, message)
		}
	}
}

func SendMessageToDisconnected(userId string, message models.Message) {
	userDir, _, err := utils.InitUserDir(userId)
	if err != nil {
		log.Println("Error al obtener el directorio: ", err)
		return
	}

	userDB, err := database.InitMessagesDB(userDir)
	if err != nil {
		log.Println("Error al abrir base de datos: ", err)
		return
	}

	query := `INSERT INTO messages (id, chat_id, sender_id, content, timestamp) VALUES ($1, $2, $3, $4, $5)`
	_, err = userDB.Exec(query, message.ID, message.ChatID, message.SenderID, message.Content, message.Timestamp)
	if err != nil {
		log.Printf("Error al guardar mensaje para usuario desconectado: %s, error: %v\n", userId, err)
		return
	}

	log.Println("Mensaje guardado correctamente para usuario fuera de linea.")

	if conn, ok := IsOnline(userId); ok {
		data := struct {
			Code    string         `json:"code"`
			Message models.Message `json:"message"`
		}{Code: "message", Message: message}

		marshaled, err := json.Marshal(data)
		if err != nil {
			log.Println("Error convirtiendo a json: ", err)
			return
		}

		conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
		if err := conn.WriteMessage(websocket.TextMessage, marshaled); err != nil {
			return
		}
	}

}

func MarkMessagesAsReaded(userId, chatId string) {
	userDir, _, err := utils.InitUserDir(userId)
	if err != nil {
		log.Println("Error al obtener el directorio: ", err)
		return
	}

	userDB, err := database.InitMessagesDB(userDir)
	if err != nil {
		log.Println("Error al abrir base de datos: ", err)
		return
	}
	defer userDB.Close()

	query := `UPDATE messages SET readed = true WHERE chat_id = $1`
	_, err = userDB.Exec(query, chatId)
	if err != nil {
		log.Printf("Error al marcar mensajes como leídos para usuario: %s, error: %v", userId, err)
		return
	}

	log.Println("Mensajes marcados como leídos correctamente.")
}
