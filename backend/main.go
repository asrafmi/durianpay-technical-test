package main

import (
	"database/sql"
	"log"
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/api"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/config"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	ah "github.com/asrafmi/durianpay-technical-test/backend/internal/module/auth/handler"
	ar "github.com/asrafmi/durianpay-technical-test/backend/internal/module/auth/repository"
	au "github.com/asrafmi/durianpay-technical-test/backend/internal/module/auth/usecase"
	ph "github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/handler"
	pr "github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/repository"
	pu "github.com/asrafmi/durianpay-technical-test/backend/internal/module/payment/usecase"
	srv "github.com/asrafmi/durianpay-technical-test/backend/internal/service/http"
	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	_ = godotenv.Load()

	db, err := sql.Open("sqlite3", config.SqliteDBPath+"?_foreign_keys=1")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	JwtExpiredDuration, err := time.ParseDuration(config.JwtExpired)
	if err != nil {
		panic(err)
	}

	userRepo := ar.NewUserRepo(db)
	paymentRepo := pr.NewPaymentRepo(db)

	authUC := au.NewAuthUsecase(userRepo, config.JwtSecret, JwtExpiredDuration)
	paymentUC := pu.NewPaymentUsecase(paymentRepo)

	authH := ah.NewAuthHandler(authUC)
	paymentH := ph.NewPaymentHandler(paymentUC)

	apiHandler := &api.APIHandler{
		Auth:    authH,
		Payment: paymentH,
	}

	server := srv.NewServer(apiHandler, config.OpenapiYamlLocation, authUC)

	addr := config.HttpAddress
	log.Printf("starting server on %s", addr)
	server.Start(addr)
}

func initDB(db *sql.DB) error {
	if err := createTables(db); err != nil {
		return err
	}
	if err := seedUsers(db); err != nil {
		return err
	}
	if err := seedPayments(db); err != nil {
		return err
	}

	const dbLifetime = time.Minute * 5
	db.SetConnMaxLifetime(dbLifetime)
	return nil
}

func createTables(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  email TEXT NOT NULL UNIQUE,
		  password_hash TEXT NOT NULL,
		  role TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS payments (
		  id INTEGER PRIMARY KEY AUTOINCREMENT,
		  merchant VARCHAR(255) NOT NULL,
		  status VARCHAR(50) NOT NULL,
		  amount DECIMAL(10, 2) NOT NULL,
		  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	return nil
}

func seedUsers(db *sql.DB) error {
	var cnt int
	row := db.QueryRow("SELECT COUNT(1) FROM users")
	if err := row.Scan(&cnt); err != nil {
		return err
	}
	if cnt > 0 {
		return nil
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "cs@test.com", string(hash), "cs"); err != nil {
		return err
	}
	if _, err := db.Exec("INSERT INTO users(email, password_hash, role) VALUES (?, ?, ?)", "operation@test.com", string(hash), "operation"); err != nil {
		return err
	}
	return nil
}

func seedPayments(db *sql.DB) error {
	var count int
	row := db.QueryRow("SELECT COUNT(1) FROM payments")
	if err := row.Scan(&count); err != nil {
		return err
	}

	if count > 0 {
		return nil
	}

	var payments = []entity.Payment{
		{Merchant: "Toko Sumber Jaya", Status: entity.PaymentStatusCompleted, Amount: "100.00", CreatedAt: time.Now().Add(-48 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Barokah", Status: entity.PaymentStatusProcessing, Amount: "200.00", CreatedAt: time.Now().Add(-24 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Makmur", Status: entity.PaymentStatusFailed, Amount: "150.00", CreatedAt: time.Now().Add(-12 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Sejahtera", Status: entity.PaymentStatusCompleted, Amount: "300.00", CreatedAt: time.Now().Add(-6 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Aman", Status: entity.PaymentStatusCompleted, Amount: "310.00", CreatedAt: time.Now().Add(-6 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Jaya Abadi", Status: entity.PaymentStatusCompleted, Amount: "100.00", CreatedAt: time.Now().Add(-6 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Toko Sinar Jaya", Status: entity.PaymentStatusProcessing, Amount: "250.00", CreatedAt: time.Now().Add(-3 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Warung Makan Ibu Rina", Status: entity.PaymentStatusFailed, Amount: "400.00", CreatedAt: time.Now().Add(-2 * time.Hour).Format(time.RFC3339)},
		{Merchant: "PT Maju Bersama", Status: entity.PaymentStatusCompleted, Amount: "500.00", CreatedAt: time.Now().Add(-1 * time.Hour).Format(time.RFC3339)},
		{Merchant: "Kedai Kopi Senja", Status: entity.PaymentStatusProcessing, Amount: "600.00", CreatedAt: time.Now().Format(time.RFC3339)},
		{Merchant: "CV Sumber Rejeki", Status: entity.PaymentStatusFailed, Amount: "700.00", CreatedAt: time.Now().Format(time.RFC3339)},
		{Merchant: "Toko Elektronik Jaya", Status: entity.PaymentStatusCompleted, Amount: "800.00", CreatedAt: time.Now().Format(time.RFC3339)},
		{Merchant: "Apotek Sehat Selalu", Status: entity.PaymentStatusProcessing, Amount: "900.00", CreatedAt: time.Now().Format(time.RFC3339)},
		{Merchant: "Toko Buku Pintar", Status: entity.PaymentStatusFailed, Amount: "1000.00", CreatedAt: time.Now().Format(time.RFC3339)},
		{Merchant: "Restoran Lezat", Status: entity.PaymentStatusCompleted, Amount: "1100.00", CreatedAt: time.Now().Format(time.RFC3339)},
	}

	for _, p := range payments {
		_, err := db.Exec("INSERT INTO payments(merchant, status, amount, created_at) VALUES (?, ?, ?, ?)", p.Merchant, p.Status, p.Amount, p.CreatedAt)
		if err != nil {
			return err
		}
	}

	return nil
}
