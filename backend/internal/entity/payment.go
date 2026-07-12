package entity

type Payment struct {
	ID        string        `json:"id"`
	Merchant  string        `json:"merchant"`
	Status    PaymentStatus `json:"status"`
	Amount    string        `json:"amount"`
	CreatedAt string        `json:"created_at"`
}

type PaymentSummary struct {
	Total      int `json:"total"`
	Success    int `json:"success"`
	Failed     int `json:"failed"`
	Processing int `json:"processing"`
}

type PaymentStatus string

const (
	PaymentStatusCompleted  PaymentStatus = "completed"
	PaymentStatusProcessing PaymentStatus = "processing"
	PaymentStatusFailed     PaymentStatus = "failed"
)
