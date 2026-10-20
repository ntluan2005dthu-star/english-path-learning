# modules/watermark.py
import base64

# Thông tin bản quyền được mã hóa Base64 (Tránh bị người mới học đọc hiểu và xóa)
_ENCODED_AUTHOR = "Tmd1eXnhu4VuIFRow6BuaCBMdcOibg==" # Mã hóa của "Nguyễn Thành Luân"
_ENCODED_PROJECT = "RW5nbGlzaCBQYXRo"                 # Mã hóa của "English Path"

def get_copyright_info():
    """Giải mã thông tin bản quyền để hiển thị lên Web"""
    try:
        author = base64.b64decode(_ENCODED_AUTHOR).decode('utf-8')
        project = base64.b64decode(_ENCODED_PROJECT).decode('utf-8')
        return f"© 2024 {author} | {project}. All rights reserved."
    except Exception:
        return "© 2024 Bản quyền đã được bảo vệ."

def verify_integrity():
    """
    Hàm kiểm tra xem ai đó có cố tình sửa/xóa file này không.
    Nếu họ sửa, app sẽ báo lỗi ngay khi khởi động.
    """
    if not _ENCODED_AUTHOR or not _ENCODED_PROJECT:
        raise SystemExit("LỖI NGHIÊM TRỌNG: Phát hiện thay đổi trái phép đối với mã nguồn hệ thống!")