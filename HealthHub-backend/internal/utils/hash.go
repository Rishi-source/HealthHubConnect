package utils

import (
	"HealthHubConnect/env"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrHashFailed       = errors.New("failed to hash data")
	ErrInvalidHash      = errors.New("invalid hash provided")
	ErrComparisonFailed = errors.New("hash comparison failed")
	ErrEmptySecret      = errors.New("secret key cannot be empty")
	ErrEmptyData        = errors.New("data to hash cannot be empty")
)

var (
	defaultBcryptCost = env.Hash.DefaultBcryptCost
	minSecretLength   = env.Hash.MinSecretLength
	secret            = env.Hash.HmacSecret
	salt              = env.Hash.HmacSecret
)

// HashPassword creates a bcrypt hash of a password
func HashPassword(password string) (string, error) {
	if password == "" {
		return "", fmt.Errorf("password cannot be empty")
	}

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		return "", err
	}

	return string(hashedBytes), nil
}

// ComparePassword compares a password with a hash
func ComparePassword(password, hash string) error {
	// Add debug logging
	if password == "" || hash == "" {
		log.Printf("Empty password or hash received: pwd_len=%d, hash_len=%d", len(password), len(hash))
		return fmt.Errorf("invalid password or hash")
	}

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		log.Printf("Password comparison error: %v", err)
		return err
	}
	return nil
}

// CreateHMAC creates an HMAC hash of data using SHA-256
func CreateHMAC(data string) (string, error) {
	if data == "" {
		return "", ErrEmptyData
	}
	if len(secret) < minSecretLength {
		return "", ErrEmptySecret
	}

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))

	return hex.EncodeToString(h.Sum(nil)), nil
}

// VerifyHMAC verifies an HMAC hash
func VerifyHMAC(data string, hash string) error {
	if data == "" || hash == "" {
		return ErrEmptyData
	}
	if len(secret) < minSecretLength {
		return ErrEmptySecret
	}

	expectedHash, err := CreateHMAC(data)
	if err != nil {
		return err
	}

	if !hmac.Equal([]byte(hash), []byte(expectedHash)) {
		return ErrInvalidHash
	}

	return nil
}

// HashWithSalt adds a salt to data before hashing
func HashWithSalt(data string) (string, error) {
	if data == "" {
		return "", ErrEmptyData
	}
	if salt == "" {
		return "", ErrEmptySecret
	}

	// Combine data and salt
	saltedData := data + salt

	// Hash using bcrypt
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(saltedData), defaultBcryptCost)
	if err != nil {
		return "", ErrHashFailed
	}

	return string(hashedBytes), nil
}

// CompareHashWithSalt compares data with a salted hash
func CompareHashWithSalt(data string, hash string) error {
	if data == "" || salt == "" || hash == "" {
		return ErrEmptyData
	}

	// Combine data and salt
	saltedData := data + salt

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(saltedData))
	if err != nil {
		if err == bcrypt.ErrMismatchedHashAndPassword {
			return ErrInvalidHash
		}
		return ErrComparisonFailed
	}

	return nil
}
