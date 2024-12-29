package models

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/oauth2"
)

type OAuthAccount struct {
	Base
	User       User      `json:"user" gorm:"foreignKey:UserID"`
	UserID     uint      `json:"user_id"`
	Provider   string    `json:"provider"` // e.g., "google", "github" or any other OAuth provider
	ProviderID string    `json:"provider_id" gorm:"uniqueIndex"`
	Token      string    `json:"-"` // encrypted in DB
	TokenType  string    `json:"-"`
	ExpiresAt  time.Time `json:"-"`
}

type JWTClaims struct {
	jwt.RegisteredClaims
	UserID string   `json:"user_id"`
	Email  string   `json:"email"`
	Scopes []string `json:"scopes"`
}

// OAuthToken extends the oauth2 token with additional metadata
type OAuthToken struct {
	oauth2.Token
	DeviceID   string    `json:"device_id,omitempty"`
	LastUsedAt time.Time `json:"last_used_at"`
	IsPrimary  bool      `json:"is_primary"`
}

type OAuthConfig struct {
	ClientID     string          `json:"client_id"`
	ClientSecret string          `json:"-"` // encrypted in DB for security reasons
	RedirectURL  string          `json:"redirect_url"`
	Scopes       []string        `json:"scopes"`
	Endpoint     oauth2.Endpoint `json:"-"`
}
