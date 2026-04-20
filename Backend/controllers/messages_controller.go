package controllers

import (
	"log"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/models"
	"github.com/gofiber/fiber/v2"
)

func LoadChatMessages(c *fiber.Ctx) error {
	chatId := c.Params("chatId")
	userId := c.Locals("userId").(string)

	userDB, err := database.GetMessagesDB(userId)
	if err != nil {
		log.Println("Error al obtener la base de datos de mensajes: ", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error del servidor"})
	}
	defer userDB.Close()

	query := `SELECT * FROM messages WHERE chat_id = $1`
	rows, err := userDB.Query(query, chatId)
	if err != nil {
		log.Println("Error al extraer mensajes: ", err)
		return c.Status(401).JSON(fiber.Map{"error": "Error al extraer los mensajes"})
	}
	var messages []models.Message
	for rows.Next() {
		var message models.Message
		err := rows.Scan(&message.ID, &message.ChatID, &message.SenderID, &message.Content, &message.Timestamp, &message.Readed)
		if err != nil {
			log.Println("En el for messages: ", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al cargar los mensajes"})
		}
		messages = append(messages, message)
	}

	return c.Status(200).JSON(fiber.Map{"messages": messages})
}
