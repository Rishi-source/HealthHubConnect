package repositories

import (
	"HealthHubConnect/internal/models"
	"context"

	"gorm.io/gorm"
)

type BillingRepository struct {
	db *gorm.DB
}

func NewBillingRepository(db *gorm.DB) *BillingRepository {
	return &BillingRepository{db: db}
}

func (r *BillingRepository) SaveDoctorBillingSettings(ctx context.Context, settings *models.DoctorBillingSettings) error {
	return r.db.WithContext(ctx).Save(settings).Error
}

func (r *BillingRepository) GetDoctorBillingSettings(ctx context.Context, doctorID uint) (*models.DoctorBillingSettings, error) {
	var settings models.DoctorBillingSettings
	err := r.db.WithContext(ctx).Where("doctor_id = ?", doctorID).First(&settings).Error
	return &settings, err
}

func (r *BillingRepository) CreateBill(ctx context.Context, bill *models.Bill) error {
	return r.db.WithContext(ctx).Create(bill).Error
}

func (r *BillingRepository) UpdateBill(ctx context.Context, bill *models.Bill) error {
	return r.db.WithContext(ctx).Save(bill).Error
}

func (r *BillingRepository) GetBill(ctx context.Context, billID uint) (*models.Bill, error) {
	var bill models.Bill
	err := r.db.WithContext(ctx).First(&bill, billID).Error
	return &bill, err
}

func (r *BillingRepository) GetBillsByDoctor(ctx context.Context, doctorID uint, page, limit int) ([]models.Bill, int64, error) {
	var bills []models.Bill
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Bill{}).Where("doctor_id = ?", doctorID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Offset((page - 1) * limit).
		Limit(limit).
		Order("created_at DESC").
		Find(&bills).Error

	return bills, total, err
}

func (r *BillingRepository) GetBillsByPatient(ctx context.Context, patientID uint, page, limit int) ([]models.Bill, int64, error) {
	var bills []models.Bill
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Bill{}).Where("patient_id = ?", patientID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Offset((page - 1) * limit).
		Limit(limit).
		Order("created_at DESC").
		Find(&bills).Error

	return bills, total, err
}

func (r *BillingRepository) GetBillsByAppointment(ctx context.Context, appointmentID uint) (*models.Bill, error) {
	var bill models.Bill
	err := r.db.WithContext(ctx).Where("appointment_id = ?", appointmentID).First(&bill).Error
	return &bill, err
}

func (r *BillingRepository) UpdatePaymentStatus(ctx context.Context, billID uint, status string, txnID string) error {
	return r.db.WithContext(ctx).
		Model(&models.Bill{}).
		Where("id = ?", billID).
		Updates(map[string]interface{}{
			"status":         status,
			"transaction_id": txnID,
			"paid_at":        gorm.Expr("CURRENT_TIMESTAMP"),
		}).Error
}

func (r *BillingRepository) ProcessRefund(ctx context.Context, billID uint, refundAmount float64, reason string) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return tx.Model(&models.Bill{}).
			Where("id = ?", billID).
			Updates(map[string]interface{}{
				"refund_status": models.RefundStatusPending,
				"refund_amount": refundAmount,
				"refund_reason": reason,
				"refund_date":   gorm.Expr("CURRENT_TIMESTAMP"),
				"status":        "REFUND_PENDING",
			}).Error
	})
}
