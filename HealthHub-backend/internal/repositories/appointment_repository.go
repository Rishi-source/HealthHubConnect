package repositories

import (
	"HealthHubConnect/internal/models"
	"time"

	"gorm.io/gorm"
)

type AppointmentRepository interface {
	CreateAppointment(appointment *models.Appointment) error
	UpdateAppointment(appointment *models.Appointment) error
	GetAppointmentByID(id uint) (*models.Appointment, error)
	GetAppointmentsByPatientID(patientID uint) ([]models.Appointment, error)
	GetAppointmentsByDoctorID(doctorID uint) ([]models.Appointment, error)
	CreateAvailability(availability *models.DoctorAvailability) error
	GetDoctorAvailability(doctorID uint) ([]models.DoctorAvailability, error)
	GetConflictingAppointments(doctorID uint, date time.Time, start time.Time, end time.Time) ([]models.Appointment, error)
	IsDoctorAvailable(doctorID uint, date time.Time, start time.Time, end time.Time) (bool, error)
	GetAppointmentsByDoctorAndDate(doctorID uint, date time.Time) ([]models.Appointment, error)
	GetUpcomingAppointments(doctorID uint) ([]models.Appointment, error)
	GetPastAppointments(doctorID uint) ([]models.Appointment, error)
	GetAppointmentsByDoctorAndDateRange(doctorID uint, start time.Time, end time.Time) ([]models.Appointment, error)
	GetPatientUpcomingAppointments(patientID uint) ([]models.Appointment, error)
	GetDoctorUpcomingAppointments(doctorID uint) ([]models.Appointment, error)
}

type appointmentRepository struct {
	db *gorm.DB
}

func NewAppointmentRepository(db *gorm.DB) AppointmentRepository {
	return &appointmentRepository{db: db}
}

func (r *appointmentRepository) CreateAppointment(appointment *models.Appointment) error {
	return r.db.Create(appointment).Error
}

func (r *appointmentRepository) UpdateAppointment(appointment *models.Appointment) error {
	return r.db.Save(appointment).Error
}

func (r *appointmentRepository) GetAppointmentByID(id uint) (*models.Appointment, error) {
	var appointment models.Appointment
	err := r.db.Preload("Patient").Preload("Doctor").First(&appointment, id).Error
	return &appointment, err
}

func (r *appointmentRepository) GetAppointmentsByPatientID(patientID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Preload("Doctor").Where("patient_id = ?", patientID).Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) GetAppointmentsByDoctorID(doctorID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Preload("Patient").Where("doctor_id = ?", doctorID).Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) CreateAvailability(availability *models.DoctorAvailability) error {
	return r.db.Create(availability).Error
}

func (r *appointmentRepository) GetDoctorAvailability(doctorID uint) ([]models.DoctorAvailability, error) {
	var availability []models.DoctorAvailability
	err := r.db.Where("doctor_id = ?", doctorID).Find(&availability).Error
	return availability, err
}

func (r *appointmentRepository) GetConflictingAppointments(doctorID uint, date time.Time, start time.Time, end time.Time) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Where(`
        doctor_id = ? AND 
        date = ? AND 
        status != ? AND
        ((start_time <= ? AND end_time > ?) OR 
         (start_time < ? AND end_time >= ?))`,
		doctorID, date, models.StatusCancelled,
		end, start,
		end, start,
	).Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) IsDoctorAvailable(doctorID uint, date time.Time, start time.Time, end time.Time) (bool, error) {
	var count int64
	err := r.db.Model(&models.DoctorAvailability{}).Where(`
        doctor_id = ? AND 
        date = ? AND 
        start_time <= ? AND 
        end_time >= ?`,
		doctorID, date, start, end,
	).Count(&count).Error

	return count > 0, err
}

func (r *appointmentRepository) GetAppointmentsByDoctorAndDate(doctorID uint, date time.Time) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Where("doctor_id = ? AND DATE(date) = DATE(?)", doctorID, date).Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) GetUpcomingAppointments(doctorID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Preload("Patient").
		Where("doctor_id = ? AND date >= ? AND status = ?",
			doctorID, time.Now(), models.StatusConfirmed).
		Order("date asc").
		Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) GetPastAppointments(doctorID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Preload("Patient").
		Where("doctor_id = ? AND date < ?",
			doctorID, time.Now()).
		Order("date desc").
		Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) GetAppointmentsByDoctorAndDateRange(doctorID uint, start time.Time, end time.Time) ([]models.Appointment, error) {
	var appointments []models.Appointment
	err := r.db.Preload("Patient").
		Where("doctor_id = ? AND date >= ? AND date < ?", doctorID, start, end).
		Order("date asc, start_time asc").
		Find(&appointments).Error
	return appointments, err
}

func (r *appointmentRepository) GetPatientUpcomingAppointments(patientID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	now := time.Now()

	result := r.db.Debug().
		Preload("Doctor").
		Preload("Patient").
		Where("patient_id = ?", patientID).
		Where("date >= ? OR (date = ? AND start_time > ?)",
			now.Format("2006-01-02"),
			now.Format("2006-01-02"),
			now.Format("15:04:05")).
		Where("status NOT IN ?",
			[]models.AppointmentStatus{
				models.StatusCancelled,
				models.StatusCompleted,
				models.StatusNoShow,
			}).
		Order("date ASC, start_time ASC").
		Find(&appointments)

	if result.Error != nil {
		return nil, result.Error
	}

	return appointments, nil
}

func (r *appointmentRepository) GetDoctorUpcomingAppointments(doctorID uint) ([]models.Appointment, error) {
	var appointments []models.Appointment
	now := time.Now()

	result := r.db.Debug().
		Preload("Doctor").
		Preload("Patient").
		Where("doctor_id = ?", doctorID).
		Where("date >= ? OR (date = ? AND start_time > ?)",
			now.Format("2006-01-02"),
			now.Format("2006-01-02"),
			now.Format("15:04:05")).
		Where("status NOT IN ?",
			[]models.AppointmentStatus{
				models.StatusCancelled,
				models.StatusCompleted,
				models.StatusNoShow,
			}).
		Order("date ASC, start_time ASC").
		Find(&appointments)

	if result.Error != nil {
		return nil, result.Error
	}

	return appointments, nil
}
