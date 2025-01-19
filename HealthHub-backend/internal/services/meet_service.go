package services

import (
	"HealthHubConnect/env"
	"HealthHubConnect/internal/models"
	"context"
	"fmt"
	"time"

	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

type MeetService struct {
	calendarService *calendar.Service
}

func NewMeetService() (*MeetService, error) {
	ctx := context.Background()

	// Use credentials JSON string directly instead of file
	calendarService, err := calendar.NewService(ctx,
		option.WithCredentialsJSON([]byte(env.GoogleMeetConfig.CredentialsJSON)))
	if err != nil {
		return nil, fmt.Errorf("failed to create calendar service: %v", err)
	}

	return &MeetService{
		calendarService: calendarService,
	}, nil
}

func (s *MeetService) CreateMeetLink(ctx context.Context, appointment *models.Appointment) (string, error) {
	event := &calendar.Event{
		Summary:     fmt.Sprintf("Medical Appointment with Dr. %s", appointment.Doctor.Name),
		Description: appointment.Description,
		Start: &calendar.EventDateTime{
			DateTime: appointment.StartTime.Format(time.RFC3339),
			TimeZone: "UTC",
		},
		End: &calendar.EventDateTime{
			DateTime: appointment.EndTime.Format(time.RFC3339),
			TimeZone: "UTC",
		},
		ConferenceData: &calendar.ConferenceData{
			CreateRequest: &calendar.CreateConferenceRequest{
				RequestId: fmt.Sprintf("appointment-%d", appointment.ID),
				ConferenceSolutionKey: &calendar.ConferenceSolutionKey{
					Type: "hangoutsMeet",
				},
			},
		},
	}

	event, err := s.calendarService.Events.Insert(env.GoogleMeetConfig.CalendarID, event).
		ConferenceDataVersion(1).
		Do()
	if err != nil {
		return "", fmt.Errorf("unable to create event: %v", err)
	}

	return event.HangoutLink, nil
}
