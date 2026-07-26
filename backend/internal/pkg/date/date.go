package date

import (
	"time"
)

func IsDateRangeValid(dateFrom, dateTo *time.Time) bool {
	if dateFrom == nil || dateTo == nil {
		return true
	}

	return !dateFrom.After(*dateTo)
}
