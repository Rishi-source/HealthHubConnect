package repositories

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/types"
	"context"
	"errors"
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

func (r *HospitalRepository) FindByID(ctx context.Context, id string) (models.Hospital, error) {
	var hospital models.Hospital
	result := r.db.WithContext(ctx).First(&hospital, "id = ?", id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.Hospital{}, errors.New("hospital not found")
		}
		return models.Hospital{}, result.Error
	}
	return hospital, nil
}

func (r *HospitalRepository) Create(ctx context.Context, hospital models.Hospital) (models.Hospital, error) {
	result := r.db.WithContext(ctx).Create(&hospital)
	if result.Error != nil {
		return models.Hospital{}, result.Error
	}
	return hospital, nil
}

func (r *HospitalRepository) Update(ctx context.Context, id string, hospital models.Hospital) (models.Hospital, error) {
	result := r.db.WithContext(ctx).Model(&models.Hospital{}).Where("id = ?", id).Updates(hospital)
	if result.Error != nil {
		return models.Hospital{}, result.Error
	}
	if result.RowsAffected == 0 {
		return models.Hospital{}, errors.New("hospital not found")
	}
	return hospital, nil
}

func (r *HospitalRepository) Delete(ctx context.Context, id string) error {
	result := r.db.WithContext(ctx).Delete(&models.Hospital{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("hospital not found")
	}
	return nil
}

func (r *HospitalRepository) FindNearbyWithFilters(ctx context.Context, location models.Location, filters types.HospitalFilters, places *maps.PlacesSearchResponse) ([]models.Hospital, error) {
	if places == nil {
		return []models.Hospital{}, nil
	}

	hospitals := make([]models.Hospital, 0)
	for _, place := range places.Results {
		hospital := models.Hospital{
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

		distance := r.calculateDistance(
			location.Latitude,
			location.Longitude,
			hospital.Location.Latitude,
			hospital.Location.Longitude,
		)

		if !r.passesFilters(hospital, filters) || distance > filters.Radius/1000 {
			continue
		}

		hospital.Distance = distance
		hospitals = append(hospitals, hospital)
	}

	sort.Slice(hospitals, func(i, j int) bool {
		return hospitals[i].Distance < hospitals[j].Distance
	})

	return hospitals, nil
}

func (r *HospitalRepository) ProcessSearchResults(ctx context.Context, results *maps.PlacesSearchResponse, filters types.HospitalFilters) ([]models.Hospital, error) {
	if results == nil {
		return []models.Hospital{}, nil
	}

	hospitals := make([]models.Hospital, 0)
	for _, result := range results.Results {
		hospital := models.Hospital{
			Name:          result.Name,
			Address:       result.FormattedAddress,
			GooglePlaceID: result.PlaceID,
			Location: models.Location{
				Latitude:  result.Geometry.Location.Lat,
				Longitude: result.Geometry.Location.Lng,
			},
			Rating: float32(result.Rating),
		}

		var existingHospital models.Hospital
		err := r.db.WithContext(ctx).Where("google_place_id = ?", result.PlaceID).First(&existingHospital).Error
		if err == nil {
			hospital = r.mergeHospitalData(existingHospital, hospital)
		}

		if r.passesFilters(hospital, filters) {
			hospitals = append(hospitals, hospital)
		}
	}

	return hospitals, nil
}

func (r *HospitalRepository) mergeHospitalData(existing, new models.Hospital) models.Hospital {
	existing.Rating = new.Rating
	existing.IsOpen = new.IsOpen
	existing.Name = new.Name
	existing.Address = new.Address
	existing.Location = new.Location
	return existing
}

func (r *HospitalRepository) passesFilters(hospital models.Hospital, filters types.HospitalFilters) bool {
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
	const earthRadius = 6371
	lat1Rad := lat1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	deltaLat := (lat2 - lat1) * math.Pi / 180
	deltaLon := (lon2 - lon1) * math.Pi / 180

	a := math.Sin(deltaLat/2)*math.Sin(deltaLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(deltaLon/2)*math.Sin(deltaLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}
