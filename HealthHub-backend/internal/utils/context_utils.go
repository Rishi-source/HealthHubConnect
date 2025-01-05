package utils

import (
	e "HealthHubConnect/internal/errors"
	"context"
)

func GetClaimsFromContext(ctx context.Context) (*Claims, error) {
	claims, ok := ctx.Value("claims").(*Claims)
	if !ok || claims == nil {
		return nil, e.NewNotAuthorizedError("invalid or missing claims")
	}
	return claims, nil
}

func GetUserIDFromContext(ctx context.Context) (uint, error) {
	claims, err := GetClaimsFromContext(ctx)
	if err != nil {
		return 0, err
	}

	return claims.UserID, nil
}
