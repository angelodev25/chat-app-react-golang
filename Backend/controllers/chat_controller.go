package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/models"
	"github.com/angedev25/chat-backend/services"
	"github.com/angedev25/chat-backend/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func CreateChat(c *fiber.Ctx) error {
	var request models.NewChatRequest
	var otherUser models.User
	var foundedUser = false

	email := c.Locals("email").(string)

	currentUser, exists := GetUserByEmail(email)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "No estás registrado"})
	}

	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parsing request body: %v", err)
		return c.Status(400).JSON(fiber.Map{"error": "Error ejecutando la petición :("})
	}

	if request.Username != "" {
		query := `SELECT  id, username, profile_name, profile_image, email, user_dir FROM users WHERE username = $1`
		err := database.DB.QueryRow(query, request.Username).Scan(&otherUser.ID, &otherUser.Username, &otherUser.ProfileName, &otherUser.ProfileImage, &otherUser.Email, &otherUser.Dir)
		if err != nil {
			foundedUser = false
			log.Println("Error al buscar usuario: ", err)
		} else {
			foundedUser = true
		}
	}
	if request.Email != "" && foundedUser == false {
		query := `SELECT id, username, profile_name, profile_image, email, user_dir FROM users WHERE email = $1`
		err := database.DB.QueryRow(query, request.Email).Scan(&otherUser.ID, &otherUser.Username, &otherUser.ProfileName, &otherUser.ProfileImage, &otherUser.Email, &otherUser.Dir)
		if err != nil {
			if err == sql.ErrNoRows {
				foundedUser = false
			}
			log.Println("Error al buscar usuario: ", err)
		} else {
			foundedUser = true
		}
	}

	if foundedUser {
		var exists bool
		err := database.DB.QueryRow(`
    SELECT EXISTS(
        SELECT 1 FROM chats
        WHERE (user_one = $1 AND user_two = $2)
           OR (user_one = $2 AND user_two = $1)
    )`, currentUser.ID, otherUser.ID).Scan(&exists)

		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Error al buscar chat"})
		}

		if exists {
			return c.Status(400).JSON(fiber.Map{"error": "Ya tienes un chat con esa persona"})
		}

		chatID := uuid.NewString()

		chatToCurrentUser := models.ChatWithOtherUser{
			ID:                chatID,
			OtherUsername:     otherUser.Username,
			OtherProfileImage: otherUser.ProfileImage,
			OtherUserID:       otherUser.ID,
			LastMessage: &models.Message{
				ID:        uuid.NewString(),
				ChatID:    chatID,
				SenderID:  "server",
				Content:   "Acaban de empezar un chat",
				Timestamp: time.Now(),
			},
		}

		chatToOtherUser := models.ChatWithOtherUser{
			ID:                chatID,
			OtherUsername:     currentUser.Username,
			OtherProfileImage: currentUser.ProfileImage,
			OtherUserID:       currentUser.ID,
			LastMessage: &models.Message{
				ID:        uuid.NewString(),
				ChatID:    chatID,
				SenderID:  "server",
				Content:   fmt.Sprintf("%s quiere hablar contigo.\nPuedes responder o ignorar este chat.", currentUser.ProfileName),
				Timestamp: time.Now(),
			},
		}

		_, err = database.DB.Exec(`INSERT INTO chats (id, user_one, user_two) VALUES ($1, $2, $3)`, chatID, currentUser.ID, otherUser.ID)
		if err != nil {
			log.Println("Error al crear chat: ", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al crear el chat"})
		}

		go func() {
			dirs := []string{currentUser.Dir, otherUser.Dir}
			messsages := []models.Message{*chatToCurrentUser.LastMessage, *chatToOtherUser.LastMessage}

			for i, dir := range dirs {
				userDB, err := database.InitMessagesDB(dir)
				if err != nil {
					log.Printf("Error al abrir base de datos para el usuario con dir %s: %v", dir, err)
					continue
				}
				defer userDB.Close()

				query := `INSERT INTO messages (id, chat_id, sender_id, content, timestamp) VALUES ($1, $2, $3, $4, $5)`
				_, err = userDB.Exec(query, messsages[i].ID, messsages[i].ChatID, messsages[i].SenderID, messsages[i].Content, messsages[i].Timestamp)
				if err != nil {
					log.Printf("Error al guardar mensaje del servidor para usuario con dir: %s, error: %v", dir, err)
					continue
				}
				log.Println("Mensje del servidor guardado correctamente para user:  ", dir)
			}
		}()

		var uh = services.GetUsersHub()
		uh.Add <- services.InfoChannel{Chat: &chatToOtherUser, UserID: otherUser.ID}

		return c.Status(201).JSON(fiber.Map{"chat": chatToCurrentUser})
	} else {
		return c.Status(404).JSON(fiber.Map{"error": "No se pudo encontrar al usuario que buscas."})
	}
}

