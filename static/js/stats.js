(async function () {
    const root = document.getElementById('stats');
    if (!root) return;

    let d;
    try {
        d = await fetchJSON('/api/stats');
    } catch (e) {
        root.innerHTML = `<div class="empty">Không tải được thống kê. ${escapeHtml(e.message)}</div>`;
        return;
    }

    const maxMin = Math.max(1, ...d.daily_minutes.map(x => x.minutes));
    const barsMin = d.daily_minutes.map(x => `
        <div class="bar ${x.minutes > 0 ? 'filled' : ''}"
             style="height:${Math.round(x.minutes / maxMin * 100)}%;"
             title="${x.date}: ${x.minutes} phút">
            <span>${x.date.slice(5)}</span>
        </div>`).join('');

    const scoreBars = d.score_history.length
        ? d.score_history.map(s => `
            <div class="bar filled" style="height:${Math.max(6, s.score)}%"
                 title="${s.date} · ${s.type}: ${s.score} điểm">
                <span>${s.score}</span>
            </div>`).join('')
        : '<div class="empty">Chưa có bài kiểm tra nào được lưu.</div>';

    const topicRows = Object.entries(d.by_topic).sort((a,b) => b[1].total - a[1].total).map(([t, v]) => {
        const p = v.total ? Math.round(v.mastered / v.total * 100) : 0;
        return `
            <div style="padding:8px 0;border-bottom:1px solid var(--border);">
                <div style="display:flex;justify-content:space-between;font-size:13px;">
                    <span>${escapeHtml(t)}</span>
                    <span class="subtle">${v.mastered}/${v.total} thành thạo (${p}%)</span>
                </div>
                <div class="progress mt-16"><span style="width:${p}%"></span></div>
            </div>`;
    }).join('') || '<div class="empty">Chưa có dữ liệu chủ đề.</div>';

    const weak = d.weak_points.length
        ? d.weak_points.map(w => `<div class="lesson-row">
            <div class="lesson-icon">⚠️</div>
            <div><div class="lesson-title">${escapeHtml(w.name)}</div>
            <div class="lesson-desc">Số lần sai: ${w.count}</div></div>
            <a class="btn small ghost" href="/mistakes">Ôn</a>
        </div>`).join('')
        : '<div class="empty">Chưa có điểm yếu — hãy làm thêm bài kiểm tra.</div>';

    root.innerHTML = `
        <div class="grid grid-4 mb-16">
            <div class="card stat"><div class="stat-icon">🔥</div><div class="stat-label">Chuỗi ngày học</div><div class="stat-value">${d.streak}</div></div>
            <div class="card stat"><div class="stat-icon">📅</div><div class="stat-label">Tổng ngày học</div><div class="stat-value">${d.total_days}</div></div>
            <div class="card stat"><div class="stat-icon">⏱️</div><div class="stat-label">Tổng phút</div><div class="stat-value">${d.total_minutes}</div></div>
            <div class="card stat"><div class="stat-icon">📝</div><div class="stat-label">Bài kiểm tra</div><div class="stat-value">${d.total_tests}</div>
                <div class="stat-sub">Điểm TB: ${d.avg_score}</div></div>
        </div>

        <div class="grid grid-2 mb-16">
            <div class="card">
                <h2 class="section-title">Phút học 14 ngày qua</h2>
                <div class="bars">${barsMin}</div>
                <div style="height:22px;"></div>
            </div>
            <div class="card">
                <h2 class="section-title">Điểm kiểm tra gần đây</h2>
                <div class="bars">${scoreBars}</div>
                <div style="height:22px;"></div>
            </div>
        </div>

        <div class="card mb-16">
            <h2 class="section-title">Từ vựng theo chủ đề</h2>
            ${topicRows}
        </div>

        <div class="card">
            <h2 class="section-title">Điểm yếu cần cải thiện</h2>
            <div class="subtle mb-16">Số lỗi chưa khắc phục: ${d.unresolved_mistakes}</div>
            ${weak}
        </div>
    `;
})();