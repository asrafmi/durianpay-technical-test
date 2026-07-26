package role

import (
	"net/http"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/transport"
)

func GetRoleFromContext(r *http.Request) string {
	role, _ := r.Context().Value(transport.CtxKeyRole).(string)
	return role
}
