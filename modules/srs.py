# ============================================================
# modules/srs.py — Cơ chế lặp lại ngắt quãng (Spaced Repetition)
# ============================================================
from datetime import date, datetime, timedelta

# Khoảng cách ôn tập mặc định (ngày)
INTERVALS = [1, 3, 7, 14, 30]


def to_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def to_float(value, default=2.5):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_date(value):
    """Chuyển nhiều định dạng về datetime.date, trả None nếu không hợp lệ."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    s = str(value).strip()
    if not s:
        return None
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(s).date()
    except ValueError:
        return None


def update_vocab(row, correct):
    """
    Cập nhật trạng thái từ vựng dựa trên kết quả trả lời.
    Trả về dict các field cần ghi vào Excel.
    """
    interval = to_int(row.get('interval_days'), 0)
    ease = to_float(row.get('ease'), 2.5)
    today = date.today()

    if correct:
        if interval in INTERVALS:
            idx = INTERVALS.index(interval)
        else:
            idx = 0 if interval <= 0 else 1
        next_idx = min(idx + 1, len(INTERVALS) - 1)
        new_interval = INTERVALS[next_idx]
        if new_interval >= 30:
            new_status = 'mastered'
        elif new_interval >= 3:
            new_status = 'reviewing'
        else:
            new_status = 'learning'
        ease = min(ease + 0.1, 3.0)
    else:
        new_interval = 1
        new_status = 'learning'
        ease = max(ease - 0.2, 1.3)

    next_review = (today + timedelta(days=new_interval)).strftime('%Y-%m-%d')

    return {
        'status': new_status,
        'next_review': next_review,
        'interval_days': new_interval,
        'ease': round(ease, 2),
    }