(async function () {
    const root = document.getElementById('itEnglish');
    if (!root) return;

    let data;
    try {
        data = await fetchJSON('/api/it-english');
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được IT English. ${escapeHtml(e.message)}</div>`;
        return;
    }

    const topics = Object.keys(data.topics || {});
    if (!topics.length) {
        root.innerHTML = `<div class="empty">Chưa có thuật ngữ IT nào. Hãy thêm từ vựng với chủ đề IT.</div>`;
        return;
    }

    root.innerHTML = `
        <div class="card mb-16">
            <h2 class="section-title">IT English — Thuật ngữ chuyên ngành</h2>
            <p class="subtle">Mỗi thuật ngữ đi kèm định nghĩa tiếng Anh, nghĩa tiếng Việt, ví dụ và nguồn tham khảo (Microsoft Learn / MDN).</p>
        </div>
        <div class="toolbar mb-16">
            <select id="itFilter"><option value="">Mọi lĩnh vực</option></select>
        </div>
        <div id="itList"></div>
    `;

    const filter = document.getElementById('itFilter');
    topics.forEach(t => {
        const o = document.createElement('option');
        o.value = t; o.textContent = t;
        filter.appendChild(o);
    });
    filter.addEventListener('change', render);
    render();

    function render() {
        const sel = filter.value;
        const list = document.getElementById('itList');
        const shown = sel ? { [sel]: data.topics[sel] } : data.topics;
        list.innerHTML = Object.entries(shown).map(([topic, items]) => `
            <div class="card mb-16">
                <h3 class="section-title" style="color:var(--primary);">${escapeHtml(topic)}</h3>
                <div class="grid grid-2">
                    ${items.map(v => `
                        <div style="border:1px solid var(--border);border-radius:10px;padding:12px;">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                                <div style="font-weight:700;">${escapeHtml(v.word)}</div>
                                <button class="btn ghost small" data-speak="${escapeHtml(v.word)}">🔊</button>
                            </div>
                            <div class="subtle">${escapeHtml(v.pos || '')} · ${escapeHtml(v.vi_meaning || '')}</div>
                            ${v.en_definition ? `<div style="font-size:13px;margin-top:6px;">${escapeHtml(v.en_definition)}</div>` : ''}
                            ${v.example_en ? `<div class="vocab-example mt-16">
                                <div>${escapeHtml(v.example_en)}</div>
                                <div class="subtle">${escapeHtml(v.example_vi || '')}</div>
                            </div>` : ''}
                            <div class="subtle mt-16">Nguồn: <a href="${escapeHtml(v.source_url || '#')}" target="_blank" rel="noopener">${escapeHtml(v.source_name || '—')}</a></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        list.querySelectorAll('[data-speak]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.speak));
        });
    }
})();