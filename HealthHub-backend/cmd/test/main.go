package main

import (
	"HealthHubConnect/internal/database"
	"HealthHubConnect/internal/models"
	"HealthHubConnect/internal/utils"
)

func main() {

	// tokenPair, _ := utils.GenerateTokenPair(14325342)
	// fmt.Println(tokenPair.AccessToken)
	// fmt.Println(tokenPair.RefreshToken)
	// fmt.Println(utils.ExtractUserIDFromToken(tokenPair.AccessToken, env.Jwt.AccessTokenSecret))
	// fmt.Println(utils.ValidateToken(tokenPair.RefreshToken, env.Jwt.RefreshTokenSecret, "refresh"))
	// fmt.Println(utils.RefreshAccessTokens(tokenPair.RefreshToken))

	db, _ := database.InitDB()
	password := "password"
	passwordHash, _ := utils.HashPassword(password)
	db.AutoMigrate(&models.User{})
	user := models.User{Name: "test", Email: "test@gmail.com", PasswordHash: passwordHash, Phone: 1234567890}
	// database.InitDB()
	db.Create(&user)

}
