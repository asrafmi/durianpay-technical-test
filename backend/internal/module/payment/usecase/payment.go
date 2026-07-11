package usecase

import (
	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/repository"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/pkg/pagination"
)

type PaymentUsecase interface {
	GetListPayments(status, merchant string, page, limit int) (payments []entity.Payment, total, effectivePage, effectiveLimit int, err error)
}

type Payment struct {
	repo repository.PaymentRepository
}

func NewPaymentUsecase(repo repository.PaymentRepository) *Payment {
	return &Payment{repo: repo}
}

func (p *Payment) GetListPayments(status, merchant string, page, limit int) ([]entity.Payment, int, int, int, error) {
	page, limit = pagination.Normalize(page, limit)

	payments, err := p.repo.GetListPayments(entity.PaymentStatus(status), merchant, page, limit)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	total, err := p.repo.CountPayments(entity.PaymentStatus(status), merchant)
	if err != nil {
		return nil, 0, 0, 0, err
	}

	return payments, total, page, limit, nil
}
