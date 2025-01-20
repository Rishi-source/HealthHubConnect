package services

import (
	e "HealthHubConnect/internal/errors"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"strings"
	"time"

	"gorm.io/gorm"
)

type DoctorService struct {
	doctorRepo      *repositories.DoctorRepository
	appointmentRepo repositories.AppointmentRepository
}

func NewDoctorService(doctorRepo *repositories.DoctorRepository, appointmentRepo repositories.AppointmentRepository) *DoctorService {
	return &DoctorService{
		doctorRepo:      doctorRepo,
		appointmentRepo: appointmentRepo,
	}
}

func (s *DoctorService) SaveProfile(ctx context.Context, profile *models.DoctorProfile) error {
	return s.doctorRepo.SaveProfile(ctx, profile)
}

func (s *DoctorService) GetProfile(ctx context.Context, userID uint) (*models.DoctorProfile, error) {
	return s.doctorRepo.GetProfile(ctx, userID)
}

func (s *DoctorService) UpdateProfile(ctx context.Context, profile *models.DoctorProfile) error {
	return s.doctorRepo.UpdateProfile(ctx, profile)
}

func (s *DoctorService) DeleteProfile(ctx context.Context, userID uint) error {
	return s.doctorRepo.DeleteProfile(ctx, userID)
}

func (s *DoctorService) generateAvailabilitySlots(doctorID uint, schedule models.Schedule, startDate time.Time, weeks int) ([]models.DoctorAvailability, error) {
	var availabilities []models.DoctorAvailability

	for week := 0; week < weeks; week++ {
		for dayName, daySchedule := range schedule.Days {
			if !daySchedule.Enabled {
				continue
			}

			nextDate := startDate
			for nextDate.Weekday().String() != strings.Title(dayName) {
				nextDate = nextDate.AddDate(0, 0, 1)
			}

			nextDate = nextDate.AddDate(0, 0, 7*week)

			for _, slot := range daySchedule.Slots {
				startTime, _ := time.Parse("15:04", slot.Start)
				endTime, _ := time.Parse("15:04", slot.End)

				availability := models.DoctorAvailability{
					DoctorID: doctorID,
					Date:     nextDate,
					StartTime: time.Date(nextDate.Year(), nextDate.Month(), nextDate.Day(),
						startTime.Hour(), startTime.Minute(), 0, 0, nextDate.Location()),
					EndTime: time.Date(nextDate.Year(), nextDate.Month(), nextDate.Day(),
						endTime.Hour(), endTime.Minute(), 0, 0, nextDate.Location()),
				}
				availabilities = append(availabilities, availability)
			}
		}
	}

	return availabilities, nil
}

func (s *DoctorService) SaveSchedule(ctx context.Context, doctorID uint, req *models.ScheduleRequest) error {
	// Save the schedule as before
	scheduleJSON, err := json.Marshal(req.Schedule)
	if err != nil {
		return err
	}

	scheduleJSONString, err := json.Marshal(string(scheduleJSON))
	if err != nil {
		return err
	}

	schedule := &models.DoctorSchedule{
		DoctorID: doctorID,
		Schedule: string(scheduleJSONString),
	}

	// Save the base schedule
	if err := s.doctorRepo.SaveSchedule(ctx, schedule); err != nil {
		return err
	}

	// Generate availability slots for the next 12 weeks
	startDate := time.Now().Truncate(24 * time.Hour)
	availabilities, err := s.generateAvailabilitySlots(doctorID, req.Schedule, startDate, 12)
	if err != nil {
		return err
	}

	// Save all availability slots
	return s.doctorRepo.SaveBulkAvailability(ctx, availabilities)
}

func (s *DoctorService) GetSchedule(ctx context.Context, doctorID uint) (*models.ScheduleResponse, error) {
	schedule, err := s.doctorRepo.GetSchedule(ctx, doctorID)
	if err != nil {
		return nil, err
	}

	var parsedSchedule models.Schedule
	if err := json.Unmarshal([]byte(schedule.Schedule), &parsedSchedule); err != nil {
		// Try unmarshaling as a raw string first
		var rawSchedule string
		if err := json.Unmarshal([]byte(schedule.Schedule), &rawSchedule); err != nil {
			return nil, err
		}
		// Then unmarshal the raw string into Schedule
		if err := json.Unmarshal([]byte(rawSchedule), &parsedSchedule); err != nil {
			return nil, err
		}
	}

	return &models.ScheduleResponse{
		ID:        schedule.ID,
		DoctorID:  schedule.DoctorID,
		Schedule:  parsedSchedule,
		CreatedAt: schedule.CreatedAt,
		UpdatedAt: schedule.UpdatedAt,
	}, nil
}

