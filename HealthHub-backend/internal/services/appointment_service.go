package services

import (
	e "HealthHubConnect/internal/errors" // Add this import
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
	"encoding/json"
	"fmt"
	"strings"
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
	GetAvailableSlots(doctorID uint, date time.Time) ([]models.TimeSlot, error)
	ValidateAppointmentTime(doctorID uint, date time.Time, startTime time.Time) error
	GetDoctorUpcomingAppointments(doctorID uint) ([]models.Appointment, error)
	GetDoctorPastAppointments(doctorID uint) ([]models.Appointment, error)
	GetPatientUpcomingAppointments(patientID uint) ([]models.Appointment, error)
	GetPatientPastAppointments(patientID uint) ([]models.Appointment, error)
	CancelAppointment(appointmentID uint, userID uint) error
	GetDoctorTodayAppointments(doctorID uint) ([]models.Appointment, error)
	GetDoctorWeekAppointments(doctorID uint) ([]models.Appointment, error)
	RescheduleAppointment(appointmentID uint, userID uint, req *models.AppointmentRequest) error
}

type appointmentService struct {
	appointmentRepo repositories.AppointmentRepository
	userRepo        repositories.UserRepository
	doctorRepo      *repositories.DoctorRepository
	meetService     *MeetService
}

func NewAppointmentService(
	appointmentRepo repositories.AppointmentRepository,
	userRepo repositories.UserRepository,
	doctorRepo *repositories.DoctorRepository,
) (AppointmentService, error) {
	meetService, err := NewMeetService(&userRepo)
	if err != nil {
		return nil, err
	}

	return &appointmentService{
		appointmentRepo: appointmentRepo,
		userRepo:        userRepo,
		doctorRepo:      doctorRepo,
		meetService:     meetService,
	}, nil
}

func (s *appointmentService) CreateAppointment(appointment *models.Appointment) error {
	// Get current date without time component for comparison
	now := time.Now().Truncate(24 * time.Hour)
	appointmentDate := appointment.Date.Truncate(24 * time.Hour)

	if appointmentDate.Before(now) {
		return e.NewBadRequestError("cannot schedule appointments in the past")
	}

	if appointmentDate.Equal(now) {
		// If same day, check if appointment time is in the past
		currentTime := time.Now()
		if appointment.StartTime.Before(currentTime) {
			return e.NewBadRequestError("cannot schedule appointments in the past")
		}
	}

	if appointment.EndTime.Before(appointment.StartTime) {
		return e.NewBadRequestError("end time must be after start time")
	}

	duration := appointment.EndTime.Sub(appointment.StartTime)
	if duration < models.MinAppointmentDuration || duration > models.MaxAppointmentDuration {
		return e.NewBadRequestError("appointment duration must be between 15 and 120 minutes")
	}

	// Check for conflicting appointments
	existing, err := s.appointmentRepo.GetConflictingAppointments(
		appointment.DoctorID,
		appointment.Date,
		appointment.StartTime,
		appointment.EndTime,
	)
	if err != nil {
		return err
	}
	if len(existing) > 0 {
		return e.NewDuplicateResourceError("time slot already booked")
	}

	// Generate Meet link for online appointments
	if appointment.Type == models.TypeOnline {
		meetLink, err := s.meetService.CreateMeetLink(context.Background(), appointment)
		if err != nil {
			return fmt.Errorf("failed to create meet link: %v", err)
		}
		appointment.MeetLink = meetLink
	}

	appointment.Status = models.StatusPending
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
	appointments, err := s.appointmentRepo.GetAppointmentsByPatientID(patientID)
	if err != nil {
		return nil, e.NewInternalError()
	}
	return appointments, nil
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

func (s *appointmentService) GetAvailableSlots(doctorID uint, date time.Time) ([]models.TimeSlot, error) {
	// Get doctor's schedule
	schedule, err := s.doctorRepo.GetSchedule(context.Background(), doctorID)
	if err != nil {
		return nil, err
	}

	// Parse schedule JSON
	var parsedSchedule models.Schedule
	if err := json.Unmarshal([]byte(schedule.Schedule), &parsedSchedule); err != nil {
		var rawSchedule string
		if err := json.Unmarshal([]byte(schedule.Schedule), &rawSchedule); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(rawSchedule), &parsedSchedule); err != nil {
			return nil, err
		}
	}

	dayOfWeek := strings.ToLower(date.Weekday().String())
	daySchedule, exists := parsedSchedule.Days[dayOfWeek]
	if !exists || !daySchedule.Enabled {
		return nil, e.NewNotFoundError("no slots available for this day")
	}

	existingAppointments, err := s.appointmentRepo.GetAppointmentsByDoctorAndDate(doctorID, date)
	if err != nil {
		return nil, err
	}

	var availableSlots []models.TimeSlot
	for _, scheduleSlot := range daySchedule.Slots {
		startTime, _ := time.Parse("15:04", scheduleSlot.Start)
		endTime, _ := time.Parse("15:04", scheduleSlot.End)

		slot := models.TimeSlot{
			StartTime: startTime,
			EndTime:   endTime,
			Available: true,
		}

		if isSlotAvailable(slot, existingAppointments) {
			availableSlots = append(availableSlots, slot)
		}
	}

	return availableSlots, nil
}

