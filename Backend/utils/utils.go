package utils

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Guarda la imagen en el directorio del usuario y devuelve la ruta relativa para acceder a ella
func UploadImage(c *fiber.Ctx, userId string) (string, error) {
	_, uploadsDir, err := InitUserDir(userId)
	if err != nil {
		return "", err
	}
	file, err := c.FormFile("file")
	if err != nil {
		log.Println(err)
		return "", err
	}
	uniqueFilename := strconv.Itoa((rand.Intn(99999) + 10000)) + "_" + file.Filename

	err = c.SaveFile(file, uploadsDir+"/"+uniqueFilename)
	if err != nil {
		log.Println("Error al guardar el archivo: ", err)
		return "", err
	}

	return fmt.Sprintf("/uploads/%s/%s", userId, uniqueFilename), nil
}

// Crea las carpetas que contendrán los archivos del usuario si no existe
func InitUserDir(userId string) (string, string, error) {
	storageDir := "./users_storage"
	if _, err := os.Stat(storageDir); os.IsNotExist(err) {
		err := os.MkdirAll(storageDir, 0755)
		if err != nil {
			log.Println("Error al crear el directorio: ", storageDir, " - ", err)
			return "", "", err
		}
	}
	userDir := storageDir + "/messages/" + userId
	uploadsDir := storageDir + "/uploads/" + userId
	if _, err := os.Stat(userDir); os.IsNotExist(err) {
		err := os.MkdirAll(userDir, 0755)
		if err != nil {
			log.Println("Error al crear el directorio del usuario: ", userDir, " - ", err)
			return "", "", err
		}
	}
	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		err = os.MkdirAll(uploadsDir, 0755)
		if err != nil {
			log.Println("Error al crear el directorio de subidas del usuario: ", uploadsDir, " - ", err)
			return "", "", err
		}
	}
	return userDir, uploadsDir, nil
}
