# modules/online_loader.py
import urllib.request
import urllib.parse
import json
import time
from modules import excel_store as store

OXFORD_URL = "https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/main/data/oxford_5000.json"
DICT_API = "https://dict.minhqnd.com/api/v1/lookup"

def fetch_oxford_data():
    print("Đang tải dữ liệu Oxford 5000 từ internet...")
    req = urllib.request.Request(OXFORD_URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.loads(response.read().decode('utf-8'))
    return [entry for key, entry in data.items()]

def translate_to_vietnamese(word):
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
            time.sleep(0.2)

        row = {
            'word': word,
            'ipa': entry.get("phon_br", "") or entry.get("phon_n_am", "") or "Chưa xác minh",
            'pos': entry.get("type", ""),
            'vi_meaning': vi_meaning or "Chưa có nghĩa tiếng Việt",
            'en_definition': entry.get("definition", ""),
            'collocation': "", 
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

    return added_count

def translate_missing_words(limit=50):
    rows = store.read_sheet('Vocabulary')
    missing = [r for r in rows if r.get('vi_meaning') == 'Chưa có nghĩa tiếng Việt']
    
    if not missing:
        return 0, 0
        
    target_words = missing[:limit]
    translated_count = 0
    
    for row in target_words:
        word = row.get('word')
        vi_meaning = translate_to_vietnamese(word)
        if vi_meaning:
            store.update_row('Vocabulary', row.get('id'), {'vi_meaning': vi_meaning})
            translated_count += 1
        time.sleep(0.3)
        
    return translated_count, len(missing)