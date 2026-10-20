(async function () {
    const root = document.getElementById('vocabulary');
    if (!root) return;

    const state = {
        search: '', topic: '', difficulty: '', status: '', favorite: '',
        page: 1, perPage: 12,
    };

<<<<<<< HEAD
=======
    // Render khung giao diện ban đầu
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
    root.innerHTML = `
        <div class="card mb-16">
            <div class="toolbar">
                <input type="search" id="fSearch" placeholder="Tìm tiếng Anh hoặc tiếng Việt...">
                <select id="fTopic"><option value="">Tất cả chủ đề</option></select>
                <select id="fDifficulty"><option value="">Mọi độ khó</option></select>
                <select id="fStatus">
                    <option value="">Mọi trạng thái</option>
                    <option value="new">Mới</option>
                    <option value="learning">Đang học</option>
                    <option value="reviewing">Đang ôn</option>
                    <option value="mastered">Đã thành thạo</option>
                </select>
                <label style="display:flex;align-items:center;gap:6px;font-size:13px;">
                    <input type="checkbox" id="fFavorite" style="width:auto;"> Chỉ yêu thích
                </label>
                <button class="btn small ghost" id="btnReset">Xóa lọc</button>
<<<<<<< HEAD
                
                <div style="margin-left:auto; display:flex; gap:8px;">
                    <button class="btn small" id="btnTranslate" style="background:#f59e0b;">🇻🇳 Dịch từ thiếu</button>
                    <button class="btn small" id="btnImportOxford" style="background:#8b5cf6;">📥 Nhập 5000 từ Oxford</button>
                </div>
=======
                <button class="btn small" id="btnImportOxford" style="margin-left:auto; background:#8b5cf6;">📥 Nhập 5000 từ Oxford</button>
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
            </div>
            <div class="subtle" id="resultInfo">—</div>
        </div>
        <div id="vocabList" class="grid grid-3"></div>
        <div id="pager" class="toolbar mt-16" style="justify-content:center;"></div>
    `;

    const els = {
        search: document.getElementById('fSearch'),
        topic: document.getElementById('fTopic'),
        difficulty: document.getElementById('fDifficulty'),
        status: document.getElementById('fStatus'),
        favorite: document.getElementById('fFavorite'),
        reset: document.getElementById('btnReset'),
        importBtn: document.getElementById('btnImportOxford'),
<<<<<<< HEAD
        translateBtn: document.getElementById('btnTranslate'),
=======
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
        list: document.getElementById('vocabList'),
        info: document.getElementById('resultInfo'),
        pager: document.getElementById('pager'),
    };

<<<<<<< HEAD
=======
    // Tải dữ liệu lần đầu
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
    await load();

    function buildQuery() {
        const q = new URLSearchParams();
        if (state.search) q.set('search', state.search);
        if (state.topic) q.set('topic', state.topic);
        if (state.difficulty) q.set('difficulty', state.difficulty);
        if (state.status) q.set('status', state.status);
        if (state.favorite) q.set('favorite', '1');
        q.set('page', state.page);
        q.set('per_page', state.perPage);
        return q.toString();
    }

    async function load() {
        let data;
        try {
            data = await fetchJSON('/api/vocabulary?' + buildQuery());
        } catch (e) {
            els.list.innerHTML = `<div class="empty">Lỗi tải từ vựng. ${escapeHtml(e.message)}</div>`;
            return;
        }
        fillFilters(data);
        render(data);
    }

    function fillFilters(data) {
        if (els.topic.options.length <= 1 && data.topics) {
            data.topics.forEach(t => {
                const o = document.createElement('option');
                o.value = t; o.textContent = t;
                els.topic.appendChild(o);
            });
        }
        if (els.difficulty.options.length <= 1 && data.difficulties) {
            data.difficulties.forEach(t => {
                const o = document.createElement('option');
                o.value = t; o.textContent = t;
                els.difficulty.appendChild(o);
            });
        }
    }

    function render(data) {
        els.info.textContent = `Tìm thấy ${data.total} từ · Trang ${data.page}/${data.pages}`;
        if (!data.items || !data.items.length) {
            els.list.innerHTML = `<div class="empty">Không có từ nào phù hợp.</div>`;
            els.pager.innerHTML = '';
            return;
        }
        els.list.innerHTML = data.items.map(renderCard).join('');
        bindCards();
        renderPager(data);
    }

    function renderCard(v) {
        const statusLabel = {
            new: '<span class="badge neutral">Mới</span>',
            learning: '<span class="badge">Đang học</span>',
            reviewing: '<span class="badge warning">Đang ôn</span>',
            mastered: '<span class="badge success">Thành thạo</span>',
        }[v.status] || '';

        return `
            <div class="card vocab-card" data-id="${v.id}">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
                    <div>
                        <div class="vocab-word">${escapeHtml(v.word)}</div>
                        <div class="vocab-meta">
                            <span>${escapeHtml(v.pos || '')}</span>
                            <span>·</span>
                            <span>${escapeHtml(v.ipa || 'Chưa xác minh')}</span>
                            <span>·</span>
<<<<<<< HEAD
=======
                            <span>${escapeHtml(v.topic || '')}</span>
                            <span>·</span>
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
                            <span>CEFR: ${escapeHtml(v.cefr || '?')}</span>
                        </div>
                    </div>
                    ${statusLabel}
                </div>
<<<<<<< HEAD
                <div class="vocab-meaning" style="${v.vi_meaning === 'Chưa có nghĩa tiếng Việt' ? 'color:red;' : ''}">
                    ${escapeHtml(v.vi_meaning || '')}
                </div>
                ${v.en_definition ? `<div class="subtle">${escapeHtml(v.en_definition)}</div>` : ''}
                ${v.example_en ? `<div class="vocab-example">
                    <div>${escapeHtml(v.example_en)}</div>
                </div>` : ''}
                <div class="vocab-actions">
                    <button class="btn small ghost" data-speak="${escapeHtml(v.word)}">🔊</button>
                    <button class="btn small ghost" data-fav="${v.id}">${v.favorite ? '💖' : '🤍'}</button>
=======
                <div class="vocab-meaning">${escapeHtml(v.vi_meaning || '')}</div>
                ${v.en_definition ? `<div class="subtle">${escapeHtml(v.en_definition)}</div>` : ''}
                ${v.collocation ? `<div class="subtle">Cụm từ: ${escapeHtml(v.collocation)}</div>` : ''}
                ${v.example_en ? `<div class="vocab-example">
                    <div>${escapeHtml(v.example_en)}</div>
                    <div class="subtle">${escapeHtml(v.example_vi || '')}</div>
                </div>` : ''}
                <div class="subtle">Nguồn: <a href="${escapeHtml(v.source_url || '#')}" target="_blank" rel="noopener">${escapeHtml(v.source_name || '—')}</a></div>
                <div class="vocab-actions">
                    <button class="btn small ghost" data-speak="${escapeHtml(v.word)}">🔊</button>
                    <button class="btn small ghost" data-fav="${v.id}">${v.favorite ? '💖 Đã thích' : '🤍 Thích'}</button>
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
                    <select class="status-sel" data-status="${v.id}" style="width:auto;">
                        <option value="new" ${v.status === 'new' ? 'selected' : ''}>Mới</option>
                        <option value="learning" ${v.status === 'learning' ? 'selected' : ''}>Đang học</option>
                        <option value="reviewing" ${v.status === 'reviewing' ? 'selected' : ''}>Đang ôn</option>
                        <option value="mastered" ${v.status === 'mastered' ? 'selected' : ''}>Thành thạo</option>
                    </select>
                </div>
            </div>
        `;
    }

    function bindCards() {
        els.list.querySelectorAll('[data-speak]').forEach(b => {
            b.addEventListener('click', () => Speech.speak(b.dataset.speak));
        });
<<<<<<< HEAD
=======
        
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
        els.list.querySelectorAll('[data-fav]').forEach(b => {
            b.addEventListener('click', async () => {
                try {
                    const res = await fetchJSON('/api/vocabulary/' + b.dataset.fav + '/favorite', { method: 'POST' });
<<<<<<< HEAD
                    b.textContent = res.favorite ? '💖' : '🤍';
                } catch (e) { /* toast */ }
            });
        });
=======
                    b.textContent = res.favorite ? '💖 Đã thích' : '🤍 Thích';
                    toast('Đã cập nhật yêu thích', 'success');
                } catch (e) { /* toast */ }
            });
        });
        
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
        els.list.querySelectorAll('[data-status]').forEach(sel => {
            sel.addEventListener('change', async () => {
                try {
                    await fetchJSON('/api/vocabulary/' + sel.dataset.status + '/status', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: sel.value }),
                    });
<<<<<<< HEAD
=======
                    toast('Đã cập nhật trạng thái', 'success');
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
                } catch (e) { /* toast */ }
            });
        });
    }

    function renderPager(data) {
        if (data.pages <= 1) { els.pager.innerHTML = ''; return; }
        const prev = data.page > 1 ? `<button class="btn small ghost" data-page="${data.page - 1}">← Trước</button>` : '';
        const next = data.page < data.pages ? `<button class="btn small ghost" data-page="${data.page + 1}">Sau →</button>` : '';
        els.pager.innerHTML = `${prev}<span class="subtle">Trang ${data.page}/${data.pages}</span>${next}`;
        els.pager.querySelectorAll('[data-page]').forEach(b => {
            b.addEventListener('click', () => {
                state.page = Number(b.dataset.page);
                load();
            });
        });
    }

