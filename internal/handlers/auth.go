package handlers

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/phpdave11/gofpdf"
	"log"
	"net/http"
	"recordlog/internal/database"
	"recordlog/internal/models"
	"recordlog/internal/utils"
	"time"
)

type AuthHandler struct {
	db              *database.Database // Change this to *database.Database
	jwtSecret       []byte
	tokenExpiration time.Duration
}

type NoteHandler struct {
	db *database.Database
}

// NewAuthHandler creates a new authentication handler
// Update db type to *database.Database
func NewAuthHandler(db *database.Database, jwtSecret []byte) *AuthHandler {
	return &AuthHandler{
		db:              db,
		jwtSecret:       jwtSecret,
		tokenExpiration: 24 * time.Hour,
	}
}

func NewNoteHandler(db *database.Database) *NoteHandler {
	return &NoteHandler{db: db}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var user models.UserRegister

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format", "details": err.Error()})
		return
	}

	if err := user.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var exists bool
	err := h.db.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ? OR username = ?)", user.Email, user.Username).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email or username already registered"})
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password hashing failed"})
		return
	}

	tx, err := h.db.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction start failed"})
		return
	}

	var id int64
	stmt := "INSERT INTO users (email, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())"
	res, err := tx.Exec(stmt, user.Email, user.Username, hashedPassword)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
		return
	}

	id, err = res.LastInsertId()
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user ID"})
		return
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user_id": id})
}

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var login models.UserLogin

	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid login data"})
		return
	}

	var user models.User
	err := h.db.DB.QueryRow("SELECT id, email, username, password_hash FROM users WHERE email = ? AND username = ?", login.Email, login.Username).
		Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash)

	if err == sql.ErrNoRows || !utils.CheckPasswordHash(login.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"email":    user.Email,
		"username": user.Username,
		"iat":      now.Unix(),
		"exp":      now.Add(h.tokenExpiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      tokenString,
		"expires_in": h.tokenExpiration.Seconds(),
		"token_type": "Bearer",
	})
}

// RefreshToken issues a new JWT token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id": userID,
		"iat":     now.Unix(),
		"exp":     now.Add(h.tokenExpiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token refresh failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      tokenString,
		"expires_in": h.tokenExpiration.Seconds(),
		"token_type": "Bearer",
	})
}

// Logout simply returns success (since JWTs are stateless)
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message":      "Successfully logged out",
		"instructions": "Please remove the token from your client storage",
	})
}

type NoteInput struct {
	Note string `json:"note"`
}

func (h *NoteHandler) CreateNote(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Handle type assertion
	var userID int
	switch v := userIDVal.(type) {
	case float64:
		userID = int(v) // Convert float64 to int
	case int:
		userID = v // Already an int
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}

	// Log for debugging
	log.Printf("Creating note for user ID: %d", userID)

	var input NoteInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	log.Printf("Received note content: %s", input.Note)

	note := models.Note{
		UserID:     userID,
		Date:       time.Now().Format("2006-01-02"),
		Time:       time.Now().Format("15:04:05"),
		ApprovedBy: "Self", // Can be dynamic based on user or request
		Content:    input.Note,
	}

	// SQL insertion query
	query := `INSERT INTO notes (user_id, date, time, approved_by, content) VALUES (?, ?, ?, ?, ?)`
	res, err := h.db.DB.Exec(query, note.UserID, note.Date, note.Time, note.ApprovedBy, note.Content)
	if err != nil {
		log.Printf("Failed to insert note: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create note"})
		return
	}

	lastID, _ := res.LastInsertId()
	note.ID = uint(lastID)

	log.Printf("Note created with ID %d", note.ID)

	c.JSON(http.StatusCreated, gin.H{"message": "Note created", "note": note})
}

// GetUserNotes retrieves all notes for the authenticated user
func (h *NoteHandler) GetUserNotes(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)

	rows, err := h.db.DB.Query("SELECT id, user_id, date, time, approved_by, content FROM notes WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notes"})
		return
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var note models.Note
		if err := rows.Scan(&note.ID, &note.UserID, &note.Date, &note.Time, &note.ApprovedBy, &note.Content); err == nil {
			notes = append(notes, note)
		}
	}

	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

// UpdateNote updates a note for the authenticated user
func (h *NoteHandler) UpdateNote(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)

	var note models.Note
	if err := c.ShouldBindJSON(&note); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note data"})
		return
	}

	// Check ownership
	var existsID int
	err := h.db.DB.QueryRow("SELECT id FROM notes WHERE id = ? AND user_id = ?", note.ID, userID).Scan(&existsID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to update this note"})
		return
	}

	_, err = h.db.DB.Exec(`UPDATE notes SET approved_by = ?, content = ? WHERE id = ?`, note.ApprovedBy, note.Content, note.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update note"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note updated successfully"})
}

