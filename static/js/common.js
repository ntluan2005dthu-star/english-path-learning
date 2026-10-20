// ---------- Tiện ích chung ----------
async function fetchJSON(url, options = {}) {
  try {
    const res = await fetch(url, options);
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      throw new Error("Phản hồi không phải JSON (HTTP " + res.status + ")");
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Lỗi HTTP " + res.status);
    }
    return data;
  } catch (err) {
    toast(err.message || "Lỗi kết nối", "error");
    throw err;
  }
}

function toast(msg, type = "") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast show " + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = "toast";
  }, 2600);
}

function toggleSidebar() {
  const s = document.getElementById("sidebar");
  if (s) s.classList.toggle("open");
}

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmtDate(s) {
  if (!s) return "—";
  return String(s);
}

function pct(n, total) {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}

// ---------- Web Speech API ----------
const Speech = {
  supported: typeof window !== "undefined" && "speechSynthesis" in window,
  speak(text, rate = 0.95) {
    if (!this.supported) {
      toast("Trình duyệt không hỗ trợ phát âm (Web Speech API).", "error");
      return false;
    }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text || ""));
      u.lang = "en-US";
      u.rate = rate;
      const voices = window.speechSynthesis.getVoices();
      const en = voices.find((v) => /en[-_]/i.test(v.lang));
      if (en) u.voice = en;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      toast("Không thể phát âm: " + e.message, "error");
      return false;
    }
  },
  stop() {
    if (this.supported) window.speechSynthesis.cancel();
  },
};

// ========================================================
// HỆ THỐNG BẢO VỆ THƯƠNG HIỆU (Anti-Tamper Script)
// ========================================================
(function protectBrand() {
  // Chuỗi Base64 của "© 2005 Nguyễn Thành Luân | English Path. All rights reserved."
  const p1 = "wqkgMjAwNSBOZ3V5";
  const p2 = "4buFbiBUaMOgbmgg";
  const p3 = "THXDom4gfCBFbmds";
  const p4 = "aXNoIFBhdGguIEFs";
  const p5 = "bCByaWdodHMgcmVz";
  const p6 = "ZXJ2ZWQu";

  try {
    const base64Str = p1 + p2 + p3 + p4 + p5 + p6;
    const binString = atob(base64Str);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    const decodedText = new TextDecoder().decode(bytes);

    const watermark = document.createElement("div");
    watermark.id = "sys-protect-9988";
    watermark.style.cssText =
      "position:fixed;bottom:10px;right:15px;background:rgba(0,0,0,0.8);color:#fff;padding:5px 12px;border-radius:20px;font-size:11px;z-index:99999;pointer-events:none;opacity:0.7;font-family:monospace;box-shadow:0 2px 10px rgba(0,0,0,0.3);";
    watermark.textContent = decodedText;
    document.body.appendChild(watermark);

    // Bẫy chống xóa
    setInterval(function () {
      if (!document.getElementById("sys-protect-9988")) {
        document.body.innerHTML =
          "<div style='color:red; text-align:center; margin-top:50px; font-size:24px; font-weight:bold;'>HỆ THỐNG PHÁT HIỆN HÀNH VI XÓA BẢN QUYỀN TRÁI PHÉP!<br>Vui lòng tải lại trang.</div>";
        setTimeout(() => window.location.reload(), 2000);
      }
    }, 1000);
  } catch (e) {
    console.error("Lỗi bảo vệ bản quyền", e);
  }
})();
