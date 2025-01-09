package services

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"errors"
	"fmt"
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
	appointmentRepo   repositories.AppointmentRepository
	conferenceService ConferenceService
}

func NewAppointmentService(appointmentRepo repositories.AppointmentRepository) AppointmentService {
	return &appointmentService{
		appointmentRepo:   appointmentRepo,
		conferenceService: NewConferenceService(),
	}
}

func (s *appointmentService) CreateAppointment(appointment *models.Appointment) error {
	if appointment.StartTime.Before(time.Now()) {
		return errors.New("appointment time cannot be in the past")
	}

	if appointment.Type != models.TypeOnline && appointment.Type != models.TypeOffline {
		return errors.New("invalid appointment type")
	}

	if appointment.Type == models.TypeOnline {
		conferenceDetails, err := s.conferenceService.CreateMeeting(appointment)
		if err != nil {
			return fmt.Errorf("failed to create conference: %w", err)
		}
		appointment.MeetingLink = conferenceDetails.JoinURL
	}

	return s.appointmentRepo.CreateAppointment(appointment)
}

func (s *appointmentService) UpdateAppointmentStatus(id uint, status models.AppointmentStatus) error {
	appointment, err := s.appointmentRepo.GetAppointmentByID(id)
	if err != nil {
		return err
	}

	// If appointment is cancelled and it's an online appointment, delete the meeting
	if status == models.StatusCancelled && appointment.Type == models.TypeOnline {
		if err := s.conferenceService.DeleteMeeting(appointment.MeetingLink); err != nil {
			return fmt.Errorf("failed to delete conference: %w", err)
		}
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
