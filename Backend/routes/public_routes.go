package routes

import (
	"github.com/angedev25/chat-backend/controllers"
	"github.com/gofiber/fiber/v2"
)

func PublicRoutes(app *fiber.App) {
	route := app.Group("/api")

	route.Post("/user/register", controllers.CreateUser)
	route.Post("/user/login", controllers.LoginUser)
}
