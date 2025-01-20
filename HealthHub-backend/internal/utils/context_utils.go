package utils

import (
	e "HealthHubConnect/internal/errors"
	"context"
)

func GetUserIDFromContext(ctx context.Context) (uint, error) {
	userID, ok := ctx.Value("userID").(uint)
	if !ok || userID == 0 {
		return 0, e.NewNotAuthorizedError("invalid or missing user ID")
	}
	return userID, nil
}
