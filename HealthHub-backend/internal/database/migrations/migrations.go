package migrations

import (
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
func RunMigrations(db *gorm.DB) error {
	if err := db.AutoMigrate(&Migration{}); err != nil {
		return fmt.Errorf("failed to create migrations table: %v", err)
	}

	for _, model := range registeredModels {
		modelName := fmt.Sprintf("%T", model)

		var migration Migration
		if result := db.Where("name = ?", modelName).First(&migration); result.Error == gorm.ErrRecordNotFound {
			if err := db.AutoMigrate(model); err != nil {
				return fmt.Errorf("failed to migrate %s: %v", modelName, err)
			}

			migration = Migration{
				Name:      modelName,
				CreatedAt: time.Now(),
			}
			if err := db.Create(&migration).Error; err != nil {
				return fmt.Errorf("failed to record migration %s: %v", modelName, err)
			}
		}
	}

	return nil
}
