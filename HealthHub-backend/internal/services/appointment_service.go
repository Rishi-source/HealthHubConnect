package services

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
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
	appointmentRepo repositories.AppointmentRepository
}

func NewAppointmentService(appointmentRepo repositories.AppointmentRepository) AppointmentService {
	return &appointmentService{appointmentRepo: appointmentRepo}
}

func (s *appointmentService) CreateAppointment(appointment *models.Appointment) error {
	now := time.Now()
	if appointment.Date.Before(now) {
		return errors.New("appointment date cannot be in the past")
	}

	if appointment.Type != models.TypeOnline && appointment.Type != models.TypeOffline {
		return errors.New("invalid appointment type")
	}

	if appointment.EndTime.Before(appointment.StartTime) {
		return errors.New("end time cannot be before start time")
	}
	availability, err := s.appointmentRepo.GetDoctorAvailability(appointment.DoctorID)
	if err != nil {
		return err
	}

	isAvailable := false
	for _, slot := range availability {
		if slot.Date.Equal(appointment.Date) &&
			!slot.StartTime.After(appointment.StartTime) &&
			!slot.EndTime.Before(appointment.EndTime) {
			isAvailable = true
			break
		}
	}

	if !isAvailable {
		return errors.New("selected time slot is not available")
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
