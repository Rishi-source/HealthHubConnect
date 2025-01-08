package database

import (
	"HealthHubConnect/internal/models"
	"database/sql"
	"errors"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
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
	&models.VitalSign{},
	&models.Hospital{},
	&models.Appointment{},
	&models.DoctorAvailability{},
}

func InitDB() error {
	var err error
	db, err = gorm.Open(sqlite.Open("healthhub.db"), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return err
	}

	if sqlDB, err = db.DB(); err != nil {
		return err
	}

	return db.AutoMigrate(modelsToMigrate...)
}

func Close() error {
	if sqlDB != nil {
		return sqlDB.Close()
	}
	return nil
}

func GetDB() (*gorm.DB, error) {
	if db == nil {
		return nil, errors.New("database not initialized")
	}
	return db, nil
}

func HealthCheck() error {
	if sqlDB == nil {
		return errors.New("database not initialized")
	}
	return sqlDB.Ping()
}
