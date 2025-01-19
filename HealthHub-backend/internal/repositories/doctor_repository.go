package repositories

import (
	"HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
)

type DoctorRepository struct {
	db *gorm.DB
}

func NewDoctorRepository(db *gorm.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

func (r *DoctorRepository) ValidateDoctorAccess(ctx context.Context, userID uint) error {
	var user models.User
	err := r.db.WithContext(ctx).Select("role").First(&user, userID).Error
	if err != nil {
		return errors.NewNotAuthorizedError("user not found")
	}

	if user.Role != models.RoleDoctor {
		return errors.NewForbiddenError("access denied: doctor role required")
	}

	return nil
}

func (r *DoctorRepository) SaveProfile(ctx context.Context, profile *models.DoctorProfile) error {
	if err := r.ValidateDoctorAccess(ctx, profile.UserID); err != nil {
		return err
	}

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var existing models.DoctorProfile
		err := tx.Where("user_id = ?", profile.UserID).First(&existing).Error

		if err != nil {
			if err == gorm.ErrRecordNotFound {
				return tx.Create(profile).Error
			}
			return err
		}

		profile.ID = existing.ID
		return tx.Save(profile).Error
	})
}

func (r *DoctorRepository) GetProfile(ctx context.Context, userID uint) (*models.DoctorProfile, error) {
	var profile models.DoctorProfile

	log.Printf("Fetching doctor profile for userID: %d", userID)

	err := r.db.WithContext(ctx).
		Table("doctor_profiles").
		Select("doctor_profiles.*, basic_info_json, qual_json, practice_json, spec_json").
		Joins("LEFT JOIN users ON users.id = doctor_profiles.user_id").
		Where("doctor_profiles.user_id = ? AND users.role = ?", userID, models.RoleDoctor).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, profile_picture")
		}).
		First(&profile).Error

	if err != nil {
		log.Printf("Error fetching profile: %v", err)
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("doctor profile not found")
		}
		return nil, err
	}

	var jsonData struct {
		BasicInfoJSON string `gorm:"column:basic_info_json"`
		QualJSON      string `gorm:"column:qual_json"`
		PracticeJSON  string `gorm:"column:practice_json"`
		SpecJSON      string `gorm:"column:spec_json"`
	}

	err = r.db.WithContext(ctx).
		Table("doctor_profiles").
		Where("user_id = ?", userID).
		Select("basic_info_json, qual_json, practice_json, spec_json").
		Scan(&jsonData).Error

	if err != nil {
		log.Printf("Error fetching JSON data: %v", err)
		return nil, err
	}

	log.Printf("Raw JSON data - Basic: %s", jsonData.BasicInfoJSON)
	log.Printf("Raw JSON data - Qual: %s", jsonData.QualJSON)
	log.Printf("Raw JSON data - Practice: %s", jsonData.PracticeJSON)
	log.Printf("Raw JSON data - Spec: %s", jsonData.SpecJSON)

	if jsonData.BasicInfoJSON != "" {
		if err := json.Unmarshal([]byte(jsonData.BasicInfoJSON), &profile.BasicInfo); err != nil {
			log.Printf("Error unmarshaling BasicInfo: %v", err)
		}
	}
	if jsonData.QualJSON != "" {
		if err := json.Unmarshal([]byte(jsonData.QualJSON), &profile.Qualifications); err != nil {
			log.Printf("Error unmarshaling Qualifications: %v", err)
		}
	}
	if jsonData.PracticeJSON != "" {
		if err := json.Unmarshal([]byte(jsonData.PracticeJSON), &profile.PracticeDetails); err != nil {
			log.Printf("Error unmarshaling PracticeDetails: %v", err)
		}
	}
	if jsonData.SpecJSON != "" {
		if err := json.Unmarshal([]byte(jsonData.SpecJSON), &profile.Specializations); err != nil {
			log.Printf("Error unmarshaling Specializations: %v", err)
		}
	}

	if err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("id = ?", userID).
		Select("id, name, profile_picture").
		Scan(&profile.User).Error; err != nil {
		log.Printf("Error fetching user data: %v", err)
	}

	log.Printf("Final profile data: %+v", profile)
	return &profile, nil
}

