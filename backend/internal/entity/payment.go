package entity

type Payment struct {
	ID        string        `json:"id"`
	Merchant  string        `json:"merchant"`
	Status    PaymentStatus `json:"status"`
	Amount    string        `json:"amount"`
	CreatedAt string        `json:"created_at"`
}

type PaymentStatus string

const (
	PaymentStatusCompleted  PaymentStatus = "completed"
	PaymentStatusProcessing PaymentStatus = "processing"
	PaymentStatusFailed     PaymentStatus = "failed"
)
