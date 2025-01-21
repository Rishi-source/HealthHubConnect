package repositories

import (
	"HealthHubConnect/internal/models"
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

// todo: implement context more carefully if i get time
func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) SaveMessage(ctx context.Context, msg *models.ChatMessage) error {
	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(msg).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to save message: %v", err)
	}

	// Commit transaction its necessary to use context dont forget
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

func (r *ChatRepository) GetChatHistory(ctx context.Context, user1ID, user2ID uint, limit, offset int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage

	err := r.db.WithContext(ctx).
		Preload("Sender", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name")
		}).
		Preload("Receiver", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name")
		}).
		Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			user1ID, user2ID, user2ID, user1ID,
		).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	return messages, err
}

func (r *ChatRepository) MarkMessagesAsRead(ctx context.Context, receiverID, senderID uint) error {
	now := time.Now()

	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return fmt.Errorf("failed to begin transaction: %v", tx.Error)
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result := tx.Model(&models.ChatMessage{}).
		Where("receiver_id = ? AND sender_id = ? AND read = ?", receiverID, senderID, false).
		Updates(map[string]interface{}{
			"read":       true,
			"read_at":    now,
			"updated_at": now,
		})

	if result.Error != nil {
		tx.Rollback()
		return fmt.Errorf("failed to update messages: %v", result.Error)
	}

	var count int64
	tx.Model(&models.ChatMessage{}).
		Where("receiver_id = ? AND sender_id = ? AND read = ?", receiverID, senderID, true).
		Count(&count)

	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	return nil
}

func (r *ChatRepository) GetUnreadCount(ctx context.Context, receiverID, senderID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ChatMessage{}).
		Where("receiver_id = ? AND sender_id = ? AND read = false", receiverID, senderID).
		Count(&count).Error

	return count, err
}

func (r *ChatRepository) GetChatHistoryWithUnread(ctx context.Context, user1ID, user2ID uint, limit, offset int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage

	err := r.db.WithContext(ctx).
		Preload("Sender", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Preload("Receiver", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			user1ID, user2ID, user2ID, user1ID,
		).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (r *ChatRepository) GetRecentChats(ctx context.Context, userID uint, limit int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage

	subQueryStr := `
        WITH RankedMessages AS (
            SELECT 
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY 
                        CASE 
                            WHEN sender_id = ? THEN receiver_id 
                            ELSE sender_id 
                        END 
                    ORDER BY created_at DESC
                ) as rn
            FROM chat_messages
            WHERE sender_id = ? OR receiver_id = ?
        )
        SELECT * FROM RankedMessages WHERE rn = 1
    `

	err := r.db.WithContext(ctx).
		Raw(subQueryStr, userID, userID, userID).
		Preload("Sender", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Preload("Receiver", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error

	return messages, err
}