<<<<<<< HEAD
    // Sự kiện lọc
=======
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
    let searchTimer;
    els.search.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.search = els.search.value.trim();
            state.page = 1;
            load();
        }, 300);
    });
<<<<<<< HEAD
    els.topic.addEventListener('change', () => { state.topic = els.topic.value; state.page = 1; load(); });
    els.difficulty.addEventListener('change', () => { state.difficulty = els.difficulty.value; state.page = 1; load(); });
    els.status.addEventListener('change', () => { state.status = els.status.value; state.page = 1; load(); });
    els.favorite.addEventListener('change', () => { state.favorite = els.favorite.checked; state.page = 1; load(); });
    els.reset.addEventListener('click', () => {
        state.search = ''; state.topic = ''; state.difficulty = '';
        state.status = ''; state.favorite = false; state.page = 1;
        els.search.value = ''; els.topic.value = ''; els.difficulty.value = '';
        els.status.value = ''; els.favorite.checked = false;
        load();
    });

    // Xử lý Nhập 5000 từ
    els.importBtn.addEventListener('click', async () => {
        if (!confirm('Hệ thống sẽ tải khoảng 5000 từ vựng Oxford (chưa có nghĩa tiếng Việt).\nTiếp tục?')) return;
        const originalText = els.importBtn.innerHTML;
        els.importBtn.disabled = true;
        els.importBtn.innerHTML = '⏳ Đang tải...';
        try {
            const res = await fetchJSON('/api/vocabulary/import-oxford', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ translate: false })
            });
            toast(res.message || 'Nhập thành công!', 'success');
            await load();
        } catch (e) {
            toast(e.message, 'error');
        } finally {
            els.importBtn.disabled = false;
            els.importBtn.innerHTML = originalText;
        }
    });

    // Xử lý Dịch từ thiếu
    els.translateBtn.addEventListener('click', async () => {
        if (!confirm('Hệ thống sẽ dùng API để dịch tự động các từ chưa có nghĩa tiếng Việt (mỗi lần 50 từ).\nQuá trình này có thể mất vài chục giây. Bạn có muốn tiếp tục?')) return;
        
        const originalText = els.translateBtn.innerHTML;
        els.translateBtn.disabled = true;
        els.translateBtn.innerHTML = '⏳ Đang dịch (có thể mất chút thời gian)...';
        
        try {
            const res = await fetchJSON('/api/vocabulary/translate-missing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit: 50 })
            });
            
            toast(res.message, 'success');
            await load();
        } catch (e) {
            toast(e.message, 'error');
        } finally {
            els.translateBtn.disabled = false;
            els.translateBtn.innerHTML = originalText;
        }
    });
})();
=======

    els.topic.addEventListener('change', () => { state.topic = els.topic.value; state.page = 1; load(); });
    els.difficulty.addEventListener('change', () => { state.difficulty = els.difficulty.value; state.page = 1; load(); });
    els.status.addEventListener('change', () => { state.status = els.status.value; state.page = 1; load(); });
    els.favorite.addEventListener('change', () => { state.favorite = els.favorite.checked; state.page = 1; load(); });
    
    els.reset.addEventListener('click', () => {
        state.search = ''; state.topic = ''; state.difficulty = '';
        state.status = ''; state.favorite = false; state.page = 1;
        els.search.value = ''; els.topic.value = ''; els.difficulty.value = '';
        els.status.value = ''; els.favorite.checked = false;
        load();
    });

    els.importBtn.addEventListener('click', async () => {
        if (!confirm('Hệ thống sẽ tải khoảng 5000 từ vựng chuẩn Oxford từ internet và tự động thêm vào Excel.\nQuá trình này có thể mất 1-2 phút tùy tốc độ mạng.\n\nBạn có chắc chắn muốn tiếp tục?')) {
            return;
        }

        const originalText = els.importBtn.innerHTML;
        els.importBtn.disabled = true;
        els.importBtn.innerHTML = '⏳ Đang tải dữ liệu...';
        els.importBtn.style.opacity = '0.7';

        try {
            const res = await fetchJSON('/api/vocabulary/import-oxford', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ translate: false })
            });
            
            toast(res.message || 'Nhập dữ liệu thành công!', 'success');
            
            state.page = 1;
            state.topic = ''; 
            state.search = '';
            els.topic.value = '';
            els.search.value = '';
            
            await load();
        } catch (e) {
            toast(e.message || 'Lỗi khi nhập dữ liệu', 'error');
        } finally {
            els.importBtn.disabled = false;
            els.importBtn.innerHTML = originalText;
            els.importBtn.style.opacity = '1';
        }
    });
})();
>>>>>>> c77325a2779c87ed1ee4b2b0e9d389a7c30fbe77
