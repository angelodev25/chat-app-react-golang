package models

import (
	"time"
)

type Message struct {
	ID        string    `json:"id"`
	ChatID    string    `json:"chatId"`
	SenderID  string    `json:"senderId"`
	Content   string    `json:"content"`
	Readed    bool      `json:"readed"`
	Timestamp time.Time `json:"timestamp"`
}
