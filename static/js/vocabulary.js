{% extends 'base.html' %}

{% block content %}
<section id="docs" class="docs">

  <div class="docs-hero">
    <div class="docs-hero-icon">🎓</div>
    <h1>English Path</h1>
    <p class="docs-hero-tag">Hệ thống học tiếng Anh giao tiếp &amp; IT English cho người Việt mới bắt đầu</p>
    <div class="docs-hero-badges">
      <span class="badge">Flask 3.0</span>
      <span class="badge">openpyxl 3.1</span>
      <span class="badge success">Local-first</span>
      <span class="badge warning">Excel storage</span>
      <span class="badge neutral">Single learner</span>
    </div>
  </div>

  <nav class="docs-toc">
    <a href="#overview">Tổng quan</a>
    <a href="#features">Tính năng</a>
    <a href="#stack">Công nghệ</a>
    <a href="#install">Cài đặt &amp; chạy</a>
    <a href="#structure">Cấu trúc</a>
    <a href="#data">Dữ liệu Excel</a>
    <a href="#api">API</a>
    <a href="#safety">An toàn dữ liệu</a>
    <a href="#limits">Giới hạn</a>
    <a href="#sources">Nguồn tham khảo</a>
    <a href="#tests">Kiểm thử</a>
  </nav>

  <!-- ============ OVERVIEW ============ -->
  <section id="overview" class="docs-section card">
    <h2 class="section-title">📌 Tổng quan</h2>
    <p>English Path là một <b>ứng dụng web chạy cục bộ</b> trên máy cá nhân, dùng <b>Flask</b> làm backend và lưu toàn bộ dữ liệu học tập vào <b>một file Excel duy nhất</b> (<code>data/english_learning_data.xlsx</code>). Hệ thống được thiết kế cho <b>một người học duy nhất</b> — người Việt mới bắt đầu — hướng tới hai mục tiêu song song:</p>
    <ul>
      <li><b>Tiếng Anh giao tiếp từ con số 0</b>: chào hỏi, tự giới thiệu, số đếm, gia đình, trường học, sở thích, hội thoại tình huống, nghe, nói, đọc hiểu.</li>
      <li><b>Tiếng Anh chuyên ngành CNTT</b>: máy tính, hệ điều hành, mạng, lập trình, frontend, backend, cơ sở dữ liệu, kiểm thử, mô tả dự án.</li>
    </ul>
    <p>Hệ thống tích hợp sẵn <b>bộ từ vựng mẫu</b> và tính năng <b>tự động tải 5000 từ vựng chuẩn Oxford</b> trực tiếp từ internet để mở rộng kho từ. Lộ trình gợi ý <b>6 tháng</b> chia thành 24 bài, có thể điều chỉnh tốc độ. Hệ thống <b>không cam kết</b> người học đạt mức lưu loát sau 6 tháng — đây chỉ là khung tham khảo.</p>
    <div class="docs-note info">
      Đối tượng phù hợp: người Việt mới học tiếng Anh, sinh viên CNTT hoặc người chuyển ngành muốn chuẩn bị vốn tiếng Anh cho công việc lập trình. Không dành cho lớp học đông người hoặc môi trường nhiều người dùng cùng lúc.
    </div>
  </section>

  <!-- ============ FEATURES ============ -->
  <section id="features" class="docs-section card">
    <h2 class="section-title">✨ Tính năng chính</h2>
    <div class="grid grid-2">
      <div>
        <h3>🗺️ Lộ trình 6 tháng</h3>
        <ul>
          <li>24 bài học chia đều 6 tháng.</li>
          <li>Mỗi bài gắn 1 kỹ năng: nghe, nói, đọc, ngữ pháp, từ vựng, IT.</li>
          <li>Bài tiếp theo tự động mở khoá khi hoàn thành bài trước.</li>
        </ul>

        <h3>📚 Thư viện từ vựng</h3>
        <ul>
          <li><b>Tích hợp sẵn 5000 từ Oxford:</b> Nhấn nút "Nhập 5000 từ Oxford" để tự động tải và thêm vào Excel.</li>
          <li>Mỗi từ lưu: IPA, từ loại, nghĩa Việt, định nghĩa Anh, collocation, câu ví dụ, chủ đề, CEFR, độ khó, nguồn tham khảo.</li>
          <li>Tìm kiếm Anh ↔ Việt, lọc theo chủ đề / độ khó / trạng thái, đánh dấu yêu thích, đánh dấu đã thành thạo.</li>
          <li>Phát âm bằng Web Speech API của trình duyệt.</li>
        </ul>

        <h3>📅 Luyện tập hằng ngày (40 phút)</h3>
        <ul>
          <li>5 phần: ôn từ đến hạn, học từ mới, nghe &amp; phát âm, đọc hội thoại, kiểm tra 5 câu.</li>
          <li>Trạng thái từng phần được lưu vào <code>StudyProgress</code> theo ngày.</li>
        </ul>
      </div>
      <div>
        <h3>📝 Trung tâm kiểm tra</h3>
        <ul>
          <li>Sinh đề theo chủ đề, chọn 5–20 câu.</li>
          <li>Các dạng: Anh→Việt, Việt→Anh, điền khuyết, nghe.</li>
          <li>Chỉ hiện đáp án + giải thích <b>sau khi nộp</b>.</li>
          <li>Kết quả lưu vào <code>TestResults</code>.</li>
        </ul>

        <h3>❌ Sổ lỗi sai</h3>
        <ul>
          <li>Lưu mọi câu sai: câu hỏi, đáp án bạn chọn, đáp án đúng, số lần sai, giải thích.</li>
          <li>Đánh dấu "đã khắc phục" khi hiểu.</li>
          <li>Có thể lọc xem lỗi chưa/đã xử lý.</li>
        </ul>

        <h3>🎧 Luyện nghe &amp; 🎤 Luyện nói</h3>
        <ul>
          <li>Nghe từ và chọn đáp án đúng (dùng Web Speech API).</li>
          <li>Luyện nói: phát mẫu câu, tự đọc theo, tự đánh giá (không chấm điểm phát âm).</li>
        </ul>

        <h3>📊 Thống kê &amp; 🎯 Mục tiêu</h3>
        <ul>
          <li>Chuỗi ngày học, phút học, điểm trung bình, từ vựng theo chủ đề, điểm yếu.</li>
          <li>Mọi con số đều tính từ dữ liệu thật trong Excel — không có số liệu giả.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ============ STACK ============ -->
  <section id="stack" class="docs-section card">
    <h2 class="section-title">🛠 Công nghệ sử dụng</h2>
    <table class="docs-table">
      <thead><tr><th>Thành phần</th><th>Phiên bản</th><th>Vai trò</th></tr></thead>
      <tbody>
        <tr><td>Python</td><td>3.10+ (khuyến nghị 3.11+)</td><td>Runtime cho backend</td></tr>
        <tr><td>Flask</td><td>3.0.3</td><td>Web framework, routing, API JSON</td></tr>
        <tr><td>openpyxl</td><td>3.1.5</td><td>Đọc/ghi file Excel <code>.xlsx</code></td></tr>
        <tr><td>HTML5 / CSS3 / JS (ES2020)</td><td>—</td><td>Giao diện, không framework</td></tr>
        <tr><td>Web Speech API</td><td>Trình duyệt cung cấp</td><td>Phát âm (không dùng để chấm điểm)</td></tr>
        <tr><td>urllib (Python stdlib)</td><td>—</td><td>Tải dữ liệu Oxford 5000 từ GitHub</td></tr>
      </tbody>
    </table>
    <p class="subtle">Không dùng cơ sở dữ liệu, không dùng ORM, không dùng Node.js. Chạy hoàn toàn trong môi trường Python cục bộ.</p>
  </section>

  <!-- ============ INSTALL ============ -->
  <section id="install" class="docs-section card">
    <h2 class="section-title">🚀 Cài đặt và chạy trên Windows</h2>
    <p class="subtle">Các bước dưới đây dùng <b>PowerShell</b> (không phải CMD). Mở PowerShell tại thư mục dự án (ví dụ <code>C:\Users\HP\Desktop\DuAnHocTiengAnh\english_path</code>).</p>

    <div class="docs-step">
      <div class="docs-step-num">1</div>
      <div class="docs-step-body">
        <div class="docs-step-title">Cài Python 3.10+ (nếu chưa có)</div>
        <div class="docs-step-desc">Tải từ <a href="https://www.python.org/downloads/" target="_blank" rel="noopener">python.org/downloads</a> và <b>tick chọn "Add python.exe to PATH"</b> khi cài.</div>
        <div class="docs-code">python --version
