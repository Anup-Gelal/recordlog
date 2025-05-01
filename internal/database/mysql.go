package database

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"time"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase(connectionString string) (*Database, error) {
	// Open database connection
	db, err := sql.Open("mysql", connectionString)
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	db.SetMaxOpenConns(25)                 // Limit maximum simultaneous connections
	db.SetMaxIdleConns(5)                  // Keep some connections ready
	db.SetConnMaxLifetime(5 * time.Minute) // Refresh connections periodically

	// Verify connection is working
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &Database{DB: db}, nil
}
