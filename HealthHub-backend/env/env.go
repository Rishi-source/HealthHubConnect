package env

import (
	"HealthHubConnect/config"
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Make sure NO sensitive data is in this file
// All sensitive data should be in .env only

// database configurations
var dsnConfig = config.DBConfig{
	Host:     os.Getenv("DB_HOST"),
	User:     os.Getenv("DB_USER"),
	Password: os.Getenv("DB_PASSWORD"),
	Dbname:   os.Getenv("DB_NAME"),
	Port:     5432,
	Sslmode:  "disable",
	TimeZone: "Asia/Kolkata",
}

var (
	Dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s TimeZone=%s", dsnConfig.Host, dsnConfig.User, dsnConfig.Password, dsnConfig.Dbname, dsnConfig.Port, dsnConfig.Sslmode, dsnConfig.TimeZone)

	// these varibalbes are used to set the maximum number of open and idle connections in the database
	MaxIdleConns = 10
	MaxOpenConns = 100
)

// Server configurations

var (
	// ServerPort defines the port on which he server will listen
	port       = 8081
	ServerPort = fmt.Sprint(":", port)
)

// Logger configurations
var Logger = config.LoggerConfig{
	Level:      zerolog.DebugLevel,
	FilePath:   "./logs",
	MaxSize:    10,
	MaxBackups: 5,
	MaxAge:     30,
	Compress:   true,
}

// JWT configurations
var Jwt = config.JwtConfig{
	AccessTokenSecret:  []byte("access_secret"),
	RefreshTokenSecret: []byte("refresh_secret"),
	AccessTokenTTL:     15 * time.Minute,
	RefreshTokenTTL:    7 * 24 * time.Hour,
}

// hash configurations
var Hash = config.HashConfig{
	DefaultBcryptCost: 10,
	MinSecretLength:   32,
	HmacSecret:        "secret",
	Salt:              "salt",
}

var Mail = config.MailConfig{
	SmtpHost:     os.Getenv("SMTP_HOST"),
	SmtpPort:     os.Getenv("SMTP_PORT"),
	MailUsername: os.Getenv("MAIL_USERNAME"),
	MailPassword: os.Getenv("MAIL_PASSWORD"),
}

type Config struct {
	GoogleClientID     string
	GoogleClientSecret string
}

func NewConfig() *Config {
	return &Config{
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	}
}

var (
	GoogleOAuthConfig = &oauth2.Config{
		ClientID:     NewConfig().GoogleClientID,
		ClientSecret: NewConfig().GoogleClientSecret,
		RedirectURL:  "http://localhost:8081/api/v1/auth/google/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	OAuthStateString = "random-string" // In production, generate this dynamically for each request
)

// CORS configurations
var Cors = config.CorsConfig{
	AllowedOrigins: []string{"*"},
	AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	MaxAge:         300, // 5 minutes
}

//in production set these variable private and add getter functions

// func GetDSN() string {
// 	return dsn
// }

// func GetMaxIdleConns() int {
// 	return maxIdleConns
// }

// func GetMaxOpenConns() int {
// 	return maxOpenConns
// }

// func GetServerPort() string {
// 	return serverPort
// }

// func GetLogger() config.LoggerConfig {
// 	return logger
// }

// func GetJWT() config.JwtConfig {
// 	return jwt
// }
