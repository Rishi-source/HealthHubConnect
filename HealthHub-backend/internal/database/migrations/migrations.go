package migrations

import (
	"HealthHubConnect/internal/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// you might be thinking why a new migration package is created instead of using the db package to run migrations
// the reason is that the migrations package will help us  track all the migrations which would be great for debugging and tracking purposes

type Migration struct {
	ID        uint   `gorm:"primarykey"`
	Name      string `gorm:"unique"`
	CreatedAt time.Time
}

var registeredModels []interface{}

func Register(models ...interface{}) {
	registeredModels = append(registeredModels, models...)
}

func init() {
	Register(
		&models.User{},
		&models.LoginAttempt{},
		&models.OAuthAccount{}, // Uncomment this
		&models.EmergencyContact{},
		&models.Allergy{},
		&models.Medication{},
		&models.PastMedication{},
	)
}

func registerIndexes(db *gorm.DB) error {
	// User related indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`).Error; err != nil {
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active)`).Error; err != nil {
		return err
	}

	// Login attempts indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_login_attempts_user_time ON login_attempts (user_id, timestamp)`).Error; err != nil {
		return err
	}

	// OAuth accounts indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts (user_id, provider)`).Error; err != nil {
		return err
	}

	// Emergency contacts indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_main ON emergency_contacts (user_id, is_main_contact)`).Error; err != nil {
		return err
	}

	// Allergies indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_allergies_user_active ON allergies (user_id, is_active)`).Error; err != nil {
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_allergies_severity ON allergies (severity)`).Error; err != nil {
		return err
	}

	// Medications indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications (user_id, is_active)`).Error; err != nil {
		return err
	}
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_medications_refill ON medications (next_refill_date)`).Error; err != nil {
		return err
	}

	// Past medications indexes
	if err := db.Exec(`CREATE INDEX IF NOT EXISTS idx_past_medications_user ON past_medications (user_id)`).Error; err != nil {
		return err
	}

	return nil
}

func RunMigrations(db *gorm.DB) error {
	// Create migrations table first
	if err := db.AutoMigrate(&Migration{}); err != nil {
		return fmt.Errorf("failed to create migrations table: %v", err)
	}

	// First, manually create tables in order to handle dependencies
	tables := []interface{}{
		&models.User{},         // First create users
		&models.OAuthAccount{}, // Then OAuth accounts that depend on users
		&models.LoginAttempt{}, // Then other tables that depend on users
		&models.EmergencyContact{},
		&models.Allergy{},
		&models.Medication{},
		&models.PastMedication{},
	}

	// Create all tables first
	for _, table := range tables {
		if err := db.AutoMigrate(table); err != nil {
			return fmt.Errorf("failed to create table for %T: %v", table, err)
		}
	}

	// Then record migrations
	for _, model := range registeredModels {
		modelName := fmt.Sprintf("%T", model)
		var migration Migration
		if result := db.Where("name = ?", modelName).First(&migration); result.Error == gorm.ErrRecordNotFound {
			migration = Migration{
				Name:      modelName,
				CreatedAt: time.Now(),
			}
			if err := db.Create(&migration).Error; err != nil {
				return fmt.Errorf("failed to record migration %s: %v", modelName, err)
			}
		}
	}

	// Finally create indexes
	if err := registerIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %v", err)
	}

	return nil
}