<span class="comment"># Kết quả mong đợi: Python 3.11.x trở lên</span></div>
      </div>
    </div>

    <div class="docs-step">
      <div class="docs-step-num">2</div>
      <div class="docs-step-body">
        <div class="docs-step-title">Tạo môi trường ảo (venv)</div>
        <div class="docs-step-desc">Cô lập thư viện của dự án, tránh xung đột với các dự án Python khác.</div>
        <div class="docs-code">python -m venv venv
.\venv\Scripts\Activate.ps1</div>
        <div class="docs-note info">Khi kích hoạt thành công, prompt sẽ có tiền tố <code>(venv)</code>. Nếu bị lỗi <code>Activate.ps1 cannot be loaded</code>, chạy một lần: <code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code>.</div>
      </div>
    </div>

    <div class="docs-step">
      <div class="docs-step-num">3</div>
      <div class="docs-step-body">
        <div class="docs-step-title">Cài thư viện</div>
        <div class="docs-step-desc">Cài Flask và openpyxl theo đúng phiên bản trong <code>requirements.txt</code>.</div>
        <div class="docs-code">pip install -r requirements.txt
<span class="comment"># Hoặc nếu muốn chắc chắn: python -m pip install -r requirements.txt</span></div>
      </div>
    </div>

    <div class="docs-step">
      <div class="docs-step-num">4</div>
      <div class="docs-step-body">
        <div class="docs-step-title">Chạy ứng dụng</div>
        <div class="docs-step-desc">Flask sẽ tự tạo file Excel và khởi động server tại cổng 5000.</div>
        <div class="docs-code">python app.py</div>
        <div class="docs-note info">Lần chạy đầu tiên sẽ tạo <code>data/english_learning_data.xlsx</code> (10 sheet với dữ liệu mẫu) — có thể mất 1–2 giây.</div>
      </div>
    </div>

    <div class="docs-step">
      <div class="docs-step-num">5</div>
      <div class="docs-step-body">
        <div class="docs-step-title">Mở trình duyệt</div>
        <div class="docs-step-desc">Truy cập địa chỉ sau (dùng Chrome / Edge / Cốc Cốc để Web Speech API hoạt động):</div>
        <div class="docs-code">http://127.0.0.1:5000</div>
      </div>
    </div>

    <h3>Khắc phục sự cố thường gặp</h3>
    <table class="docs-table">
      <thead><tr><th>Lỗi</th><th>Nguyên nhân</th><th>Cách xử lý</th></tr></thead>
      <tbody>
        <tr><td><code>python not found</code></td><td>Python chưa cài hoặc chưa vào PATH</td><td>Cài lại, tick "Add Python to PATH"</td></tr>
        <tr><td><code>Activate.ps1 cannot be loaded</code></td><td>Execution policy chặn script</td><td><code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code></td></tr>
        <tr><td><code>TemplateNotFound</code></td><td>Chạy app.py từ sai thư mục</td><td><code>cd</code> vào thư mục gốc có <code>templates/</code> trước khi chạy</td></tr>
        <tr><td><code>Port 5000 đang bận</code></td><td>Cổng đã bị dùng</td><td>Đổi <code>port=5000</code> trong <code>app.py</code> sang 5001</td></tr>
        <tr><td><code>PermissionError</code> khi ghi Excel</td><td>File Excel đang mở trong Microsoft Excel</td><td>Đóng file Excel rồi tải lại trang</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ============ STRUCTURE ============ -->
  <section id="structure" class="docs-section card">
    <h2 class="section-title">📂 Cấu trúc thư mục</h2>
    <div class="docs-code">english_path/
