package models

import "time"

type ChatResponse struct {
	ID          string  `json:"id"`
	SenderName  string  `json:"senderName"`
	LastMessage Message `json:"lastMessage"`
}

type Chat struct {
	ID        string `json:"id"`
	UserOne   string `json:"userOne"`
	UserTwo   string `json:"userTwo"`
	CreatedAt string `db:"created_at" json:"createdAt"`
}

type ChatWithOtherUser struct {
	ID                string    `json:"id"`
	OtherUsername     string    `json:"otherUsername"`
	OtherUserID       string    `json:"otherUserID"`
	OtherProfileImage string    `json:"otherProfileImage"`
	CreatedAt         time.Time `json:"createdAt"`
	LastMessage       *Message  `json:"lastMessage,omitempty"`
}

type NewChatRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
}
