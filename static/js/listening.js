(async function () {
    const root = document.getElementById('listening');
    if (!root) return;

    if (!Speech.supported) {
        root.innerHTML = `<div class="card">
            <h2 class="section-title">Trình duyệt không hỗ trợ phát âm</h2>
            <p class="subtle">Web Speech API không khả dụng trên trình duyệt này.
            Vui lòng dùng Chrome / Edge / Cốc Cốc phiên bản mới. Hệ thống không thể phát âm thanh
            nên phần luyện nghe tạm thời bị vô hiệu hoá.</p>
            <a class="btn ghost" href="/vocabulary">← Về thư viện từ vựng</a>
        </div>`;
        return;
    }

    root.innerHTML = `
        <div class="card mb-16">
            <h2 class="section-title">Luyện nghe từ vựng</h2>
            <p class="subtle">Nghe từ và chọn đáp án đúng. Âm thanh do trình duyệt tổng hợp (Web Speech API).
            Không phải bản ghi âm của người bản xứ — chỉ dùng để luyện phản xạ nghe.</p>
            <div class="toolbar mt-16">
                <select id="lisSize">
                    <option value="5">5 câu</option>
                    <option value="8" selected>8 câu</option>
                    <option value="10">10 câu</option>
                </select>
                <select id="lisTopic"><option value="">Mọi chủ đề</option></select>
                <button class="btn" id="btnStart">Bắt đầu</button>
            </div>
        </div>
        <div id="lisBody"></div>
    `;

    const topicSel = document.getElementById('lisTopic');
    try {
        const v = await fetchJSON('/api/vocabulary?per_page=1');
        (v.topics || []).forEach(t => {
            const o = document.createElement('option');
            o.value = t; o.textContent = t;
            topicSel.appendChild(o);
        });
    } catch (e) { /* bỏ qua */ }

    document.getElementById('btnStart').addEventListener('click', start);

    async function start() {
        const size = Number(document.getElementById('lisSize').value);
        const topic = topicSel.value;
        const params = new URLSearchParams({ per_page: 60, page: 1 });
        if (topic) params.set('topic', topic);
        let vocab = [];
        try {
            const d = await fetchJSON('/api/vocabulary?' + params.toString());
            vocab = d.items || [];
        } catch (e) { /* toast */ }
        if (vocab.length < 4) {
            document.getElementById('lisBody').innerHTML = `<div class="empty">
                Không đủ từ vựng để tạo bài nghe (cần tối thiểu 4).</div>`;
            return;
        }
        const picked = shuffle(vocab).slice(0, Math.min(size, vocab.length));
        runQuiz(picked, vocab);
    }

    function runQuiz(words, pool) {
        const answers = [];
        const startTime = Date.now();
        let idx = 0, correct = 0;
        const body = document.getElementById('lisBody');
        const total = words.length;

        function show() {
            const w = words[idx];
            const others = shuffle(pool.filter(p => p.word !== w.word)).slice(0, 3);
            const options = shuffle([w.word, ...others.map(o => o.word)]);
            body.innerHTML = `
                <div class="card">
                    <div style="display:flex;justify-content:space-between;">
                        <div class="subtle">Câu ${idx + 1}/${total}</div>
                        <div class="subtle">Đúng: ${correct}</div>
                    </div>
                    <div class="mt-16" style="text-align:center;">
                        <button class="btn" id="playBtn" style="font-size:18px;padding:14px 24px;">🔊 Nghe</button>
                        <button class="btn ghost small" id="playSlow" style="margin-left:6px;">🐢 Chậm</button>
                    </div>
                    <div class="subtle mt-16" style="text-align:center;">Chọn từ bạn vừa nghe:</div>
                    <div id="lisOpts" class="mt-16"></div>
                    <div id="lisFeedback" class="mt-16"></div>
                    <div class="mt-16"><button class="btn" id="lisNext" disabled>Tiếp theo</button></div>
                </div>
            `;
            const opts = document.getElementById('lisOpts');
            options.forEach(o => {
                const b = document.createElement('button');
                b.className = 'btn ghost';
                b.style.cssText = 'display:block;width:100%;text-align:left;margin-bottom:8px;';
                b.textContent = o;
                b.addEventListener('click', () => choose(o, b));
                opts.appendChild(b);
            });
            Speech.speak(w.word);
            document.getElementById('playBtn').addEventListener('click', () => Speech.speak(w.word));
            document.getElementById('playSlow').addEventListener('click', () => Speech.speak(w.word, 0.6));
        }

        function choose(val, btn) {
            const w = words[idx];
            const ok = val.toLowerCase() === w.word.toLowerCase();
            if (ok) correct++;
            document.getElementById('lisOpts').querySelectorAll('button').forEach(b => b.disabled = true);
            if (!ok) btn.style.background = '#fee2e2';
            document.getElementById('lisFeedback').innerHTML = `
                <div class="vocab-example">
                    <div><b>${ok ? '✅ Đúng' : '❌ Sai'}</b> — Đáp án: <b>${escapeHtml(w.word)}</b> (${escapeHtml(w.vi_meaning || '')})</div>
                    ${w.example_en ? `<div class="subtle">Ví dụ: ${escapeHtml(w.example_en)}</div>` : ''}
                </div>`;
            answers.push({
                qid: 'lis_' + w.id, type: 'listening', question: 'Nghe và chọn từ đúng',
                user_answer: val, correct_answer: w.word,
                explanation_vi: `Từ đúng là "${w.word}" — ${w.vi_meaning || ''}`,
                knowledge_point: w.topic || 'Chung',
                vocab_id: w.id,
            });
            document.getElementById('lisNext').disabled = false;
        }

        document.addEventListener('click', function nextHandler(e) {
            if (e.target && e.target.id === 'lisNext') {
                idx++;
                if (idx < total) show();
                else finish();
            }
        });
        show();

        async function finish() {
            const duration = Math.round((Date.now() - startTime) / 1000);
            try {
                const res = await fetchJSON('/api/quiz/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ answers, quiz_type: 'listening', duration }),
                });
                body.innerHTML = `
                    <div class="card">
                        <h2 class="section-title">Kết quả luyện nghe</h2>
                        <p>Đúng ${res.correct}/${res.total} · Điểm ${res.score}</p>
                        <p class="subtle">Kết quả đã được lưu và cập nhật trạng thái ôn tập từng từ.</p>
                        <button class="btn" onclick="location.reload()">Luyện lại</button>
                        <a class="btn ghost" href="/stats">Xem thống kê</a>
                    </div>`;
            } catch (e) { /* toast */ }
        }
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
})();