package usecase

import (
	"time"

	"github.com/asrafmi/durianpay-technical-test/backend/internal/entity"
	"github.com/asrafmi/durianpay-technical-test/backend/internal/module/auth/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const (
	errorMessageInvalidCredentials = "invalid credentials"
	errorMessageInvalidToken       = "invalid token"
)

type AuthUsecase interface {
	Login(email string, password string) (string, *entity.User, error)
}

type Auth struct {
	repo      repository.UserRepository
	jwtSecret []byte
	ttl       time.Duration
}

func NewAuthUsecase(repo repository.UserRepository, jwtSecret []byte, ttl time.Duration) *Auth {
	return &Auth{repo: repo, jwtSecret: jwtSecret, ttl: ttl}
}

// Login verifies email + password and returns a JWT.
func (a *Auth) Login(email string, password string) (string, *entity.User, error) {
	user, err := a.repo.GetUserByEmail(email)
	if err != nil {
		return "", nil, err
	}
	if user.ID == "" {
		return "", nil, entity.ErrorNotFound(errorMessageInvalidCredentials)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", nil, entity.WrapError(err, entity.ErrorCodeUnauthorized, errorMessageInvalidCredentials)
	}

	claims := jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(a.ttl).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(a.jwtSecret)
	if err != nil {
		return "", nil, entity.WrapError(err, entity.ErrorCodeUnauthorized, errorMessageInvalidCredentials)
	}
	return signed, user, nil
}

func (a *Auth) VerifyToken(tokenStr string) (jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return a.jwtSecret, nil
	})
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeUnauthorized, errorMessageInvalidToken)
	}
	if !token.Valid {
		return nil, entity.ErrorUnauthorized(errorMessageInvalidToken)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, entity.ErrorUnauthorized("invalid token claims")
	}

	return claims, nil
}
