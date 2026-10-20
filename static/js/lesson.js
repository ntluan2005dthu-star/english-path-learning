(async function () {
    const root = document.getElementById('lesson');
    if (!root) return;
    const lessonId = root.dataset.lessonId;

    let data;
    try {
        data = await fetchJSON('/api/lesson/' + lessonId);
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được bài học. ${escapeHtml(e.message)}</div>`;
        return;
    }

    render();

    function render() {
        const icon = {
            listening: '🎧', speaking: '🎤', grammar: '📐',
            reading: '📖', vocab: '📚', it: '💻',
        }[data.skill] || '📘';

        root.innerHTML = `
            <div class="card mb-16">
                <div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;">
                    <div class="lesson-icon" style="font-size:32px;">${icon}</div>
                    <div style="flex:1;min-width:220px;">
                        <div class="subtle">Tháng ${data.month} · Kỹ năng: ${escapeHtml(data.skill)}</div>
                        <h2 style="margin:4px 0;">${escapeHtml(data.title_vi)}</h2>
                        <div class="subtle">${escapeHtml(data.title_en || '')} · ${data.estimated_minutes} phút</div>
                    </div>
                    <div>
                        ${data.completed
                            ? '<span class="badge success">Đã hoàn thành</span>'
                            : `<button class="btn" id="btnComplete">Đánh dấu đã học</button>`}
                    </div>
                </div>
                <p class="mt-16">${escapeHtml(data.description_vi || '')}</p>
                ${data.content_vi ? `<div class="vocab-example mt-16">${escapeHtml(data.content_vi)}</div>` : ''}
            </div>

            <div class="grid grid-2 mb-16">
                <div class="card">
                    <h2 class="section-title">Từ vựng trọng tâm</h2>
                    ${data.vocab.length
                        ? data.vocab.map(v => `
                            <div style="border-bottom:1px solid var(--border);padding:10px 0;">
                                <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;">
                                    <div>
                                        <div style="font-weight:700;">${escapeHtml(v.word)}</div>
                                        <div class="subtle">${escapeHtml(v.pos || '')} · ${escapeHtml(v.vi_meaning || '')}</div>
                                    </div>
                                    <button class="btn ghost small" data-speak="${escapeHtml(v.word)}">🔊</button>
                                </div>
                                ${v.example_en ? `
                                    <div class="vocab-example mt-16">
                                        <div>${escapeHtml(v.example_en)}</div>
                                        <div class="subtle">${escapeHtml(v.example_vi || '')}</div>
                                    </div>` : ''}
                            </div>
                        `).join('')
                        : '<div class="empty">Bài này chưa có từ vựng mẫu.</div>'}
                </div>
                <div class="card">
                    <h2 class="section-title">Bài tập nhanh</h2>
                    ${data.exercises.length
                        ? data.exercises.map(e => `
                            <div style="border-bottom:1px solid var(--border);padding:10px 0;">
                                <div class="subtle">${escapeHtml(e.type)}</div>
                                <div>${escapeHtml(e.question)}</div>
                            </div>
                        `).join('') + `
                            <div class="mt-16"><button class="btn" id="btnPractice">Luyện tập với bài này</button></div>
                        `
                        : '<div class="empty">Bài này chưa có bài tập mẫu.</div>'}
                </div>
            </div>

            <div class="mt-16">
                <a class="btn ghost" href="/roadmap">← Về lộ trình</a>
            </div>
        `;

        root.querySelectorAll('[data-speak]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.speak));
        });
        const btnC = document.getElementById('btnComplete');
        if (btnC) btnC.addEventListener('click', completeLesson);
        const btnP = document.getElementById('btnPractice');
        if (btnP) btnP.addEventListener('click', practice);
    }

    async function completeLesson() {
        try {
            await fetchJSON('/api/lesson/' + lessonId + '/complete', { method: 'POST' });
            toast('Đã đánh dấu hoàn thành!', 'success');
            const d = await fetchJSON('/api/lesson/' + lessonId);
            Object.assign(data, d);
            render();
        } catch (e) { /* toast đã hiện */ }
    }

    async function practice() {
        try {
            const res = await fetchJSON('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson_id: Number(lessonId), size: 5 }),
            });
            startQuizModal(res.questions);
        } catch (e) { /* toast đã hiện */ }
    }

    // ---------- Modal quiz nhỏ ----------
    function startQuizModal(questions) {
        const box = document.createElement('div');
        box.className = 'flashcard';
        let idx = 0;
        let correct = 0;
        const answers = [];

        function renderQuestion() {
            const q = questions[idx];
            const opts = (q.options || []).map(o => `
                <button class="btn ghost" style="display:block;width:100%;text-align:left;margin-bottom:8px;" data-val="${escapeHtml(o)}">${escapeHtml(o)}</button>
            `).join('');
            box.innerHTML = `
                <div class="subtle">Câu ${idx + 1}/${questions.length}</div>
                <h3 style="margin:8px 0 12px;">${escapeHtml(q.question)}</h3>
                ${q.type === 'listening' && q.audio_word
                    ? `<button class="btn small mb-16" data-play="${escapeHtml(q.audio_word)}">🔊 Nghe</button>`
                    : ''}
                <div id="opts">${opts}</div>
            `;
            box.querySelectorAll('#opts [data-val]').forEach(b => {
                b.addEventListener('click', () => {
                    const val = b.getAttribute('data-val');
                    if (val.toLowerCase() === String(q.answer).toLowerCase()) correct++;
                    answers.push({
                        qid: q.qid, type: q.type, question: q.question,
                        user_answer: val, correct_answer: q.answer,
                        explanation_vi: q.explanation_vi,
                        knowledge_point: q.knowledge_point,
                        vocab_id: q.vocab_id,
                    });
                    idx++;
                    if (idx < questions.length) renderQuestion();
                    else finish();
                });
            });
            const play = box.querySelector('[data-play]');
            if (play) play.addEventListener('click', () => Speech.speak(play.dataset.play));
        }

        async function finish() {
            try {
                const res = await fetchJSON('/api/quiz/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers, quiz_type: 'lesson', lesson_id: Number(lessonId) }),
                });
                box.innerHTML = `
                    <h3>Kết quả: ${res.correct}/${res.total} (${res.score} điểm)</h3>
                    <p class="subtle">Kết quả đã được lưu.</p>
                    <button class="btn" id="closeModal">Đóng</button>
                `;
                box.querySelector('#closeModal').onclick = () => box.remove();
            } catch (e) {
                box.innerHTML = `<p class="subtle">Không lưu được kết quả. ${escapeHtml(e.message)}</p>
                                 <button class="btn" id="closeModal">Đóng</button>`;
                box.querySelector('#closeModal').onclick = () => box.remove();
            }
        }

        renderQuestion();
        document.getElementById('content').appendChild(box);
    }
})();