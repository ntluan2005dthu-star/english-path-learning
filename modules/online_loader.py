# modules/online_loader.py
import urllib.request
import json
import time
from modules import excel_store as store

OXFORD_URL = "https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/data/oxford_5000.json"
DICT_API = "https://dict.minhqnd.com/api/v1/lookup"

def fetch_oxford_data():
    """Tải file JSON Oxford 5000 từ GitHub."""
    print("Đang tải dữ liệu Oxford 5000 từ internet...")
    req = urllib.request.Request(OXFORD_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode('utf-8'))
    # Chuyển dict {"0": {...}, "1": {...}} thành list
    return [entry for key, entry in data.items()]

def translate_to_vietnamese(word):
    """Gọi API để lấy nghĩa tiếng Việt (có thể bị giới hạn)."""
    try:
        url = f"{DICT_API}?word={urllib.parse.quote(word)}&lang=en&def_lang=vi"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get("exists") and data.get("results"):
                for res in data["results"]:
                    if res.get("lang_code") == "vi" and res.get("meanings"):
                        return res["meanings"][0].get("definition", "")
    except Exception:
        pass
    return ""

def import_oxford_5000(translate=False):
    """Nhập 5000 từ vào Excel (bỏ qua từ đã tồn tại)."""
    existing_rows = store.read_sheet('Vocabulary')
    existing_words = {str(r.get('word', '')).lower().strip() for r in existing_rows}
    
    oxford_data = fetch_oxford_data()
    added_count = 0
    print(f"Tìm thấy {len(oxford_data)} mục. Bắt đầu nhập...")

    for entry in oxford_data:
        word = str(entry.get("word", "")).strip()
        if not word or word.lower() in existing_words:
            continue

        vi_meaning = ""
        if translate:
            vi_meaning = translate_to_vietnamese(word)
            time.sleep(0.3)  # Tránh gửi quá nhanh đến API

        # Ánh xạ dữ liệu sang schema của sheet Vocabulary
        row = {
            'word': word,
            'ipa': entry.get("phon_br", "") or entry.get("phon_n_am", "") or "Chưa xác minh",
            'pos': entry.get("type", ""),
            'vi_meaning': vi_meaning or "Chưa có nghĩa tiếng Việt",
            'en_definition': entry.get("definition", ""),
            'collocation': "", # Oxford JSON không có trường này
            'example_en': entry.get("example", ""),
            'example_vi': "", 
            'topic': "Oxford 5000",
            'cefr': str(entry.get("cefr", "")).upper(),
            'difficulty': 'unknown',
            'source_name': "Oxford 5000 (Winterdl)",
            'source_url': OXFORD_URL,
            'added_at': time.strftime('%Y-%m-%d'),
            'status': 'new',
            'favorite': 0,
            'next_review': '',
            'interval_days': 0,
            'ease': 2.5
        }
        store.append_row('Vocabulary', row)
        existing_words.add(word.lower())
        added_count += 1

    print(f"Hoàn tất: Đã thêm {added_count} từ mới.")
    return added_count