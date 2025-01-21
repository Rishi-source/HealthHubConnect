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

func (r *DoctorRepository) GetScheduleWithoutValidation(ctx context.Context, doctorID uint) (*models.DoctorSchedule, error) {
	var schedule models.DoctorSchedule
	err := r.db.Where("doctor_id = ?", doctorID).First(&schedule).Error
	return &schedule, err
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

func (r *DoctorRepository) GetDoctorPatients(ctx context.Context, doctorID uint, page, limit int) ([]models.PatientInfo, int64, error) {
	var patients []models.PatientInfo
	var total int64

	subquery := r.db.WithContext(ctx).
		Table("appointments").
		Select("DISTINCT patient_id").
		Where("doctor_id = ?", doctorID)

	query := r.db.WithContext(ctx).
		Table("users").
		Select(`
            users.id as user_id,
            users.name,
            users.email,
            users.phone,
            (SELECT date FROM appointments a1 
             WHERE a1.patient_id = users.id 
             AND a1.doctor_id = ? 
             AND a1.status = 'COMPLETED'
             ORDER BY date DESC LIMIT 1) as last_visit,
            (SELECT COUNT(*) FROM appointments a2 
             WHERE a2.patient_id = users.id 
             AND a2.doctor_id = ? 
             AND a2.status = 'COMPLETED') as total_visits,
            (SELECT date FROM appointments a3 
             WHERE a3.patient_id = users.id 
             AND a3.doctor_id = ? 
             AND a3.date > datetime('now') 
             AND a3.status = 'CONFIRMED'
             ORDER BY date ASC LIMIT 1) as next_appointment
        `, doctorID, doctorID, doctorID).
		Joins("JOIN (?) AS pat ON users.id = pat.patient_id", subquery).
		Where("users.role = ?", models.RolePatient)

	err := r.db.WithContext(ctx).
		Table("(?)", query).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = query.
		Order("last_visit DESC").
		Offset((page - 1) * limit).
		Limit(limit).
		Scan(&patients).Error

	if err != nil {
		return nil, 0, err
	}

	return patients, total, nil
}

func (r *DoctorRepository) IsPatientOfDoctor(ctx context.Context, doctorID, patientID uint) bool {
	var count int64
	r.db.WithContext(ctx).Model(&models.Appointment{}).
		Where("doctor_id = ? AND patient_id = ?", doctorID, patientID).
		Count(&count)
	return count > 0
}

// Bill related methods
func (r *DoctorRepository) CreateBill(ctx context.Context, bill *models.Bill) error {
	// Generate bill number
	billNumber := fmt.Sprintf("BILL-%d-%s", bill.DoctorID, time.Now().Format("20060102150405"))
	bill.BillNumber = billNumber
	bill.IssuedAt = time.Now()

	// Marshal items to JSON string
	itemsJSON, err := json.Marshal(bill.Items)
	if err != nil {
		return err
	}

	// Create a map for updates
	billData := map[string]interface{}{
		"bill_number":     bill.BillNumber,
		"appointment_id":  bill.AppointmentID,
		"patient_id":      bill.PatientID,
		"doctor_id":       bill.DoctorID,
		"sub_total":       bill.SubTotal,
		"tax_amount":      bill.TaxAmount,
		"discount_amount": bill.DiscountAmount,
		"total_amount":    bill.TotalAmount,
		"status":          bill.Status,
		"due_date":        bill.DueDate,
		"notes":           bill.Notes,
		"payment_method":  bill.PaymentMethod,
		"items":           string(itemsJSON), // Store items as JSON string
		"issued_at":       bill.IssuedAt,
	}

	return r.db.WithContext(ctx).Model(&models.Bill{}).Create(billData).Error
}

func (r *DoctorRepository) GetBillByAppointmentID(ctx context.Context, appointmentID uint) (*models.Bill, error) {
	var bill models.Bill
	var rawBill struct {
		models.Bill
		RawItems          string `gorm:"column:items"`
		RawPaymentDetails string `gorm:"column:payment_details"`
	}

	err := r.db.WithContext(ctx).
		Where("appointment_id = ?", appointmentID).
		First(&rawBill).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("bill not found")
		}
		return nil, err
	}

	// Copy all fields except Items and PaymentDetails
	bill = rawBill.Bill

	// Parse items JSON
	if rawBill.RawItems != "" {
		var items []models.BillItem
		if err := json.Unmarshal([]byte(rawBill.RawItems), &items); err != nil {
			return nil, fmt.Errorf("error unmarshaling bill items: %v", err)
		}
		bill.Items = items
	}

	// Parse payment details JSON
	if rawBill.RawPaymentDetails != "" {
		bill.PaymentDetails = json.RawMessage(rawBill.RawPaymentDetails)
	}

	return &bill, nil
}

