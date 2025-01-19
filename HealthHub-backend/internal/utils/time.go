package utils

import (
	"time"
)

func CombineDateAndTime(date time.Time, timeStr string) (time.Time, error) {
	t, err := time.Parse("15:04:05", timeStr)
	if err != nil {
		return time.Time{}, err
	}

	return time.Date(
		date.Year(),
		date.Month(),
		date.Day(),
		t.Hour(),
		t.Minute(),
		t.Second(),
		0,
		date.Location(),
	), nil
}
