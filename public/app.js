import { SERVICES, duplicates, normalize, schedule, isDue, mastery, localDate, createCard, validateCard, validateImport, DAY } from './shared/model.js';
import { seedCards } from './shared/seed.js';
import {DEFAULT_TAGS,MAX_TAGS,getService,parseTagInput,toggleTag} from './shared/catalog.js';
import {serviceOptions,serviceField,serviceResults,tagsField,tagChoices} from './editor-fields.js';

const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  book: '<path d="M12 6c-3-2-6-3-10-2v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-4-1-7 0-10 2Zm0 0v15"/>',
  note: '<path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M9 15l1-4L19 2l3 3-9 9Z"/>',
  settings: '<path d="m9 3-1 3-3 1-2 4 2 2v4l4 3 3-1 3 1 4-3v-4l2-2-2-4-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  star: '<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L20 5"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  flame: '<path d="M12 2c1 5 6 5 6 10 2-1 2-3 2-3 3 8-1 13-8 13-6 0-10-5-7-11 0 3 2 4 2 4-1-6 5-8 5-13Z"/>',
  cloud: '<path d="M6 19h12a5 5 0 0 0 .6-10A7 7 0 0 0 5.2 7.1 6 6 0 0 0 6 19Z"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M15 6.5h3M15 17.5h3"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  network: '<rect x="8" y="2" width="8" height="6" rx="1"/><rect x="2" y="16" width="7" height="6" rx="1"/><rect x="15" y="16" width="7" height="6" rx="1"/><path d="M12 8v4M5.5 16v-4h13v4"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 10v10M3 7l9 5 9-5M8 4l9 5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  queue: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h5"/>',
  chart: '<path d="M3 3v18h18M7 15l4-5 4 3 6-8"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  moon: '<path d="M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  external: '<path d="M14 3h7v7M21 3l-11 11M10 3H4v17h17v-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  refresh: '<path d="M20 7a9 9 0 0 0-15-2L2 8m0-6v6h6M4 17a9 9 0 0 0 15 2l3-3m0 6v-6h-6"/>',
  flip: '<path d="M3 7h14l-4-4M21 17H7l4 4M3 7v9M21 17V8"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  alert: '<path d="m12 3 10 18H2ZM12 9v5M12 17h.01"/>',
  logout: '<path d="M9 3H3v18h6M9 12h13m-5-5 5 5-5 5"/>',
  leaf: '<path d="M20 3C4 1 1 10 6 16s17 3 14-13ZM4 21l11-11"/>',
  trophy: '<path d="M7 3h10v6a5 5 0 0 1-10 0ZM7 5H3v3c0 3 2 5 5 5M17 5h4v3c0 3-2 5-5 5M12 14v6M7 21h10"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.layers}</svg>`;
const serviceIcon = service => ({ IAM: 'shield', EC2: 'server', S3: 'box', VPC: 'network', RDS: 'database', Lambda: 'bolt', DynamoDB: 'database', CloudFront: 'globe', SQS: 'queue', CloudWatch: 'chart' }[service] || getService(service)?.icon || 'cloud');
const serviceClass = service => `svc-${getService(service)?.group || 'architecture'}`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const attr = esc;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORAGE = 'aws-recall-data-v1';
const PREFS = 'aws-recall-preferences';
const tabs = { home: 'Tổng quan', library: 'Thư viện thẻ', review: 'Ôn tập', notes: 'Ghi chú' };
const state = { cards: [], reviews: [], session: null, tab: 'home', query: '', service: 'all', filter: 'all', view: 'grid', study: null, busy: false, editor: null, noteCard: null, prefs: {} };
let focusBeforeModal;
let toastTimer;
try { state.prefs = JSON.parse(localStorage.getItem(PREFS) || '{}'); } catch { /* Use defaults if storage is unavailable. */ }
document.documentElement.dataset.theme = state.prefs.theme || 'dark';
document.documentElement.dataset.reduceMotion = String(Boolean(state.prefs.reduceMotion));

