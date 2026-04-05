package models

import (
	"database/sql"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type InfoChannel struct {
	UserID string
	Chat   *ChatWithOtherUser
}

type UsersHub struct {
	UsersOnline map[string]*websocket.Conn
	Add         chan InfoChannel
	Remove      chan Chat
	mu          sync.RWMutex
}

type Client struct {
	ID         string
	UserID     string
	ChatID     string
	Conn       *websocket.Conn
	MessagesDB *sql.DB
	Send       chan []byte
}

type ChatsHub struct {
	Clients    map[string]*Client
	Register   chan *Client
	Unregister chan *Client
	Rooms      map[string]map[string]*Client
	Mu         sync.RWMutex
}
