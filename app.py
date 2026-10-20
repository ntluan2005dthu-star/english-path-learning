import os
from datetime import date, timedelta

from flask import Flask, jsonify, render_template, request

from modules import excel_store as store
from modules import quiz_engine, srs, online_loader

app = Flask(__name__)
app.json.ensure_ascii = False

store.ensure_workbook()

def to_int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default

def today_str():
    return date.today().strftime('%Y-%m-%d')

def get_settings():
    return {r.get('key'): r.get('value') for r in store.read_sheet('Settings') if r.get('key')}

def set_setting(key, value):
    rows = store.read_sheet('Settings')
    for r in rows:
        if r.get('key') == key:
            store.update_row('Settings', r.get('id'), {'value': value})
            return
    store.append_row('Settings', {'key': key, 'value': value, 'note': ''})

def completed_lesson_ids():
    raw = get_settings().get('completed_lessons') or ''
    return [x.strip() for x in str(raw).split(',') if x.strip()]

def get_progress(today=None):
    today = today or today_str()
    rows = store.read_sheet('StudyProgress')
    for r in rows:
        if str(r.get('date')) == today:
            return r
    return store.append_row('StudyProgress', {
        'date': today, 'tasks_done': '', 'new_words': 0, 'reviewed_words': 0,
        'quiz_score': 0, 'minutes': 0, 'note': ''
    })

def compute_streak(date_set):
    d = date.today()
    if d not in date_set:
        d = d - timedelta(days=1)
    streak = 0
    while d in date_set:
        streak += 1
        d = d - timedelta(days=1)
    return streak

NAV = [
    ('index', '/', 'Trang chủ', '🏠'),
    ('roadmap', '/roadmap', 'Lộ trình học', '🗺️'),
    ('vocabulary', '/vocabulary', 'Từ vựng', '📚'),
    ('daily', '/daily', 'Luyện tập hằng ngày', '📅'),
    ('listening', '/listening', 'Luyện nghe', '🎧'),
    ('speaking', '/speaking', 'Luyện nói', '🎤'),
    ('grammar', '/grammar', 'Ngữ pháp', '📐'),
    ('it_english', '/it-english', 'IT English', '💻'),
    ('quiz', '/quiz', 'Trung tâm kiểm tra', '📝'),
    ('mistakes', '/mistakes', 'Sổ lỗi sai', '❌'),
    ('stats', '/stats', 'Thống kê học tập', '📊'),
    ('docs', '/docs', 'Tài liệu dự án', '📘'),
]

@app.context_processor
def inject_nav():
    return {'nav_items': NAV, 'current_path': request.path}

@app.route('/')
def index(): return render_template('index.html', page_key='index', page_title='Trang chủ')

@app.route('/roadmap')
def roadmap(): return render_template('roadmap.html', page_key='roadmap', page_title='Lộ trình học 6 tháng')

@app.route('/lesson/<int:lesson_id>')
def lesson_page(lesson_id): return render_template('lesson.html', page_key='roadmap', page_title='Chi tiết bài học', lesson_id=lesson_id)

@app.route('/vocabulary')
def vocabulary(): return render_template('vocabulary.html', page_key='vocabulary', page_title='Thư viện từ vựng')

@app.route('/daily')
def daily(): return render_template('daily.html', page_key='daily', page_title='Luyện tập hằng ngày')

@app.route('/listening')
def listening(): return render_template('listening.html', page_key='listening', page_title='Luyện nghe')

@app.route('/speaking')
def speaking(): return render_template('speaking.html', page_key='speaking', page_title='Luyện nói')

@app.route('/grammar')
def grammar(): return render_template('grammar.html', page_key='grammar', page_title='Ngữ pháp cơ bản')

@app.route('/it-english')
def it_english(): return render_template('it_english.html', page_key='it_english', page_title='IT English')

@app.route('/quiz')
def quiz(): return render_template('quiz.html', page_key='quiz', page_title='Trung tâm kiểm tra')

@app.route('/mistakes')
def mistakes(): return render_template('mistakes.html', page_key='mistakes', page_title='Sổ lỗi sai')

@app.route('/stats')
def stats(): return render_template('stats.html', page_key='stats', page_title='Thống kê học tập')

@app.route('/docs')
def docs(): return render_template('docs.html', page_key='docs', page_title='Tài liệu dự án')

