package database

import (
	"HealthHubConnect/internal/database/migrations"
	"context"
	"database/sql"
	"errors"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var sqlDB *sql.DB

func InitDB() (*gorm.DB, error) {
	dbPath := "healthhub.db"
	var err error

	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err = db.DB()
	if err != nil {
		return nil, err
	}

	return db, nil
}

func Close() error {
	if sqlDB != nil {
		return sqlDB.Close()
	}
	return nil
}

func GetDB() *gorm.DB {
	return db
}

// to check health of the database returns nil if the database is healthy, error otherwise
func HealthCheck(ctx context.Context) error {
	if sqlDB == nil {
		return errors.New("database connection not initialized")
	}
	return sqlDB.PingContext(ctx)
}

// AutoMigrate runs all pending migrations
func AutoMigrate(models ...interface{}) error {
	migrations.Register(models...)
	return migrations.RunMigrations(db)
}
