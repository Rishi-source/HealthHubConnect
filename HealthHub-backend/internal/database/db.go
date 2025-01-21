package database

import (
	"HealthHubConnect/internal/models"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db    *gorm.DB
	sqlDB *sql.DB
)

var modelsToMigrate = []interface{}{
	&models.User{},
	&models.OAuthAccount{},
	&models.LoginAttempt{},
	&models.HealthProfile{},
	&models.EmergencyContact{},
	&models.Allergy{},
	&models.Medication{},
	&models.Prescription{},
	&models.VitalSign{},
	&models.ChatMessage{},
	&models.Hospital{},
	&models.Appointment{},
	&models.DoctorAvailability{},
	&models.DoctorProfile{},
	&models.DoctorSchedule{},
	&models.Bill{},
}

func InitDB() error {
	var err error

	// Add retry logic for database connection
	maxRetries := 5
	var lastError error

	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(sqlite.Open("healthhub.db?_timeout=10000&_journal=WAL&_sync=NORMAL&_mutex=full&_busy_timeout=10000"), &gorm.Config{
			PrepareStmt:            true,
			DisableAutomaticPing:   true,
			SkipDefaultTransaction: true,
			Logger:                 logger.Default.LogMode(logger.Silent),
		})

		if err == nil {
			break
		}

		lastError = err
		time.Sleep(time.Second * time.Duration(i+1))
	}

	if err != nil {
		return fmt.Errorf("failed to connect to database after %d retries: %v", maxRetries, lastError)
	}

	// Get underlying SQL database
	if sqlDB, err = db.DB(); err != nil {
		return err
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(5)
	sqlDB.SetMaxOpenConns(10)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Configure SQLite pragmas
	pragmas := []string{
		"PRAGMA journal_mode=WAL",
		"PRAGMA synchronous=NORMAL",
		"PRAGMA busy_timeout=10000",
		"PRAGMA foreign_keys=ON",
		"PRAGMA temp_store=MEMORY",
		"PRAGMA cache_size=5000",
	}

	for _, pragma := range pragmas {
		if result := db.Exec(pragma); result.Error != nil {
			return fmt.Errorf("failed to set pragma: %s: %v", pragma, result.Error)
		}
	}

	if err := createTablesIfNotExist(db); err != nil {
		return fmt.Errorf("failed to create tables: %v", err)
	}

	err = db.AutoMigrate(modelsToMigrate...)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate: %v", err)
	}

	return nil
}

func createTablesIfNotExist(db *gorm.DB) error {
	tables := []string{
		`CREATE TABLE IF NOT EXISTS prescriptions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at DATETIME,
			updated_at DATETIME,
			deleted_at DATETIME,
			appointment_id INTEGER NOT NULL,
			patient_id INTEGER NOT NULL,
			doctor_id INTEGER NOT NULL,
			diagnosis TEXT,
			chief_complaints TEXT,
			vitals TEXT,
			medications TEXT,
			investigations TEXT,
			advice TEXT,
			follow_up TEXT,
			status VARCHAR(20),
			expiry_date DATETIME,
			doctor_notes TEXT,
			is_digitally_signed BOOLEAN DEFAULT 0,
			signed_at DATETIME,
			patient_history TEXT
		)`,
	}

	for _, table := range tables {
		if result := db.Exec(table); result.Error != nil {
			return result.Error
		}
	}

	return nil
}

func Close() error {
	if sqlDB != nil {
		return sqlDB.Close()
	}
	return nil
}

func GetDB() (*gorm.DB, error) {
	if db == nil {
		if err := InitDB(); err != nil {
			return nil, err
		}
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	if err := sqlDB.Ping(); err != nil {

		if err := InitDB(); err != nil {
			return nil, err
		}
	}

	return db, nil
}

func HealthCheck() error {
	if sqlDB == nil {
		return errors.New("database not initialized")
	}
	return sqlDB.Ping()
}