├── app.py                       <span class="comment"># Backend Flask, điều hướng, API</span>
├── requirements.txt             <span class="comment"># Flask==3.0.3, openpyxl==3.1.5</span>
├── README.md
├── data/
│   ├── english_learning_data.xlsx  <span class="comment"># Tự sinh khi chạy lần đầu</span>
│   └── backups/                    <span class="comment"># Sao lưu tự động mỗi lần ghi</span>
├── modules/
│   ├── __init__.py
│   ├── excel_store.py           <span class="comment"># Đọc/ghi Excel an toàn, atomic save</span>
│   ├── online_loader.py         <span class="comment"># Tải 5000 từ Oxford từ internet</span>
│   ├── quiz_engine.py           <span class="comment"># Sinh câu hỏi &amp; chấm điểm</span>
│   ├── seed_data.py             <span class="comment"># Dữ liệu mẫu ban đầu (DEMO)</span>
│   └── srs.py                   <span class="comment"># Spaced Repetition (1, 3, 7, 14, 30 ngày)</span>
├── templates/
│   ├── base.html                <span class="comment"># Layout chung + sidebar</span>
│   ├── index.html               <span class="comment"># Trang chủ</span>
│   ├── roadmap.html
│   ├── lesson.html
│   ├── vocabulary.html
│   ├── daily.html
│   ├── listening.html
│   ├── speaking.html
│   ├── grammar.html
│   ├── it_english.html
│   ├── quiz.html
│   ├── mistakes.html
│   ├── stats.html
│   └── docs.html                <span class="comment"># Trang bạn đang xem</span>
└── static/
    ├── css/style.css
    └── js/
        ├── common.js            <span class="comment"># fetchJSON, toast, Speech, escapeHtml</span>
        ├── home.js
        ├── roadmap.js
        ├── lesson.js
        ├── vocabulary.js
        ├── daily.js
        ├── listening.js
        ├── speaking.js
        ├── grammar.js
        ├── it_english.js
        ├── quiz.js
        ├── mistakes.js
        └── stats.js</div>
  </section>

  <!-- ============ DATA ============ -->
  <section id="data" class="docs-section card">
    <h2 class="section-title">📊 Thiết kế dữ liệu Excel</h2>
    <p>Toàn bộ trạng thái ứng dụng nằm trong một workbook <code>english_learning_data.xlsx</code>, gồm <b>10 sheet</b> có schema cố định:</p>
    <table class="docs-table">
      <thead><tr><th>Sheet</th><th>Mục đích</th><th>Cột chính</th></tr></thead>
      <tbody>
        <tr><td><code>Vocabulary</code></td><td>Kho từ vựng (có thể lên tới 5000+ dòng nếu nhập Oxford)</td><td>id, word, ipa, pos, vi_meaning, en_definition, example_en, example_vi, topic, cefr, difficulty, source_name, source_url, status, next_review, interval_days, ease</td></tr>
        <tr><td><code>Phrases</code></td><td>Câu hội thoại mẫu</td><td>id, phrase_en, phrase_vi, topic, source_name, source_url</td></tr>
        <tr><td><code>Grammar</code></td><td>Chủ điểm ngữ pháp</td><td>id, title_vi, title_en, content_vi, example_en, example_vi, level, source_url</td></tr>
        <tr><td><code>Lessons</code></td><td>Bài học trong lộ trình</td><td>id, month, title_vi, title_en, skill, description_vi, estimated_minutes, unlock_order, vocab_topics</td></tr>
        <tr><td><code>Exercises</code></td><td>Bài tập gắn với lesson</td><td>id, lesson_id, type, question, options, answer, explanation_vi, vocab_id</td></tr>
        <tr><td><code>TestResults</code></td><td>Lịch sử làm bài</td><td>id, date, quiz_type, lesson_id, total, correct, score, duration_sec, details</td></tr>
        <tr><td><code>StudyProgress</code></td><td>Tiến độ từng ngày</td><td>id, date, tasks_done, new_words, reviewed_words, quiz_score, minutes</td></tr>
        <tr><td><code>Mistakes</code></td><td>Sổ lỗi sai</td><td>id, qid, question, user_answer, correct_answer, explanation_vi, knowledge_point, wrong_count, resolved</td></tr>
        <tr><td><code>Sources</code></td><td>Danh sách nguồn</td><td>id, name, url, type, verified</td></tr>
        <tr><td><code>Settings</code></td><td>Cấu hình hệ thống</td><td>id, key, value, note</td></tr>
      </tbody>
    </table>
    <div class="docs-note danger">
      <b>Excel không phải là cơ sở dữ liệu.</b> Khi nhập 5000 từ Oxford, file Excel sẽ phình to (khoảng 2-4 MB) và tốc độ đọc/ghi sẽ chậm hơn so với ban đầu. Nó phù hợp cho học cá nhân, không phù hợp cho ghi đồng thời nhiều người.
    </div>
  </section>

  <!-- ============ API ============ -->
  <section id="api" class="docs-section card">
    <h2 class="section-title">🔌 API endpoints</h2>
    <p class="subtle">Tất cả dữ liệu đi qua backend; trình duyệt không đọc/ghi trực tiếp file Excel.</p>
    <table class="docs-table">
      <thead><tr><th>Method</th><th>Route</th><th>Chức năng</th></tr></thead>
      <tbody>
        <tr><td>GET</td><td><code>/api/dashboard</code></td><td>Số liệu tổng hợp cho trang chủ</td></tr>
        <tr><td>GET</td><td><code>/api/roadmap</code></td><td>Danh sách bài học theo tháng + trạng thái mở khoá</td></tr>
        <tr><td>GET</td><td><code>/api/lesson/&lt;id&gt;</code></td><td>Chi tiết 1 bài học</td></tr>
        <tr><td>POST</td><td><code>/api/lesson/&lt;id&gt;/complete</code></td><td>Đánh dấu hoàn thành bài học</td></tr>
        <tr><td>GET</td><td><code>/api/vocabulary</code></td><td>Tìm kiếm, lọc, phân trang từ vựng</td></tr>
        <tr><td>POST</td><td><code>/api/vocabulary/import-oxford</code></td><td><b>[Mới]</b> Tự động tải và import 5000 từ Oxford</td></tr>
        <tr><td>POST</td><td><code>/api/vocabulary/&lt;id&gt;/favorite</code></td><td>Bật/tắt yêu thích</td></tr>
        <tr><td>POST</td><td><code>/api/vocabulary/&lt;id&gt;/status</code></td><td>Đổi trạng thái (new / learning / reviewing / mastered)</td></tr>
        <tr><td>POST</td><td><code>/api/vocabulary/&lt;id&gt;/review</code></td><td>Cập nhật SRS theo kết quả đúng/sai</td></tr>
        <tr><td>GET</td><td><code>/api/daily</code></td><td>Nhiệm vụ hôm nay + tiến độ</td></tr>
        <tr><td>POST</td><td><code>/api/daily/complete</code></td><td>Đánh dấu 1 nhiệm vụ đã xong</td></tr>
        <tr><td>GET</td><td><code>/api/grammar</code> · <code>/api/phrases</code> · <code>/api/it-english</code></td><td>Dữ liệu cho các trang tương ứng</td></tr>
        <tr><td>POST</td><td><code>/api/quiz/generate</code></td><td>Sinh đề theo chủ đề / lesson / số câu</td></tr>
        <tr><td>POST</td><td><code>/api/quiz/submit</code></td><td>Chấm điểm, lưu kết quả, ghi lỗi sai, cập nhật SRS</td></tr>
        <tr><td>GET</td><td><code>/api/mistakes?resolved=0|1</code></td><td>Danh sách lỗi sai</td></tr>
        <tr><td>POST</td><td><code>/api/mistakes/&lt;id&gt;/resolve</code></td><td>Đánh dấu đã khắc phục</td></tr>
        <tr><td>GET</td><td><code>/api/stats</code></td><td>Toàn bộ số liệu thống kê</td></tr>
        <tr><td>GET/POST</td><td><code>/api/settings</code></td><td>Đọc/ghi cấu hình</td></tr>
      </tbody>
    </table>
  </section>

  <!-- ============ SAFETY ============ -->
  <section id="safety" class="docs-section card">
    <h2 class="section-title">🛡 An toàn dữ liệu khi ghi Excel</h2>
    <ul>
      <li><b>Kiểm tra kiểu dữ liệu:</b> mọi giá trị được chuẩn hoá về chuỗi/số trước khi ghi; ngày được format lại về <code>YYYY-MM-DD</code>.</li>
      <li><b>Sao lưu tự động:</b> mỗi lần ghi thành công, file cũ được copy sang <code>data/backups/backup_YYYYMMDD_HHMMSS.xlsx</code>.</li>
      <li><b>Atomic save:</b> ghi vào file tạm trong <code>data/</code> rồi <code>os.replace()</code> để thay thế — tránh hỏng file giữa chừng nếu tiến trình bị kill.</li>
      <li><b>Khoá ghi:</b> toàn bộ thao tác đọc/ghi dùng <code>threading.Lock()</code> để tránh tranh chấp trong Flask.</li>
      <li><b>ID tự tăng:</b> mỗi sheet dùng hàm <code>_next_id()</code> đảm bảo ID duy nhất, không phụ thuộc số dòng hiện tại.</li>
      <li><b>Khôi phục:</b> nếu file bị lỗi, copy file mới nhất trong <code>data/backups/</code> đè lên <code>data/english_learning_data.xlsx</code> rồi khởi động lại ứng dụng.</li>
    </ul>
  </section>

  <!-- ============ LIMITS ============ -->
  <section id="limits" class="docs-section card">
    <h2 class="section-title">⚠️ Giới hạn đã biết</h2>
    <ul>
      <li><b>Chỉ 1 người dùng:</b> không có đăng nhập, không có phân quyền.</li>
      <li><b>Excel không phải DB:</b> chậm dần khi dữ liệu lớn (khi nhập 5000 từ, thời gian lưu file có thể lên tới 1-2 giây mỗi lần bấm nút).</li>
      <li><b>Dịch tự động sang tiếng Việt khi nhập Oxford:</b> API dịch miễn phí có thể bị giới hạn (rate limit). Mặc định hệ thống không dịch tự động để đảm bảo tốc độ. Bạn có thể tự điền nghĩa Việt sau.</li>
      <li><b>Không nhận dạng giọng nói:</b> trang Luyện nói chỉ phát mẫu, cho người học tự đánh giá. Chưa tích hợp engine chấm điểm phát âm.</li>
      <li><b>IPA chưa đầy đủ:</b> nhiều mục trong dữ liệu mẫu ghi "Chưa xác minh" vì chưa tra cứu nguồn.</li>
      <li><b>Dữ liệu mẫu là DEMO:</b> có thể chỉnh sửa trực tiếp trong Excel; không được coi là giáo trình đầy đủ.</li>
      <li><b>Chưa có import/export CSV</b>, chưa có migration sang SQLite.</li>
      <li><b>Giao diện tiếng Việt cố định</b>, chưa hỗ trợ đa ngôn ngữ giao diện.</li>
    </ul>
  </section>

  <!-- ============ SOURCES ============ -->
  <section id="sources" class="docs-section card">
    <h2 class="section-title">📚 Nguồn tham khảo</h2>
    <p class="subtle">Mỗi mục từ vựng trong Excel đều có cột <code>source_name</code> và <code>source_url</code>. Nguồn chính:</p>
    <ul>
      <li><a href="https://learnenglish.britishcouncil.org/" target="_blank" rel="noopener">British Council LearnEnglish</a> — từ vựng, ngữ pháp, hội thoại.</li>
      <li><a href="https://www.oxfordlearnersdictionaries.com/wordlists/" target="_blank" rel="noopener">Oxford Learner's Dictionaries</a> — định nghĩa, ví dụ, IPA (chỉ dùng khi tra được).</li>
      <li><a href="https://dictionary.cambridge.org/" target="_blank" rel="noopener">Cambridge Dictionary</a> — tham chiếu chéo.</li>
      <li><a href="https://developer.mozilla.org/en-US/docs/Glossary" target="_blank" rel="noopener">MDN Web Docs Glossary</a> — thuật ngữ web (HTML, CSS, JS, HTTP, API...).</li>
      <li><a href="https://learn.microsoft.com/" target="_blank" rel="noopener">Microsoft Learn</a> — thuật ngữ Windows, SQL Server, Azure.</li>
      <li><a href="https://github.com/winterdl/oxford-5000-vocabulary-audio-definition" target="_blank" rel="noopener">Kho dữ liệu mở Oxford 5000</a> — dùng cho tính năng nhập từ tự động.</li>
    </ul>
    <div class="docs-note info">
      Dự án <b>không</b> tải hàng loạt (crawl) tài liệu có bản quyền. Các mục từ vựng mẫu do người phát triển tự biên soạn hoặc lấy từ kho dữ liệu mở, có ghi nguồn tham chiếu. Người dùng có thể chỉnh sửa và bổ sung trong Excel.
    </div>
  </section>

  <!-- ============ TESTS ============ -->
  <section id="tests" class="docs-section card">
    <h2 class="section-title">✅ Trạng thái kiểm thử</h2>
    <p>Đã kiểm thử thủ công trên Windows 11, Python 3.11, Flask 3.0.3, openpyxl 3.1.5, Chrome &amp; Edge:</p>
    <table class="docs-table">
      <thead><tr><th>Hành vi</th><th>Kết quả</th></tr></thead>
      <tbody>
        <tr><td>Lần đầu chạy tự sinh <code>data/english_learning_data.xlsx</code> với 10 sheet</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Tự động nhập 5000 từ Oxford từ internet vào Excel</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Trang chủ hiển thị số liệu thật từ Excel</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Tìm kiếm / lọc / phân trang từ vựng (kể cả khi có 5000 từ)</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Bật/tắt yêu thích, đổi trạng thái (new → mastered)</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Đánh dấu bài học hoàn thành → lộ trình cập nhật</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Sinh đề 5–20 câu, chấm điểm, lưu <code>TestResults</code></td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Câu sai được thêm vào <code>Mistakes</code>, có thể đánh dấu khắc phục</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>SRS cập nhật <code>next_review</code> theo chu kỳ 1/3/7/14/30 ngày</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Nhiệm vụ hằng ngày lưu vào <code>StudyProgress</code> theo ngày</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Sau khi khởi động lại server, dữ liệu vẫn còn</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Web Speech API phát âm đúng trên Chrome &amp; Edge</td><td><span class="badge success">Pass</span></td></tr>
        <tr><td>Chấm điểm phát âm người học</td><td><span class="badge danger">Chưa có</span></td></tr>
        <tr><td>Migration sang SQLite</td><td><span class="badge danger">Chưa có</span></td></tr>
        <tr><td>Import/Export CSV</td><td><span class="badge danger">Chưa có</span></td></tr>
      </tbody>
    </table>
  </section>

  <div class="card" style="text-align:center;">
    <p class="subtle">English Path — Dự án học tập cục bộ · Dữ liệu lưu trong Excel · Không gửi dữ liệu lên cloud.</p>
    <a class="btn ghost" href="/">← Về trang chủ</a>
  </div>

</section>
{% endblock %}