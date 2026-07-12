package repository

import (
	"database/sql"
	"regexp"
	"strings"
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/pkg/pagination"
)

const errDB = "db error"

type PaymentRepository interface {
	GetListPayments(status entity.PaymentStatus, search string, dateFrom, dateTo *time.Time, page, limit int, sort string) ([]entity.Payment, error)
	CountPayments(status entity.PaymentStatus, search string, dateFrom, dateTo *time.Time) (int, error)
	GetPaymentsSummary() (entity.PaymentSummary, error)
}

type PaymentRepo struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *PaymentRepo {
	return &PaymentRepo{db: db}
}

func whereClause(status entity.PaymentStatus, search string, dateFrom, dateTo *time.Time) (string, []any) {
	var conditions []string
	var args []any

	if status != "" {
		conditions = append(conditions, "status = ?")
		args = append(args, status)
	}
	if search != "" {
		conditions = append(conditions, "(merchant LIKE ? OR CAST(id AS TEXT) LIKE ?)")
		args = append(args, "%"+search+"%", "%"+search+"%")
	}
	if dateFrom != nil {
		conditions = append(conditions, "created_at >= ?")
		args = append(args, dateFrom.Format("2006-01-02 00:00:00"))
	}
	if dateTo != nil {
		conditions = append(conditions, "created_at < ?")
		args = append(args, dateTo.AddDate(0, 0, 1).Format("2006-01-02 00:00:00"))
	}

	if len(conditions) == 0 {
		return "", args
	}

	return " WHERE " + strings.Join(conditions, " AND "), args
}

func parseSort(sort string) string {
	if sort == "" {
		return " ORDER BY created_at DESC"
	}

	validFields := map[string]bool{
		"created_at": true,
		"amount":     true,
		"merchant":   true,
		"status":     true,
	}

	orderBy := " ORDER BY "
	fields := strings.Split(sort, ",")
	var orders []string

	for _, field := range fields {
		field = strings.TrimSpace(field)
		direction := "ASC"
		if strings.HasPrefix(field, "-") {
			field = field[1:]
			direction = "DESC"
		}

		if !validFields[field] {
			continue
		}

		if match, _ := regexp.MatchString("^[a-z_]+$", field); !match {
			continue
		}

		orders = append(orders, field+" "+direction)
	}

	if len(orders) == 0 {
		return " ORDER BY created_at DESC"
	}

	return orderBy + strings.Join(orders, ", ")
}

func (r *PaymentRepo) GetListPayments(status entity.PaymentStatus, search string, dateFrom, dateTo *time.Time, page, limit int, sort string) ([]entity.Payment, error) {
	where, args := whereClause(status, search, dateFrom, dateTo)
	orderBy := parseSort(sort)
	query := "SELECT id, merchant, status, amount, created_at FROM payments" + where + orderBy + " LIMIT ? OFFSET ?"
	args = append(args, limit, pagination.Offset(page, limit))

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, errDB)
	}

	defer rows.Close()

	var payments []entity.Payment
	for rows.Next() {
		var p entity.Payment
		err := rows.Scan(&p.ID, &p.Merchant, &p.Status, &p.Amount, &p.CreatedAt)
		if err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, errDB)
		}

		payments = append(payments, p)
	}

	return payments, nil
}

func (r *PaymentRepo) CountPayments(status entity.PaymentStatus, search string, dateFrom, dateTo *time.Time) (int, error) {
	where, args := whereClause(status, search, dateFrom, dateTo)
	query := "SELECT COUNT(1) FROM payments" + where

	var count int
	if err := r.db.QueryRow(query, args...).Scan(&count); err != nil {
		return 0, entity.WrapError(err, entity.ErrorCodeInternal, errDB)
	}
	return count, nil
}

func (r *PaymentRepo) GetPaymentsSummary() (entity.PaymentSummary, error) {
	var summary entity.PaymentSummary
	query := `
		SELECT 
			COUNT(1) AS total,
			SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS success,
			SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed,
			SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) AS processing
		FROM payments
	`

	err := r.db.QueryRow(query).Scan(&summary.Total, &summary.Success, &summary.Failed, &summary.Processing)
	if err != nil {
		return entity.PaymentSummary{}, entity.WrapError(err, entity.ErrorCodeInternal, errDB)
	}

	return summary, nil
}
