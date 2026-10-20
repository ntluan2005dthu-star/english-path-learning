(async function () {
    const root = document.getElementById('speaking');
    if (!root) return;

    let phrases = [];
    try {
        const d = await fetchJSON('/api/phrases');
        phrases = d.items || [];
    } catch (e) { /* toast */ }

    if (!phrases.length) {
        root.innerHTML = `<div class="empty">Chưa có câu mẫu để luyện nói.</div>`;
        return;
    }

    root.innerHTML = `
        <div class="card mb-16" style="border-left:4px solid var(--warning);">
            <h2 class="section-title">⚠️ Lưu ý trước khi luyện</h2>
            <p class="subtle">Trang này sử dụng Web Speech API của trình duyệt để phát câu mẫu.
            Hệ thống <b>không đánh giá được phát âm</b> của bạn vì chưa tích hợp công cụ nhận dạng giọng nói.
            Bạn hãy tự nghe, đọc theo và tự đánh giá. Kết quả tự đánh giá chỉ lưu tạm trên trình duyệt.</p>
        </div>
        <div class="toolbar mb-16">
            <select id="spFilter"><option value="">Mọi chủ đề</option></select>
            <button class="btn ghost" id="spShuffle">Xáo trộn</button>
        </div>
        <div id="spList" class="grid grid-2"></div>
    `;

    const filter = document.getElementById('spFilter');
    const topics = [...new Set(phrases.map(p => p.topic).filter(Boolean))];
    topics.forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t;
        filter.appendChild(o);
    });
    filter.addEventListener('change', render);
    document.getElementById('spShuffle').addEventListener('click', () => {
        phrases = shuffle(phrases);
        render();
    });

    const selfScores = JSON.parse(sessionStorage.getItem('spSelf') || '{}');

    render();

    function render() {
        const topic = filter.value;
        const list = document.getElementById('spList');
        const items = topic ? phrases.filter(p => p.topic === topic) : phrases;
        if (!items.length) {
            list.innerHTML = `<div class="empty">Không có câu nào phù hợp.</div>`;
            return;
        }
        list.innerHTML = items.map(p => {
            const key = 'p' + p.id;
            const score = selfScores[key];
            return `
                <div class="card">
                    <div class="subtle">${escapeHtml(p.topic || '')}</div>
                    <div style="font-weight:600;font-size:16px;margin-top:6px;">${escapeHtml(p.phrase_en)}</div>
                    <div class="subtle" style="margin-top:6px;">${escapeHtml(p.phrase_vi || '')}</div>
                    <div class="mt-16" style="display:flex;gap:6px;flex-wrap:wrap;">
                        <button class="btn small" data-say="${escapeHtml(p.phrase_en)}">🔊 Nghe</button>
                        <button class="btn small ghost" data-say-slow="${escapeHtml(p.phrase_en)}">🐢 Chậm</button>
                        <button class="btn small ghost" data-self="ok" data-key="${key}">✅ Đọc đúng</button>
                        <button class="btn small ghost" data-self="bad" data-key="${key}">🔁 Cần luyện thêm</button>
                    </div>
                    ${score === 'ok' ? '<div class="mt-16"><span class="badge success">Bạn đã tự đánh giá: đọc đúng</span></div>' : ''}
                    ${score === 'bad' ? '<div class="mt-16"><span class="badge warning">Bạn đã tự đánh giá: cần luyện thêm</span></div>' : ''}
                </div>`;
        }).join('');

        list.querySelectorAll('[data-say]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.say));
        });
        list.querySelectorAll('[data-say-slow]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.saySlow, 0.6));
        });
        list.querySelectorAll('[data-self]').forEach(b => {
            b.addEventListener('click', () => {
                selfScores[b.dataset.key] = b.dataset.self;
                sessionStorage.setItem('spSelf', JSON.stringify(selfScores));
                toast('Đã lưu tự đánh giá', 'success');
                render();
            });
        });
    }

    function shuffle(a) {
        const arr = a.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
})();