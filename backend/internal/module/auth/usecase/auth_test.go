package usecase

import (
	"testing"
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type fakeUserRepo struct {
	user *entity.User
	err  error
}

func (f *fakeUserRepo) GetUserByEmail(email string) (*entity.User, error) {
	if f.err != nil {
		return nil, f.err
	}
	return f.user, nil
}

func hashPassword(t *testing.T, password string) string {
	t.Helper()
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}
	return string(hash)
}

func TestAuth_Login_Success(t *testing.T) {
	repo := &fakeUserRepo{
		user: &entity.User{
			ID:           "1",
			Email:        "cs@test.com",
			PasswordHash: hashPassword(t, "password"),
			Role:         "cs",
		},
	}
	auth := NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	token, user, err := auth.Login("cs@test.com", "password")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if token == "" {
		t.Error("expected a non-empty token")
	}
	if user.Email != "cs@test.com" {
		t.Errorf("user.Email = %q, want %q", user.Email, "cs@test.com")
	}

	claims, err := auth.VerifyToken(token)
	if err != nil {
		t.Fatalf("issued token should verify, got error: %v", err)
	}
	if claims["sub"] != "1" {
		t.Errorf("claims[sub] = %v, want %q", claims["sub"], "1")
	}
}

func TestAuth_Login_WrongPassword(t *testing.T) {
	repo := &fakeUserRepo{
		user: &entity.User{ID: "1", Email: "cs@test.com", PasswordHash: hashPassword(t, "correct-password")},
	}
	auth := NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	_, _, err := auth.Login("cs@test.com", "wrong-password")
	if err == nil {
		t.Fatal("expected an error for wrong password, got nil")
	}
}

func TestAuth_Login_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{err: entity.ErrorNotFound("user not found")}
	auth := NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	_, _, err := auth.Login("missing@test.com", "password")
	if err == nil {
		t.Fatal("expected an error for missing user, got nil")
	}
}

func TestAuth_Login_EmptyUserTreatedAsNotFound(t *testing.T) {
	repo := &fakeUserRepo{user: &entity.User{}}
	auth := NewAuthUsecase(repo, []byte("test-secret"), time.Hour)

	_, _, err := auth.Login("cs@test.com", "password")
	if err == nil {
		t.Fatal("expected an error when repo returns a zero-value user, got nil")
	}
}

func TestAuth_VerifyToken_InvalidSignature(t *testing.T) {
	auth := NewAuthUsecase(&fakeUserRepo{}, []byte("test-secret"), time.Hour)

	// Craft a token signed with a different secret and confirm verification fails.
	claims := jwt.MapClaims{"sub": "1", "exp": time.Now().Add(time.Hour).Unix()}
	badToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := badToken.SignedString([]byte("different-secret"))
	if err != nil {
		t.Fatalf("failed to sign test token: %v", err)
	}

	if _, err := auth.VerifyToken(signed); err == nil {
		t.Fatal("expected an error for a token signed with a different secret, got nil")
	}
}

func TestAuth_VerifyToken_Expired(t *testing.T) {
	secret := []byte("test-secret")
	auth := NewAuthUsecase(&fakeUserRepo{}, secret, time.Hour)

	claims := jwt.MapClaims{"sub": "1", "exp": time.Now().Add(-time.Hour).Unix()}
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := expiredToken.SignedString(secret)
	if err != nil {
		t.Fatalf("failed to sign test token: %v", err)
	}

	if _, err := auth.VerifyToken(signed); err == nil {
		t.Fatal("expected an error for an expired token, got nil")
	}
}

func TestAuth_VerifyToken_Malformed(t *testing.T) {
	auth := NewAuthUsecase(&fakeUserRepo{}, []byte("test-secret"), time.Hour)

	if _, err := auth.VerifyToken("not-a-real-token"); err == nil {
		t.Fatal("expected an error for a malformed token, got nil")
	}
}
