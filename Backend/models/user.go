package models

type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	ProfileName  string `json:"profileName"`
	Email        string `json:"email"`
	Dir          string `json:"userDir"`
	ProfileImage string `json:"profileImage"`
}
