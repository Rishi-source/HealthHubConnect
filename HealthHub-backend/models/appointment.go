package models

import "time"

type CreateAppointmentRequest struct {
	DoctorID    uint      `json:"doctorId"`
	PatientID   uint      `json:"patientId"`
	DateTime    time.Time `json:"dateTime"`
	Description string    `json:"description"`
	Type        string    `json:"type" binding:"required,oneof=ONLINE OFFLINE"`
}

type UpdateAppointmentStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=confirmed rejected completed cancelled"`
}

type SetDoctorAvailabilityRequest struct {
	Date      time.Time `json:"date" binding:"required"`
	TimeSlots []struct {
		StartTime string `json:"startTime" binding:"required"`
		EndTime   string `json:"endTime" binding:"required"`
	} `json:"timeSlots"`
}

type AppointmentResponse struct {
	ID          uint      `json:"id"`
	DoctorID    uint      `json:"doctorId"`
	PatientID   uint      `json:"patientId"`
	Type        string    `json:"type"`
	DateTime    time.Time `json:"dateTime"`
	Status      string    `json:"status"`
	Description string    `json:"description"`
	MeetingLink string    `json:"meetingLink,omitempty"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type DoctorAvailabilityResponse struct {
	DoctorID  uint       `json:"doctorId"`
	Date      time.Time  `json:"date"`
	TimeSlots []TimeSlot `json:"timeSlots"`
}

type TimeSlot struct {
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	IsBooked  bool   `json:"isBooked"`
}

type AppointmentListResponse struct {
	Appointments []AppointmentResponse `json:"appointments"`
	Total        int64                 `json:"total"`
	Page         int                   `json:"page"`
	PerPage      int                   `json:"perPage"`
}
