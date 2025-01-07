package types

type HospitalFilters struct {
	Radius       float64
	IsOpen       *bool
	HasEmergency *bool
	Specialities []string
	MinRating    *float32
}
