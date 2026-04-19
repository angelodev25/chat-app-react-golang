package middleware

import (
	"fmt"
	"strings"
	"time"

	"github.com/angedev25/chat-backend/config"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userId, email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userId,
		"email":   email,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // Expira en 7 dias
		"iat":     time.Now().Unix(),                         // tiempo de emision
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.LoadsConfig().JwtSecret))
}

func ValidateToken(tokenString string) (*jwt.Token, error) {
	return jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validar método de firma
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Token inválido. Método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(config.LoadsConfig().JwtSecret), nil
	})
}

// Valida y extrae la informacion del token pasado como parámetro (userId, email)
func ExtractClaims(tokenString string) (string, string, error) {
	token, err := ValidateToken(tokenString)
	if err != nil {
		return "", "", err
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return claims["user_id"].(string), claims["email"].(string), nil
	}
	return "", "", fmt.Errorf("Token inválido")
}

func JWTMiddleware() func(*fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{"error": "Token faltante"})
		}

		// Remover "Bearer " si está presente
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			tokenString = authHeader
		}

		userID, email, err := ExtractClaims(tokenString)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "Token inválido: " + err.Error()})
		}

		c.Locals("userId", userID)
		c.Locals("email", email)

		return c.Next()
	}
}
