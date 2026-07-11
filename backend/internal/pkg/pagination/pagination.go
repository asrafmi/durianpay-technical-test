package pagination

const (
	DefaultPage  = 1
	DefaultLimit = 10
	MaxLimit     = 100
)

func Normalize(page, limit int) (int, int) {
	if page < 1 {
		page = DefaultPage
	}
	if limit < 1 {
		limit = DefaultLimit
	}
	if limit > MaxLimit {
		limit = MaxLimit
	}
	return page, limit
}

func Offset(page, limit int) int {
	return (page - 1) * limit
}