// Update helper function signature if needed
func isSlotAvailable(slot models.TimeSlot, appointments []models.Appointment) bool {
	for _, apt := range appointments {
		if (slot.StartTime.Before(apt.EndTime) || slot.StartTime.Equal(apt.EndTime)) &&
			(slot.EndTime.After(apt.StartTime) || slot.EndTime.Equal(apt.StartTime)) {
			return false
		}
	}
	return true
}

func (s *appointmentService) ValidateAppointmentTime(doctorID uint, date time.Time, startTime time.Time) error {
	_, err := s.doctorRepo.GetSchedule(context.Background(), doctorID)
	if err != nil {
		return err
	}

	// Parse and validate against doctor's schedule
	// Add implementation here

	return nil
}

func (s *appointmentService) GetDoctorUpcomingAppointments(doctorID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetUpcomingAppointments(doctorID)
}

func (s *appointmentService) GetDoctorPastAppointments(doctorID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetPastAppointments(doctorID)
}

func (s *appointmentService) GetPatientUpcomingAppointments(patientID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetUpcomingAppointments(patientID)
}

func (s *appointmentService) GetPatientPastAppointments(patientID uint) ([]models.Appointment, error) {
	return s.appointmentRepo.GetPastAppointments(patientID)
}

func (s *appointmentService) CancelAppointment(appointmentID uint, userID uint) error {
	appointment, err := s.appointmentRepo.GetAppointmentByID(appointmentID)
	if err != nil {
		return err
	}

	if appointment.PatientID != userID && appointment.DoctorID != userID {
		return e.NewForbiddenError("not authorized to cancel this appointment")
	}

	now := time.Now()
	appointment.Status = models.StatusCancelled
	appointment.IsCancelled = true
	appointment.CancelledAt = &now
	appointment.CancelledBy = &userID

	return s.appointmentRepo.UpdateAppointment(appointment)
}

func (s *appointmentService) GetDoctorTodayAppointments(doctorID uint) ([]models.Appointment, error) {
	today := time.Now().Truncate(24 * time.Hour)
	tomorrow := today.Add(24 * time.Hour)

	appointments, err := s.appointmentRepo.GetAppointmentsByDoctorAndDateRange(
		doctorID,
		today,
		tomorrow,
	)
	if err != nil {
		return nil, err
	}

	return appointments, nil
}

func (s *appointmentService) GetDoctorWeekAppointments(doctorID uint) ([]models.Appointment, error) {
	now := time.Now()
	weekStart := now.Truncate(24 * time.Hour)
	weekEnd := weekStart.Add(7 * 24 * time.Hour)

	appointments, err := s.appointmentRepo.GetAppointmentsByDoctorAndDateRange(
		doctorID,
		weekStart,
		weekEnd,
	)
	if err != nil {
		return nil, err
	}

	return appointments, nil
}

func (s *appointmentService) RescheduleAppointment(appointmentID uint, userID uint, req *models.AppointmentRequest) error {
	appointment, err := s.appointmentRepo.GetAppointmentByID(appointmentID)
	if err != nil {
		return err
	}

	if appointment.PatientID != userID && appointment.DoctorID != userID {
		return e.NewForbiddenError("not authorized to reschedule this appointment")
	}

	newAppointment, err := req.ToAppointment(appointment.PatientID)
	if err != nil {
		return err
	}

	newAppointment.ID = appointmentID
	newAppointment.Status = models.StatusPending

	return s.appointmentRepo.UpdateAppointment(newAppointment)
}
