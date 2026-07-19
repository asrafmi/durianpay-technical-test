package date

import (
	"testing"
	"time"
)

// func TestIsDateRangeValid(t *testing.T) {
// 	tests := []struct {
// 		name     string
// 		dateFrom *time.Time
// 		dateTo   *time.Time
// 		want     bool
// 	}{
// 		{"both nil", nil, nil, true},
// 		{"dateFrom nil", nil, &time.Time{}, true},
// 		{"dateTo nil", &time.Time{}, nil, true},
// 		{"valid range", func() *time.Time { t := time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC); return &t }(), func() *time.Time { t := time.Date(2023, 1, 2, 0, 0, 0, 0, time.UTC); return &t }(), true},
// 		{"invalid range", func() *time.Time { t := time.Date(2023, 1, 2, 0, 0, 0, 0, time.UTC); return &t }(), func() *time.Time { t := time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC); return &t }(), false},
// 	}

// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			got := IsDateRangeValid(tt.dateFrom, tt.dateTo)
// 			if got != tt.want {
// 				t.Errorf("IsDateRangeValid() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }

func TestIsDateRangeValid(t *testing.T) {
	tests := []struct {
		name     string
		dateFrom *time.Time
		dateTo   *time.Time
		want     bool
	}{
		{"both nil", nil, nil, true},
		{"dateFrom nil", nil, &time.Time{}, true},
		{"dateTo nil", &time.Time{}, nil, true},
		{"valid range", func() *time.Time { t := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC); return &t }(), func() *time.Time { t := time.Date(2026, 1, 2, 0, 0, 0, 0, time.UTC); return &t }(), true},
		{"invalid range", func() *time.Time { t := time.Date(2026, 1, 2, 0, 0, 0, 0, time.UTC); return &t }(), func() *time.Time { t := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC); return &t }(), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := IsDateRangeValid(tt.dateFrom, tt.dateTo)
			if got != tt.want {
				t.Errorf("IsDateRangeValid() = %v, want %v", got, tt.want)
			}
		})
	}
}
