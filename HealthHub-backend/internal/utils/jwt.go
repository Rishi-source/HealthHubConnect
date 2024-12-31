package utils

import (
	"HealthHubConnect/env"
	"errors"
	"fmt"
	"math/rand"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

// cause there is repetition of same errors
var (
	ErrExpiredRefreshToken = errors.New("refresh token has expired")
	ErrInvalidToken        = errors.New("invalid token")
	ErrInvalidTokenType    = errors.New("invalid token type")
	ErrMissingSecret       = errors.New("secret key is required")
)

type TokenType string

const (
	AccessToken  TokenType = "access"
	RefreshToken TokenType = "refresh"
)

type Claims struct {
	UserID uint      `json:"user_id"`
	Type   TokenType `json:"type"`
	jwt.RegisteredClaims
}

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func GenerateTokenPair(userID uint) (TokenPair, error) {
	if len(env.Jwt.RefreshTokenSecret) == 0 || len(env.Jwt.AccessTokenSecret) == 0 {
		return TokenPair{}, ErrMissingSecret
	}

	accessToken, err := generateToken(userID, AccessToken, env.Jwt.AccessTokenSecret, env.Jwt.AccessTokenTTL)
	if err != nil {
		return TokenPair{}, err
	}

	refreshToken, err := generateToken(userID, RefreshToken, env.Jwt.RefreshTokenSecret, env.Jwt.RefreshTokenTTL)
	if err != nil {
		return TokenPair{}, err
	}

	return TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func generateToken(userID uint, tokenType TokenType, secret []byte, expiration time.Duration) (string, error) {
	claims := Claims{
		UserID: userID,
		Type:   tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// extractClaimsFromExpiredToken extracts claims from a token even if it's expired
func extractClaimsFromExpiredToken(tokenString string, secret []byte) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	})

	if err != nil {
		//if the error is due to expiration
		if errors.Is(err, jwt.ErrTokenExpired) {
			if claims, ok := token.Claims.(*Claims); ok {
				return claims, nil
			}
		}
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

func ValidateToken(tokenString string, secret []byte, expectedType TokenType) (*Claims, error) {
	if len(secret) == 0 {
		return nil, ErrMissingSecret
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return secret, nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			if expectedType == RefreshToken {
				return nil, ErrExpiredRefreshToken
			}
			return nil, err
		}
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	if claims.Type != expectedType {
		return nil, ErrInvalidTokenType
	}

	return claims, nil
}

func RefreshAccessTokens(refreshToken string) (TokenPair, error) {
	claims, err := ValidateToken(refreshToken, env.Jwt.RefreshTokenSecret, RefreshToken)
	if err != nil {
		// If the refresh token is expired, try to extract the claims anyway
		if errors.Is(err, ErrExpiredRefreshToken) {
			claims, err = extractClaimsFromExpiredToken(refreshToken, env.Jwt.RefreshTokenSecret)
			if err != nil {
				return TokenPair{}, err
			}

			//completely new token pair
			return GenerateTokenPair(claims.UserID)
		}
		return TokenPair{}, err
	}

	//new access token
	newAccessToken, err := generateToken(claims.UserID, AccessToken, env.Jwt.AccessTokenSecret, env.Jwt.AccessTokenTTL)
	if err != nil {
		return TokenPair{}, err
	}

	//using the same refresh token if it's still valid
	return TokenPair{
		AccessToken:  newAccessToken,
		RefreshToken: refreshToken,
	}, nil
}

func ExtractUserIDFromToken(tokenString string, secret []byte) (uint, error) {
	claims, err := ValidateToken(tokenString, secret, AccessToken) //only access token allowed
	if err != nil {
		return 0, err
	}
	return claims.UserID, nil
}

func GenerateResetOTP() string {

	otp := 100000 + rand.Intn(900000)
	return fmt.Sprintf("%06d", otp)
}
