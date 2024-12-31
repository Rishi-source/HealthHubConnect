package repositories

import (
	"HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/pkg/logger"

	"gorm.io/gorm"
)

type HealthRepository struct {
	db     *gorm.DB
	logger *logger.LoggerManager
}

func NewHealthRepository(db *gorm.DB) *HealthRepository {
	return &HealthRepository{
		db:     db,
		logger: logger.GetLogger(),
	}
}

func (r *HealthRepository) GetHealthProfile(userID uint) (*models.HealthProfile, error) {
	var profile models.HealthProfile
	err := r.db.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			r.logger.DBLogger.Warn().
				Uint("userID", userID).
				Msg("Health profile not found")
			return nil, errors.NewObjectNotFoundError("health profile")
		}
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching health profile")
		return nil, err
	}

	r.logger.DBLogger.Debug().
		Uint("userID", userID).
		Uint("profileID", profile.ID).
		Msg("Successfully retrieved health profile")

	return &profile, nil
}

func (r *HealthRepository) GetVitalSigns(userID uint) ([]models.VitalSign, error) {
	var vitals []models.VitalSign
	err := r.db.Where("user_id = ?", userID).
		Order("timestamp desc").
		Find(&vitals).Error
	if err != nil {
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching vital signs")
		return nil, err
	}

	r.logger.DBLogger.Debug().
		Uint("userID", userID).
		Int("count", len(vitals)).
		Msg("Successfully retrieved vital signs")

	return vitals, nil
}

func (r *HealthRepository) GetEmergencyContacts(userID uint) ([]models.EmergencyContact, error) {
	var contacts []models.EmergencyContact
	err := r.db.Where("user_id = ?", userID).Find(&contacts).Error
	if err != nil {
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching emergency contacts")
		return nil, err
	}

	r.logger.DBLogger.Debug().
		Uint("userID", userID).
		Int("count", len(contacts)).
		Msg("Successfully retrieved emergency contacts")

	return contacts, nil
}

func (r *HealthRepository) GetAllergies(userID uint) ([]models.Allergy, error) {
	var allergies []models.Allergy
	err := r.db.Where("user_id = ? AND is_active = ?", userID, true).Find(&allergies).Error
	if err != nil {
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching allergies")
		return nil, err
	}
	return allergies, nil
}

func (r *HealthRepository) GetCurrentMedications(userID uint) ([]models.Medication, error) {
	var medications []models.Medication
	err := r.db.Where("user_id = ? AND is_active = ?", userID, true).Find(&medications).Error
	if err != nil {
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching current medications")
		return nil, err
	}
	return medications, nil
}

func (r *HealthRepository) GetPastMedications(userID uint) ([]models.PastMedication, error) {
	var medications []models.PastMedication
	err := r.db.Where("user_id = ?", userID).Find(&medications).Error
	if err != nil {
		r.logger.DBLogger.Error().
			Err(err).
			Uint("userID", userID).
			Msg("Database error while fetching past medications")
		return nil, err
	}
	return medications, nil
}

func (r *HealthRepository) BeginTx() *gorm.DB {
	return r.db.Begin()
}

func (r *HealthRepository) SaveHealthProfile(tx *gorm.DB, profile *models.HealthProfile) error {
	return tx.Save(profile).Error
}

func (r *HealthRepository) SaveEmergencyContact(tx *gorm.DB, contact *models.EmergencyContact) error {
	return tx.Save(contact).Error
}

func (r *HealthRepository) SaveVitalSign(tx *gorm.DB, vitalSign *models.VitalSign) error {
	return tx.Save(vitalSign).Error
}

func (r *HealthRepository) SaveAllergy(tx *gorm.DB, allergy *models.Allergy) error {
	return tx.Save(allergy).Error
}

func (r *HealthRepository) SaveMedication(tx *gorm.DB, medication *models.Medication) error {
	return tx.Save(medication).Error
}
