package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	JwtSecret    string
	DBConnString string
	Port         string
	Host         string
}

func LoadsConfig() *Config {
	_ = godotenv.Load()
	return &Config{
		JwtSecret: requireEnv("JWT_SECRET"),
		DBConnString: fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=require",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_USER", "postgres"),
			getEnv("DB_PASSWORD", "password"),
			getEnv("DB_NAME", "chat_app"),
		),
		Port: getEnv("PORT", "8080"),
		Host: getEnv("HOST", "localhost"),
	}
}

func requireEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		panic("Variable de entorno requerida: " + key)
	}
	return val
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
