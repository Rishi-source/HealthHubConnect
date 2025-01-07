package repositories

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/types"
	"context"
	"fmt"
	"math"

	"googlemaps.github.io/maps"
	"gorm.io/gorm"
)

type HospitalRepository struct {
	db *gorm.DB
}

func NewHospitalRepository(db *gorm.DB) *HospitalRepository {
	return &HospitalRepository{db: db}
}

func (r *HospitalRepository) FindByID(ctx context.Context, id string) (*models.Hospital, error) {
	var hospital models.Hospital
	if err := r.db.First(&hospital, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &hospital, nil
}

func (r *HospitalRepository) Create(ctx context.Context, hospital models.Hospital) (*models.Hospital, error) {
	if err := r.db.Create(&hospital).Error; err != nil {
		return nil, err
	}
	return &hospital, nil
}

func (r *HospitalRepository) Update(ctx context.Context, id string, hospital models.Hospital) (*models.Hospital, error) {
	if err := r.db.Model(&hospital).Where("id = ?", id).Updates(hospital).Error; err != nil {
		return nil, err
	}
	return &hospital, nil
}

func (r *HospitalRepository) Delete(ctx context.Context, id string) error {
	return r.db.Delete(&models.Hospital{}, "id = ?", id).Error
}

func (r *HospitalRepository) FindNearbyWithFilters(ctx context.Context, location models.Location, filters types.HospitalFilters, places *maps.PlacesSearchResponse) ([]*models.Hospital, error) {
	var hospitals []*models.Hospital
	query := r.db.Model(&models.Hospital{})

	// Apply filters
	if filters.IsOpen != nil {
		query = query.Where("is_open = ?", *filters.IsOpen)
	}
	if filters.HasEmergency != nil {
		query = query.Where("has_emergency = ?", *filters.HasEmergency)
	}
	if filters.MinRating != nil {
		query = query.Where("rating >= ?", *filters.MinRating)
	}
	if len(filters.Specialities) > 0 {
		query = query.Joins("JOIN hospital_specialities ON hospitals.id = hospital_specialities.hospital_id").
			Where("hospital_specialities.name IN ?", filters.Specialities)
	}

	// Calculate distance and filter by radius
	query = query.Where(`
		ST_Distance(
			ST_MakePoint(location_longitude, location_latitude)::geography,
			ST_MakePoint(?, ?)::geography
		) <= ?`,
		location.Longitude, location.Latitude, filters.Radius)

	// Fix the Order call syntax
	query = query.Order(fmt.Sprintf(`
		ST_Distance(
			ST_MakePoint(location_longitude, location_latitude)::geography,
			ST_MakePoint(%f, %f)::geography
		)`,
		location.Longitude, location.Latitude))

	if err := query.Find(&hospitals).Error; err != nil {
		return nil, err
	}

	// Merge with Google Places data
	return r.mergeWithPlacesData(hospitals, places), nil
}

func (r *HospitalRepository) ProcessSearchResults(ctx context.Context, results *maps.PlacesSearchResponse, filters *types.HospitalFilters) ([]*models.Hospital, error) {
	var hospitals []*models.Hospital

	for _, result := range results.Results {
		hospital := &models.Hospital{
			Name:          result.Name,
			Address:       result.FormattedAddress,
			GooglePlaceID: result.PlaceID,
			Location: models.Location{
				Latitude:  result.Geometry.Location.Lat,
				Longitude: result.Geometry.Location.Lng,
			},
			Rating: float32(result.Rating),
		}

		// Check if hospital already exists in database
		existingHospital := &models.Hospital{}
		err := r.db.Where("google_place_id = ?", result.PlaceID).First(existingHospital).Error
		if err == nil {
			// Update existing hospital with new data
			hospital = r.mergeHospitalData(existingHospital, hospital)
		}

		// Apply filters
		if r.passesFilters(hospital, filters) {
			hospitals = append(hospitals, hospital)
		}
	}

	return hospitals, nil
}

func (r *HospitalRepository) mergeWithPlacesData(hospitals []*models.Hospital, places *maps.PlacesSearchResponse) []*models.Hospital {
	placeMap := make(map[string]*maps.PlacesSearchResult)
	for _, place := range places.Results {
		placeMap[place.PlaceID] = &place
	}

	for _, hospital := range hospitals {
		if place, exists := placeMap[hospital.GooglePlaceID]; exists {
			hospital.Rating = float32(place.Rating)
			// Fix the OpeningHours comparison
			if place.OpeningHours != nil {
				hospital.IsOpen = *place.OpeningHours.OpenNow
			} else {
				hospital.IsOpen = false
			}
			// Add more fields as needed
		}
	}

	return hospitals
}

func (r *HospitalRepository) mergeHospitalData(existing, new *models.Hospital) *models.Hospital {
	// Keep existing data but update with new information from Google Places
	existing.Rating = new.Rating
	existing.IsOpen = new.IsOpen
	// Update other fields as needed
	return existing
}

func (r *HospitalRepository) passesFilters(hospital *models.Hospital, filters *types.HospitalFilters) bool {
	if filters == nil {
		return true
	}

	if filters.MinRating != nil && hospital.Rating < *filters.MinRating {
		return false
	}

	if filters.HasEmergency != nil && hospital.HasEmergency != *filters.HasEmergency {
		return false
	}

	if filters.IsOpen != nil && hospital.IsOpen != *filters.IsOpen {
		return false
	}

	return true
}

func (r *HospitalRepository) calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const earthRadius = 6371 // kilometers

	lat1Rad := toRadians(lat1)
	lat2Rad := toRadians(lat2)
	deltaLat := toRadians(lat2 - lat1)
	deltaLon := toRadians(lon2 - lon1)

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

func toRadians(deg float64) float64 {
	return deg * (math.Pi / 180)
}
