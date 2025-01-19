package services

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
	"encoding/json"
)

type DoctorService struct {
	doctorRepo *repositories.DoctorRepository
}

func NewDoctorService(doctorRepo *repositories.DoctorRepository) *DoctorService {
	return &DoctorService{doctorRepo: doctorRepo}
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

func (s *DoctorService) SaveSchedule(ctx context.Context, doctorID uint, req *models.ScheduleRequest) error {
	scheduleJSON, err := json.Marshal(req.Schedule)
	if err != nil {
		return err
	}

	// Double encode to store as JSON string
	scheduleJSONString, err := json.Marshal(string(scheduleJSON))
	if err != nil {
		return err
	}

	schedule := &models.DoctorSchedule{
		DoctorID: doctorID,
		Schedule: string(scheduleJSONString),
	}
	return s.doctorRepo.SaveSchedule(ctx, schedule)
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