func (r *DoctorRepository) UpdateBill(ctx context.Context, appointmentID uint, billUpdate *models.Bill) error {
	// Marshal PaymentDetails to JSON string
	paymentDetailsJSON, err := json.Marshal(billUpdate.PaymentDetails)
	if err != nil {
		return err
	}

	// Create update map with serialized fields
	updates := map[string]interface{}{
		"status":          billUpdate.Status,
		"payment_method":  billUpdate.PaymentMethod,
		"payment_details": string(paymentDetailsJSON),
		"payment_date":    billUpdate.PaymentDate,
		"transaction_id":  billUpdate.TransactionID,
		"paid_amount":     billUpdate.PaidAmount,
		"paid_at":         time.Now(),
	}

	return r.db.WithContext(ctx).
		Model(&models.Bill{}).
		Where("appointment_id = ?", appointmentID).
		Updates(updates).Error
}

func (r *DoctorRepository) GetBillsByDoctorID(ctx context.Context, doctorID uint, page, limit int) ([]models.Bill, int64, error) {
	var bills []models.Bill
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Bill{}).
		Where("doctor_id = ?", doctorID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("created_at desc").
		Offset((page - 1) * limit).
		Limit(limit).
		Find(&bills).Error

	return bills, total, err
}

func (r *DoctorRepository) CreatePrescription(ctx context.Context, prescription *models.Prescription) error {
	// Begin a transaction
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return tx.Error
	}

	// Defer rollback in case anything fails
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Convert slices and structs to JSON strings
	diagnosisJSON, err := json.Marshal(prescription.Diagnosis)
	if err != nil {
		tx.Rollback()
		return err
	}

	complaintsJSON, err := json.Marshal(prescription.ChiefComplaints)
	if err != nil {
		tx.Rollback()
		return err
	}

	vitalsJSON, err := json.Marshal(prescription.Vitals)
	if err != nil {
		tx.Rollback()
		return err
	}

	medicationsJSON, err := json.Marshal(prescription.Medications)
	if err != nil {
		tx.Rollback()
		return err
	}

	investigationsJSON, err := json.Marshal(prescription.Investigations)
	if err != nil {
		tx.Rollback()
		return err
	}

	followUpJSON, err := json.Marshal(prescription.FollowUp)
	if err != nil {
		tx.Rollback()
		return err
	}

	patientHistoryJSON, err := json.Marshal(prescription.PatientHistory)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Create a map for inserting the data
	prescriptionData := map[string]interface{}{
		"appointment_id":      prescription.AppointmentID,
		"patient_id":          prescription.PatientID,
		"doctor_id":           prescription.DoctorID,
		"diagnosis":           string(diagnosisJSON),
		"chief_complaints":    string(complaintsJSON),
		"vitals":              string(vitalsJSON),
		"medications":         string(medicationsJSON),
		"investigations":      string(investigationsJSON),
		"advice":              prescription.Advice,
		"follow_up":           string(followUpJSON),
		"status":              string(prescription.Status),
		"expiry_date":         prescription.ExpiryDate,
		"doctor_notes":        prescription.DoctorNotes,
		"is_digitally_signed": prescription.IsDigitallySigned,
		"signed_at":           prescription.SignedAt,
		"patient_history":     string(patientHistoryJSON),
	}

	// Execute the insert within the transaction
	if err := tx.Table("prescriptions").Create(prescriptionData).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Get the created prescription's ID and timestamps
	var created struct {
		ID        uint      `gorm:"column:id"`
		CreatedAt time.Time `gorm:"column:created_at"`
		UpdatedAt time.Time `gorm:"column:updated_at"`
	}

	if err := tx.Table("prescriptions").
		Where("appointment_id = ?", prescription.AppointmentID).
		Select("id, created_at, updated_at").
		First(&created).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update the original prescription's fields
	prescription.ID = created.ID
	prescription.CreatedAt = created.CreatedAt
	prescription.UpdatedAt = created.UpdatedAt

	// Commit the transaction
	return tx.Commit().Error
}

// Add a corresponding GetPrescription method that handles JSON unmarshaling
func (r *DoctorRepository) GetPrescription(ctx context.Context, appointmentID uint) (*models.Prescription, error) {
	var dbPrescription struct {
		models.Base
		AppointmentID     uint            `gorm:"not null;index"`
		PatientID         uint            `gorm:"not null;index"`
		DoctorID          uint            `gorm:"not null;index"`
		Diagnosis         json.RawMessage `gorm:"type:json"`
		ChiefComplaints   json.RawMessage `gorm:"type:json"`
		Vitals            json.RawMessage `gorm:"type:json"`
		Medications       json.RawMessage `gorm:"type:json"`
		Investigations    json.RawMessage `gorm:"type:json"`
		Advice            string          `gorm:"type:text"`
		FollowUp          json.RawMessage `gorm:"type:json"`
		Status            string          `gorm:"type:varchar(20)"`
		ExpiryDate        *time.Time
		DoctorNotes       string `gorm:"type:text"`
		IsDigitallySigned bool
		SignedAt          *time.Time
		PatientHistory    json.RawMessage `gorm:"type:json"`
	}

	if err := r.db.Where("appointment_id = ?", appointmentID).First(&dbPrescription).Error; err != nil {
		return nil, err
	}

	prescription := &models.Prescription{
		Base:              dbPrescription.Base,
		AppointmentID:     dbPrescription.AppointmentID,
		PatientID:         dbPrescription.PatientID,
		DoctorID:          dbPrescription.DoctorID,
		Advice:            dbPrescription.Advice,
		Status:            models.PrescriptionStatus(dbPrescription.Status),
		ExpiryDate:        dbPrescription.ExpiryDate,
		DoctorNotes:       dbPrescription.DoctorNotes,
		IsDigitallySigned: dbPrescription.IsDigitallySigned,
		SignedAt:          dbPrescription.SignedAt,
	}

	// Unmarshal JSON fields
	json.Unmarshal(dbPrescription.Diagnosis, &prescription.Diagnosis)
	json.Unmarshal(dbPrescription.ChiefComplaints, &prescription.ChiefComplaints)
	json.Unmarshal(dbPrescription.Vitals, &prescription.Vitals)
	json.Unmarshal(dbPrescription.Medications, &prescription.Medications)
	json.Unmarshal(dbPrescription.Investigations, &prescription.Investigations)
	json.Unmarshal(dbPrescription.FollowUp, &prescription.FollowUp)
	json.Unmarshal(dbPrescription.PatientHistory, &prescription.PatientHistory)

	return prescription, nil
}

