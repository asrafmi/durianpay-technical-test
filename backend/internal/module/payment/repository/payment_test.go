package repository

import (
	"database/sql"
	"testing"
	"time"

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
		merchant  string
		status    string
		amount    string
		createdAt string
	}{
		{"Toko Sejahtera", "completed", "100.00", "2026-01-05 10:00:00"},
		{"Warung Nusantara", "processing", "200.00", "2026-01-15 10:00:00"},
		{"Toko Sejahtera", "failed", "300.00", "2026-01-25 10:00:00"},
	}
	for _, s := range seed {
		_, err := db.Exec(
			`INSERT INTO payments (merchant, status, amount, created_at) VALUES (?, ?, ?, ?)`,
			s.merchant, s.status, s.amount, s.createdAt,
		)
		if err != nil {
			t.Fatalf("failed to seed payment: %v", err)
		}
	}

	return db
}

func date(s string) time.Time {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		panic(err)
	}
	return t
}

func TestPaymentRepo_GetListPayments_SearchMatchesMerchant(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	payments, err := repo.GetListPayments("", "Sejahtera", nil, nil, 1, 10, "")
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
	payments, err := repo.GetListPayments("", "2", nil, nil, 1, 10, "")
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

	payments, err := repo.GetListPayments("", "nonexistent-xyz", nil, nil, 1, 10, "")
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
	payments, err := repo.GetListPayments("completed", "Sejahtera", nil, nil, 1, 10, "")
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

	count, err := repo.CountPayments("", "Sejahtera", nil, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 2 {
		t.Errorf("count = %d, want 2", count)
	}

	count, err = repo.CountPayments("", "2", nil, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 1 {
		t.Errorf("count = %d, want 1", count)
	}
}

func TestPaymentRepo_GetListPayments_EmptySearchReturnsAll(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	payments, err := repo.GetListPayments("", "", nil, nil, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 3 {
		t.Fatalf("got %d payments, want 3", len(payments))
	}
}

// Seeded rows are created_at 2026-01-05, 2026-01-15, 2026-01-25 (all 10:00:00).
func TestPaymentRepo_GetListPayments_DateFromOnly(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	dateFrom := date("2026-01-15")
	payments, err := repo.GetListPayments("", "", &dateFrom, nil, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 2 {
		t.Fatalf("got %d payments, want 2 (2026-01-15 and 2026-01-25)", len(payments))
	}
}

func TestPaymentRepo_GetListPayments_DateToOnly(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	dateTo := date("2026-01-15")
	payments, err := repo.GetListPayments("", "", nil, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 2 {
		t.Fatalf("got %d payments, want 2 (2026-01-05 and 2026-01-15)", len(payments))
	}
}

func TestPaymentRepo_GetListPayments_DateToIsInclusiveOfWholeDay(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	// The 2026-01-15 row has a time component (10:00:00). date_to=2026-01-15
	// must still include it (i.e. date_to means "through end of that day").
	dateTo := date("2026-01-15")
	payments, err := repo.GetListPayments("", "", nil, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	found := false
	for _, p := range payments {
		if p.Merchant == "Warung Nusantara" {
			found = true
		}
	}
	if !found {
		t.Error("expected the 2026-01-15 row to be included when date_to=2026-01-15")
	}
}

func TestPaymentRepo_GetListPayments_DateFromAndDateToRange(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	dateFrom := date("2026-01-10")
	dateTo := date("2026-01-20")
	payments, err := repo.GetListPayments("", "", &dateFrom, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 1 {
		t.Fatalf("got %d payments, want 1 (only 2026-01-15)", len(payments))
	}
	if payments[0].Merchant != "Warung Nusantara" {
		t.Errorf("merchant = %q, want %q", payments[0].Merchant, "Warung Nusantara")
	}
}

func TestPaymentRepo_GetListPayments_DateRangeWithNoMatchReturnsEmpty(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	dateFrom := date("2026-02-01")
	dateTo := date("2026-02-28")
	payments, err := repo.GetListPayments("", "", &dateFrom, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 0 {
		t.Fatalf("got %d payments, want 0", len(payments))
	}
}

func TestPaymentRepo_CountPayments_DateRange(t *testing.T) {
	repo := NewPaymentRepo(newTestDB(t))

	dateFrom := date("2026-01-10")
	dateTo := date("2026-01-20")
	count, err := repo.CountPayments("", "", &dateFrom, &dateTo)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 1 {
		t.Errorf("count = %d, want 1", count)
	}
}

// Regression test for a WIB/UTC boundary bug: a payment created late in the
// evening UTC (18:49) is already past midnight in WIB (UTC+7), so it falls
// on the *next* calendar day when displayed in the frontend (which renders
// dates in the browser's local timezone). date_from/date_to must be
// interpreted in the same business timezone (Asia/Jakarta) the frontend
// uses, otherwise a date the user picks won't match what they see in the UI.
func TestPaymentRepo_GetListPayments_DateFilterUsesBusinessTimezoneNotUTC(t *testing.T) {
	db := newTestDB(t)
	// 2026-07-12T18:49:57Z is 2026-07-13T01:49:57+07:00 (WIB) - i.e. it is
	// "13 July" from the business's/user's point of view, even though its
	// UTC calendar date is still "12 July".
	_, err := db.Exec(
		`INSERT INTO payments (merchant, status, amount, created_at) VALUES (?, ?, ?, ?)`,
		"Kedai Kopi Senja", "processing", "600.00", "2026-07-12 18:49:57",
	)
	if err != nil {
		t.Fatalf("failed to seed payment: %v", err)
	}
	repo := NewPaymentRepo(db)

	dateFrom := date("2026-07-13")
	dateTo := date("2026-07-13")
	payments, err := repo.GetListPayments("", "", &dateFrom, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 1 {
		t.Fatalf("got %d payments, want 1 (the 18:49:57 UTC row, which is 13 July in WIB)", len(payments))
	}
	if payments[0].Merchant != "Kedai Kopi Senja" {
		t.Errorf("merchant = %q, want %q", payments[0].Merchant, "Kedai Kopi Senja")
	}
}

// Companion test: the same row must NOT match date_from=date_to=2026-07-12,
// since in WIB it belongs to the 13th, not the 12th.
func TestPaymentRepo_GetListPayments_DateFilterExcludesPreviousUTCDayInBusinessTimezone(t *testing.T) {
	db := newTestDB(t)
	_, err := db.Exec(
		`INSERT INTO payments (merchant, status, amount, created_at) VALUES (?, ?, ?, ?)`,
		"Kedai Kopi Senja", "processing", "600.00", "2026-07-12 18:49:57",
	)
	if err != nil {
		t.Fatalf("failed to seed payment: %v", err)
	}
	repo := NewPaymentRepo(db)

	dateFrom := date("2026-07-12")
	dateTo := date("2026-07-12")
	payments, err := repo.GetListPayments("", "", &dateFrom, &dateTo, 1, 10, "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(payments) != 0 {
		t.Fatalf("got %d payments, want 0 (the 18:49:57 UTC row is 13 July in WIB, not 12 July)", len(payments))
	}
}
