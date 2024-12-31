package env

import (
	"HealthHubConnect/config"
	"fmt"
	"time"

	"github.com/rs/zerolog"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// database configurations
var dsnConfig = config.DBConfig{
	Host:     "localhost",
	User:     "ujjwal",
	Password: "password",
	Dbname:   "user_services",
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
	// ServerPort defines the port on which the server will listen
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
	SmtpHost:     "smtppro.zoho.in",
	SmtpPort:     "465", // Use "465"
	MailUsername: "ujjwal@anochat.in",
	MailPassword: "7tuzVskvEvbN",
}

var (
	GoogleOAuthConfig = &oauth2.Config{
		ClientID:     "YOUR_GOOGLE_CLIENT_ID",
		ClientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
		RedirectURL:  "http://localhost:8081/api/v1/auth/google/callback",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
	OAuthStateString = "random-string" // In production, generate this dynamically for each request
)

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