@app.get('/api/dashboard')
def api_dashboard():
    vocab = store.read_sheet('Vocabulary')
    progress = store.read_sheet('StudyProgress')
    tests = store.read_sheet('TestResults')
    lessons = store.read_sheet('Lessons')
    settings = get_settings()
    done = set(completed_lesson_ids())
    today = today_str()

    total = len(vocab)
    mastered = sum(1 for v in vocab if v.get('status') == 'mastered')
    reviewing = sum(1 for v in vocab if v.get('status') == 'reviewing')
    learning = sum(1 for v in vocab if v.get('status') == 'learning')
    fresh = sum(1 for v in vocab if v.get('status') in ('new', '', None))

    due = [v for v in vocab if srs.parse_date(v.get('next_review')) and srs.parse_date(v.get('next_review')) <= date.today() and v.get('status') != 'mastered']
    date_set = {srs.parse_date(p.get('date')) for p in progress if srs.parse_date(p.get('date'))}

    prog = get_progress(today)
    tasks_done = [x for x in str(prog.get('tasks_done') or '').split(',') if x.strip()]

    skill_map = {'listening': 'Nghe', 'speaking': 'Nói', 'grammar': 'Ngữ pháp', 'reading': 'Đọc', 'it': 'IT English', 'vocab': 'Từ vựng'}
    skill_stats = {}
    for sk, label in skill_map.items():
        items = [l for l in lessons if l.get('skill') == sk]
        if not items: continue
        fin = sum(1 for l in items if str(l.get('id')) in done)
        skill_stats[sk] = {'label': label, 'done': fin, 'total': len(items), 'percent': round(fin * 100 / len(items)) if items else 0}

    recent = []
    for i in range(6, -1, -1):
        d = (date.today() - timedelta(days=i)).strftime('%Y-%m-%d')
        scores = [to_int(t.get('score')) for t in tests if str(t.get('date')) == d]
        recent.append({'date': d, 'score': round(sum(scores) / len(scores)) if scores else None})

    return jsonify({
        'learner': settings.get('learner_name') or 'Học viên',
        'goal': settings.get('study_goal') or '',
        'daily_minutes': to_int(settings.get('daily_minutes'), 40),
        'today_tasks': {'done': len(tasks_done), 'total': 5, 'percent': round(len(tasks_done) * 100 / 5)},
        'streak': compute_streak(date_set), 'total_study_days': len(date_set),
        'vocab': {'total': total, 'mastered': mastered, 'reviewing': reviewing, 'learning': learning, 'new': fresh, 'due': len(due)},
        'lessons': {'done': len(done), 'total': len(lessons)},
        'skill_stats': skill_stats, 'recent_scores': recent,
        'due_words': [{'id': v.get('id'), 'word': v.get('word'), 'vi_meaning': v.get('vi_meaning')} for v in due[:8]],
    })

@app.get('/api/roadmap')
def api_roadmap():
    lessons = store.read_sheet('Lessons')
    done = set(completed_lesson_ids())
    lessons.sort(key=lambda x: to_int(x.get('unlock_order')))
    out = []
    for idx, l in enumerate(lessons):
        lid = str(l.get('id'))
        completed = lid in done
        unlocked = completed or idx <= len(done)
        out.append({
            'id': to_int(l.get('id')), 'month': to_int(l.get('month')), 'title_vi': l.get('title_vi'), 'title_en': l.get('title_en'),
            'skill': l.get('skill'), 'description_vi': l.get('description_vi'), 'estimated_minutes': to_int(l.get('estimated_minutes'), 30),
            'completed': completed, 'unlocked': unlocked,
        })
    months = {}
    for item in out: months.setdefault(item['month'], []).append(item)
    return jsonify({'months': months, 'completed_count': len(done), 'total': len(out)})

@app.get('/api/lesson/<int:lesson_id>')
def api_lesson(lesson_id):
    lessons = {to_int(l.get('id')): l for l in store.read_sheet('Lessons')}
    l = lessons.get(lesson_id)
    if not l: return jsonify({'error': 'Không tìm thấy bài học'}), 404
    done = set(completed_lesson_ids())
    topics = [t.strip() for t in str(l.get('vocab_topics') or '').split(',') if t.strip()]
    words = [v for v in store.read_sheet('Vocabulary') if v.get('topic') in topics][:8]
    exercises = [e for e in store.read_sheet('Exercises') if to_int(e.get('lesson_id')) == lesson_id][:5]

    return jsonify({
        'id': lesson_id, 'month': to_int(l.get('month')), 'title_vi': l.get('title_vi'), 'title_en': l.get('title_en'),
        'skill': l.get('skill'), 'description_vi': l.get('description_vi'), 'content_vi': l.get('content_vi'),
        'estimated_minutes': to_int(l.get('estimated_minutes'), 30), 'completed': str(lesson_id) in done,
        'vocab': [{'id': v.get('id'), 'word': v.get('word'), 'pos': v.get('pos'), 'vi_meaning': v.get('vi_meaning'), 'example_en': v.get('example_en'), 'example_vi': v.get('example_vi')} for v in words],
        'exercises': [{'id': e.get('id'), 'question': e.get('question'), 'type': e.get('type')} for e in exercises],
    })

