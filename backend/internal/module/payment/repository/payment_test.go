package repository

import (
	"database/sql"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()

	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	t.Cleanup(func() { db.Close() })

	_, err = db.Exec(`CREATE TABLE payments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		merchant VARCHAR(255) NOT NULL,
		status VARCHAR(50) NOT NULL,
		amount DECIMAL(10, 2) NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		t.Fatalf("failed to create schema: %v", err)
	}

	seed := []struct {
		merchant string
		status   string
		amount   string
	}{
		{"Toko Sejahtera", "completed", "100.00"},
		{"Warung Nusantara", "processing", "200.00"},
		{"Toko Sejahtera", "failed", "300.00"},
	}
	for _, s := range seed {
		_, err := db.Exec(`INSERT INTO payments (merchant, status, amount) VALUES (?, ?, ?)`, s.merchant, s.status, s.amount)
		if err != nil {
			t.Fatalf("failed to seed payment: %v", err)
		}
	}

	return db
}

func TestPaymentRepo_GetListPayments_SearchMatchesMerchant(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	payments, err := repo.GetListPayments("", "Sejahtera", 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 2 {
		t.Fatalf("got %d payments, want 2", len(payments))
	}
	for _, p := range payments {
		if p.Merchant != "Toko Sejahtera" {
			t.Errorf("merchant = %q, want %q", p.Merchant, "Toko Sejahtera")
		}
	}
}

func TestPaymentRepo_GetListPayments_SearchMatchesPaymentID(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	// Row 2 is "Warung Nusantara" (seeded second, autoincrement id=2).
	payments, err := repo.GetListPayments("", "2", 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 1 {
		t.Fatalf("got %d payments, want 1", len(payments))
	}
	if payments[0].ID != "2" {
		t.Errorf("id = %q, want %q", payments[0].ID, "2")
	}
	if payments[0].Merchant != "Warung Nusantara" {
		t.Errorf("merchant = %q, want %q", payments[0].Merchant, "Warung Nusantara")
	}
}

func TestPaymentRepo_GetListPayments_SearchWithNoMatchReturnsEmpty(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	payments, err := repo.GetListPayments("", "nonexistent-xyz", 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 0 {
		t.Fatalf("got %d payments, want 0", len(payments))
	}
}

func TestPaymentRepo_GetListPayments_SearchCombinedWithStatus(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	// "Toko Sejahtera" matches both id=1 (completed) and id=3 (failed);
	// status filter should narrow it down to just the completed one.
	payments, err := repo.GetListPayments("completed", "Sejahtera", 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 1 {
		t.Fatalf("got %d payments, want 1", len(payments))
	}
	if payments[0].Status != "completed" {
		t.Errorf("status = %q, want %q", payments[0].Status, "completed")
	}
}

func TestPaymentRepo_CountPayments_SearchMatchesMerchantOrID(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	count, err := repo.CountPayments("", "Sejahtera")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}

	count, err = repo.CountPayments("", "2")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 1 {
		t.Errorf("count = %d, want 1", count)
	}
}

func TestPaymentRepo_GetListPayments_EmptySearchReturnsAll(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	payments, err := repo.GetListPayments("", "", 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 3 {
		t.Fatalf("got %d payments, want 3", len(payments))
	}
}
