package utils

import (
	"HealthHubConnect/env"
	"HealthHubConnect/pkg/logger"
	"fmt"
	"net/smtp"
)

func SendEmail(to string, subject string, bodyContent string) error {

	logger := logger.GetLogger()
	smtpHost := env.Mail.SmtpHost
	smtpPort := env.Mail.SmtpPort

	username := env.Mail.MailUsername
	password := env.Mail.MailUsername

	from := username
	recipients := []string{to}

	headers := make(map[string]string)
	headers["From"] = "HealthHub <" + from + ">"
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"utf-8\""

	message := ""
	for key, value := range headers {
		message += fmt.Sprintf("%s: %s\r\n", key, value)
	}
	message += "\r\n" + bodyContent

	auth := smtp.PlainAuth("", username, password, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, recipients, []byte(message))
	if err != nil {
		logger.GeneralLogger.Error().Err(err).Msg("failed to send email")
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}
