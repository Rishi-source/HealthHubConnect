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
	now := time.Now().In(time.Local)

	// Create appointment date-time by combining date and time
	appointmentDateTime := time.Date(
		appointment.Date.Year(),
		appointment.Date.Month(),
		appointment.Date.Day(),
		appointment.StartTime.Hour(),
		appointment.StartTime.Minute(),
		0, 0,
		time.Local,
	)

	// Calculate minimum allowed appointment time (15 minutes from now)
	minAllowedTime := now.Add(15 * time.Minute)

	if appointmentDateTime.Before(minAllowedTime) {
		return errors.New("appointment must be scheduled at least 15 minutes in advance")
	}

	// Create end date-time
	endDateTime := time.Date(
		appointment.Date.Year(),
		appointment.Date.Month(),
		appointment.Date.Day(),
		appointment.EndTime.Hour(),
		appointment.EndTime.Minute(),
		0, 0,
		time.Local,
	)

	if endDateTime.Before(appointmentDateTime) {
		return errors.New("end time cannot be before start time")
	}

	if appointment.Type != models.TypeOnline && appointment.Type != models.TypeOffline {
		return errors.New("invalid appointment type")
	}

	// Rest of the availability check logic remains the same
	availability, err := s.appointmentRepo.GetDoctorAvailability(appointment.DoctorID)
	if err != nil {
		return err
	}

	isAvailable := false
	for _, slot := range availability {
		if slot.Date.Equal(appointment.Date) &&
			!slot.StartTime.After(appointmentDateTime) &&
			!slot.EndTime.Before(endDateTime) {
			isAvailable = true
			break
		}
	}

	if !isAvailable {
		return errors.New("selected time slot is not available")
	}

	// Update the appointment with normalized times
	appointment.StartTime = appointmentDateTime
	appointment.EndTime = endDateTime

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
