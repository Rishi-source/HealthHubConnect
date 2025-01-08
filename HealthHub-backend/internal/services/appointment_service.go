package services

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repository"
	"errors"
	"time"
)

type AppointmentService interface {
	CreateAppointment(appointment *models.Appointment) error
	UpdateAppointmentStatus(id uint, status models.AppointmentStatus) error
	GetAppointmentByID(id uint) (*models.Appointment, error)
	GetPatientAppointments(patientID uint) ([]models.Appointment, error)
	GetDoctorAppointments(doctorID uint) ([]models.Appointment, error)
	SetDoctorAvailability(availability *models.DoctorAvailability) error
	GetDoctorAvailability(doctorID uint) ([]models.DoctorAvailability, error)
}

type appointmentService struct {
	appointmentRepo repository.AppointmentRepository
}

func NewAppointmentService(appointmentRepo repository.AppointmentRepository) AppointmentService {
	return &appointmentService{appointmentRepo: appointmentRepo}
}

func (s *appointmentService) CreateAppointment(appointment *models.Appointment) error {
	if appointment.StartTime.Before(time.Now()) {
		return errors.New("appointment time cannot be in the past")
	}
	return s.appointmentRepo.CreateAppointment(appointment)
}

func (s *appointmentService) UpdateAppointmentStatus(id uint, status models.AppointmentStatus) error {
	appointment, err := s.appointmentRepo.GetAppointmentByID(id)
	if err != nil {
		return err
	}
	appointment.Status = status
	return s.appointmentRepo.UpdateAppointment(appointment)
}

func (s *appointmentService) GetAppointmentByID(id uint) (*models.Appointment, error) {
	return s.appointmentRepo.GetAppointmentByID(id)
}

func (s *appointmentService) GetPatientAppointments(patientID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetAppointmentsByPatientID(patientID)
}

func (s *appointmentService) GetDoctorAppointments(doctorID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetAppointmentsByDoctorID(doctorID)
}

func (s *appointmentService) SetDoctorAvailability(availability *models.DoctorAvailability) error {
	return s.appointmentRepo.CreateAvailability(availability)
}

func (s *appointmentService) GetDoctorAvailability(doctorID uint) ([]models.DoctorAvailability, error) {
	return s.appointmentRepo.GetDoctorAvailability(doctorID)
}
