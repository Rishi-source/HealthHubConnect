package main

import (
	"HealthHubConnect/internal/utils"
	"fmt"
	"log"
)

func main() {
	to := "rishigarg2503@gmail.com"
	subject := "Test Email from HealthHub"
	body := "This is a test email sent from HealthHub application.\n\nBest regards,\nHealthHub Team"

	err := utils.SendEmail(to, subject, body)
	if err != nil {
		log.Fatalf("Failed to send email: %v", err)
	}
	fmt.Println("Email sent successfully!")
}
