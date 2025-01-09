package repositories

import (
	"HealthHubConnect/internal/models"

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
