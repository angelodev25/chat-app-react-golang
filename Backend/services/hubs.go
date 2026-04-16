package services

import (
	"github.com/gofiber/websocket/v2"
)

var chatsHub *ChatsHub
var usersHub *UsersHub

func SaveChatsHub(hub *ChatsHub) {
	if chatsHub == nil {
		chatsHub = hub
	}
}

func SaveUsersHub(hub *UsersHub) {
	if usersHub == nil {
		usersHub = hub
	}
}

func GetChatsHub() *ChatsHub {
	if chatsHub != nil {
		return chatsHub
	}
	return nil
}

func GetUsersHub() *UsersHub {
	if usersHub != nil {
		return usersHub
	}
	return nil
}

func IsOnline(userId string) (*websocket.Conn, bool) {
	if conn, ok := usersHub.UsersOnline[userId]; ok {
		return conn, true
	}
	return nil, false
}
