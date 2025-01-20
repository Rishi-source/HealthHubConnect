package models

import "time"

type ChatMessage struct {
	Base
	SenderID   uint      `json:"sender_id" gorm:"not null"`
	ReceiverID uint      `json:"receiver_id" gorm:"not null"`
	Content    string    `json:"content" gorm:"not null"`
	Read       bool      `json:"read" gorm:"default:false"`
	ReadAt     time.Time `json:"read_at,omitempty"`
	Sender     User      `json:"sender" gorm:"foreignkey:SenderID"`
	Receiver   User      `json:"receiver" gorm:"foreignkey:ReceiverID"`
}
