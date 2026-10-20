(async function () {
    const root = document.getElementById('daily');
    if (!root) return;

    let data;
    try {
        data = await fetchJSON('/api/daily');
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được nhiệm vụ. ${escapeHtml(e.message)}</div>`;
        return;
    }

    render();

    function render() {
        const done = new Set(data.done_tasks || []);
        const pctDone = pct(done.size, data.tasks.length);

        root.innerHTML = `
            <div class="card mb-16">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
                    <div>
                        <div class="subtle">Ngày ${escapeHtml(data.date)}</div>
                        <h2 style="margin:4px 0;">Nhiệm vụ hôm nay (${data.tasks.length} phần · khoảng 40 phút)</h2>
                    </div>
                    <div style="text-align:right;">
                        <div class="stat-label">Đã hoàn thành</div>
                        <div class="stat-value">${done.size}/${data.tasks.length}</div>
                    </div>
                </div>
                <div class="progress mt-16 success"><span style="width:${pctDone}%"></span></div>
                <div class="subtle mt-16">
                    Học phút: ${data.progress.minutes} · Từ mới: ${data.progress.new_words} · Đã ôn: ${data.progress.reviewed_words}
                </div>
            </div>
            <div class="grid" id="taskList"></div>
        `;

        const list = document.getElementById('taskList');
        list.innerHTML = data.tasks.map((t, i) => renderTask(t, i, done.has(t.key))).join('');
        bind();
    }

    function renderTask(t, i, isDone) {
        const items = (t.items || []).map(it => renderItem(it)).join('');
        return `
            <div class="card" data-task="${t.key}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                    <div>
                        <div class="subtle">Phần ${i + 1}</div>
                        <h3 style="margin:4px 0;">${escapeHtml(t.title)}</h3>
                        <div class="subtle">${escapeHtml(t.desc || '')} · ${t.count} mục</div>
                    </div>
                    ${isDone
                        ? '<span class="badge success">Đã xong</span>'
                        : `<button class="btn small" data-complete="${t.key}">Đánh dấu xong</button>`}
                </div>
                ${items ? `<div class="mt-16">${items}</div>` : ''}
                ${t.key === 'quiz'
                    ? `<div class="mt-16"><a class="btn ghost small" href="/quiz">Mở trang kiểm tra</a></div>`
                    : ''}
            </div>
        `;
    }

    function renderItem(it) {
        if (it.phrase_en) {
            return `<div class="vocab-example">
                <div>${escapeHtml(it.phrase_en)}</div>
                <div class="subtle">${escapeHtml(it.phrase_vi || '')}</div>
            </div>`;
        }
        return `<div style="border-bottom:1px solid var(--border);padding:8px 0;display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div>
                <div style="font-weight:600;">${escapeHtml(it.word || '')}</div>
                <div class="subtle">${escapeHtml(it.vi_meaning || '')}</div>
                ${it.example_en ? `<div class="subtle">${escapeHtml(it.example_en)}</div>` : ''}
            </div>
            <button class="btn ghost small" data-speak="${escapeHtml(it.word || '')}">🔊</button>
        </div>`;
    }

    function bind() {
        root.querySelectorAll('[data-speak]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.speak));
        });
        root.querySelectorAll('[data-complete]').forEach(b => {
            b.addEventListener('click', async () => {
                const key = b.dataset.complete;
                const task = data.tasks.find(t => t.key === key);
                try {
                    await fetchJSON('/api/daily/complete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ task: key, count: task.count }),
                    });
                    toast('Đã đánh dấu hoàn thành', 'success');
                    data = await fetchJSON('/api/daily');
                    render();
                } catch (e) { /* toast */ }
            });
        });
    }
})();