package controllers

import (
	"database/sql"
	"log"
	"math/rand"
	"strconv"
	"strings"

	"github.com/angedev25/chat-backend/database"
	"github.com/angedev25/chat-backend/middleware"
	"github.com/angedev25/chat-backend/models"
	"github.com/angedev25/chat-backend/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// No tengo que explicarlo
func CreateUser(c *fiber.Ctx) error {
	file, _ := c.FormFile("file")
	userId := uuid.New().String()
	name := c.FormValue("name")
	email := c.FormValue("email")
	password := c.FormValue("password")
	imagePath := ""
	username := strings.ToLower(name) + strconv.Itoa(rand.Intn(9999)+1000) // nombre de usuario unico a partir del nombre y un numero aleatorio

	if name == "" || email == "" || password == "" {
		return c.Status(400).JSON(fiber.Map{"error": "No se proporcionaron lo datos necesarios"})
	}

	_, exist := GetUserByEmail(email)
	if exist {
		return c.Status(400).JSON(fiber.Map{"error": "Ya existe un usuario con esa dirección email"}) // Verifica si ya existe un usuario con el mismo email
	}

	// Genera el directorio de archivos del usuario
	userDir, userUploadsDir, err := utils.InitUserDir(userId)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear la carpeta del usuario"})
	}

	// Si hay una imagen la guarda
	if file != nil {
		if file.Size > 4*1024*1024 {
			return c.Status(400).JSON(fiber.Map{"error": "El archivo es muy grande. El tamaño máximo es de 4MB."})
		}
		path, err := utils.UploadImage(c, userId, userUploadsDir)
		if err != nil {
			c.Status(500).JSON(fiber.Map{"error": "No se pudo guardar el archivo"})
		} else {
			imagePath = path
		}
	}

	// convierte la contraseña a un hash seguro
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Credenciales inválidas"})
	}

	// Genera el token de autenticacion
	token, err := middleware.GenerateJWT(userId, email)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el token de autenticación"})
	}

	user := &models.User{
		ID:           userId,
		Username:     username,
		ProfileName:  name,
		ProfileImage: imagePath,
		Dir:          userDir,
		Email:        email,
	}

	query := `
	INSERT INTO users (id, username, profile_name, profile_image, email, user_dir, password)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err = database.DB.Exec(query, user.ID, user.Username, user.ProfileName, user.ProfileImage, user.Email, userDir, hashedPassword)
	if err != nil {
		log.Println("Error al guardar usuario: ", err)
		c.Status(500).JSON(fiber.Map{"error": "No se pudo guadar el usuario"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Cuenta creada exitosamente!", "user": user, "token": token})
}

// Funcion para el login mediante el token de autenticación, verifica que el token aun sea valido y extrae la informacion del usuario para devolverla en la respuesta, si el token no es valido o ya expiro devuelve error
func TokenLogin(c *fiber.Ctx) error {
	email := c.Locals("email").(string)

	user, exists := GetUserByEmail(email)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	return c.Status(200).JSON(fiber.Map{"user": user})
}

// Funcion para login normal con email y contraseña
func LoginUser(c *fiber.Ctx) error {
	// Estructura para recibir los datos de la peticion
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&loginData); err != nil {
		log.Println(err)
		return c.Status(400).JSON(fiber.Map{"error": "Petición inválida"})
	}

	// Busca al usaurio
	user, exists := GetUserByEmail(loginData.Email)
	if !exists {
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Busca el hash de la contraseña almacenado en la base de datos para compararlo
	var storedHash string
	err := database.DB.QueryRow(`SELECT password FROM users WHERE id = $1`, user.ID).Scan(&storedHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
		}
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Error en consulta"})
	}

	// compara ambas contraseñas
	if !utils.ComparePassword(loginData.Password, storedHash) {
		return c.Status(401).JSON(fiber.Map{"error": "Contraseña incorrecta"})
	}

	// Genera el token de autenticacion
	token, err := middleware.GenerateJWT(user.ID, user.Email)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "No se pudo crear el token de autenticación"})
	}

	// Devuelve todos los datos
	return c.Status(200).JSON(fiber.Map{"message": "Correcto!", "user": user, "token": token})
}

func UpdateUser(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		log.Println(err)
		return c.Status(400).JSON(fiber.Map{"error": "Petición inválida"})
	}

	userId := c.Locals("userId").(string)
	existingUser, exists := GetUserByID(userId)
	if !exists {
		log.Printf("Usario '%s' no encontrado.", userId)
		return c.Status(404).JSON(fiber.Map{"error": "Usuario no encontrado"})
	}

	// Solo se pueden actualizar el nombre, la imagen de perfil y el nombre de usuario
	if user.ProfileName != existingUser.ProfileName {
		if user.ProfileName == "" {
			return c.Status(400).JSON(fiber.Map{"error": "No e puede tener un nombre de usuario vacio"})
		}
		if len(user.ProfileName) < 3 || len(user.ProfileName) > 20 {
			return c.Status(400).JSON(fiber.Map{"error": "El nombre de perfil debe tener entre 3 y 20 caracteres"})
		}
		query := `UPDATE users SET profile_name = $1 WHERE id = $2`
		_, err := database.DB.Exec(query, user.ProfileName, userId)
		if err != nil {
			log.Println(err)
			return c.Status(500).JSON(fiber.Map{"error": "No se pudo actualizar el nombre de perfil"})
		}
		existingUser.ProfileName = user.ProfileName
	} else if user.Username != existingUser.Username {
		if user.Username == "" {
			return c.Status(400).JSON(fiber.Map{"error": "No e puede tener un nombre de usuario vacio"})
		}
		if len(user.Username) < 3 || len(user.Username) > 20 {
			return c.Status(400).JSON(fiber.Map{"error": "El nombre de usuario debe tener entre 3 y 20 caracteres"})
		}
		checkQuery := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 AND id != $2)`
		var usernameExists bool
		err := database.DB.QueryRow(checkQuery, user.Username, userId).Scan(&usernameExists)
		if err != nil {
			log.Println(err)
			return c.Status(500).JSON(fiber.Map{"error": "Error al verificar el nombre de usuario"})
		}
		if usernameExists {
			return c.Status(400).JSON(fiber.Map{"error": "Ese nombre de usuario no estña diponible"})
		}
		query := `UPDATE users SET username = $1 WHERE id = $2`
		_, err = database.DB.Exec(query, user.Username, userId)
		if err != nil {
			log.Println(err)
			return c.Status(500).JSON(fiber.Map{"error": "No se pudo actualizar el nombre de usuario"})
		}
		existingUser.Username = user.Username
	}
	return c.Status(200).JSON(fiber.Map{"user": existingUser})
}

// Extrae un usuario de la base de datos por el email, y devuelve un booleano que indica si se encontro al usuario o no
func GetUserByEmail(email string) (*models.User, bool) {
	var user models.User
	query := `SELECT id, username, profile_name, profile_image, email, user_dir FROM users WHERE email = $1`
	err := database.DB.QueryRow(query, email).Scan(
		&user.ID, &user.Username, &user.ProfileName, &user.ProfileImage, &user.Email, &user.Dir,
	)

	if err != nil {
		if err != sql.ErrNoRows {
			log.Println(err)
		}
		return nil, false
	}

	return &user, true
}

func GetUserByID(userID string) (*models.User, bool) {
	var user models.User
	query := `SELECT id, username, profile_name, profile_image, email, user_dir FROM users WHERE id = $1`
	err := database.DB.QueryRow(query, userID).Scan(
		&user.ID, &user.Username, &user.ProfileName, &user.ProfileImage, &user.Email, &user.Dir,
	)

	if err != nil {
		if err != sql.ErrNoRows {
			log.Println(err)
		}
		return nil, false
	}

	return &user, true
}
