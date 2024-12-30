package database

import (
	"HealthHubConnect/internal/models"
	"context"
	"database/sql"
	"errors"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var sqlDB *sql.DB

// Models to migrate - add new models here
var model = []interface{}{
	&models.User{},
	&models.LoginAttempt{},
	// &models.OAuthAccount{},
	&models.EmergencyContact{},
	&models.Allergy{},
	&models.Medication{},
	&models.PastMedication{},
}

func InitDB() (*gorm.DB, error) {
	dbPath := "healthhub.db"
	var err error

	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return nil, err
	}

	// Run migrations immediately after db connection
	if err := autoMigrate(); err != nil {
		return nil, err
	}

	sqlDB, err = db.DB()
	if err != nil {
		return nil, err
	}

	return db, nil
}

// autoMigrate handles database migrations
func autoMigrate() error {
	for _, model := range model {
		if err := db.AutoMigrate(model); err != nil {
			return err
		}
	}

	// Create indexes
	return createIndexes()
}

// createIndexes creates database indexes
func createIndexes() error {
	// User related indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`).Error; err != nil {
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active)`).Error; err != nil {
		return err
	}

	return nil
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