@app.post('/api/lesson/<int:lesson_id>/complete')
def api_lesson_complete(lesson_id):
    lessons = {to_int(l.get('id')): l for l in store.read_sheet('Lessons')}
    if lesson_id not in lessons: return jsonify({'error': 'Bài học không tồn tại'}), 404
    done = completed_lesson_ids()
    if str(lesson_id) not in done:
        done.append(str(lesson_id))
        set_setting('completed_lessons', ','.join(done))
        prog = get_progress()
        minutes = to_int(prog.get('minutes')) + to_int(lessons[lesson_id].get('estimated_minutes'), 30)
        store.update_row('StudyProgress', prog.get('id'), {'minutes': minutes})
    return jsonify({'ok': True, 'completed': done})

@app.get('/api/vocabulary')
def api_vocabulary():
    rows = store.read_sheet('Vocabulary')
    search = (request.args.get('search') or '').strip().lower()
    topic = request.args.get('topic') or ''
    difficulty = request.args.get('difficulty') or ''
    status = request.args.get('status') or ''
    favorite = request.args.get('favorite') or ''
    page = max(to_int(request.args.get('page'), 1), 1)
    per_page = min(max(to_int(request.args.get('per_page'), 12), 1), 60)

    filtered = []
    for r in rows:
        if search:
            hay = ' '.join(str(r.get(k, '')) for k in ('word', 'vi_meaning', 'example_en', 'collocation')).lower()
            if search not in hay: continue
        if topic and r.get('topic') != topic: continue
        if difficulty and r.get('difficulty') != difficulty: continue
        if status and r.get('status') != status: continue
        if favorite == '1' and to_int(r.get('favorite')) != 1: continue
        filtered.append(r)

    total = len(filtered)
    start = (page - 1) * per_page
    items = filtered[start:start + per_page]

    return jsonify({
        'total': total, 'page': page, 'per_page': per_page, 'pages': max((total + per_page - 1) // per_page, 1),
        'topics': sorted({r.get('topic') for r in rows if r.get('topic')}), 'difficulties': sorted({r.get('difficulty') for r in rows if r.get('difficulty')}),
        'items': [{
            'id': to_int(v.get('id')), 'word': v.get('word'), 'ipa': v.get('ipa') or 'Chưa xác minh', 'pos': v.get('pos'),
            'vi_meaning': v.get('vi_meaning'), 'en_definition': v.get('en_definition'), 'collocation': v.get('collocation'),
            'example_en': v.get('example_en'), 'example_vi': v.get('example_vi'), 'topic': v.get('topic'), 'cefr': v.get('cefr'),
            'difficulty': v.get('difficulty'), 'source_name': v.get('source_name'), 'source_url': v.get('source_url'),
            'status': v.get('status') or 'new', 'favorite': to_int(v.get('favorite')), 'next_review': v.get('next_review'),
        } for v in items]
    })

@app.post('/api/vocabulary/import-oxford')
def api_import_oxford():
    data = request.get_json(silent=True) or {}
    translate = bool(data.get('translate'))
    try:
        count = online_loader.import_oxford_5000(translate=translate)
        return jsonify({'ok': True, 'added': count, 'message': f'Đã thêm {count} từ mới.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.post('/api/vocabulary/translate-missing')
def api_translate_missing():
    data = request.get_json(silent=True) or {}
    limit = to_int(data.get('limit'), 50)
    try:
        translated, remaining = online_loader.translate_missing_words(limit=limit)
        if translated == 0 and remaining == 0:
            return jsonify({'ok': True, 'message': 'Tất cả từ vựng đã có nghĩa tiếng Việt!'})
        return jsonify({'ok': True, 'translated': translated, 'remaining': remaining, 'message': f'Đã dịch {translated} từ. Còn {remaining} từ chưa dịch.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.post('/api/vocabulary/<int:vid>/favorite')
def api_vocab_favorite(vid):
    rows = {to_int(r.get('id')): r for r in store.read_sheet('Vocabulary')}
    if vid not in rows: return jsonify({'error': 'Không tìm thấy từ vựng'}), 404
    new_val = 0 if to_int(rows[vid].get('favorite')) == 1 else 1
    store.update_row('Vocabulary', vid, {'favorite': new_val})
    return jsonify({'ok': True, 'favorite': new_val})

@app.post('/api/vocabulary/<int:vid>/status')
def api_vocab_status(vid):
    data = request.get_json(silent=True) or {}
    status = data.get('status')
    if status not in ('new', 'learning', 'reviewing', 'mastered'): return jsonify({'error': 'Trạng thái không hợp lệ'}), 400
    rows = {to_int(r.get('id')): r for r in store.read_sheet('Vocabulary')}
    if vid not in rows: return jsonify({'error': 'Không tìm thấy từ vựng'}), 404
    changes = {'status': status}
    if status == 'mastered': changes['next_review'] = (date.today() + timedelta(days=30)).strftime('%Y-%m-%d')
    store.update_row('Vocabulary', vid, changes)
    return jsonify({'ok': True, 'status': status})

@app.post('/api/vocabulary/<int:vid>/review')
def api_vocab_review(vid):
    data = request.get_json(silent=True) or {}
    correct = bool(data.get('correct'))
    rows = {to_int(r.get('id')): r for r in store.read_sheet('Vocabulary')}
    if vid not in rows: return jsonify({'error': 'Không tìm thấy từ vựng'}), 404
    changes = srs.update_vocab(rows[vid], correct)
    store.update_row('Vocabulary', vid, changes)
    prog = get_progress()
    store.update_row('StudyProgress', prog.get('id'), {'reviewed_words': to_int(prog.get('reviewed_words')) + 1})
    return jsonify({'ok': True, **changes})

@app.get('/api/daily')
def api_daily():
    vocab = store.read_sheet('Vocabulary')
    settings = get_settings()
    new_per_day = to_int(settings.get('new_words_per_day'), 5)
    today = date.today()

    due = [v for v in vocab if srs.parse_date(v.get('next_review')) and srs.parse_date(v.get('next_review')) <= today and v.get('status') != 'mastered']
    due.sort(key=lambda v: str(v.get('next_review')))
    new_words = [v for v in vocab if (v.get('status') or 'new') == 'new'][:new_per_day]
    listen_pool = (due + new_words + vocab)[:8]
    reading = store.read_sheet('Phrases')
    phrase = reading[len(reading) % len(reading)] if reading else None

    prog = get_progress()
    done = [x for x in str(prog.get('tasks_done') or '').split(',') if x.strip()]

    def brief(v):
        return {'id': to_int(v.get('id')), 'word': v.get('word'), 'vi_meaning': v.get('vi_meaning'), 'pos': v.get('pos'), 'example_en': v.get('example_en'), 'example_vi': v.get('example_vi'), 'status': v.get('status') or 'new'}

    return jsonify({
        'date': today_str(), 'done_tasks': done,
        'tasks': [
            {'key': 'review', 'title': 'Ôn từ vựng đến hạn (5 phút)', 'desc': 'Các từ đã đến lịch ôn tập theo phương pháp lặp lại ngắt quãng.', 'items': [brief(v) for v in due[:10]], 'count': len(due[:10])},
            {'key': 'new_words', 'title': 'Học từ mới (10 phút)', 'desc': 'Mỗi ngày chỉ học một lượng nhỏ từ mới kèm câu ví dụ.', 'items': [brief(v) for v in new_words], 'count': len(new_words)},
            {'key': 'listening', 'title': 'Luyện nghe & phát âm (10 phút)', 'desc': 'Nghe và nhắc lại. Sử dụng Web Speech API của trình duyệt.', 'items': [brief(v) for v in listen_pool], 'count': len(listen_pool)},
            {'key': 'reading', 'title': 'Đọc / hội thoại tình huống (10 phút)', 'desc': 'Đọc câu và đoán nghĩa trong ngữ cảnh thực tế.', 'items': ([{'id': to_int(phrase.get('id')), 'phrase_en': phrase.get('phrase_en'), 'phrase_vi': phrase.get('phrase_vi'), 'context_vi': phrase.get('context_vi')}] if phrase else []), 'count': 1 if phrase else 0},
            {'key': 'quiz', 'title': 'Kiểm tra nhanh hằng ngày (5 phút)', 'desc': 'Bài kiểm tra 5 câu, kết quả được lưu lại.', 'items': [], 'count': 5},
        ],
        'progress': {'minutes': to_int(prog.get('minutes')), 'new_words': to_int(prog.get('new_words')), 'reviewed_words': to_int(prog.get('reviewed_words'))},
    })

@app.post('/api/daily/complete')
def api_daily_complete():
    data = request.get_json(silent=True) or {}
    key = data.get('task')
    if key not in ('review', 'new_words', 'listening', 'reading', 'quiz'): return jsonify({'error': 'Nhiệm vụ không hợp lệ'}), 400
    prog = get_progress()
    done = [x for x in str(prog.get('tasks_done') or '').split(',') if x.strip()]
    if key not in done: done.append(key)
    changes = {'tasks_done': ','.join(done)}
    minutes_map = {'review': 5, 'new_words': 10, 'listening': 10, 'reading': 10, 'quiz': 5}
    changes['minutes'] = to_int(prog.get('minutes')) + minutes_map[key]
    if key == 'new_words': changes['new_words'] = to_int(prog.get('new_words')) + to_int(data.get('count'), 0)
    if key == 'review': changes['reviewed_words'] = to_int(prog.get('reviewed_words')) + to_int(data.get('count'), 0)
    store.update_row('StudyProgress', prog.get('id'), changes)
    return jsonify({'ok': True, 'done_tasks': done})

@app.get('/api/grammar')
def api_grammar(): return jsonify({'items': store.read_sheet('Grammar')})

@app.get('/api/phrases')
def api_phrases():
    topic = request.args.get('topic') or ''
    rows = store.read_sheet('Phrases')
    if topic: rows = [r for r in rows if r.get('topic') == topic]
    return jsonify({'items': rows})

@app.get('/api/it-english')
def api_it_english():
    it_topics = ['Máy tính', 'Hệ điều hành', 'Mạng', 'Lập trình', 'Cơ sở dữ liệu', 'Frontend', 'Backend', 'Kiểm thử', 'Dự án']
    vocab = store.read_sheet('Vocabulary')
    result = {}
    for t in it_topics:
        items = [v for v in vocab if v.get('topic') == t]
        if items: result[t] = [{'id': to_int(v.get('id')), 'word': v.get('word'), 'pos': v.get('pos'), 'vi_meaning': v.get('vi_meaning'), 'en_definition': v.get('en_definition'), 'example_en': v.get('example_en'), 'example_vi': v.get('example_vi'), 'source_name': v.get('source_name'), 'source_url': v.get('source_url')} for v in items]
    return jsonify({'topics': result})

@app.post('/api/quiz/generate')
def api_quiz_generate():
    data = request.get_json(silent=True) or {}
    questions = quiz_engine.generate_quiz(topic=data.get('topic') or None, lesson_id=to_int(data.get('lesson_id')) if data.get('lesson_id') else None, size=min(max(to_int(data.get('size'), 10), 1), 30))
    if not questions: return jsonify({'error': 'Không đủ dữ liệu để tạo bài kiểm tra'}), 400
    return jsonify({'questions': questions, 'count': len(questions)})

@app.post('/api/quiz/submit')
def api_quiz_submit():
    data = request.get_json(silent=True) or {}
    answers = data.get('answers') or []
    if not answers: return jsonify({'error': 'Chưa có câu trả lời nào'}), 400
    results, correct_count = quiz_engine.grade_submission(answers)
    total = len(results)
    score = round(correct_count * 100 / total) if total else 0

    store.append_row('TestResults', {'date': today_str(), 'quiz_type': data.get('quiz_type') or 'practice', 'lesson_id': data.get('lesson_id') or '', 'total': total, 'correct': correct_count, 'score': score, 'duration_sec': to_int(data.get('duration'), 0), 'details': quiz_engine.serialize_details(results)})

    existing = {str(m.get('qid')): m for m in store.read_sheet('Mistakes')}
    for r in results:
        if r['is_correct']: continue
        old = existing.get(r['qid'])
        if old:
            store.update_row('Mistakes', old.get('id'), {'user_answer': r['user_answer'], 'correct_answer': r['correct_answer'], 'wrong_count': to_int(old.get('wrong_count')) + 1, 'last_practiced': today_str(), 'resolved': 0})
        else:
            store.append_row('Mistakes', {'qid': r['qid'], 'question': r['question'], 'question_type': r['type'], 'user_answer': r['user_answer'], 'correct_answer': r['correct_answer'], 'explanation_vi': r['explanation_vi'], 'knowledge_point': r['knowledge_point'], 'wrong_count': 1, 'last_practiced': today_str(), 'resolved': 0})

    quiz_engine.apply_srs(results)
    prog = get_progress()
    prev = to_int(prog.get('quiz_score'))
    store.update_row('StudyProgress', prog.get('id'), {'quiz_score': round((prev + score) / 2) if prev else score})

    return jsonify({'ok': True, 'score': score, 'total': total, 'correct': correct_count, 'results': results})

@app.get('/api/mistakes')
def api_mistakes():
    show_resolved = request.args.get('resolved') == '1'
    items = [r for r in store.read_sheet('Mistakes') if (to_int(r.get('resolved')) == 1) == show_resolved]
    items.sort(key=lambda r: to_int(r.get('wrong_count')), reverse=True)
    return jsonify({'items': items, 'total': len(items)})

@app.post('/api/mistakes/<int:mid>/resolve')
def api_mistake_resolve(mid):
    resolved = 1 if (request.get_json(silent=True) or {}).get('resolved', True) else 0
    rows = {to_int(r.get('id')): r for r in store.read_sheet('Mistakes')}
    if mid not in rows: return jsonify({'error': 'Không tìm thấy lỗi sai'}), 404
    store.update_row('Mistakes', mid, {'resolved': resolved, 'last_practiced': today_str()})
    return jsonify({'ok': True, 'resolved': resolved})

@app.get('/api/stats')
def api_stats():
    vocab = store.read_sheet('Vocabulary')
    tests = store.read_sheet('TestResults')
    progress = store.read_sheet('StudyProgress')
    mistakes = store.read_sheet('Mistakes')

    by_topic = {}
    for v in vocab:
        t = v.get('topic') or 'Khác'
        d = by_topic.setdefault(t, {'total': 0, 'mastered': 0})
        d['total'] += 1
        if v.get('status') == 'mastered': d['mastered'] += 1

    date_set = {srs.parse_date(p.get('date')) for p in progress if srs.parse_date(p.get('date'))}
    daily_minutes = [{'date': (date.today() - timedelta(days=i)).strftime('%Y-%m-%d'), 'minutes': to_int(next((p for p in progress if str(p.get('date')) == (date.today() - timedelta(days=i)).strftime('%Y-%m-%d')), {}).get('minutes'))} for i in range(13, -1, -1)]
    score_history = [{'date': t.get('date'), 'score': to_int(t.get('score')), 'type': t.get('quiz_type')} for t in tests[-20:]]

    weak = {}
    for m in mistakes:
        if to_int(m.get('resolved')) == 1: continue
        kp = m.get('knowledge_point') or 'Khác'
        weak[kp] = weak.get(kp, 0) + to_int(m.get('wrong_count'), 1)

    return jsonify({
        'streak': compute_streak(date_set), 'total_days': len(date_set), 'total_minutes': sum(to_int(p.get('minutes')) for p in progress),
        'total_tests': len(tests), 'avg_score': round(sum(to_int(t.get('score')) for t in tests) / len(tests)) if tests else 0,
        'by_topic': by_topic, 'daily_minutes': daily_minutes, 'score_history': score_history,
        'weak_points': [{'name': k, 'count': v} for k, v in sorted(weak.items(), key=lambda x: x[1], reverse=True)[:5]],
        'unresolved_mistakes': sum(1 for m in mistakes if to_int(m.get('resolved')) == 0),
    })

@app.get('/api/settings')
def api_get_settings(): return jsonify(get_settings())

@app.post('/api/settings')
def api_set_settings():
    data = request.get_json(silent=True) or {}
    updated = {}
    for key, value in data.items():
        if key in ('learner_name', 'daily_minutes', 'new_words_per_day', 'study_goal'):
            set_setting(key, str(value))
            updated[key] = str(value)
    return jsonify({'ok': True, 'updated': updated})

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'): return jsonify({'error': 'Không tìm thấy tài nguyên'}), 404
    return render_template('index.html', page_key='index', page_title='Trang chủ'), 404

@app.errorhandler(500)
def server_error(e):
    if request.path.startswith('/api/'): return jsonify({'error': 'Lỗi máy chủ. Vui lòng kiểm tra tệp Excel.'}), 500
    return 'Lỗi máy chủ nội bộ', 500

if __name__ == '__main__':
    print('=' * 60)
    print(' English Path đang chạy tại: http://127.0.0.1:5000')
    print(' Dữ liệu: data/english_learning_data.xlsx')
    print('=' * 60)
    app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)