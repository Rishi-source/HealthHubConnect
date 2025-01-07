package graphql

import (
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/services"
	"HealthHubConnect/internal/types"
	"context"
)

type Resolver struct {
	hospitalService *services.HospitalService
}

func NewResolver(hospitalService *services.HospitalService) *Resolver {
	return &Resolver{hospitalService: hospitalService}
}

type queryResolver struct{ *Resolver }

func (r *queryResolver) Hospitals(ctx context.Context, location models.Location, filters types.HospitalFilters) ([]*models.Hospital, error) {
	return r.hospitalService.FindNearbyHospitals(ctx, location, filters)
}

func (r *queryResolver) Hospital(ctx context.Context, id string) (*models.Hospital, error) {
	return r.hospitalService.GetHospitalByID(ctx, id)
}

type mutationResolver struct{ *Resolver }

func (r *mutationResolver) AddHospital(ctx context.Context, input models.Hospital) (*models.Hospital, error) {
	return r.hospitalService.CreateHospital(ctx, input)
}

func (r *mutationResolver) UpdateHospital(ctx context.Context, id string, input models.Hospital) (*models.Hospital, error) {
	return r.hospitalService.UpdateHospital(ctx, id, input)
}
