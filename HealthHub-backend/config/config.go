package config

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	ServerPort string
}

func LoadConfig() *Config {
	return &Config{
		DBHost:     "localhost",
		DBPort:     "5432",
		DBUser:     "ujjwal",
		DBPassword: "password",
		DBName:     "healthhubconnect",
		ServerPort: "8080",
	}
}