// SearchNotes allows filtering by date and approved_by
func (h *NoteHandler) SearchNotes(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)

	date := c.Query("date")
	approvedBy := c.Query("approved_by")

	query := "SELECT id, user_id, date, time, approved_by, content FROM notes WHERE user_id = ?"
	args := []interface{}{userID}

	if date != "" {
		query += " AND date = ?"
		args = append(args, date)
	}
	if approvedBy != "" {
		query += " AND approved_by LIKE ?"
		args = append(args, "%"+approvedBy+"%")
	}

	rows, err := h.db.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search notes"})
		return
	}
	defer rows.Close()

	var notes []models.Note
	for rows.Next() {
		var note models.Note
		if err := rows.Scan(&note.ID, &note.UserID, &note.Date, &note.Time, &note.ApprovedBy, &note.Content); err == nil {
			notes = append(notes, note)
		}
	}

	c.JSON(http.StatusOK, gin.H{"notes": notes})
}

// DeleteNote deletes a note owned by the authenticated user
func (h *NoteHandler) DeleteNote(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)

	noteID := c.Param("id")
	result, err := h.db.DB.Exec("DELETE FROM notes WHERE id = ? AND user_id = ?", noteID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete note"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Note not found or access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Note deleted successfully"})
}

// ExportNotesAsPDF generates and returns a PDF of all user notes
func (h *NoteHandler) ExportNotesAsPDF(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDVal.(int)

	rows, err := h.db.DB.Query("SELECT date, time, approved_by, content FROM notes WHERE user_id = ?", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notes"})
		return
	}
	defer rows.Close()

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetFont("Arial", "", 12)
	pdf.AddPage()

	for rows.Next() {
		var date, timeStr, approvedBy, content string
		_ = rows.Scan(&date, &timeStr, &approvedBy, &content)

		pdf.Cell(0, 10, "Date: "+date+" | Time: "+timeStr)
		pdf.Ln(6)
		pdf.Cell(0, 10, "Approved By: "+approvedBy)
		pdf.Ln(6)
		pdf.MultiCell(0, 10, "Note: "+content, "", "", false)
		pdf.Ln(10)
	}

	err = pdf.Output(c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate PDF"})
	}
}

/*
package handlers

import (
	"database/sql"
	"net/http"
	"recordlog/internal/models"
	"recordlog/internal/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	db              *sql.DB
	jwtSecret       []byte
	tokenExpiration time.Duration
}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler(db *sql.DB, jwtSecret []byte) *AuthHandler {
	return &AuthHandler{
		db:              db,
		jwtSecret:       jwtSecret,
		tokenExpiration: 24 * time.Hour,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var user models.UserRegister

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format", "details": err.Error()})
		return
	}

	if err := user.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = ? OR username = ?)", user.Email, user.Username).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "Email or username already registered"})
		return
	}

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password hashing failed"})
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction start failed"})
		return
	}

	var id int64
	stmt := "INSERT INTO users (email, username, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())"
	res, err := tx.Exec(stmt, user.Email, user.Username, hashedPassword)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User creation failed"})
		return
	}

	id, err = res.LastInsertId()
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user ID"})
		return
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully", "user_id": id})
}

// Login handles user authentication
func (h *AuthHandler) Login(c *gin.Context) {
	var login models.UserLogin

	if err := c.ShouldBindJSON(&login); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid login data"})
		return
	}

	var user models.User
	err := h.db.QueryRow("SELECT id, email, username, password_hash FROM users WHERE email = ? AND username = ?", login.Email, login.Username).
		Scan(&user.ID, &user.Email, &user.Username, &user.PasswordHash)

	if err == sql.ErrNoRows || !utils.CheckPasswordHash(login.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id":  user.ID,
		"email":    user.Email,
		"username": user.Username,
		"iat":      now.Unix(),
		"exp":      now.Add(h.tokenExpiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token generation failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      tokenString,
		"expires_in": h.tokenExpiration.Seconds(),
		"token_type": "Bearer",
	})
}

// RefreshToken issues a new JWT token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	now := time.Now()
	claims := jwt.MapClaims{
		"user_id": userID,
		"iat":     now.Unix(),
		"exp":     now.Add(h.tokenExpiration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token refresh failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      tokenString,
		"expires_in": h.tokenExpiration.Seconds(),
		"token_type": "Bearer",
	})
}

// Logout simply returns success (since JWTs are stateless)
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message":      "Successfully logged out",
		"instructions": "Please remove the token from your client storage",
	})
}



*/
