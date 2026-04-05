package services

import (
	"log"

	"github.com/gofiber/websocket/v2"
)

var chatsHub *ChatsHub
var usersHub *UsersHub

func SaveChatsHub(hub *ChatsHub) {
	if chatsHub == nil {
		chatsHub = hub
		log.Println("Hub de chats almacendo en variable global: ", chatsHub)
	}
}

func SaveUsersHub(hub *UsersHub) {
	if usersHub == nil {
		usersHub = hub
		log.Println("Hub de usuarios en linea almacendo en variable global: ", usersHub)
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
