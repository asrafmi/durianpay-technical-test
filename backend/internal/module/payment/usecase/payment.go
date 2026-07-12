package usecase

import (
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/repository"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/pkg/pagination"
)

type PaymentUsecase interface {
	GetListPayments(status, search string, dateFrom, dateTo *time.Time, page, limit int, sort string) (payments []entity.Payment, total, effectivePage, effectiveLimit int, err error)
	GetPaymentSummary() (*entity.PaymentSummary, error)
}

type Payment struct {
	repo repository.PaymentRepository
}

func NewPaymentUsecase(repo repository.PaymentRepository) *Payment {
	return &Payment{repo: repo}
}

func (p *Payment) GetListPayments(status, search string, dateFrom, dateTo *time.Time, page, limit int, sort string) ([]entity.Payment, int, int, int, error) {
	page, limit = pagination.Normalize(page, limit)

	payments, err := p.repo.GetListPayments(entity.PaymentStatus(status), search, dateFrom, dateTo, page, limit, sort)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	total, err := p.repo.CountPayments(entity.PaymentStatus(status), search, dateFrom, dateTo)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	return payments, total, page, limit, nil
}

func (p *Payment) GetPaymentSummary() (*entity.PaymentSummary, error) {
	summary, err := p.repo.GetPaymentsSummary()
	if err != nil {
		return nil, err
	}

	return &summary, nil
}
