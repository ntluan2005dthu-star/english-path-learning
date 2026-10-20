(async function () {
    const root = document.getElementById('grammar');
    if (!root) return;

    let items = [];
    try {
        const d = await fetchJSON('/api/grammar');
        items = d.items || [];
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được ngữ pháp. ${escapeHtml(e.message)}</div>`;
        return;
    }

    if (!items.length) {
        root.innerHTML = `<div class="empty">Chưa có dữ liệu ngữ pháp.</div>`;
        return;
    }

    const levels = [...new Set(items.map(i => i.level).filter(Boolean))];

    root.innerHTML = `
        <div class="toolbar mb-16">
            <select id="grLevel">
                <option value="">Mọi cấp độ</option>
                ${levels.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('')}
            </select>
        </div>
        <div id="grList" class="grid grid-2"></div>
    `;
    document.getElementById('grLevel').addEventListener('change', render);
    render();

    function render() {
        const level = document.getElementById('grLevel').value;
        const list = document.getElementById('grList');
        const shown = level ? items.filter(i => i.level === level) : items;
        if (!shown.length) {
            list.innerHTML = `<div class="empty">Không có chủ điểm phù hợp.</div>`;
            return;
        }
        list.innerHTML = shown.map(g => `
            <div class="card">
                <div class="subtle">Cấp độ: ${escapeHtml(g.level || 'Không rõ')}</div>
                <h3 style="margin:6px 0;">${escapeHtml(g.title_vi || '')} <span class="subtle">— ${escapeHtml(g.title_en || '')}</span></h3>
                <p style="margin:8px 0;">${escapeHtml(g.content_vi || '')}</p>
                ${g.example_en ? `<div class="vocab-example">
                    <div>${escapeHtml(g.example_en)}</div>
                    <div class="subtle">${escapeHtml(g.example_vi || '')}</div>
                </div>` : ''}
                <div class="subtle mt-16">Nguồn: <a href="${escapeHtml(g.source_url || '#')}" target="_blank" rel="noopener">${escapeHtml(g.source_name || '—')}</a></div>
            </div>
        `).join('');
    }
})();