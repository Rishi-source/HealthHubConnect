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
	Name          string       `json:"name"`
	Address       string       `json:"address"`
	Location      Location     `json:"location" gorm:"embedded"`
	PhoneNumber   string       `json:"phone_number"`
	Rating        float32      `json:"rating"`
	Services      []string     `json:"services"`
	IsOpen        bool         `json:"is_open"`
	Distance      float64      `gorm:"-" json:"distance"`
	HasEmergency  bool         `json:"has_emergency"`
	Specialities  []Speciality `json:"specialities" gorm:"many2many:hospital_specialities;"`
	GooglePlaceID string       `json:"google_place_id"`
	OpeningHours  []string     `json:"opening_hours"`
}

type UserLocation struct {
	UserID uint    `json:"user_id" gorm:"uniqueIndex"`
	Lat    float64 `json:"lat"`
	Lng    float64 `json:"lng"`
}
