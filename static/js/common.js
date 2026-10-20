// ---------- Tiện ích chung ----------
async function fetchJSON(url, options = {}) {
    try {
        const res = await fetch(url, options);
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            throw new Error('Phản hồi không phải JSON (HTTP ' + res.status + ')');
        }
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || ('Lỗi HTTP ' + res.status));
        }
        return data;
    } catch (err) {
        toast(err.message || 'Lỗi kết nối', 'error');
        throw err;
    }
}

function toast(msg, type = '') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = 'toast'; }, 2600);
}

function toggleSidebar() {
    const s = document.getElementById('sidebar');
    if (s) s.classList.toggle('open');
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function fmtDate(s) {
    if (!s) return '—';
    return String(s);
}

function pct(n, total) {
    if (!total) return 0;
    return Math.round((n / total) * 100);
}

// ---------- Web Speech API ----------
const Speech = {
    supported: typeof window !== 'undefined' && 'speechSynthesis' in window,
    speak(text, rate = 0.95) {
        if (!this.supported) {
            toast('Trình duyệt không hỗ trợ phát âm (Web Speech API).', 'error');
            return false;
        }
        try {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(text || ''));
            u.lang = 'en-US';
            u.rate = rate;
            const voices = window.speechSynthesis.getVoices();
            const en = voices.find(v => /en[-_]/i.test(v.lang));
            if (en) u.voice = en;
            window.speechSynthesis.speak(u);
            return true;
        } catch (e) {
            toast('Không thể phát âm: ' + e.message, 'error');
            return false;
        }
    },
    stop() {
        if (this.supported) window.speechSynthesis.cancel();
    }
};

// Gợi ý: gọi Speech.supported để hiển thị cảnh báo ở giao diện