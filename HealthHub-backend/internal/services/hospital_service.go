package services

import (
	"HealthHubConnect/env"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/repositories"
	"HealthHubConnect/internal/types"
	"context"
	"fmt"

	"googlemaps.github.io/maps"
)

type HospitalService struct {
	repo       *repositories.HospitalRepository
	mapsClient *maps.Client
}

func NewHospitalService(repo *repositories.HospitalRepository, mapsClient *maps.Client) *HospitalService {
	return &HospitalService{
		repo:       repo,
		mapsClient: mapsClient,
	}
}

func (s *HospitalService) FindNearbyHospitals(ctx context.Context, location models.Location, filters types.HospitalFilters) ([]*models.Hospital, error) {
	// Create a new context with timeout for the Maps API request
	mapsCtx, cancel := context.WithTimeout(ctx, env.GoogleMaps.RequestTimeout)
	defer cancel()

	placeReq := &maps.NearbySearchRequest{
		Location: &maps.LatLng{
			Lat: location.Latitude,
			Lng: location.Longitude,
		},
		Radius:   uint(int32(filters.Radius)),
		Type:     "hospital",
		Language: "en",
	}

	places, err := s.mapsClient.NearbySearch(mapsCtx, placeReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch nearby places: %w", err)
	}

	hospitals, err := s.repo.FindNearbyWithFilters(ctx, location, filters, &places)
	if err != nil {
		return nil, fmt.Errorf("failed to process nearby hospitals: %w", err)
	}

	return hospitals, nil
}

func (s *HospitalService) SearchHospitals(ctx context.Context, query string, location *models.Location, filters *types.HospitalFilters) ([]*models.Hospital, error) {
	searchReq := &maps.TextSearchRequest{
		Query:    query + " hospital",
		Language: "en",
	}

	if location != nil {
		searchReq.Location = &maps.LatLng{
			Lat: location.Latitude,
			Lng: location.Longitude,
		}
		// Fix: Convert float64 to uint
		searchReq.Radius = uint(int32(filters.Radius)) // Convert through int32 to avoid overflow
	}

	results, err := s.mapsClient.TextSearch(ctx, searchReq)
	if err != nil {
		return nil, err
	}

	// Fix: Pass address of results
	return s.repo.ProcessSearchResults(ctx, &results, filters)
}

func (s *HospitalService) GetHospitalByID(ctx context.Context, id string) (*models.Hospital, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *HospitalService) CreateHospital(ctx context.Context, hospital models.Hospital) (*models.Hospital, error) {
	return s.repo.Create(ctx, hospital)
}

func (s *HospitalService) UpdateHospital(ctx context.Context, id string, hospital models.Hospital) (*models.Hospital, error) {
	return s.repo.Update(ctx, id, hospital)
}

func (s *HospitalService) GetRawPlacesData(ctx context.Context, location models.Location, filters types.HospitalFilters) (*maps.PlacesSearchResponse, error) {
	mapsCtx, cancel := context.WithTimeout(ctx, env.GoogleMaps.RequestTimeout)
	defer cancel()

	placeReq := &maps.NearbySearchRequest{
		Location: &maps.LatLng{
			Lat: location.Latitude,
			Lng: location.Longitude,
		},
		Radius:   uint(int32(filters.Radius)),
		Type:     "hospital",
		Language: "en",
	}

	places, err := s.mapsClient.NearbySearch(mapsCtx, placeReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch nearby places: %w", err)
	}

	return &places, nil
}
