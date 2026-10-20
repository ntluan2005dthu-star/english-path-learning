# ============================================================
# modules/quiz_engine.py — Sinh câu hỏi và chấm điểm
# ============================================================
import json
import random

from modules import srs
from modules.excel_store import read_sheet, update_row


def to_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


QUESTION_TYPES = ['en_to_vi', 'vi_to_en', 'fill_blank', 'listening']


def _pick_distractors(correct_value, pool, key, n=3):
    """Lấy n distractors khác correct_value."""
    candidates = []
    seen = {str(correct_value).strip().lower()}
    for item in pool:
        val = item.get(key)
        if not val:
            continue
        s = str(val).strip()
        if s.lower() in seen:
            continue
        seen.add(s.lower())
        candidates.append(s)
    random.shuffle(candidates)
    out = candidates[:n]
    while len(out) < n:
        out.append('—')
    return out


def _build_question(v, qtype, all_vocab):
    vid = to_int(v.get('id'))
    word = v.get('word') or ''
    vi = v.get('vi_meaning') or ''
    ex_en = v.get('example_en') or ''
    topic = v.get('topic') or 'Chung'
    if not word or not vi:
        return None

    if qtype == 'en_to_vi':
        options = [vi] + _pick_distractors(vi, all_vocab, 'vi_meaning')
        random.shuffle(options)
        return {
            'qid': f'v{vid}_en_to_vi',
            'type': 'en_to_vi',
            'question': f"'{word}' nghĩa là gì?",
            'options': options,
            'answer': vi,
            'explanation_vi': f"'{word}' = '{vi}'. Ví dụ: {ex_en}",
            'knowledge_point': topic,
            'vocab_id': vid,
        }

    if qtype == 'vi_to_en':
        options = [word] + _pick_distractors(word, all_vocab, 'word')
        random.shuffle(options)
        return {
            'qid': f'v{vid}_vi_to_en',
            'type': 'vi_to_en',
            'question': f"Từ tiếng Anh của '{vi}' là gì?",
            'options': options,
            'answer': word,
            'explanation_vi': f"'{vi}' = '{word}'. Ví dụ: {ex_en}",
            'knowledge_point': topic,
            'vocab_id': vid,
        }

    if qtype == 'fill_blank':
        if not ex_en or word.lower() not in ex_en.lower():
            # Fallback: dùng câu mẫu nếu có, nếu không có thì sinh câu mẫu
            sentence = ex_en or f"I use a {word} every day."
            blanked = sentence
        else:
            # Thay từ đầu tiên khớp (không phân biệt hoa thường) bằng ___
            import re
            pattern = re.compile(re.escape(word), re.IGNORECASE)
            blanked = pattern.sub('___', ex_en, count=1)
        options = [word] + _pick_distractors(word, all_vocab, 'word')
        random.shuffle(options)
        return {
            'qid': f'v{vid}_fill_blank',
            'type': 'fill_blank',
            'question': f'Điền từ còn thiếu: "{blanked}"',
            'options': options,
            'answer': word,
            'explanation_vi': f"Đáp án đúng là '{word}' ({vi}).",
            'knowledge_point': topic,
            'vocab_id': vid,
        }

    if qtype == 'listening':
        options = [word] + _pick_distractors(word, all_vocab, 'word')
        random.shuffle(options)
        return {
            'qid': f'v{vid}_listening',
            'type': 'listening',
            'question': 'Nghe và chọn từ đúng (nhấn nút loa để nghe)',
            'options': options,
            'answer': word,
            'explanation_vi': f"Từ đúng là '{word}' — nghĩa: '{vi}'.",
            'knowledge_point': topic,
            'vocab_id': vid,
            'audio_word': word,
        }

    return None


def generate_quiz(topic=None, lesson_id=None, size=10):
    all_vocab = read_sheet('Vocabulary')
    if not all_vocab:
        return []

    pool = all_vocab
    if topic:
        pool = [v for v in pool if v.get('topic') == topic]
    if lesson_id:
        lessons = read_sheet('Lessons')
        lesson = next((l for l in lessons if to_int(l.get('id')) == lesson_id), None)
        if lesson:
            topics = set(t.strip() for t in str(lesson.get('vocab_topics') or '').split(',') if t.strip())
            pool = [v for v in all_vocab if v.get('topic') in topics]

    if len(pool) < 2:
        pool = all_vocab
    if not pool:
        return []

    random.shuffle(pool)
    picked = pool[:size]

    questions = []
    for v in picked:
        qtype = random.choice(QUESTION_TYPES)
        q = _build_question(v, qtype, all_vocab)
        if q:
            questions.append(q)
    return questions


def grade_submission(answers):
    results = []
    correct_count = 0
    for a in answers:
        user = str(a.get('user_answer') or '').strip()
        correct = str(a.get('correct_answer') or '').strip()
        is_correct = user.lower() == correct.lower() and user != ''
        if is_correct:
            correct_count += 1
        results.append({
            'qid': str(a.get('qid') or ''),
            'type': a.get('type'),
            'question': a.get('question'),
            'user_answer': user,
            'correct_answer': correct,
            'explanation_vi': a.get('explanation_vi') or '',
            'knowledge_point': a.get('knowledge_point') or 'Chung',
            'vocab_id': to_int(a.get('vocab_id')),
            'is_correct': is_correct,
        })
    return results, correct_count


def serialize_details(results):
    return json.dumps(results, ensure_ascii=False)


def apply_srs(results):
    """Cập nhật trạng thái SRS cho từng vocab có trong kết quả."""
    vocab_by_id = {to_int(v.get('id')): v for v in read_sheet('Vocabulary')}
    for r in results:
        vid = to_int(r.get('vocab_id'))
        if not vid or vid not in vocab_by_id:
            continue
        changes = srs.update_vocab(vocab_by_id[vid], r.get('is_correct'))
        try:
            update_row('Vocabulary', vid, changes)
        except Exception:
            pass