func (s *DoctorService) ExtendAvailability(ctx context.Context, doctorID uint, weeksToAdd int) error {
	// Get existing schedule
	schedule, err := s.GetSchedule(ctx, doctorID)
	if err != nil {
		return err
	}

	// Find the last availability date
	var lastAvailability models.DoctorAvailability
	if err := s.doctorRepo.GetLastAvailabilityDate(ctx, doctorID, &lastAvailability); err != nil {
		return err
	}

	// Generate new slots starting from the last availability date
	startDate := lastAvailability.Date.AddDate(0, 0, 1)
	availabilities, err := s.generateAvailabilitySlots(doctorID, schedule.Schedule, startDate, weeksToAdd)
	if err != nil {
		return err
	}

	// Save new availability slots
	return s.doctorRepo.AddBulkAvailability(ctx, availabilities)
}

func (s *DoctorService) BlockSlot(ctx context.Context, doctorID uint, req *models.BlockSlotRequest) error {
	// Parse date and times
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return e.NewValidationError("invalid date format")
	}

	startTime, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		return e.NewValidationError("invalid start time format")
	}

	endTime, err := time.Parse("15:04", req.EndTime)
	if err != nil {
		return e.NewValidationError("invalid end time format")
	}

	// Convert to full datetime
	slotStart := time.Date(date.Year(), date.Month(), date.Day(),
		startTime.Hour(), startTime.Minute(), 0, 0, time.Local)
	slotEnd := time.Date(date.Year(), date.Month(), date.Day(),
		endTime.Hour(), endTime.Minute(), 0, 0, time.Local)

	// Delete the availability slots for the specified time range
	return s.doctorRepo.DeleteAvailabilitySlots(ctx, doctorID, date, slotStart, slotEnd)
}

type DoctorListResponse struct {
	Doctors     []models.DoctorProfile `json:"doctors"`
	Total       int64                  `json:"total"`
	CurrentPage int                    `json:"current_page"`
	PerPage     int                    `json:"per_page"`
	TotalPages  int                    `json:"total_pages"`
}

func (s *DoctorService) ListDoctors(ctx context.Context, filters map[string]interface{}, page, limit int) (*DoctorListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	doctors, total, err := s.doctorRepo.ListDoctors(ctx, filters, page, limit)
	if err != nil {
		log.Printf("Error in service layer: %v", err)
		return nil, err
	}

	log.Printf("Service layer: Found %d doctors, total: %d", len(doctors), total)

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &DoctorListResponse{
		Doctors:     doctors,
		Total:       total,
		CurrentPage: page,
		PerPage:     limit,
		TotalPages:  totalPages,
	}, nil
}

func (s *DoctorService) GetAvailableSlots(doctorID uint, date time.Time) ([]models.TimeSlot, error) {
	// Get doctor's schedule
	schedule, err := s.doctorRepo.GetSchedule(context.Background(), doctorID)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return []models.TimeSlot{}, e.NewNotFoundError("doctor schedule not found")
		}
		return nil, fmt.Errorf("error getting doctor schedule: %v", err)
	}

	// Parse schedule and generate available slots
	var parsedSchedule models.Schedule
	if err := json.Unmarshal([]byte(schedule.Schedule), &parsedSchedule); err != nil {
		// ... existing unmarshal code ...
	}

	dayOfWeek := strings.ToLower(date.Weekday().String())
	daySchedule, exists := parsedSchedule.Days[dayOfWeek]
	if !exists || !daySchedule.Enabled {
		return []models.TimeSlot{}, e.NewNotFoundError("no slots available for this day")
	}

	// Get existing appointments
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

		// Check if slot is available (not booked)
		if isSlotAvailable(slot, existingAppointments) {
			availableSlots = append(availableSlots, slot)
		}
	}

	return availableSlots, nil
}

func (s *DoctorService) ListPatients(ctx context.Context, doctorID uint, page, limit int) (*models.PatientListResponse, error) {
	if err := s.doctorRepo.ValidateDoctorAccess(ctx, doctorID); err != nil {
		return nil, err
	}

	patients, total, err := s.doctorRepo.GetDoctorPatients(ctx, doctorID, page, limit)
	if err != nil {
		return nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &models.PatientListResponse{
		Patients:    patients,
		Total:       total,
		CurrentPage: page,
		PerPage:     limit,
		TotalPages:  totalPages,
	}, nil
}
