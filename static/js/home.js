(async function () {
    const root = document.getElementById('home');
    if (!root) return;

    try {
        const data = await fetchJSON('/api/dashboard');
        root.innerHTML = renderHome(data);
        bindHomeEvents();
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được dashboard. ${escapeHtml(e.message)}</div>`;
    }

    function renderHome(d) {
        const t = d.today_tasks;
        const v = d.vocab;

        const skillCards = Object.values(d.skill_stats || {}).map(s => `
            <div class="card">
                <div class="stat-label">${escapeHtml(s.label)}</div>
                <div class="stat-value">${s.done}<span class="subtle" style="font-size:14px;">/${s.total}</span></div>
                <div class="progress mt-16"><span style="width:${s.percent}%"></span></div>
            </div>
        `).join('') || '<div class="empty">Chưa có dữ liệu kỹ năng</div>';

        const recent = (d.recent_scores || []).map(r => `
            <div class="bar ${r.score !== null ? 'filled' : ''}" title="${r.date}: ${r.score !== null ? r.score + ' điểm' : 'chưa có'}">
                <span>${r.date.slice(5)}</span>
            </div>
        `).join('');

        const due = (d.due_words || []).map(w => `
            <div class="lesson-row">
                <div class="lesson-icon">📌</div>
                <div>
                    <div class="lesson-title">${escapeHtml(w.word)}</div>
                    <div class="lesson-desc">${escapeHtml(w.vi_meaning || '')}</div>
                </div>
                <span class="badge warning">Cần ôn</span>
            </div>
        `).join('') || '<div class="empty">Không có từ nào cần ôn hôm nay 🎉</div>';

        return `
            <div class="card mb-16">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
                    <div>
                        <div class="subtle">Xin chào,</div>
                        <div style="font-size:22px;font-weight:700;">${escapeHtml(d.learner)}</div>
                        <div class="subtle">${escapeHtml(d.goal || '')}</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="stat-label">Chuỗi ngày học</div>
                        <div class="stat-value">${d.streak} 🔥</div>
                        <div class="subtle">${d.total_study_days} ngày đã học · ${d.daily_minutes} phút/ngày</div>
                    </div>
                </div>
                <div class="mt-16">
                    <div class="stat-label">Tiến độ hôm nay (${t.done}/${t.total} nhiệm vụ)</div>
                    <div class="progress"><span style="width:${t.percent}%"></span></div>
                </div>
                <div class="mt-16" style="display:flex;gap:8px;flex-wrap:wrap;">
                    <a class="btn" href="/daily">Bắt đầu học hôm nay</a>
                    <a class="btn ghost" href="/quiz">Kiểm tra nhanh</a>
                </div>
            </div>

            <div class="grid grid-4 mb-16">
                <div class="card stat"><div class="stat-icon">📚</div><div class="stat-label">Tổng từ vựng</div><div class="stat-value">${v.total}</div></div>
                <div class="card stat"><div class="stat-icon">✅</div><div class="stat-label">Đã thành thạo</div><div class="stat-value">${v.mastered}</div><div class="stat-sub">${pct(v.mastered, v.total)}%</div></div>
                <div class="card stat"><div class="stat-icon">🔁</div><div class="stat-label">Đang ôn tập</div><div class="stat-value">${v.reviewing + v.learning}</div></div>
                <div class="card stat"><div class="stat-icon">⏰</div><div class="stat-label">Đến hạn hôm nay</div><div class="stat-value">${v.due}</div></div>
            </div>

            <h2 class="section-title">Tiến độ theo kỹ năng</h2>
            <div class="grid grid-3 mb-16">${skillCards}</div>

            <div class="grid grid-2 mb-16">
                <div class="card">
                    <h2 class="section-title">Điểm kiểm tra 7 ngày qua</h2>
                    <div class="bars">${recent || '<div class="empty">Chưa có bài kiểm tra</div>'}</div>
                    <div style="height:24px;"></div>
                </div>
                <div class="card">
                    <h2 class="section-title">Cần ôn hôm nay</h2>
                    ${due}
                </div>
            </div>

            <div class="card">
                <h2 class="section-title">Bài học</h2>
                <div class="subtle">Đã hoàn thành ${d.lessons.done}/${d.lessons.total} bài học trong lộ trình 6 tháng.</div>
                <div class="progress mt-16 success"><span style="width:${pct(d.lessons.done, d.lessons.total)}%"></span></div>
                <div class="mt-16"><a class="btn ghost" href="/roadmap">Xem lộ trình</a></div>
            </div>
        `;
    }

    function bindHomeEvents() {
        // Trang chủ hiện chưa cần sự kiện đặc biệt
    }
})();