(async function () {
    const root = document.getElementById('quiz');
    if (!root) return;

    let topics = [];
    try {
        const v = await fetchJSON('/api/vocabulary?per_page=1');
        topics = v.topics || [];
    } catch (e) { /* bỏ qua */ }

    renderSetup();

    function renderSetup() {
        root.innerHTML = `
            <div class="card mb-16">
                <h2 class="section-title">Tạo bài kiểm tra</h2>
                <p class="subtle">Chọn chủ đề (hoặc để trống để trộn ngẫu nhiên) và số câu.</p>
                <div class="toolbar mt-16">
                    <select id="qTopic">
                        <option value="">Trộn tất cả chủ đề</option>
                        ${topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
                    </select>
                    <select id="qSize">
                        <option value="5">5 câu</option>
                        <option value="10" selected>10 câu</option>
                        <option value="15">15 câu</option>
                        <option value="20">20 câu</option>
                    </select>
                    <button class="btn" id="btnStart">Bắt đầu</button>
                </div>
            </div>
        `;
        document.getElementById('btnStart').addEventListener('click', start);
    }

    async function start() {
        const topic = document.getElementById('qTopic').value;
        const size = Number(document.getElementById('qSize').value);
        try {
            const res = await fetchJSON('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, size }),
            });
            runQuiz(res.questions);
        } catch (e) { /* toast */ }
    }

    function runQuiz(questions) {
        const answers = [];
        const startTime = Date.now();
        let idx = 0;
        let correct = 0;

        root.innerHTML = `
            <div class="card mb-16">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div class="subtle" id="qProgress">Câu 1/${questions.length}</div>
                    <div class="subtle">Điểm tạm: <span id="qScore">0</span></div>
                </div>
                <div class="progress mt-16"><span id="qBar" style="width:0%"></span></div>
                <div id="qBody" class="mt-16"></div>
            </div>
        `;
        show();

        function show() {
            const q = questions[idx];
            document.getElementById('qProgress').textContent = `Câu ${idx + 1}/${questions.length}`;
            document.getElementById('qBar').style.width = ((idx / questions.length) * 100).toFixed(1) + '%';
            document.getElementById('qScore').textContent = correct;

            const body = document.getElementById('qBody');
            const opts = (q.options || []).map((o, i) => `
                <button class="btn ghost" style="display:block;width:100%;text-align:left;margin-bottom:8px;" data-val="${escapeHtml(o)}">
                    <b>${String.fromCharCode(65 + i)}.</b> ${escapeHtml(o)}
                </button>
            `).join('');

            body.innerHTML = `
                <h3 style="margin:0 0 10px;">${escapeHtml(q.question)}</h3>
                ${q.type === 'listening' && q.audio_word
                    ? `<button class="btn small mb-16" id="btnPlay">🔊 Nghe lại</button>`
                    : ''}
                <div id="qOpts">${opts}</div>
                <div id="feedback" class="mt-16"></div>
                <div class="mt-16"><button class="btn" id="btnNext" disabled>Tiếp theo</button></div>
            `;

            if (q.type === 'listening' && q.audio_word) {
                Speech.speak(q.audio_word);
                document.getElementById('btnPlay').addEventListener('click', () => Speech.speak(q.audio_word));
            }

            let answered = false;
            body.querySelectorAll('#qOpts [data-val]').forEach(b => {
                b.addEventListener('click', () => {
                    if (answered) return;
                    answered = true;
                    const val = b.getAttribute('data-val');
                    const ok = val.toLowerCase() === String(q.answer).toLowerCase();
                    if (ok) correct++;
                    document.getElementById('qScore').textContent = correct;

                    // Hiển thị đáp án
                    body.querySelectorAll('#qOpts [data-val]').forEach(x => {
                        const v = x.getAttribute('data-val').toLowerCase();
                        if (v === String(q.answer).toLowerCase()) x.classList.add('secondary');
                        if (x === b && !ok) x.classList.add('danger');
                        x.disabled = true;
                    });

                    document.getElementById('feedback').innerHTML = `
                        <div class="vocab-example">
                            <div><b>${ok ? '✅ Đúng' : '❌ Sai'}</b> — Đáp án: ${escapeHtml(q.answer)}</div>
                            <div class="subtle">${escapeHtml(q.explanation_vi || '')}</div>
                        </div>
                    `;
                    document.getElementById('btnNext').disabled = false;

                    answers.push({
                        qid: q.qid, type: q.type, question: q.question,
                        user_answer: val, correct_answer: q.answer,
                        explanation_vi: q.explanation_vi,
                        knowledge_point: q.knowledge_point,
                        vocab_id: q.vocab_id,
                    });
                });
            });

            document.getElementById('btnNext').addEventListener('click', () => {
                idx++;
                if (idx < questions.length) show();
                else submit();
            });
        }

        async function submit() {
            const duration = Math.round((Date.now() - startTime) / 1000);
            try {
                const res = await fetchJSON('/api/quiz/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers, quiz_type: 'practice', duration }),
                });
                showResult(res);
            } catch (e) { /* toast */ }
        }

        function showResult(res) {
            const badge = res.score >= 80 ? 'success' : (res.score >= 50 ? 'warning' : 'danger');
            const detailRows = res.results.map(r => `
                <tr>
                    <td>${escapeHtml(r.question)}</td>
                    <td>${escapeHtml(r.user_answer || '—')}</td>
                    <td>${escapeHtml(r.correct_answer)}</td>
                    <td>
                        ${r.is_correct
                            ? '<span class="badge success">Đúng</span>'
                            : '<span class="badge danger">Sai</span>'}
                    </td>
                </tr>
            `).join('');

            root.innerHTML = `
                <div class="card mb-16">
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                        <div>
                            <h2 style="margin:0;">Kết quả</h2>
                            <div class="subtle">${res.correct}/${res.total} câu đúng</div>
                        </div>
                        <div style="text-align:right;">
                            <div class="stat-label">Điểm</div>
                            <div class="stat-value"><span class="badge ${badge}" style="font-size:22px;padding:6px 14px;">${res.score}</span></div>
                        </div>
                    </div>
                </div>
                <div class="card mb-16">
                    <h3 class="section-title">Chi tiết từng câu</h3>
                    <table>
                        <thead><tr><th>Câu hỏi</th><th>Bạn chọn</th><th>Đáp án</th><th></th></tr></thead>
                        <tbody>${detailRows}</tbody>
                    </table>
                </div>
                <div class="mt-16">
                    <button class="btn" id="btnAgain">Làm bài khác</button>
                    <a class="btn ghost" href="/mistakes">Xem sổ lỗi sai</a>
                </div>
            `;
            document.getElementById('btnAgain').addEventListener('click', renderSetup);
        }
    }
})();