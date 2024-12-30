package config

import (
	"time"

	"github.com/rs/zerolog"
)

type DBConfig struct {
	Host     string
	User     string
	Password string
	Dbname   string
	Port     int
	Sslmode  string
	TimeZone string
}

type LoggerConfig struct {
	Level      zerolog.Level
	FilePath   string
	MaxSize    int
	MaxBackups int
	MaxAge     int
	Compress   bool
}

type JwtConfig struct {
	AccessTokenSecret  []byte
	RefreshTokenSecret []byte
	AccessTokenTTL     time.Duration
	RefreshTokenTTL    time.Duration
}

type HashConfig struct {
	DefaultBcryptCost int
	MinSecretLength   int
	HmacSecret        string
	Salt              string
}

type MailConfig struct {
	SmtpHost     string
	SmtpPort     string
	MailUsername string
	MailPassword string
}
