package api

import (
	"net/http"

	ah "github.com/asrafmi/durianpay-technical-test/backend/internal/module/auth/handler"
	ph "github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/handler"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/openapigen"
)

type APIHandler struct {
	Auth    *ah.AuthHandler
	Payment *ph.PaymentHandler
}

var _ openapigen.ServerInterface = (*APIHandler)(nil)

func (h *APIHandler) PostDashboardV1AuthLogin(w http.ResponseWriter, r *http.Request) {
	h.Auth.PostDashboardV1AuthLogin(w, r)
}

func (h *APIHandler) GetDashboardV1Payments(w http.ResponseWriter, r *http.Request, params openapigen.GetDashboardV1PaymentsParams) {
	h.Payment.GetDashboardV1Payments(w, r, params)
}
