# English Path — Học tiếng Anh + IT English (cục bộ)

Ứng dụng Flask chạy trên máy cá nhân, dữ liệu lưu trong một file Excel.
Dành cho người Việt mới bắt đầu, lộ trình gợi ý 6 tháng kết hợp tiếng Anh
giao tiếp và tiếng Anh CNTT.

> 📘 **Tài liệu đầy đủ dạng trang web:**
> Sau khi chạy, mở **http://127.0.0.1:5000/docs**
> (có hướng dẫn cài đặt từng bước, kiến trúc, schema Excel, API, giới hạn…)

## Yêu cầu

- Windows 10/11
- Python 3.10+ (khuyến nghị 3.11+)
- Trình duyệt: Chrome, Edge hoặc Cốc Cốc (để Web Speech API hoạt động)

## Cài đặt & chạy (PowerShell)

```powershell
cd <thư-mục-dự-án>
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py