func GetUserChats(c *fiber.Ctx) error {
	email := c.Locals("email").(string)
	user, exists := GetUserByEmail(email)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "No estás registrado"})
	}

	// Carga todos los chats guardados con el id del usuario
	query := `
	SELECT
		c.id as chat_id,
		c.created_at,
		u.id as other_id,
		u.username,
		u.profile_name,
		u.profile_image
	FROM chats c JOIN users u ON (
		CASE
			WHEN c.user_one = $1 THEN c.user_two
			ELSE user_one
		END
	) = u.id
	WHERE c.user_one = $1 OR c.user_two = $1
	ORDER BY c.created_at ASC
	`
	rows, err := database.DB.Query(query, user.ID)
	if err != nil {
		log.Println(err)
		if err != sql.ErrNoRows {
			return c.Status(500).JSON(fiber.Map{"error": "Error al cargar los chats"})
		}
	}
	defer rows.Close()

	userDB, err := database.InitMessagesDB(user.Dir)
	if err != nil {
		log.Println("Error al obtener la base de datos de mensajes: ", err)
		return c.Status(500).JSON(fiber.Map{"error": "Error del servidor"})
	}
	defer userDB.Close()

	var chats []models.ChatWithOtherUser
	for rows.Next() {
		var chat models.ChatWithOtherUser
		var otherUser models.User

		err := rows.Scan(&chat.ID, &chat.CreatedAt, &otherUser.ID, &otherUser.Username, &otherUser.ProfileName, &otherUser.ProfileImage)
		if err != nil {
			log.Println("En el for: ", err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al cargar los chats"})
		}
		chat.OtherUsername = otherUser.Username
		chat.OtherProfileImage = otherUser.ProfileImage
		chat.OtherUserID = otherUser.ID

		lastMessageQuery := `SELECT * FROM messages WHERE chat_id = $1 ORDER BY timestamp DESC LIMIT 1`
		var lastMessage models.Message
		err = userDB.QueryRow(lastMessageQuery, chat.ID).Scan(
			&lastMessage.ID, &lastMessage.ChatID, &lastMessage.SenderID, &lastMessage.Content, &lastMessage.Timestamp, &lastMessage.Readed,
		)
		if err != nil {
			log.Println("En el for de last message: ", err)
			if err != sql.ErrNoRows {
				return c.Status(500).JSON(fiber.Map{"error": "Error en el servdor"})
			}
		}
		chat.LastMessage = &lastMessage
		chats = append(chats, chat)
	}
	return c.Status(200).JSON(fiber.Map{"chats": chats})
}

func DeleteChat(c *fiber.Ctx) error {
	chatId := c.Params("chatId")

	users := make([]string, 2)
	stmt := `DELETE FROM chats WHERE id = $1 RETURNING user_one, user_two;`
	err := database.DB.QueryRow(stmt, chatId).Scan(&users[0], &users[1])
	if err != nil {
		log.Println("Error al eliminar chat: ", err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo eliminar el chat, intenta más tarde."})
	}

	for _, id := range users {
		userDir, _, err := utils.InitUserDir(id)
		if err != nil {
			log.Println("Error obtieniendo directorio: ", err)
			break
		}
		userDB, err := database.InitMessagesDB(userDir)
		if err != nil {
			log.Println("Error abriendo DB: ", err)
			break
		}
		defer userDB.Close()

		stmt := `DELETE FROM messages WHERE chat_id = $1`
		_, err = userDB.Exec(stmt, chatId)
		if err != nil {
			log.Println("Error eliminando registro: ", err)
			break
		}

		log.Println("Mensajes borrados para usuario: ", id)
	}

	var uh = services.GetUsersHub()
	uh.Remove <- models.Chat{ID: chatId, UserOne: users[0], UserTwo: users[1]}

	return c.Status(200).JSON(fiber.Map{"message": "chat eliminado"})
}
