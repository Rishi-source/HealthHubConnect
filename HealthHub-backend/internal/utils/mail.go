package utils

import (
	"HealthHubConnect/env"
	"crypto/tls"
	"fmt"
	"net/smtp"
)

func SendEmail(to string, subject string, bodyContent string) error {
	// logger := logger.GetLogger()
	smtpHost := env.Mail.SmtpHost
	smtpPort := env.Mail.SmtpPort

	username := env.Mail.MailUsername
	password := env.Mail.MailPassword

	// fmt.Println("smtpHost: ", smtpHost, "smtpPort: ", smtpPort, "username: ", username, "password: ", password)

	// Configure TLS
	tlsConfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         smtpHost,
	}

	// Connect to SMTP server
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	conn, err := tls.Dial("tcp", addr, tlsConfig)
	if err != nil {
		// logger.GeneralLogger.Error().Err(err).Msg("failed to connect to SMTP server")
		return fmt.Errorf("failed to connect to SMTP server: %v", err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, smtpHost)
	if err != nil {
		return fmt.Errorf("failed to create SMTP client: %v", err)
	}
	defer client.Close()

	// Authenticate
	auth := smtp.PlainAuth("", username, password, smtpHost)
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("failed to authenticate: %v", err)
	}

	// Set up email
	from := username
	// recipients := []string{to}

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

	if err = client.Mail(from); err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to set from address: %v", err)
	}
	if err = client.Rcpt(to); err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to set recipient: %v", err)
	}

	w, err := client.Data()
	if err != nil {
		fmt.Println(err)
		return fmt.Errorf("failed to open data connection: %v", err)
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		fmt.Println(err)

		return fmt.Errorf("failed to write message: %v", err)
	}

	err = w.Close()
	if err != nil {
		return fmt.Errorf("failed to close data connection: %v", err)
	}

	return client.Quit()
}
