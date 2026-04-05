package main

import (
	"log"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/routes"
	"github.com/angedev25/chat-backend/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

func main() {
	app := fiber.New()
	chatHub := services.NewChatsHub()
	usersHub := services.NewUsersHub()
	database.InitDB()
	defer database.CloseDB()

	services.SaveChatsHub(chatHub)
	services.SaveUsersHub(usersHub)

	go chatHub.Run()
	go usersHub.Listen()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://10.7.0.38:5174, http://127.0.0.1:5174, http://localhost:5174",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, Upgrade, Connection",
		AllowCredentials: true,
		ExposeHeaders:    "Upgrade, Connection",
	}))

	app.Static("/uploads", "./users_storage/uploads")

	routes.PublicRoutes(app)
	routes.PrivateRoutes(app)

	app.Get("/api/ws/:chatId", websocket.New(func(c *websocket.Conn) { chatHub.Connect(c) }))
	app.Get("/api/ws/connect/chat", websocket.New(func(c *websocket.Conn) { usersHub.SetOnline(c) }))

	log.Fatal(app.Listen(":8080"))
}
