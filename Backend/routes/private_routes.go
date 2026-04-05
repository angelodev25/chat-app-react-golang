package routes

import (
	"github.com/angedev25/chat-backend/controllers"
	"github.com/angedev25/chat-backend/middleware"
	"github.com/gofiber/fiber/v2"
)

func PrivateRoutes(app *fiber.App) {
	route := app.Group("/api")

	route.Get("/user/verify", middleware.JWTMiddleware(), controllers.TokenLogin)
	route.Get("/chats", middleware.JWTMiddleware(), controllers.GetUserChats)
	route.Get("/chat/:chatId", middleware.JWTMiddleware(), controllers.LoadChatMessages)
	route.Post("/chats", middleware.JWTMiddleware(), controllers.CreateChat)
	route.Put("/user/update", middleware.JWTMiddleware(), controllers.UpdateUser)
	route.Delete("/chat/:chatId/msg/:messageId", middleware.JWTMiddleware(), controllers.DeleteMessage)
	route.Delete("/chat/:chatId", middleware.JWTMiddleware(), controllers.DeleteChat)
}