func (r *DoctorRepository) UpdateProfile(ctx context.Context, profile *models.DoctorProfile) error {
	if err := r.ValidateDoctorAccess(ctx, profile.UserID); err != nil {
		return err
	}

	var existingProfile models.DoctorProfile
	if err := r.db.WithContext(ctx).Where("user_id = ?", profile.UserID).First(&existingProfile).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return r.SaveProfile(ctx, profile)
		}
		return err
	}

	profile.ID = existingProfile.ID
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *DoctorRepository) DeleteProfile(ctx context.Context, userID uint) error {
	if err := r.ValidateDoctorAccess(ctx, userID); err != nil {
		return err
	}

	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&models.DoctorProfile{}).Error
}

func (r *DoctorRepository) SaveSchedule(ctx context.Context, schedule *models.DoctorSchedule) error {
	if err := r.ValidateDoctorAccess(ctx, schedule.DoctorID); err != nil {
		return err
	}

	var existing models.DoctorSchedule
	err := r.db.WithContext(ctx).Where("doctor_id = ?", schedule.DoctorID).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return r.db.WithContext(ctx).Create(schedule).Error
	}

	schedule.ID = existing.ID
	return r.db.WithContext(ctx).Save(schedule).Error
}

func (r *DoctorRepository) GetSchedule(ctx context.Context, doctorID uint) (*models.DoctorSchedule, error) {
	if err := r.ValidateDoctorAccess(ctx, doctorID); err != nil {
		return nil, err
	}

	var schedule models.DoctorSchedule
	err := r.db.WithContext(ctx).Where("doctor_id = ?", doctorID).First(&schedule).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("schedule not found")
		}
		return nil, err
	}

	return &schedule, nil
}

func (r *DoctorRepository) SaveBulkAvailability(ctx context.Context, availabilities []models.DoctorAvailability) error {

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("doctor_id = ? AND date >= ?",
			availabilities[0].DoctorID,
			time.Now().Format("2006-01-02")).
			Delete(&models.DoctorAvailability{}).Error; err != nil {
			return err
		}

		return tx.CreateInBatches(availabilities, 100).Error
	})
}

func (r *DoctorRepository) GetLastAvailabilityDate(ctx context.Context, doctorID uint, lastAvailability *models.DoctorAvailability) error {
	return r.db.WithContext(ctx).
		Where("doctor_id = ?", doctorID).
		Order("date DESC").
		First(lastAvailability).Error
}

func (r *DoctorRepository) AddBulkAvailability(ctx context.Context, availabilities []models.DoctorAvailability) error {
	return r.db.WithContext(ctx).CreateInBatches(availabilities, 100).Error
}

func (r *DoctorRepository) ListDoctors(ctx context.Context, filters map[string]interface{}, page, limit int) ([]models.DoctorProfile, int64, error) {
	var profiles []models.DoctorProfile
	var total int64

	query := r.db.WithContext(ctx).
		Model(&models.DoctorProfile{}).
		Joins("JOIN users ON users.id = doctor_profiles.user_id").
		Where("users.role = ?", models.RoleDoctor).
		Preload("User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, profile_picture")
		})
	fmt.Print(query)
	if specialization, ok := filters["specialization"].(string); ok && specialization != "" {
		query = query.Where("basic_info_json->>'specializations' @> ?", fmt.Sprintf("[\"%s\"]", specialization))
	}
	if name, ok := filters["name"].(string); ok && name != "" {
		query = query.Where("users.name ILIKE ?", "%"+name+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Offset((page - 1) * limit).
		Limit(limit).
		Find(&profiles).Error

	if err != nil {
		log.Printf("Error fetching doctors: %v", err)
		return nil, 0, err
	}

	log.Printf("Found %d doctors", len(profiles))
	return profiles, total, nil
}

func (r *DoctorRepository) DeleteAvailabilitySlots(ctx context.Context, doctorID uint, date time.Time, startTime time.Time, endTime time.Time) error {
	return r.db.WithContext(ctx).
		Where("doctor_id = ? AND date = ? AND start_time >= ? AND end_time <= ?",
			doctorID, date, startTime, endTime).
		Delete(&models.DoctorAvailability{}).Error
}
