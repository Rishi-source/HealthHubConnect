package repositories

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/types"
	"context"
	"math"
	"sort"

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
	if places == nil {
		return make([]*models.Hospital, 0), nil
	}

	var hospitals []*models.Hospital

	// Convert Places results to hospitals
	for _, place := range places.Results {
		hospital := &models.Hospital{
			Name:          place.Name,
			Address:       place.FormattedAddress,
			GooglePlaceID: place.PlaceID,
			Location: models.Location{
				Latitude:  place.Geometry.Location.Lat,
				Longitude: place.Geometry.Location.Lng,
			},
			Rating: float32(place.Rating),
		}

		if place.OpeningHours != nil {
			hospital.IsOpen = *place.OpeningHours.OpenNow
		}

		// Calculate distance
		distance := r.calculateDistance(
			location.Latitude,
			location.Longitude,
			hospital.Location.Latitude,
			hospital.Location.Longitude,
		)

		// Apply filters
		if !r.passesFilters(hospital, &filters) {
			continue
		}

		// Check distance
		if distance <= filters.Radius/1000 { // Convert meters to km
			hospital.Distance = distance
			hospitals = append(hospitals, hospital)
		}
	}

	if hospitals == nil {
		return make([]*models.Hospital, 0), nil
	}

	// Sort by distance
	sort.Slice(hospitals, func(i, j int) bool {
		return hospitals[i].Distance < hospitals[j].Distance
	})

	return hospitals, nil
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
