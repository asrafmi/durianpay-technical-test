package usecase

import (
	"errors"
	"testing"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
)

type fakePaymentRepo struct {
	payments []entity.Payment
	total    int
	err      error

	gotStatus   entity.PaymentStatus
	gotMerchant string
	gotPage     int
	gotLimit    int
}

func (f *fakePaymentRepo) GetListPayments(status entity.PaymentStatus, merchant string, page, limit int) ([]entity.Payment, error) {
	f.gotStatus = status
	f.gotMerchant = merchant
	f.gotPage = page
	f.gotLimit = limit
	if f.err != nil {
		return nil, f.err
	}
	return f.payments, nil
}

func (f *fakePaymentRepo) CountPayments(status entity.PaymentStatus, merchant string) (int, error) {
	if f.err != nil {
		return 0, f.err
	}
	return f.total, nil
}

func TestPayment_GetListPayments_NormalizesPagination(t *testing.T) {
	tests := []struct {
		name      string
		inPage    int
		inLimit   int
		wantPage  int
		wantLimit int
	}{
		{"valid page and limit are kept", 2, 5, 2, 5},
		{"zero page defaults to 1", 0, 10, 1, 10},
		{"negative page defaults to 1", -1, 10, 1, 10},
		{"zero limit defaults to 10", 1, 0, 1, 10},
		{"limit above max is capped to 100", 1, 500, 1, 100},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &fakePaymentRepo{payments: []entity.Payment{}, total: 0}
			uc := NewPaymentUsecase(repo)

			_, _, gotPage, gotLimit, err := uc.GetListPayments("", "", tt.inPage, tt.inLimit)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if gotPage != tt.wantPage {
				t.Errorf("page = %d, want %d", gotPage, tt.wantPage)
			}
			if gotLimit != tt.wantLimit {
				t.Errorf("limit = %d, want %d", gotLimit, tt.wantLimit)
			}
			if repo.gotPage != tt.wantPage || repo.gotLimit != tt.wantLimit {
				t.Errorf("repo received page=%d limit=%d, want page=%d limit=%d", repo.gotPage, repo.gotLimit, tt.wantPage, tt.wantLimit)
			}
		})
	}
}

func TestPayment_GetListPayments_PassesFiltersThrough(t *testing.T) {
	repo := &fakePaymentRepo{payments: []entity.Payment{}, total: 0}
	uc := NewPaymentUsecase(repo)

	_, _, _, _, err := uc.GetListPayments("completed", "toko", 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if repo.gotStatus != entity.PaymentStatusCompleted {
		t.Errorf("status = %q, want %q", repo.gotStatus, entity.PaymentStatusCompleted)
	}
	if repo.gotMerchant != "toko" {
		t.Errorf("merchant = %q, want %q", repo.gotMerchant, "toko")
	}
}

func TestPayment_GetListPayments_ReturnsPaymentsAndTotal(t *testing.T) {
	want := []entity.Payment{
		{ID: "1", Merchant: "Toko A", Status: entity.PaymentStatusCompleted, Amount: "100.00", CreatedAt: "2026-01-01T00:00:00Z"},
		{ID: "2", Merchant: "Toko B", Status: entity.PaymentStatusFailed, Amount: "200.00", CreatedAt: "2026-01-02T00:00:00Z"},
	}
	repo := &fakePaymentRepo{payments: want, total: 42}
	uc := NewPaymentUsecase(repo)

	got, total, _, _, err := uc.GetListPayments("", "", 1, 10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(got) != len(want) {
		t.Fatalf("got %d payments, want %d", len(got), len(want))
	}
	if total != 42 {
		t.Errorf("total = %d, want 42", total)
	}
}

func TestPayment_GetListPayments_PropagatesListError(t *testing.T) {
	wantErr := errors.New("db exploded")
	repo := &fakePaymentRepo{err: wantErr}
	uc := NewPaymentUsecase(repo)

	_, _, _, _, err := uc.GetListPayments("", "", 1, 10)
	if !errors.Is(err, wantErr) {
		t.Errorf("err = %v, want %v", err, wantErr)
	}
}
