(async function () {
    const root = document.getElementById('roadmap');
    if (!root) return;

    let data;
    try {
        data = await fetchJSON('/api/roadmap');
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được lộ trình. ${escapeHtml(e.message)}</div>`;
        return;
    }

    render();

    function render() {
        const months = Object.keys(data.months).map(Number).sort((a, b) => a - b);
        const percent = pct(data.completed_count, data.total);
        const monthTitles = {
            1: 'Tháng 1 · Nền tảng (bảng chữ cái, phát âm, chào hỏi)',
            2: 'Tháng 2 · Giao tiếp hằng ngày (gia đình, trường học, sở thích)',
            3: 'Tháng 3 · Hội thoại & đọc hiểu (quá khứ, tương lai)',
            4: 'Tháng 4 · IT cơ bản (máy tính, hệ điều hành, mạng, lập trình)',
            5: 'Tháng 5 · IT nâng cao (frontend, backend, CSDL, kiểm thử)',
            6: 'Tháng 6 · Dự án (mô tả dự án, đọc code, README)',
        };

        root.innerHTML = `
            <div class="card mb-16">
                <h2 class="section-title">Lộ trình 6 tháng</h2>
                <div class="subtle">Đã hoàn thành ${data.completed_count}/${data.total} bài (${percent}%)</div>
                <div class="progress mt-16 success"><span style="width:${percent}%"></span></div>
                <div class="subtle mt-16">
                    Ghi chú: đây là lộ trình tham khảo. Tiến độ có thể điều chỉnh theo tốc độ học thực tế.
                    Việc hoàn thành lộ trình không đồng nghĩa với việc đạt mức lưu loát.
                </div>
            </div>

            ${months.map(m => `
                <div class="month-block">
                    <h3 class="month-title">${escapeHtml(monthTitles[m] || ('Tháng ' + m))}</h3>
                    ${data.months[m].map(l => renderLesson(l)).join('')}
                </div>
            `).join('')}
        `;

        root.querySelectorAll('[data-open]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-open');
                window.location.href = '/lesson/' + id;
            });
        });
    }

    function renderLesson(l) {
        const icon = {
            listening: '🎧', speaking: '🎤', grammar: '📐',
            reading: '📖', vocab: '📚', it: '💻',
        }[l.skill] || '📘';
        const status = l.completed
            ? '<span class="badge success">Đã học</span>'
            : (l.unlocked
                ? '<span class="badge">Sẵn sàng</span>'
                : '<span class="badge neutral">Chưa mở</span>');
        const btn = l.completed
            ? `<button class="btn ghost small" data-open="${l.id}">Xem lại</button>`
            : (l.unlocked
                ? `<button class="btn small" data-open="${l.id}">Học ngay</button>`
                : `<button class="btn small" disabled>Chưa mở</button>`);
        return `
            <div class="lesson-row ${l.unlocked ? '' : 'locked'}">
                <div class="lesson-icon">${icon}</div>
                <div>
                    <div class="lesson-title">${escapeHtml(l.title_vi)} <span class="subtle">— ${escapeHtml(l.title_en || '')}</span></div>
                    <div class="lesson-desc">${escapeHtml(l.description_vi || '')} · ${l.estimated_minutes} phút</div>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    ${status}
                    ${btn}
                </div>
            </div>
        `;
    }
})();