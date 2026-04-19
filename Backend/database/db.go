package database

import (
	"database/sql"
	"log"

	"github.com/angedev25/chat-backend/config"
	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

var DB *sql.DB // Base de datos postgres que guardará usuarios y informacion de chats
var err error

func InitDB() {
	DB, err = sql.Open("postgres", config.LoadsConfig().DBConnString)
	if err != nil {
		log.Fatal("No se pudo crear la base de datos: ", err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal("No se pudo conectar la base de datos: ", err)
	}

	stmt := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY, 
		username TEXT NOT NULL UNIQUE, 
		profile_name TEXT NOT NULL,
		profile_image TEXT,
		email TEXT NOT NULL UNIQUE,
		user_dir TEXT NOT NULL, 
		password TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE TABLE IF NOT EXISTS chats (
		id TEXT PRIMARY KEY,
		user_one TEXT NOT NULL,
		user_two TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_one) REFERENCES users(id) ON DELETE CASCADE,
    	FOREIGN KEY (user_two) REFERENCES users(id) ON DELETE CASCADE
	);
	`

	_, err = DB.Exec(stmt)
	if err != nil {
		log.Fatal("Error al crear las tablas: ", err)
	}
	log.Println("Todas las tablas se crearon correctamente.")
	log.Println("Base de datos conectada.")
}

func InitMessagesDB(dir string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dir+"/messagesDB.db")
	if err != nil {
		log.Println("No se pudo crear la base de datos de mensajes")
		return nil, err
	}

	stmt := `CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
    	chat_id TEXT NOT NULL,
    	sender_id TEXT NOT NULL,
    	content TEXT NOT NULL,
    	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		readed BOOLEAN DEFAULT FALSE,
    	FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
    	FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
	);`

	_, err = db.Exec(stmt)
	if err != nil {
		log.Fatal("Error al crear la tabla mensajes: ", err)
		return nil, err
	}
	log.Println("Base de datos de mensajes creada.")
	return db, nil
}

func GetMessagesDB(dir string) (*sql.DB, error) {
	return sql.Open("sqlite", dir+"/messagesDB.db")
}

// Cierra la conexión a la base de datos postgres
func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
