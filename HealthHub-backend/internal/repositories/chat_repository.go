package repositories

import (
	"HealthHubConnect/internal/models"
	"context"

	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r *ChatRepository) SaveMessage(ctx context.Context, msg *models.ChatMessage) error {
	return r.db.WithContext(ctx).
		Create(msg).
		Error
}

func (r *ChatRepository) GetChatHistory(ctx context.Context, user1ID, user2ID uint, limit, offset int) ([]models.ChatMessage, error) {
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

func (r *ChatRepository) MarkMessagesAsRead(ctx context.Context, receiverID, senderID uint) error {
	return r.db.WithContext(ctx).
		Model(&models.ChatMessage{}).
		Where("receiver_id = ? AND sender_id = ? AND read = ?", receiverID, senderID, false).
		Updates(map[string]interface{}{
			"read":    true,
			"read_at": gorm.Expr("CURRENT_TIMESTAMP"),
		}).Error
}

func (r *ChatRepository) GetUnreadCount(ctx context.Context, receiverID, senderID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.ChatMessage{}).
		Where("receiver_id = ? AND sender_id = ? AND read = ?", receiverID, senderID, false).
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

	subQuery := r.db.Table("chat_messages").
		Select("MAX(id)").
		Where("sender_id = ? OR receiver_id = ?", userID, userID).
		Group("CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END")

	err := r.db.WithContext(ctx).
		Preload("Sender", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Preload("Receiver", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name, email, profile_picture")
		}).
		Where("id IN (?)", subQuery).
		Order("created_at DESC").
		Limit(limit).
		Find(&messages).Error

	return messages, err
}