func (r *DoctorRepository) UpdatePrescription(ctx context.Context, appointmentID uint, prescription *models.Prescription) error {
	return r.db.WithContext(ctx).
		Where("appointment_id = ?", appointmentID).
		Updates(prescription).Error
}

func (r *DoctorRepository) UpdatePatientHealthProfile(ctx context.Context, healthProfile *models.HealthProfile) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First try to update existing profile
		result := tx.Where("user_id = ?", healthProfile.UserID).
			Updates(healthProfile)

		if result.RowsAffected == 0 {
			// If no existing profile, create new one
			return tx.Create(healthProfile).Error
		}

		return result.Error
	})
}

func (r *DoctorRepository) SaveBillingSettings(ctx context.Context, doctorID uint, settings json.RawMessage) error {
	return r.db.WithContext(ctx).
		Model(&models.DoctorProfile{}).
		Where("user_id = ?", doctorID).
		Update("billing_settings", settings).Error
}

func (r *DoctorRepository) GetPrescriptionByAppointmentID(ctx context.Context, appointmentID uint) (*models.Prescription, error) {
	var dbPrescription struct {
		models.Base
		AppointmentID     uint            `gorm:"not null;index"`
		PatientID         uint            `gorm:"not null;index"`
		DoctorID          uint            `gorm:"not null;index"`
		Diagnosis         json.RawMessage `gorm:"type:json"`
		ChiefComplaints   json.RawMessage `gorm:"type:json"`
		Vitals            json.RawMessage `gorm:"type:json"`
		Medications       json.RawMessage `gorm:"type:json"`
		Investigations    json.RawMessage `gorm:"type:json"`
		Advice            string          `gorm:"type:text"`
		FollowUp          json.RawMessage `gorm:"type:json"`
		Status            string          `gorm:"type:varchar(20)"`
		ExpiryDate        *time.Time
		DoctorNotes       string `gorm:"type:text"`
		IsDigitallySigned bool
		SignedAt          *time.Time
		PatientHistory    json.RawMessage `gorm:"type:json"`
	}

	if err := r.db.WithContext(ctx).
		Table("prescriptions").
		Where("appointment_id = ?", appointmentID).
		First(&dbPrescription).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.NewNotFoundError("prescription not found")
		}
		return nil, err
	}

	prescription := &models.Prescription{
		Base:              dbPrescription.Base,
		AppointmentID:     dbPrescription.AppointmentID,
		PatientID:         dbPrescription.PatientID,
		DoctorID:          dbPrescription.DoctorID,
		Advice:            dbPrescription.Advice,
		Status:            models.PrescriptionStatus(dbPrescription.Status),
		ExpiryDate:        dbPrescription.ExpiryDate,
		DoctorNotes:       dbPrescription.DoctorNotes,
		IsDigitallySigned: dbPrescription.IsDigitallySigned,
		SignedAt:          dbPrescription.SignedAt,
	}

	// Unmarshal JSON fields
	if err := json.Unmarshal(dbPrescription.Diagnosis, &prescription.Diagnosis); err != nil {
		return nil, fmt.Errorf("error unmarshaling diagnosis: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.ChiefComplaints, &prescription.ChiefComplaints); err != nil {
		return nil, fmt.Errorf("error unmarshaling chief complaints: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.Vitals, &prescription.Vitals); err != nil {
		return nil, fmt.Errorf("error unmarshaling vitals: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.Medications, &prescription.Medications); err != nil {
		return nil, fmt.Errorf("error unmarshaling medications: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.Investigations, &prescription.Investigations); err != nil {
		return nil, fmt.Errorf("error unmarshaling investigations: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.FollowUp, &prescription.FollowUp); err != nil {
		return nil, fmt.Errorf("error unmarshaling follow up: %v", err)
	}
	if err := json.Unmarshal(dbPrescription.PatientHistory, &prescription.PatientHistory); err != nil {
		return nil, fmt.Errorf("error unmarshaling patient history: %v", err)
	}

	return prescription, nil
}
