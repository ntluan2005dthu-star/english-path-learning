(async function () {
    const root = document.getElementById('mistakes');
    if (!root) return;

    let showResolved = false;

    root.innerHTML = `
        <div class="card mb-16">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                <h2 class="section-title" style="margin:0;">Sổ lỗi sai</h2>
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
                    <input type="checkbox" id="showResolved" style="width:auto;">
                    Hiện cả lỗi đã khắc phục
                </label>
            </div>
            <div class="subtle mt-16" id="mistInfo">Đang tải...</div>
        </div>
        <div id="mistList" class="grid"></div>
    `;

    const list = document.getElementById('mistList');
    const info = document.getElementById('mistInfo');
    const chk = document.getElementById('showResolved');

    chk.addEventListener('change', () => {
        showResolved = chk.checked;
        load();
    });

    await load();

    async function load() {
        let data;
        try {
            data = await fetchJSON('/api/mistakes?resolved=' + (showResolved ? '1' : '0'));
        } catch (e) {
            list.innerHTML = `<div class="empty">Lỗi tải dữ liệu. ${escapeHtml(e.message)}</div>`;
            return;
        }
        info.textContent = `Tổng: ${data.total} lỗi ${showResolved ? '(đã khắc phục)' : 'chưa khắc phục'}`;
        if (!data.items.length) {
            list.innerHTML = `<div class="empty">${showResolved
                ? 'Chưa có lỗi nào được đánh dấu khắc phục.'
                : 'Chưa có lỗi nào. Hãy luyện tập thêm!'}</div>`;
            return;
        }
        list.innerHTML = data.items.map(renderMistake).join('');
        bind();
    }

    function renderMistake(m) {
        return `
            <div class="card" data-mid="${m.id}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                    <div style="flex:1;">
                        <div class="subtle">Loại: ${escapeHtml(m.question_type || '')} · Lỗi ${m.wrong_count} lần</div>
                        <div style="font-weight:600;margin-top:4px;">${escapeHtml(m.question || '')}</div>
                        <div class="mt-16" style="font-size:13px;">
                            <div>Bạn chọn: <span style="color:var(--danger);">${escapeHtml(m.user_answer || '—')}</span></div>
                            <div>Đáp án đúng: <span style="color:var(--success);font-weight:600;">${escapeHtml(m.correct_answer || '')}</span></div>
                            ${m.explanation_vi ? `<div class="subtle">${escapeHtml(m.explanation_vi)}</div>` : ''}
                            ${m.knowledge_point ? `<div class="subtle">Kiến thức: ${escapeHtml(m.knowledge_point)}</div>` : ''}
                            <div class="subtle">Lần cuối: ${escapeHtml(m.last_practiced || '')}</div>
                        </div>
                    </div>
                    ${Number(m.resolved) === 1
                        ? '<span class="badge success">Đã khắc phục</span>'
                        : `<button class="btn small" data-resolve="${m.id}">Đánh dấu đã hiểu</button>`}
                </div>
            </div>
        `;
    }

    function bind() {
        list.querySelectorAll('[data-resolve]').forEach(b => {
            b.addEventListener('click', async () => {
                try {
                    await fetchJSON('/api/mistakes/' + b.dataset.resolve + '/resolve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ resolved: true }),
                    });
                    toast('Đã đánh dấu khắc phục', 'success');
                    load();
                } catch (e) { /* toast */ }
            });
        });
    }
})();