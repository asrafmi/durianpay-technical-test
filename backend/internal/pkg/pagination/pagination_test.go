package pagination

import "testing"

func TestNormalize(t *testing.T) {
	tests := []struct {
		name      string
		page      int
		limit     int
		wantPage  int
		wantLimit int
	}{
		{"valid values are unchanged", 3, 25, 3, 25},
		{"zero page defaults to DefaultPage", 0, 10, DefaultPage, 10},
		{"negative page defaults to DefaultPage", -5, 10, DefaultPage, 10},
		{"zero limit defaults to DefaultLimit", 1, 0, 1, DefaultLimit},
		{"negative limit defaults to DefaultLimit", 1, -1, 1, DefaultLimit},
		{"limit at MaxLimit is unchanged", 1, MaxLimit, 1, MaxLimit},
		{"limit above MaxLimit is capped", 1, MaxLimit + 1, 1, MaxLimit},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotPage, gotLimit := Normalize(tt.page, tt.limit)
			if gotPage != tt.wantPage {
				t.Errorf("page = %d, want %d", gotPage, tt.wantPage)
			}
			if gotLimit != tt.wantLimit {
				t.Errorf("limit = %d, want %d", gotLimit, tt.wantLimit)
			}
		})
	}
}

func TestOffset(t *testing.T) {
	tests := []struct {
		name  string
		page  int
		limit int
		want  int
	}{
		{"first page has zero offset", 1, 10, 0},
		{"second page offsets by one limit", 2, 10, 10},
		{"third page with different limit", 3, 25, 50},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Offset(tt.page, tt.limit)
			if got != tt.want {
				t.Errorf("Offset(%d, %d) = %d, want %d", tt.page, tt.limit, got, tt.want)
			}
		})
	}
}
