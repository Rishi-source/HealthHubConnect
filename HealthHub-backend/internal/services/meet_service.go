package services

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"context"
	"fmt"
	"time"
)

type MeetService struct{}

func NewMeetService(_ *repositories.UserRepository) (*MeetService, error) {
	return &MeetService{}, nil
}

func (s *MeetService) CreateMeetLink(ctx context.Context, appointment *models.Appointment) (string, error) {
	meetCode := fmt.Sprintf("hh-%d-%s", appointment.ID, time.Now().Format("20060102150405"))

	meetLink := fmt.Sprintf("https://meet.google.com/%s", meetCode)

	return meetLink, nil
}
