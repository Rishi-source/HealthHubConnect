package models

type ConferenceProvider string

const (
	ProviderZoom  ConferenceProvider = "ZOOM"
	ProviderMeet  ConferenceProvider = "MEET"
	ProviderJitsi ConferenceProvider = "JITSI"
)

type ConferenceDetails struct {
	Provider  ConferenceProvider `json:"provider"`
	MeetingID string             `json:"meetingId"`
	JoinURL   string             `json:"joinUrl"`
	HostURL   string             `json:"hostUrl,omitempty"`
	Password  string             `json:"password,omitempty"`
	StartTime string             `json:"startTime"`
	Duration  int                `json:"duration"` // in minutes
	HostEmail string             `json:"hostEmail"`
	Topic     string             `json:"topic"`
}