function toast(message, error = false) {
  const node = document.createElement('div');
  node.className = `toast${error ? ' error' : ''}`;
  node.innerHTML = `${icon(error ? 'alert' : 'circleCheck')}<span>${esc(message)}</span>`;
  $('#toasts').replaceChildren(node);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.remove(), error ? 8000 : 4000);
}
function savePrefs() {
  try { localStorage.setItem(PREFS, JSON.stringify(state.prefs)); } catch { toast('Trình duyệt không lưu được tùy chọn.', true); }
}
function setTheme() {
  state.prefs.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.prefs.theme;
  savePrefs(); renderShell();
}
async function request(path, data, method) {
  const response = await fetch(path, { method: method || (data ? 'POST' : 'GET'), headers: data ? { 'Content-Type':'application/json' } : {}, ...(data ? { body: JSON.stringify(data) } : {}), cache:'no-store' });
  let result;
  try { result = await response.json(); } catch { throw new Error('Máy chủ trả về dữ liệu không hợp lệ. Vui lòng thử lại.'); }
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/session') { state.session.authenticated = false; state.study = null; $('#modal').close(); renderLogin(); }
    throw new Error(result.error || 'Không thực hiện được thao tác. Vui lòng thử lại.');
  }
  return result;
}
function readLocal() {
  const raw = localStorage.getItem(STORAGE);
  if (!raw) return { cards: seedCards(), reviews: [] };
  return validateImport(JSON.parse(raw));
}
function commitLocal(cards, reviews) {
  localStorage.setItem(STORAGE, JSON.stringify({ version:1, cards, reviews }));
  state.cards = cards; state.reviews = reviews;
}
async function loadData() {
  if (state.session.mode === 'sheets') {
    const result = await request('/api/cards');
    state.cards = result.cards; state.reviews = result.reviews;
  } else {
    const result = readLocal();
    commitLocal(result.cards, result.reviews);
  }
}
async function boot() {
  try {
    state.session = await request('/api/session');
    if (!state.session.ready) {
      if (state.session.oauthAvailable && state.session.ownerReady) return state.session.authenticated ? renderGoogleConnect() : renderLogin();
      return renderSetupError();
    }
    if (state.session.authEnabled && !state.session.authenticated) return renderLogin();
    await loadData();
    renderShell();
  } catch (error) { renderFatal(error.message); }
}
function brand() { return `<span class="logo-symbol">a<span>↗</span></span><span><span class="brand-text">aws <b>recall</b></span><span class="brand-caption">A LITTLE EVERY DAY</span></span>`; }
function renderLogin() {
  $('#app').innerHTML = `<main class="login-wrap"><section class="login-card"><a class="brand" href="/" aria-label="AWS Recall">${brand()}</a><p class="eyebrow">KHÔNG GIAN HỌC CỦA BẠN</p><h1>Chào bạn trở lại.</h1><p>Mỗi lần ôn tập là một bước gần hơn đến mục tiêu AWS của bạn.</p><form id="login-form"><label class="form-field"><span>Mật khẩu truy cập</span><input name="password" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu của bạn" required maxlength="500" autofocus></label><p class="form-error" id="login-error" role="alert"></p><button class="btn" type="submit">Vào không gian học ${icon('arrow')}</button></form><div class="login-foot">${icon('shield')} Chỉ bạn có quyền truy cập dữ liệu này.</div></section></main>`;
  setTimeout(() => $('[name=password]')?.focus(), 0);
}
function renderFatal(message) {
  $('#app').innerHTML = `<main class="login-wrap"><section class="login-card"><div class="brand">${brand()}</div><h1>Chưa mở được dữ liệu.</h1><p>${esc(message)}</p><button class="btn" data-action="retry">${icon('refresh')} Thử lại</button>${reconnectButton()}<p class="login-foot">Dữ liệu hiện có được giữ nguyên. Nếu bạn dùng Google Sheets, hãy kiểm tra kết nối và quyền chia sẻ.</p></section></main>`;
}
function reconnectButton() {
  return state.session?.oauthAvailable ? `<button class="btn btn-secondary" data-action="connect-google">${icon('globe')} Kết nối lại Google</button>` : '';
}
function renderSetupError() {
  $('#app').innerHTML = `<main class="login-wrap"><section class="login-card"><div class="brand">${brand()}</div><h1>Còn một bước kết nối.</h1><p>Cấu hình Google Sheets hoặc đăng nhập chưa đầy đủ. Kiểm tra các biến trong <code>.env.example</code>; SESSION_SECRET cần ít nhất 32 ký tự. Xem README để hoàn tất thiết lập.</p><button class="btn" data-action="retry">${icon('refresh')} Kiểm tra lại</button></section></main>`;
}
function renderGoogleConnect() {
  const cancelled = new URLSearchParams(location.search).get('google') === 'cancelled';
  $('#app').innerHTML = `<main class="login-wrap"><section class="login-card"><div class="brand">${brand()}</div><p class="eyebrow">THÊM MỘT BƯỚC NHỎ</p><h1>Mang kiến thức theo bạn.</h1><p>Kết nối tài khoản Google có quyền chỉnh sửa Sheet để lưu flashcard, ghi chú và tiến độ học.</p>${cancelled ? '<p class="form-error">Bạn chưa cấp quyền. Có thể kết nối lại khi sẵn sàng.</p>' : ''}<button class="btn" data-action="connect-google">${icon('globe')} Kết nối Google Sheets ${icon('arrow')}</button><p class="login-foot">Google sẽ hỏi quyền trước khi kết nối. Dữ liệu nằm trong Sheet của bạn.</p><button class="text-link" data-action="logout">${icon('logout')} Đăng xuất</button></section></main>`;
}
function dueCards() { return state.cards.filter(c => isDue(c)); }
function renderShell() {
  const due = dueCards().length;
  $('#app').innerHTML = `<div class="app-shell"><div class="mobile-overlay" data-action="close-menu"></div><aside class="sidebar" aria-label="Điều hướng chính"><a class="brand" href="#home" data-action="navigate" data-tab="home">${brand()}</a><p class="workspace-label">Không gian của bạn</p><nav class="nav">${Object.entries(tabs).map(([tab,label]) => `<button class="nav-item${state.tab === tab ? ' active' : ''}" data-action="navigate" data-tab="${tab}" ${state.tab === tab ? 'aria-current="page"' : ''}>${icon({home:'grid',library:'layers',review:'book',notes:'note'}[tab])}<span>${label}</span>${tab === 'review' && due ? `<span class="nav-count">${due}</span>` : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="sidebar-tip">${icon('leaf')}<strong>Chậm một chút. Nhớ lâu hơn.</strong><p>10 phút mỗi ngày có thể tạo nên một thay đổi lớn.</p></div><button class="nav-item" data-action="settings">${icon('settings')}<span>Cài đặt & dữ liệu</span></button><div class="storage-chip"><span class="status-dot${state.session.mode === 'sheets' ? ' connected' : ''}"></span>${state.session.mode === 'sheets' ? 'Đã kết nối Google Sheets' : 'Bản thử · Lưu trên máy này'}</div></div></aside><div class="main"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-menu" data-action="menu" aria-label="Mở menu">${icon('menu')}</button><span class="home-crumb">Không gian học ${icon('chevron')}</span><strong>${tabs[state.tab]}</strong></div><div class="top-actions"><span class="top-date">${esc(new Date().toLocaleDateString('vi-VN', { weekday:'long', day:'numeric', month:'long' }))}</span><button class="icon-button" data-action="theme" aria-label="Đổi giao diện sáng tối">${icon(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button><button class="avatar" data-action="settings" aria-label="Cài đặt tài khoản">ME</button></div></header><main class="page" id="page"></main></div></div>`;
  renderPage();
}
function intro(eyebrow, title, subtitle, add = true) {
  return `<div class="page-intro"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="subtitle">${subtitle}</p></div>${add ? `<button class="btn" data-action="new">${icon('plus')} Thêm flashcard</button>` : ''}</div>`;
}
function notice() {
  return state.session.mode === 'demo' ? `<div class="demo-notice">${icon('info')} Bản thử đang lưu trên trình duyệt này.<button data-action="settings">Kết nối Google Sheets</button></div>` : `<div class="demo-notice">${icon('shield')} Dữ liệu riêng tư · Lưu trữ trên Google Sheets của bạn</div>`;
}
function renderPage() {
  const page = $('#page');
  if (!page) return;
  page.innerHTML = state.tab === 'home' ? homePage() : state.tab === 'library' ? libraryPage() : state.tab === 'review' ? reviewPage() : notesPage();
  // Property assignments work under the strict CSP; user input never becomes style markup.
  $$('[data-progress]', page).forEach(el => { el.style.width = `${Number(el.dataset.progress)}%`; });
  $$('[data-bar]', page).forEach(el => { el.style.height = `${Math.max(3, Number(el.dataset.bar))}px`; });
}
function weekActivity() {
  return Array.from({ length:7 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - i));
    const key = localDate(date), count = state.reviews.filter(r => localDate(r.at) === key).length;
    return { label: date.toLocaleDateString('vi-VN',{weekday:'short'}), count, today:i === 6 };
  });
}
function streak() {
  const days = new Set(state.reviews.map(r => localDate(r.at)));
  const d = new Date(); let result = 0;
  if (!days.has(localDate(d))) d.setDate(d.getDate() - 1);
  while (days.has(localDate(d))) { result++; d.setDate(d.getDate() - 1); }
  return result;
}
function homePage() {
  const due = dueCards().length, learned = state.cards.filter(c => c.repetitions >= 3).length;
  const today = state.reviews.filter(r => localDate(r.at) === localDate()).length;
  const week = weekActivity(), weekTotal = week.reduce((sum,d) => sum + d.count, 0), max = Math.max(5,...week.map(d => d.count));
  const deckServices = ['IAM','EC2','S3'];
  const recent = [...state.cards].sort((a,b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0,3);
  const greeting = new Date().getHours() < 12 ? 'Buổi sáng tốt lành' : new Date().getHours() < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  return `${intro('MỘT CHÚT TIẾN BỘ MỖI NGÀY', `${greeting} <span aria-hidden="true">✦</span>`, 'Sẵn sàng biến kiến thức AWS thành điều bạn thực sự nhớ?')}
    <section class="hero" aria-label="Bắt đầu ôn tập"><div class="hero-copy"><div class="hero-kicker">${icon('bolt')} NHỎ MỖI NGÀY. LỚN THEO THỜI GIAN.</div><h2>Mỗi ngày một chút.<br><em>Gần AWS hơn một bước.</em></h2><p class="hero-desc">${due ? `Có ${due} thẻ đang chờ bạn ôn lại. Một phiên học ngắn để kiến thức ở lại lâu hơn.` : 'Bạn đã ôn hết các thẻ đến hạn. Khám phá thêm một chủ đề hoặc tự thử thách trí nhớ nhé.'}</p><div class="hero-cta"><button class="btn" data-action="quick-study">${icon('bolt')} ${due ? `Ôn ${Math.min(due,10)} thẻ ngay` : 'Luyện tập ngay'} ${icon('arrow')}</button><small>Khoảng 5–10 phút · Theo nhịp của bạn</small></div></div><div class="hero-art" aria-hidden="true"><div class="orbit three"></div><div class="orbit two"></div><div class="orbit"></div><div class="mini-card back"><div class="mini-top"><span class="mini-badge">${icon('shield')} IAM</span></div><strong>Học từng chút.<br>Nhớ từng ngày.</strong></div><div class="mini-card front"><div class="mini-top"><span class="mini-badge">${icon('box')} AMAZON S3</span>${icon('star')}</div><strong>Kiến thức hôm nay.<br>Tự tin ngày mai.</strong><div class="mini-line"></div></div><div class="floating-label">${icon('circleCheck')} Một thẻ. Một bước tiến.</div></div></section>
    <section class="stats-grid" aria-label="Thống kê học tập">${stat('Tổng flashcard',state.cards.length,'layers','Kiến thức bạn đã góp nhặt')}${stat('Cần ôn tập',due,'clock','Đúng lúc để nhớ lâu hơn')}${stat('Đã ghi nhớ',learned,'circleCheck','Từ 3 lần nhớ liên tiếp')}${stat('Chuỗi ngày học',streak(),'flame',today ? 'Bạn đã học hôm nay!' : 'Bắt đầu từ hôm nay', 'ngày')}</section>
    <div class="home-middle"><section><div class="section-head"><div><h2>Góc kiến thức AWS</h2><p>Chọn một chủ đề, học thêm một chút.</p></div><button class="text-link" data-action="navigate" data-tab="library">Tất cả ${icon('arrow')}</button></div><div class="decks">${deckServices.map(service => {
      const cards = state.cards.filter(c => c.service === service), learned = cards.filter(c => c.repetitions >= 3).length;
      const progress = cards.length ? Math.round(learned / cards.length * 100) : 0;
      return `<button class="deck svc-${service}" data-action="deck" data-service="${service}"><span class="service-icon">${icon(serviceIcon(service))}</span><h3>${{IAM:'Identity & Access',EC2:'Elastic Compute',S3:'Simple Storage'}[service]}</h3><p>${service} · ${cards.length} flashcard</p><div class="deck-progress"><span data-progress="${progress}"></span></div><div class="deck-footer"><span>Đã nhớ ${learned}/${cards.length}</span><span>${progress}%</span></div></button>`;
    }).join('')}</div></section><section><div class="section-head"><div><h2>Nhịp học của bạn</h2><p>7 ngày gần đây</p></div>${icon('chart')}</div><div class="activity"><div class="activity-summary"><strong>${weekTotal}<small>lượt ôn tập</small></strong><span class="pill">${icon('leaf')} ${today ? 'Đã học hôm nay' : 'Bắt đầu nhé'}</span></div><div class="chart" role="img" aria-label="${esc(week.map(d => `${d.label}: ${d.count} lượt`).join(', '))}">${week.map(d => `<div class="chart-col${d.today ? ' today' : ''}" title="${d.count} lượt ôn"><div class="chart-bar" data-bar="${Math.round(d.count / max * 77)}"></div><span>${esc(d.label)}</span></div>`).join('')}</div></div></section></div>
    <section class="home-recent"><div class="section-head"><div><h2>Những thẻ gần đây</h2><p>Góp nhặt hôm nay, dùng được ngày mai.</p></div><button class="text-link" data-action="navigate" data-tab="library">Mở thư viện ${icon('arrow')}</button></div>${recent.length ? `<div class="cards-grid">${recent.map(cardPreview).join('')}</div>` : empty('layers','Thư viện đang chờ bạn','Bắt đầu với một câu hỏi AWS bạn muốn ghi nhớ.', 'new', 'Tạo thẻ đầu tiên')}</section>${notice()}`;
}
function stat(label, value, symbol, note, unit = '') {
  return `<article class="stat"><div class="stat-label">${label}${icon(symbol)}</div><div class="stat-value">${value}${unit ? `<small>${unit}</small>` : ''}</div><p class="stat-note">${icon('leaf')}${note}</p></article>`;
}
function cardPreview(c) {
  return `<article class="flash-preview ${serviceClass(c.service)}"><div class="card-top"><span class="service-label">${icon(serviceIcon(c.service))}${esc(c.service)}</span><button class="favorite-button${c.favorite ? ' is-favorite' : ''}" data-action="favorite" data-id="${attr(c.id)}" aria-label="${c.favorite ? 'Bỏ' : 'Thêm'} đánh dấu yêu thích" aria-pressed="${c.favorite}">${icon('star')}</button></div><button class="card-question" data-action="detail" data-id="${attr(c.id)}">${esc(c.question)}</button><div class="tags">${c.tags.slice(0,3).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div><div class="card-footer"><span class="card-status"><span class="status-dot${c.repetitions >= 3 ? ' connected' : ''}"></span>${mastery(c)}${c.note ? ` · ${icon('note')}` : ''}</span><button data-action="edit" data-id="${attr(c.id)}">${icon('edit')} Chỉnh sửa</button></div></article>`;
}
function empty(symbol,title,description,action,label) {
  return `<div class="empty">${icon(symbol)}<h2>${title}</h2><p>${description}</p>${action ? `<button class="btn" data-action="${action}">${icon('plus')}${label}</button>` : ''}${!state.cards.length && state.session.mode === 'sheets' ? `<button class="btn btn-secondary" data-action="seed">Thêm 12 thẻ mẫu</button>` : ''}</div>`;
}
function filteredCards(notesOnly = false) {
  const q = normalize(state.query);
  return state.cards.filter(c => (!notesOnly || c.note.trim()) && (state.service === 'all' || c.service === state.service) && (state.filter !== 'favorite' || c.favorite) && (state.filter !== 'due' || isDue(c)) && (!q || normalize([c.question,c.answer,c.note,c.service,...c.tags].join(' ')).includes(q))).sort((a,b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}
function toolbar(notes = false) {
  return `<div class="toolbar"><label class="search">${icon('search')}<input id="search-input" type="search" placeholder="${notes ? 'Tìm trong ghi chú…' : 'Tìm câu hỏi, dịch vụ, nhãn…'}" aria-label="${notes ? 'Tìm ghi chú' : 'Tìm flashcard'}" value="${attr(state.query)}" maxlength="200"><kbd>/</kbd></label><select id="service-filter" aria-label="Lọc theo dịch vụ"><option value="all">Tất cả dịch vụ</option>${serviceOptions(state.service)}</select>${!notes ? `<div class="view-switch" aria-label="Kiểu hiển thị"><button class="icon-button${state.view === 'grid' ? ' active' : ''}" data-action="view" data-view="grid" aria-label="Dạng lưới" aria-pressed="${state.view === 'grid'}">${icon('grid')}</button><button class="icon-button${state.view === 'list' ? ' active' : ''}" data-action="view" data-view="list" aria-label="Dạng danh sách" aria-pressed="${state.view === 'list'}">${icon('list')}</button></div>` : ''}</div>`;
}
function libraryPage() {
  const cards = filteredCards();
  return `${intro('GÓP NHẶT KIẾN THỨC','Thư viện flashcard','Một nơi cho mọi điều bạn muốn nhớ về AWS.')}${toolbar()}<div class="filter-row">${[['all','Tất cả',state.cards.length],['due','Đến hạn ôn',dueCards().length],['favorite','Yêu thích',state.cards.filter(c => c.favorite).length]].map(([key,label,count]) => `<button class="filter-chip${state.filter === key ? ' active' : ''}" data-action="filter" data-filter="${key}">${label}<span>${count}</span></button>`).join('')}<span class="results-count">${cards.length} kết quả</span></div>${cards.length ? `<div class="cards-${state.view}">${cards.map(cardPreview).join('')}</div>` : empty('search','Chưa có thẻ phù hợp',state.cards.length ? 'Thử từ khóa khác hoặc bỏ bớt bộ lọc nhé.' : 'Tạo flashcard đầu tiên để bắt đầu hành trình của bạn.',state.cards.length ? 'clear-filters' : 'new',state.cards.length ? 'Xóa bộ lọc' : 'Tạo thẻ đầu tiên')}${notice()}`;
}
function notesPage() {
  const cards = filteredCards(true);
  return `${intro('HIỂU THEO CÁCH CỦA BẠN','Ghi chú & điều dễ nhầm','Những dòng ghi lại hôm nay sẽ giúp bạn nhớ rõ hơn ngày mai.',false)}${toolbar(true)}${cards.length ? `<div class="notes-grid">${cards.map(c => `<article class="note-card ${serviceClass(c.service)}"><span class="service-label">${icon(serviceIcon(c.service))}${esc(c.service)}</span><h3>${esc(c.question)}</h3><div class="note-body">${esc(c.note)}</div><footer><span>${esc(new Date(c.updatedAt).toLocaleDateString('vi-VN'))}</span><button class="text-link" data-action="note" data-id="${attr(c.id)}">${icon('edit')} Sửa ghi chú</button></footer></article>`).join('')}</div>` : empty('note','Để dành một điều đáng nhớ',state.query || state.service !== 'all' ? 'Chưa tìm thấy ghi chú phù hợp. Thử đổi bộ lọc.' : 'Mở một flashcard và thêm ghi chú. Bạn sẽ tìm thấy tất cả ghi chú ở đây.', 'navigate-library','Mở thư viện')}${notice()}`;
}
function reviewPage() {
  if (state.study) return studyPage();
  return `${intro('HỌC ĐỀU, NHỚ LÂU','Một chút ôn tập hôm nay','Không cần học thật nhiều. Chỉ cần quay lại đều đặn.',false)}<section class="study-intro"><div class="study-banner"><span class="service-icon">${icon('book')}</span><h2>Cho kiến thức thêm một lần gặp.</h2><p>Chọn một chế độ học. Lật thẻ, tự đánh giá và để lịch ôn lo phần còn lại.</p></div><div class="study-options"><button class="study-option" data-action="start-study" data-type="due">${icon('clock')}<strong>Ôn đến hạn</strong><span>${dueCards().length} thẻ cần ôn · Đề xuất cho bạn</span></button><button class="study-option" data-action="start-study" data-type="weak">${icon('bolt')}<strong>Củng cố điểm yếu</strong><span>Ưu tiên thẻ hay quên và mới học</span></button><button class="study-option" data-action="start-study" data-type="favorite">${icon('star')}<strong>Thẻ yêu thích</strong><span>${state.cards.filter(c => c.favorite).length} thẻ bạn đã đánh dấu</span></button></div><div class="study-controls"><select id="study-service" aria-label="Chọn chủ đề ôn"><option value="all">Tất cả chủ đề AWS</option>${serviceOptions()}</select><select id="study-limit" aria-label="Số thẻ mỗi phiên"><option value="10">10 thẻ / phiên</option><option value="20" selected>20 thẻ / phiên</option><option value="50">50 thẻ / phiên</option><option value="all">Toàn bộ thẻ phù hợp</option></select><button class="btn btn-secondary" data-action="start-study" data-type="all">Luyện tập tự do ${icon('arrow')}</button></div><p class="keyboard-hint">Mẹo nhỏ: nhớ lại câu trả lời trước khi lật thẻ. Bạn sẽ học hiệu quả hơn.</p></section>${notice()}`;
}
function studyPage() {
  const study = state.study;
  if (study.index >= study.ids.length) {
    const minutes = Math.max(1,Math.round((Date.now() - study.startedAt)/60000));
    return `${intro('THÊM MỘT BƯỚC TIẾN','Bạn đã dành thời gian cho mình.','Một phiên học nhỏ. Một nền tảng vững hơn.',false)}<section class="completion"><div class="completion-icon">${icon('trophy')}</div><h2>Làm tốt lắm, hôm nay!</h2><p>Những thẻ bạn vừa học đã có lịch ôn tiếp theo.</p><div class="completion-stats"><div><strong>${study.reviewed}</strong><span>thẻ đã ôn</span></div><div><strong>${minutes}</strong><span>phút tập trung</span></div><div><strong>${streak()}</strong><span>ngày liên tiếp</span></div></div><button class="btn" data-action="finish-study">Hoàn tất ${icon('check')}</button><button class="btn btn-ghost" data-action="study-again">Học thêm một chút ${icon('arrow')}</button></section>`;
  }
  const c = state.cards.find(c => c.id === study.ids[study.index]);
  if (!c) { study.index++; return studyPage(); }
  const labels = { again:'Chưa nhớ', hard:'Khó', good:'Nhớ', easy:'Rất dễ' };
  return `${intro('MỖI LẦN NHỚ LẠI, MỘT LẦN VỮNG HƠN','Góc tập trung','Dành trọn một chút thời gian cho thẻ trước mắt.',false)}<section class="study-shell"><div class="study-top"><button class="text-link" data-action="end-study">${icon('close')} Kết thúc phiên</button><span>Thẻ ${study.index + 1} / ${study.ids.length}</span></div><div class="study-progress"><span data-progress="${study.index/study.ids.length*100}"></span></div><div class="study-card${study.flipped ? ' flipped' : ''}" id="study-card"><div class="study-card-inner"><div class="study-face" ${study.flipped ? 'inert aria-hidden="true"' : ''}><div class="study-face-top"><span class="service-label ${serviceClass(c.service)}">${icon(serviceIcon(c.service))}${esc(c.service)}</span><span>Câu hỏi</span></div><div class="study-question">${esc(c.question)}</div><div class="study-bottom-hint">Thử nhớ câu trả lời trước khi lật nhé.</div></div><div class="study-face study-back" ${!study.flipped ? 'inert aria-hidden="true"' : ''}><div class="study-face-top"><span class="service-label ${serviceClass(c.service)}">${icon(serviceIcon(c.service))}${esc(c.service)}</span><span>Đáp án</span></div><div class="study-answer">${esc(c.answer)}</div>${c.explanation ? `<div class="explanation"><strong>Hiểu thêm một chút</strong>${esc(c.explanation)}</div>` : ''}${sourceLink(c.source)}</div></div></div><div class="study-actions" id="study-actions">${study.flipped ? Object.entries(labels).map(([rating,label],i) => `<button class="rating ${rating}" data-action="rate" data-rating="${rating}" ${state.busy ? 'disabled' : ''}>${label}<span>${i+1} · ${intervalLabel(schedule(c,rating).interval)}</span></button>`).join('') : `<button class="btn" data-action="flip">${icon('flip')} Lật xem đáp án <kbd>Space</kbd></button>`}</div><div class="study-tools"><button data-action="note" data-id="${attr(c.id)}">${icon('note')} ${c.note ? 'Sửa ghi chú' : 'Thêm ghi chú'}</button><button data-action="favorite" data-id="${attr(c.id)}" aria-pressed="${c.favorite}">${icon('star')} ${c.favorite ? 'Đã yêu thích' : 'Yêu thích'}</button><button data-action="edit" data-id="${attr(c.id)}">${icon('edit')} Sửa thẻ</button></div>${c.note ? `<div class="study-note"><strong>GHI CHÚ CỦA BẠN</strong>${esc(c.note)}</div>` : ''}<p class="keyboard-hint">${study.flipped ? '<kbd>1</kbd> Chưa nhớ &nbsp; <kbd>2</kbd> Khó &nbsp; <kbd>3</kbd> Nhớ &nbsp; <kbd>4</kbd> Rất dễ' : '<kbd>Space</kbd> để lật thẻ'} · Tiến độ được lưu sau mỗi thẻ.</p></section>`;
}
function intervalLabel(days) { return days === 0 ? '10 phút' : `${days} ngày`; }
function sourceLink(source) {
  if (!source) return '';
  try { if (!['https:','http:'].includes(new URL(source).protocol)) return ''; } catch { return ''; }
  return `<a class="source-link" href="${attr(source)}" target="_blank" rel="noopener noreferrer">${icon('external')} Xem tài liệu nguồn</a>`;
}
function navigate(tab, reset = true) {
  state.tab = tab;
  if (reset) { state.query = ''; state.service = 'all'; state.filter = 'all'; }
  renderShell(); window.scrollTo({top:0});
}
function startStudy(type = 'due', service = 'all', limit = 20) {
  let cards = state.cards.filter(c => service === 'all' || c.service === service);
  if (type === 'due') cards = cards.filter(c => isDue(c)).sort((a,b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
  if (type === 'weak') cards = cards.sort((a,b) => a.repetitions - b.repetitions || Date.parse(a.dueAt) - Date.parse(b.dueAt));
  if (type === 'favorite') cards = cards.filter(c => c.favorite);
  if (!cards.length) { toast(type === 'due' ? 'Không có thẻ đến hạn trong chủ đề này. Thử luyện tập tự do nhé.' : 'Chưa có thẻ phù hợp với chế độ này.'); return; }
  state.study = { ids:(limit === 'all' ? cards : cards.slice(0,limit)).map(c => c.id), index:0, flipped:false, reviewed:0, startedAt:Date.now(), requestId:null };
  state.tab = 'review'; renderShell(); window.scrollTo({top:0});
}
function flip() {
  if (!state.study || state.study.flipped || state.study.index >= state.study.ids.length) return;
  state.study.flipped = true;
  $('#study-card').classList.add('flipped');
  const faces = $$('.study-face');
  faces[0].setAttribute('inert',''); faces[0].setAttribute('aria-hidden','true');
  faces[1].removeAttribute('inert'); faces[1].removeAttribute('aria-hidden');
  const c = state.cards.find(c => c.id === state.study.ids[state.study.index]);
  $('#study-actions').innerHTML = [['again','Chưa nhớ'],['hard','Khó'],['good','Nhớ'],['easy','Rất dễ']].map(([rating,label],i) => `<button class="rating ${rating}" data-action="rate" data-rating="${rating}">${label}<span>${i+1} · ${intervalLabel(schedule(c,rating).interval)}</span></button>`).join('');
  $('.keyboard-hint', $('#page')).innerHTML = '<kbd>1</kbd> Chưa nhớ &nbsp; <kbd>2</kbd> Khó &nbsp; <kbd>3</kbd> Nhớ &nbsp; <kbd>4</kbd> Rất dễ · Tiến độ được lưu sau mỗi thẻ.';
}
async function rate(rating) {
  const s = state.study;
  if (state.busy || !s?.flipped || s.index >= s.ids.length) return;
  state.busy = true;
  $$('.rating').forEach(b => b.disabled = true);
  const c = state.cards.find(c => c.id === s.ids[s.index]);
  s.requestId ||= crypto.randomUUID();
  try {
    if (state.session.mode === 'sheets') {
      const result = await request('/api/cards',{ action:'review',id:c.id,expectedVersion:c.updatedAt,rating,reviewId:s.requestId });
      state.cards = state.cards.map(x => x.id === c.id ? result.card : x);
      if (!state.reviews.some(r => r.id === result.review.id)) state.reviews.push(result.review);
    } else {
      const latest = readLocal(), current = latest.cards.find(x => x.id === c.id);
      if (!current || current.updatedAt !== c.updatedAt) throw new Error('Thẻ đã thay đổi ở tab khác. Tải lại dữ liệu trước khi ôn tiếp.');
      const updated = schedule(current,rating);
      commitLocal(latest.cards.map(x => x.id === c.id ? updated : x),[...latest.reviews,{ id:s.requestId,cardId:c.id,rating,at:updated.lastReviewedAt }]);
    }
    s.index++; s.reviewed++; s.flipped = false; s.requestId = null;
    state.busy = false; renderShell();
  } catch (error) { state.busy = false; $$('.rating').forEach(b => b.disabled = false); toast(error.message,true); }
}

function openModal(html) {
  focusBeforeModal = document.activeElement;
  const modal = $('#modal');
  modal.innerHTML = html;
  if (!modal.open) modal.showModal();
}
function closeModal() { $('#modal').close(); }
function modalHeader(title,subtitle = '') {
  return `<div class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle ? `<p>${subtitle}</p>` : ''}</div><button type="button" class="icon-button" data-action="close-modal" aria-label="Đóng">${icon('close')}</button></div>`;
}
function detail(id) {
  const c = state.cards.find(c => c.id === id);
  if (!c) return;
  openModal(`${modalHeader('Một thẻ, một kiến thức',mastery(c))}<div class="modal-body ${serviceClass(c.service)}"><span class="service-label">${icon(serviceIcon(c.service))}${esc(c.service)}</span><h3 class="detail-question">${esc(c.question)}</h3><div class="tags">${c.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div><p class="detail-label">Đáp án</p><div class="detail-answer">${esc(c.answer)}</div>${c.explanation ? `<p class="detail-label">Hiểu thêm một chút</p><div class="detail-answer">${esc(c.explanation)}</div>` : ''}${c.note ? `<div class="study-note"><strong>GHI CHÚ CỦA BẠN</strong>${esc(c.note)}</div>` : ''}${sourceLink(c.source)}</div><div class="modal-footer"><button class="btn btn-ghost" data-action="note" data-id="${attr(c.id)}">${icon('note')} Ghi chú</button><div class="right"><button class="btn btn-secondary" data-action="edit" data-id="${attr(c.id)}">${icon('edit')} Sửa thẻ</button><button class="btn" data-action="study-one" data-id="${attr(c.id)}">Ôn thẻ này ${icon('arrow')}</button></div></div>`);
}
function editor(id) {
  const existing = state.cards.find(c => c.id === id);
  const c = existing || {question:'',answer:'',explanation:'',service:'S3',tags:[...DEFAULT_TAGS],note:'',source:'',favorite:false};
  state.editor = { id:existing?.id || crypto.randomUUID(), updatedAt:existing?.updatedAt, existing:Boolean(existing), favorite:c.favorite };
  openModal(`<form id="card-form">${modalHeader(existing ? 'Chỉnh sửa flashcard' : 'Góp nhặt một kiến thức mới','Một câu hỏi rõ ràng sẽ giúp bạn nhớ tốt hơn.')}<div class="modal-body"><label class="form-field"><span>Câu hỏi <small>Bắt buộc</small></span><textarea name="question" id="question-input" placeholder="Ví dụ: Khi nào nên dùng S3 Lifecycle?" required maxlength="1000" rows="2" autofocus>${esc(c.question)}</textarea></label><div id="duplicate-results" aria-live="polite"></div><label class="form-field"><span>Đáp án ngắn gọn <small>Bắt buộc</small></span><textarea name="answer" placeholder="Viết điều quan trọng nhất bạn cần nhớ…" required maxlength="10000" rows="3">${esc(c.answer)}</textarea></label>${serviceField(c.service)}${tagsField(c.tags,c.service)}<label class="form-field"><span>Giải thích thêm <small>Không bắt buộc</small></span><textarea name="explanation" placeholder="Ví dụ, ngữ cảnh sử dụng hoặc điểm cần phân biệt…" maxlength="10000" rows="2">${esc(c.explanation)}</textarea></label><label class="form-field"><span>Ghi chú của bạn <small>Điều dễ nhầm, mẹo ghi nhớ</small></span><textarea name="note" placeholder="Ghi theo cách bạn dễ hiểu nhất…" maxlength="10000" rows="2">${esc(c.note)}</textarea></label><label class="form-field"><span>Link tài liệu nguồn</span><input name="source" type="url" value="${attr(c.source)}" placeholder="https://docs.aws.amazon.com/…" maxlength="2048"></label><p id="card-error" class="form-error" role="alert"></p></div><div class="modal-footer">${existing ? `<button type="button" class="icon-button" data-action="delete-confirm" data-id="${attr(c.id)}" aria-label="Xóa flashcard">${icon('trash')}</button>` : `<span class="subtitle">${icon('shield')} Chỉ dành cho bạn</span>`}<div class="right"><button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button><button class="btn" type="submit">${icon('check')} ${existing ? 'Lưu thay đổi' : 'Lưu flashcard'}</button></div></div></form>`);
  updateDuplicates();
}
function updateDuplicates() {
  const input = $('#question-input');
  if (!input) return;
  const matches = input.value.trim() ? duplicates(input.value,state.cards,state.editor.id).filter(m => m.score === 1 || input.value.trim().length > 8) : [];
  $('#duplicate-results').innerHTML = matches.length ? `<div class="duplicate-box"><strong>${icon('info')} Có thể bạn đã có thẻ tương tự</strong>${matches.map(({card,score}) => `<div class="duplicate-match"><span>${esc(card.question)} ${score === 1 ? '· Trùng câu hỏi' : ''}</span></div><details><summary>Xem đáp án hiện có</summary><p class="subtitle">${esc(card.answer)}</p></details>`).join('')}<label class="checkbox"><input type="checkbox" name="allowDuplicate"> Vẫn lưu thành một thẻ riêng</label></div>` : '';
}
function updateTagPicker() {
  const input = $('#tags-input');
  if (!input) return;
  const tags = parseTagInput(input.value), expanded = $('#more-tags')?.open;
  $('#tag-presets').innerHTML = tagChoices(tags,$('[name=service]', $('#card-form')).value);
  $('#more-tags').open = Boolean(expanded);
  $('#tag-count').textContent = `${tags.length}/${MAX_TAGS} nhãn`;
  $('#tag-count').classList.toggle('over-limit',tags.length > MAX_TAGS);
}
function toggleServicePanel(force) {
  const panel = $('#service-panel');
  if (!panel) return;
  const open = force ?? panel.hidden;
  panel.hidden = !open;
  $('#service-trigger').setAttribute('aria-expanded',String(open));
  if (open) {
    $('#service-search').value = '';
    $('#service-results').innerHTML = serviceResults($('[name=service]', $('#card-form')).value);
    $('#service-search').focus();
  }
}
function selectService(service) {
  const entry = getService(service);
  if (!entry) return;
  $('[name=service]', $('#card-form')).value = service;
  $('#service-selected-label').textContent = service;
  $('#service-selection-group').textContent = entry.groupLabel;
  toggleServicePanel(false);
  updateTagPicker();
  $('#service-trigger').focus({preventScroll:true});
}
function selectTag(tag) {
  try {
    const input = $('#tags-input');
    input.value = toggleTag(parseTagInput(input.value),tag).join(', ');
    updateTagPicker();
    const next = $$('[data-action=toggle-tag]', $('#tag-presets')).find(b => b.dataset.tag === tag && b.classList.contains('tag-choice') && !b.disabled);
    (next || input).focus({preventScroll:true});
  } catch (error) { toast(error.message,true); }
}
document.addEventListener('keydown',event => {
  const panel = $('#service-panel');
  if (!panel || panel.hidden || !event.target.closest('.service-picker')) return;
  if (event.key === 'Escape') {
    event.preventDefault(); toggleServicePanel(false); $('#service-trigger').focus(); return;
  }
  if (event.key === 'Enter' && event.target.id === 'service-search') {
    event.preventDefault();
    const first = $('.service-option.selected',panel) || $('.service-option',panel);
    if (first) selectService(first.dataset.service);
    return;
  }
  if (['Home','End'].includes(event.key) && event.target.id === 'service-search') return;
  if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
  const buttons = $$('.service-option',panel);
  if (!buttons.length) return;
  const index = buttons.indexOf(document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
    : index < 0 ? event.key === 'ArrowUp' ? buttons.length - 1 : 0
    : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
  event.preventDefault(); buttons[next].focus();
});
async function saveCard(event) {
  event.preventDefault();
  if (state.busy) return;
  const form = event.target, data = new FormData(form), info = state.editor;
  let card;
  try {
    card = validateCard({ question:data.get('question'),answer:data.get('answer'),explanation:data.get('explanation'),service:data.get('service'),tags:parseTagInput(data.get('tags') || ''),note:data.get('note'),source:data.get('source'),favorite:info.favorite });
    const exact = state.cards.some(c => c.id !== info.id && normalize(c.question) === normalize(card.question));
    if (exact && !data.get('allowDuplicate')) throw new Error('Câu hỏi đã tồn tại. Chọn “Vẫn lưu thành một thẻ riêng” nếu bạn muốn tiếp tục.');
  } catch (error) { $('#card-error').textContent = error.message; return; }
  state.busy = true; $('button[type=submit]',form).disabled = true;
  try {
    await mutateCard(info.existing ? 'update' : 'create',info.id,card,Boolean(data.get('allowDuplicate')),info.updatedAt);
    closeModal(); renderShell(); toast(info.existing ? 'Đã lưu thay đổi.' : 'Đã thêm một kiến thức mới.');
  } catch (error) { if ($('#card-error')) $('#card-error').textContent = error.message; }
  finally { state.busy = false; if (form.isConnected) $('button[type=submit]',form).disabled = false; }
}
async function mutateCard(action,id,input,allowDuplicate = false,expectedVersion) {
  const existing = state.cards.find(c => c.id === id);
  const version = expectedVersion || existing?.updatedAt;
  if (state.session.mode === 'sheets') {
    const result = await request('/api/cards',{ action,id,card:input,allowDuplicate,expectedVersion:version });
    if (action === 'delete') state.cards = state.cards.filter(c => c.id !== id);
    else if (action === 'create') { if (!state.cards.some(c => c.id === id)) state.cards.unshift(result.card); }
    else state.cards = state.cards.map(c => c.id === id ? result.card : c);
  } else {
    const latest = readLocal(), record = latest.cards.find(c => c.id === id);
    if (action !== 'create' && (!record || record.updatedAt !== version)) throw new Error('Thẻ đã thay đổi ở tab khác. Tải lại dữ liệu trước khi lưu.');
    if (action === 'delete') commitLocal(latest.cards.filter(c => c.id !== id),latest.reviews);
    else {
      if (!allowDuplicate && latest.cards.some(c => c.id !== id && normalize(c.question) === normalize(input.question))) throw new Error('Câu hỏi này đã tồn tại.');
      const c = action === 'create' ? createCard(input,id) : { ...record,...validateCard(input),updatedAt:new Date().toISOString() };
      commitLocal(action === 'create' ? [c,...latest.cards.filter(x => x.id !== id)] : latest.cards.map(x => x.id === id ? c : x),latest.reviews);
    }
  }
}
async function toggleFavorite(id) {
  if (state.busy) return;
  const c = state.cards.find(c => c.id === id);
  if (!c) return;
  state.busy = true;
  try { await mutateCard('update',id,{...c,favorite:!c.favorite},true); renderShell(); }
  catch (error) { toast(error.message,true); }
  finally { state.busy = false; }
}
function noteModal(id) {
  const c = state.cards.find(c => c.id === id);
  if (!c) return;
  state.noteCard = {id,updatedAt:c.updatedAt};
  openModal(`<form id="note-form">${modalHeader('Ghi lại theo cách của bạn',c.service)}<div class="modal-body"><h3 class="detail-question">${esc(c.question)}</h3><label class="form-field"><span>Ghi chú cá nhân</span><textarea name="note" rows="7" maxlength="10000" autofocus placeholder="Mẹo ghi nhớ, điều dễ nhầm, ví dụ của riêng bạn…">${esc(c.note)}</textarea></label><p class="form-error" id="note-error" role="alert"></p></div><div class="modal-footer"><div class="right"><button type="button" class="btn btn-secondary" data-action="close-modal">Hủy</button><button type="submit" class="btn">${icon('check')} Lưu ghi chú</button></div></div></form>`);
}
async function saveNote(event) {
  event.preventDefault(); if (state.busy) return;
  const form = event.target, c = state.cards.find(c => c.id === state.noteCard.id);
  state.busy = true; $('button[type=submit]',form).disabled = true;
  try {
    await mutateCard('update',c.id,{...c,note:new FormData(form).get('note')},true,state.noteCard.updatedAt);
    closeModal(); renderShell(); toast('Đã lưu ghi chú của bạn.');
  } catch (error) { if ($('#note-error')) $('#note-error').textContent = error.message; }
  finally { state.busy = false; if (form.isConnected) $('button[type=submit]',form).disabled = false; }
}
function deleteConfirm(id) {
  const c = state.cards.find(c => c.id === id);
  if (!c) return;
  openModal(`${modalHeader('Xóa flashcard này?')}<div class="modal-body"><p class="detail-answer">${esc(c.question)}</p><p class="subtitle">Thẻ và ghi chú đi kèm sẽ bị xóa. Bạn có thể xuất bản sao dữ liệu trong Cài đặt trước.</p><p id="delete-error" class="form-error" role="alert"></p></div><div class="modal-footer"><div class="right"><button class="btn btn-secondary" data-action="edit" data-id="${attr(id)}">Quay lại</button><button class="btn btn-danger" data-action="delete" data-id="${attr(id)}">${icon('trash')} Xóa thẻ</button></div></div>`);
}
function settings() {
  const cloud = state.session.mode === 'sheets';
  openModal(`${modalHeader('Không gian theo cách của bạn','Giao diện, kết nối và dữ liệu.')}<div class="modal-body"><section class="settings-section"><h3>Giao diện</h3><label class="switch-row">Giao diện sáng<input type="checkbox" id="theme-toggle" ${document.documentElement.dataset.theme === 'light' ? 'checked' : ''}></label><label class="switch-row">Giảm hiệu ứng chuyển động<input type="checkbox" id="motion-toggle" ${state.prefs.reduceMotion ? 'checked' : ''}></label></section><section class="settings-section"><h3>Nơi lưu trữ</h3><div class="settings-status"><span class="status-dot${cloud ? ' connected' : ''}"></span>${cloud ? 'Đã kết nối Google Sheets' : 'Bản thử · Lưu trên trình duyệt này'}</div><p>${cloud ? 'Flashcard, ghi chú và tiến độ được lưu vào Google Sheets của bạn sau mỗi thao tác thành công.' : 'Bạn có thể dùng thử mọi tính năng ngay. Dữ liệu hiện chỉ có trên trình duyệt này; hãy xuất bản sao để chuyển máy hoặc trước khi xóa dữ liệu trình duyệt.'}</p>${!cloud ? `${connectionGuide()}` : ''}</section><section class="settings-section"><h3>Dữ liệu của bạn</h3><p>${state.cards.length} flashcard · ${state.reviews.length} lượt ôn tập. File xuất bao gồm nội dung, ghi chú và tiến độ.</p><p>${cloud ? 'Nhập file sẽ thêm thẻ mới, bỏ qua thẻ trùng và bắt đầu lịch ôn mới cho thẻ được nhập. Tiến độ hiện có trên Sheets được giữ nguyên.' : 'Nhập file sẽ thêm thẻ mới kèm tiến độ, bỏ qua thẻ trùng ID hoặc câu hỏi. Dữ liệu hiện có được giữ nguyên.'}</p><div class="settings-actions"><button class="btn btn-secondary" data-action="export">${icon('download')} Xuất JSON</button><button class="btn btn-secondary" data-action="import">${icon('upload')} Nhập JSON</button>${state.session.oauthAvailable ? reconnectButton() : ''}<button class="btn btn-secondary" data-action="reload">${icon('refresh')} Tải lại</button></div><input class="file-input" type="file" accept=".json,application/json" id="import-file"></section>${state.session.authEnabled ? `<section class="settings-section"><button class="btn btn-ghost" data-action="logout">${icon('logout')} Đăng xuất</button></section>` : ''}</div><div class="modal-footer"><span class="subtitle">AWS Recall · Học theo nhịp của bạn.</span><button class="btn btn-secondary" data-action="close-modal">Xong</button></div>`);
}
function connectionGuide() {
  return `<details><summary>Cách kết nối Google Sheets</summary><p><strong>Với file OAuth web client:</strong> điền Client ID và Client Secret vào môi trường cục bộ, chạy <code>npm run google:connect</code>, đăng nhập Google và cấp quyền. Công cụ sẽ lưu refresh token.</p><p>Điền <code>GOOGLE_SHEET_ID</code>, <code>APP_PASSWORD</code> và <code>SESSION_SECRET</code>; khởi động lại app. Khi deploy, thêm các biến vào Vercel. Xem README để làm từng bước.</p><p><strong>Hoặc dùng Service Account:</strong> bật Google Sheets API, chia sẻ Sheet cho email Service Account quyền Editor, rồi điền <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> và <code>GOOGLE_PRIVATE_KEY</code> thay thông tin OAuth.</p><p>Xuất JSON trước khi chuyển dữ liệu từ demo sang Sheets, rồi nhập lại sau khi đăng nhập.</p></details>`;
}
function exportData() {
  const blob = new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),cards:state.cards,reviews:state.reviews},null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `aws-recall-${localDate()}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url),1000); toast('Đã xuất bản sao dữ liệu.');
}
async function importData(data) {
  const valid = validateImport(data);
  if (state.session.mode === 'sheets') {
    const result = await request('/api/cards',{action:'import',data:{version:1,...valid}});
    state.cards = result.cards; state.reviews = result.reviews;
    return result.imported;
  }
  const latest = readLocal(), ids = new Set(latest.cards.map(c => c.id)), questions = new Set(latest.cards.map(c => normalize(c.question)));
  const added = valid.cards.filter(c => {
    const question = normalize(c.question);
    if (ids.has(c.id) || questions.has(question)) return false;
    ids.add(c.id); questions.add(question); return true;
  });
  const newIds = new Set(added.map(c => c.id)), reviewIds = new Set(latest.reviews.map(r => r.id));
  const reviews = valid.reviews.filter(r => newIds.has(r.cardId) && !reviewIds.has(r.id));
  const cards = [...latest.cards,...added];
  if (cards.length > 3000 || latest.reviews.length + reviews.length > 100000) throw new Error('Bản thử hỗ trợ tối đa 3.000 thẻ và 100.000 lượt ôn.');
  commitLocal(cards,[...latest.reviews,...reviews]); return added.length;
}

document.addEventListener('click',async event => {
  if ($('#service-panel') && !$('#service-panel').hidden && !event.target.closest('.service-picker')) toggleServicePanel(false);
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const { action,id,tab } = button.dataset;
  if (state.busy && !['close-menu','menu'].includes(action)) return;
  if (action === 'navigate') navigate(tab);
  else if (action === 'navigate-library') navigate('library');
  else if (action === 'new') editor();
  else if (action === 'service-picker') toggleServicePanel();
  else if (action === 'select-service') selectService(button.dataset.service);
  else if (action === 'toggle-tag') selectTag(button.dataset.tag);
  else if (action === 'edit') editor(id);
  else if (action === 'detail') detail(id);
  else if (action === 'note') noteModal(id);
  else if (action === 'favorite') await toggleFavorite(id);
  else if (action === 'close-modal') closeModal();
  else if (action === 'connect-google') { state.busy = true; button.disabled = true; window.location.assign('/api/auth/google'); }
  else if (action === 'theme') setTheme();
  else if (action === 'menu') { $('.sidebar').classList.add('open'); $('.mobile-overlay').classList.add('visible'); }
  else if (action === 'close-menu') { $('.sidebar').classList.remove('open'); $('.mobile-overlay').classList.remove('visible'); }
  else if (action === 'settings') settings();
  else if (action === 'filter') { state.filter = button.dataset.filter; renderPage(); }
  else if (action === 'view') { state.view = button.dataset.view; renderPage(); }
  else if (action === 'clear-filters') { state.query = ''; state.filter = 'all'; state.service = 'all'; renderPage(); }
  else if (action === 'deck') { navigate('library'); state.service = button.dataset.service; renderPage(); }
  else if (action === 'quick-study') startStudy(dueCards().length ? 'due' : 'all','all',10);
  else if (action === 'start-study') startStudy(button.dataset.type,$('#study-service')?.value || 'all',$('#study-limit')?.value || 20);
  else if (action === 'study-one') { closeModal(); state.study = { ids:[id],index:0,flipped:false,reviewed:0,startedAt:Date.now(),requestId:null }; navigate('review'); }
  else if (action === 'flip') flip();
  else if (action === 'rate') await rate(button.dataset.rating);
  else if (action === 'finish-study') { state.study = null; navigate('home'); }
  else if (action === 'study-again' || action === 'end-study') {
    if (action === 'end-study' && state.study?.reviewed) toast(`Đã lưu ${state.study.reviewed} lượt ôn. Hẹn bạn lần tới!`);
    state.study = null; renderPage();
  }
  else if (action === 'export') exportData();
  else if (action === 'import') $('#import-file').click();
  else if (action === 'reload') {
    state.busy = true; button.disabled = true;
    try { await loadData(); closeModal(); renderShell(); toast('Đã tải lại dữ liệu.'); }
    catch (error) { toast(error.message,true); }
    finally { state.busy = false; if (button.isConnected) button.disabled = false; }
  }
  else if (action === 'seed') {
    state.busy = true; button.disabled = true;
    try { const count = await importData({version:1,cards:seedCards(),reviews:[]}); renderShell(); toast(`Đã thêm ${count} thẻ mẫu.`); }
    catch (error) { toast(error.message,true); }
    finally { state.busy = false; if (button.isConnected) button.disabled = false; }
  }
  else if (action === 'delete-confirm') deleteConfirm(id);
  else if (action === 'delete') {
    state.busy = true; button.disabled = true;
    try { await mutateCard('delete',id); closeModal(); renderShell(); toast('Đã xóa flashcard.'); }
    catch (error) { if ($('#delete-error')) $('#delete-error').textContent = error.message; }
    finally { state.busy = false; if (button.isConnected) button.disabled = false; }
  }
  else if (action === 'logout') {
    try { await request('/api/session',undefined,'DELETE'); closeModal(); state.cards = []; state.reviews = []; state.study = null; state.session.authenticated = false; renderLogin(); }
    catch (error) { toast(error.message,true); }
  }
  else if (action === 'retry') await boot();
});
document.addEventListener('input',event => {
  if (event.target.id === 'tags-input') updateTagPicker();
  if (event.target.id === 'service-search') $('#service-results').innerHTML = serviceResults($('[name=service]', $('#card-form')).value,event.target.value);
  if (event.target.id === 'question-input') updateDuplicates();
  if (event.target.id === 'search-input') {
    const value = event.target.value, pos = event.target.selectionStart;
    state.query = value; renderPage();
    const input = $('#search-input'); input.focus();
    if (input.type !== 'search') input.setSelectionRange(pos,pos);
  }
});
document.addEventListener('change',async event => {
  const input = event.target;
  if (input.id === 'service-filter') { state.service = input.value; renderPage(); }
  if (input.id === 'theme-toggle') setTheme();
  if (input.id === 'motion-toggle') { state.prefs.reduceMotion = input.checked; document.documentElement.dataset.reduceMotion = String(input.checked); savePrefs(); }
  if (input.id === 'import-file' && input.files[0]) {
    if (state.busy) return;
    state.busy = true;
    try {
      if (input.files[0].size > 1000000) throw new Error('Chọn file JSON nhỏ hơn 1 MB.');
      const count = await importData(JSON.parse(await input.files[0].text()));
      closeModal(); renderShell(); toast(`Đã nhập ${count} thẻ mới. Các thẻ trùng được bỏ qua.`);
    } catch (error) { toast(error.message,true); }
    finally { state.busy = false; input.value = ''; }
  }
});
document.addEventListener('submit',async event => {
  if (event.target.id === 'card-form') return saveCard(event);
  if (event.target.id === 'note-form') return saveNote(event);
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  if (state.busy) return;
  state.busy = true;
  const button = $('button[type=submit]',event.target); button.disabled = true;
  try {
    await request('/api/session',{password:new FormData(event.target).get('password')});
    state.session = await request('/api/session'); if (!state.session.ready) renderGoogleConnect(); else { await loadData(); renderShell(); }
  } catch (error) { if ($('#login-error')) $('#login-error').textContent = error.message; }
  finally { state.busy = false; button.disabled = false; }
});
document.addEventListener('keydown',event => {
  if ($('#modal').open || event.target.closest('input,textarea,select,[contenteditable]') || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (event.key === '/') { event.preventDefault(); if (state.tab !== 'library' && state.tab !== 'notes') navigate('library'); $('#search-input')?.focus(); }
  if (state.tab === 'review' && state.study) {
    if (event.code === 'Space' && !state.study.flipped) { event.preventDefault(); flip(); }
    else if (['1','2','3','4'].includes(event.key) && state.study.flipped) { event.preventDefault(); rate(['again','hard','good','easy'][Number(event.key)-1]); }
  }
});
$('#modal').addEventListener('close',() => { state.editor = null; state.noteCard = null; if (focusBeforeModal?.isConnected) focusBeforeModal.focus(); });
$('#modal').addEventListener('cancel',event => { if (state.busy) event.preventDefault(); });
window.addEventListener('storage',event => {
  if (event.key !== STORAGE || state.session?.mode !== 'demo' || state.busy) return;
  if ($('#modal').open) { toast('Dữ liệu đã thay đổi ở tab khác. Đóng cửa sổ và tải lại trước khi lưu.',true); return; }
  try { const data = readLocal(); state.cards = data.cards; state.reviews = data.reviews; if ($('#page')) renderShell(); }
  catch { toast('Không đọc được dữ liệu từ tab khác.',true); }
});
boot();
