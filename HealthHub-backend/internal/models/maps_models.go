package models

type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type Speciality struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

type Hospital struct {
	Base
	Name          string       `json:"name" gorm:"size:200;not null"`
	Address       string       `json:"address" gorm:"size:500;not null"`
	Location      Location     `json:"location" gorm:"embedded"`
	PhoneNumber   string       `json:"phone_number" gorm:"size:20"`
	Rating        float32      `json:"rating"`
	Services      string       `json:"services" gorm:"type:text"`
	IsOpen        bool         `json:"is_open" gorm:"default:false"`
	Distance      float64      `gorm:"-" json:"distance"`
	HasEmergency  bool         `json:"has_emergency" gorm:"default:false"`
	Specialities  []Speciality `json:"specialities" gorm:"many2many:hospital_specialities;"`
	GooglePlaceID string       `json:"google_place_id" gorm:"size:100"`
	OpeningHours  string       `json:"opening_hours" gorm:"type:text"`
}

type UserLocation struct {
	UserID uint    `json:"user_id" gorm:"uniqueIndex"`
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
}
