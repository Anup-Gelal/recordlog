package models

import (
	"errors"
	"regexp"
	"time"
)

// User represents our database user
type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Note struct {
	ID         uint   `json:"id" gorm:"primaryKey"`
	UserID     int    `json:"user_id"`
	Date       string `json:"date"`
	Time       string `json:"time"`
	ApprovedBy string `json:"approved_by"`
	Content    string `json:"content"`
}

// UserLogin represents login request data
type UserLogin struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username"`
	Password string `json:"password" binding:"required,min=6"`
}

// UserRegister represents registration request data
type UserRegister struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username"`
	Password string `json:"password" binding:"required,min=6"`
}

// Validate checks if email format is valid
func (u *UserRegister) Validate() error {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	if !emailRegex.MatchString(u.Email) {
		return errors.New("invalid email format")
	}

	return nil
}
