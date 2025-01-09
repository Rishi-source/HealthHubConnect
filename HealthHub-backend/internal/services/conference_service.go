package services

import (
	"HealthHubConnect/internal/models"
	"fmt"
	"os"
	"time"
)

type ConferenceService interface {
	CreateMeeting(appointment *models.Appointment) (*models.ConferenceDetails, error)
	DeleteMeeting(meetingID string) error
}

type conferenceService struct {
	provider  models.ConferenceProvider
	apiKey    string
	apiSecret string
}

func NewConferenceService() ConferenceService {
	return &conferenceService{
		provider:  models.ProviderZoom,
		apiKey:    os.Getenv("ZOOM_API_KEY"),
		apiSecret: os.Getenv("ZOOM_API_SECRET"),
	}
}

func (s *conferenceService) CreateMeeting(appointment *models.Appointment) (*models.ConferenceDetails, error) {
	// In a real implementation, you would make API calls to your video conferencing provider
	// This is a mock implementation
	meetingID := fmt.Sprintf("%d-%d-%d", appointment.DoctorID, appointment.PatientID, time.Now().Unix())

	details := &models.ConferenceDetails{
		Provider:  s.provider,
		MeetingID: meetingID,
		JoinURL:   fmt.Sprintf("https://zoom.us/j/%s", meetingID),
		HostURL:   fmt.Sprintf("https://zoom.us/s/%s", meetingID),
		Password:  fmt.Sprintf("pass%d", time.Now().Unix()),
		StartTime: appointment.StartTime.Format(time.RFC3339),
		Duration:  int(appointment.EndTime.Sub(appointment.StartTime).Minutes()),
		Topic:     fmt.Sprintf("Medical Consultation - Dr. ID: %d", appointment.DoctorID),
	}

	return details, nil
}

func (s *conferenceService) DeleteMeeting(meetingID string) error {

	return nil
}
