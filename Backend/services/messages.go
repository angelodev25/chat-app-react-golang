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

func (h *ChatsHub) SaveMessage(sender *Client, content, targetUser string) {
	message := models.Message{
		ID:        uuid.NewString(),
		ChatID:    sender.ChatID,
		SenderID:  sender.UserID,
		Content:   content,
		Timestamp: time.Now(),
		Readed:    true,
	}

	data := struct {
		Code    string         `json:"code"`
		Message models.Message `json:"message"`
	}{Code: "message", Message: message}

	var isThere = false

	outgoing, _ := json.Marshal(data)
	h.Mu.RLock()
	room, ok := h.Rooms[sender.ChatID]
	h.Mu.RUnlock()
	if ok {
		for _, client := range room {
			if client.UserID == targetUser {
				isThere = true
			}
			func(db *sql.DB) {
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
			go h.SendMessageToDisconnected(targetUser, message)
		}
	}
}

func (h *ChatsHub) SendMessageToDisconnected(userId string, message models.Message) {
	userDir, _, err := utils.InitUserDir(userId)
	if err != nil {
		log.Println("Error al obtener el directorio: ", err)
		return
	}

	userDB, err := database.GetMessagesDB(userDir)
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

func (h *ChatsHub) MarkMessagesAsReaded(userId, chatId string) {
	userDir, _, err := utils.InitUserDir(userId)
	if err != nil {
		log.Println("Error al obtener el directorio: ", err)
		return
	}

	userDB, err := database.GetMessagesDB(userDir)
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
}

func (h *ChatsHub) DeleteMessageForBothUsers(chatId, messageId, otherUserId string) {
	h.Mu.RLock()
	room, ok := h.Rooms[chatId]
	h.Mu.RUnlock()

	data := struct {
		Code string `json:"code"`
		ID   string `json:"id"`
	}{Code: "delete", ID: messageId}

	outgoing, _ := json.Marshal(data)
	isThere := false

	if ok {
		for _, client := range room {
			if client.UserID == otherUserId {
				isThere = true
			}
			go func(db *sql.DB) {
				query := `DELETE FROM messages WHERE id = $1 AND chat_id = $2`
				_, err := db.Exec(query, messageId, chatId)
				if err != nil {
					log.Println("Error al eliminar mensaje: ", err)
					return
				}
			}(client.MessagesDB)
			select {
			case client.Send <- outgoing:
			default:
				log.Println("Buffer lleno del client: ", client.ID[:8])
			}
		}
		if !isThere {
			h.DeleteMessageForDisconnected(chatId, messageId, otherUserId)
		}
	}
	log.Println("Mensaje eliminado correctamente")
}

func (h *ChatsHub) DeleteMessageForSingleUser(chatId, messageId string, client *Client) {
	query := `DELETE FROM messages WHERE id = $1 AND chat_id = $2`
	_, err := client.MessagesDB.Exec(query, messageId, chatId)
	if err != nil {
		log.Println("Error al eliminar mensaje: ", err)
		return
	}
	data := struct {
		Code string `json:"code"`
		ID   string `json:"id"`
	}{Code: "delete", ID: messageId}

	outgoing, _ := json.Marshal(data)
	select {
	case client.Send <- outgoing:
	default:
		log.Println("Buffer lleno del client: ", client.ID[:8])
	}
	log.Println("Mensaje eliminado correctamente")
}

func (h *ChatsHub) DeleteMessageForDisconnected(chatId, messageId, userId string) {
	userDir, _, err := utils.InitUserDir(userId)
	if err != nil {
		log.Println("Error al obtener el directorio: ", err)
		return
	}

	userDB, err := database.GetMessagesDB(userDir)
	if err != nil {
		log.Println("Error al abrir base de datos: ", err)
		return
	}
	defer userDB.Close()

	query := `DELETE FROM messages WHERE id = $1 AND chat_id = $2`
	_, err = userDB.Exec(query, messageId, chatId)
	if err != nil {
		log.Println("Error al eliminar mensaje: ", err)
		return
	}

	log.Println("Mensaje eliminado correctamente para usuario fuera de linea.")

	if conn, ok := IsOnline(userId); ok {
		// Verifica si el mensaje que se eliminó es el último mensaje enviado en el chat
		var messages []models.Message
		query := `SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT 2`
		rows, err := userDB.Query(query, chatId)
		if err != nil {
			log.Println("Error al extraer mensajes: ", err)
			return
		}
		defer rows.Close()
		for rows.Next() {
			var message models.Message
			err := rows.Scan(&message.ID, &message.ChatID, &message.SenderID, &message.Content, &message.Timestamp, &message.Readed)
			if err != nil {
				log.Println("Error al escanear mensaje: ", err)
				return
			}
			messages = append(messages, message)
		}
		if len(messages) > 0 && messages[0].ID == messageId {
			data := struct {
				Code    string         `json:"code"`
				Message models.Message `json:"message"`
			}{Code: "message", Message: messages[1]}
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
	} else {
		log.Println("Usuario no en linea")
	}
}
