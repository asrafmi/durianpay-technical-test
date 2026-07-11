package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	paymentUsecase "github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/usecase"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/openapigen"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/transport"
)

type PaymentHandler struct {
	paymentUC paymentUsecase.PaymentUsecase
}

func NewPaymentHandler(paymentUC paymentUsecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{
		paymentUC: paymentUC,
	}
}

func toOpenapiPayment(p entity.Payment) (openapigen.Payment, error) {
	status := string(p.Status)
	createdAt, err := time.Parse(time.RFC3339, p.CreatedAt)
	if err != nil {
		return openapigen.Payment{}, entity.WrapError(err, entity.ErrorCodeInternal, "invalid created_at format")
	}

	return openapigen.Payment{
		Id:        &p.ID,
		Merchant:  &p.Merchant,
		Status:    &status,
		Amount:    &p.Amount,
		CreatedAt: &createdAt,
	}, nil
}

func (p *PaymentHandler) GetDashboardV1Payments(w http.ResponseWriter, r *http.Request, params openapigen.GetDashboardV1PaymentsParams) {
	var status, merchant string
	if params.Status != nil {
		status = *params.Status
	}
	if params.Search != nil {
		merchant = *params.Search
	}

	var page, limit int
	if params.Page != nil {
		page = *params.Page
	}
	if params.Limit != nil {
		limit = *params.Limit
	}

	payments, total, page, limit, err := p.paymentUC.GetListPayments(status, merchant, page, limit)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	openAPIPayments := make([]openapigen.Payment, len(payments))
	for i, payment := range payments {
		converted, err := toOpenapiPayment(payment)
		if err != nil {
			transport.WriteError(w, err)
			return
		}
		openAPIPayments[i] = converted
	}

	err = json.NewEncoder(w).Encode(openapigen.PaymentListResponse{
		Payments: &openAPIPayments,
		Total:    &total,
		Page:     &page,
		Limit:    &limit,
	})
	if err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
		return
	}
}
