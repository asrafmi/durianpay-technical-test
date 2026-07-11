package repository

import (
	"database/sql"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
)

type PaymentRepository interface {
	GetListPayments(status entity.PaymentStatus) ([]entity.Payment, error)
}

type PaymentRepo struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *PaymentRepo {
	return &PaymentRepo{db: db}
}

func (r *PaymentRepo) GetListPayments(status entity.PaymentStatus) ([]entity.Payment, error) {
	rows, err := r.db.Query("SELECT id, merchant, status, amount, created_at FROM payments WHERE status = ?", status)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}

	defer rows.Close()

	var payments []entity.Payment
	for rows.Next() {
		var p entity.Payment
		err := rows.Scan(&p.ID, &p.Merchant, &p.Status, &p.Amount, &p.CreatedAt)
		if err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}

		payments = append(payments, p)
	}

	return payments, nil
}
