package services

import (
	"HealthHubConnect/env"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type ChatGPTService struct {
	apiKey string
	client *http.Client
}

type ChatGPTRequest struct {
	Model       string           `json:"model"`
	Messages    []ChatGPTMessage `json:"messages"`
	MaxTokens   int              `json:"max_tokens"`
	Temperature float32          `json:"temperature"`
	Stream      bool             `json:"stream"`
}

type ChatGPTMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatGPTResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Message      ChatGPTMessage `json:"message"`
		FinishReason string         `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

func NewChatGPTService() *ChatGPTService {
	return &ChatGPTService{
		apiKey: env.GetOpenAIKey(),
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *ChatGPTService) GetResponse(ctx context.Context, query string) (string, error) {
	return s.ProcessChat(ctx, []ChatGPTMessage{{Role: "user", Content: query}})
}

func (s *ChatGPTService) ProcessChat(ctx context.Context, messages []ChatGPTMessage) (string, error) {
	if len(messages) == 0 {
		return "", errors.New("no messages provided")
	}

	config := env.GetOpenAIConfig()
	reqBody := ChatGPTRequest{
		Model:       config.Model,
		Messages:    messages,
		MaxTokens:   config.MaxTokens,
		Temperature: config.Temperature,
		Stream:      false,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errorResponse ChatGPTResponse
		if err := json.NewDecoder(resp.Body).Decode(&errorResponse); err != nil {
			return "", fmt.Errorf("API error (status %d)", resp.StatusCode)
		}
		if errorResponse.Error != nil {
			return "", fmt.Errorf("API error: %s (type: %s, code: %s)",
				errorResponse.Error.Message,
				errorResponse.Error.Type,
				errorResponse.Error.Code)
		}
		return "", fmt.Errorf("unknown API error (status %d)", resp.StatusCode)
	}

	var result ChatGPTResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	if len(result.Choices) == 0 {
		return "", errors.New("no response choices returned")
	}

	return result.Choices[0].Message.Content, nil
}

func (s *ChatGPTService) GetStreamingResponse(ctx context.Context, messages []ChatGPTMessage, responseChan chan<- string) error {
	return errors.New("streaming not implemented yet")
}

func (s *ChatGPTService) preprocessQuery(query string) string {
	return query
}

func (s *ChatGPTService) validateResponse(response string) error {
	if len(response) == 0 {
		return errors.New("empty response received")
	}
	return nil
}
