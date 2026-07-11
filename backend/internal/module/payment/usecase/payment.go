package usecase

import (
	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/repository"
)

type PaymentUsecase interface {
	GetListPayments(status string) ([]entity.Payment, error)
}

type Payment struct {
	repo repository.PaymentRepository
}

func NewPaymentUsecase(repo repository.PaymentRepository) *Payment {
	return &Payment{repo: repo}
}

func (p *Payment) GetListPayments(status string) ([]entity.Payment, error) {
	payments, err := p.repo.GetListPayments(entity.PaymentStatus(status))
	if err != nil {
		return nil, err
	}
	return payments, nil
}
