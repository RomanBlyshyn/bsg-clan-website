// ============================================================
//  АДМІНКА: вхід, заявки, редагування контенту, користувачі.
//  Права перевіряє сама база (RLS у supabase/schema.sql),
//  тут лише показуємо те, що дозволено.
// ============================================================

const sb = HAS_DB ? supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey) : null;
const $ = id => document.getElementById(id);
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = iso => new Date(iso).toLocaleString("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const ROLE_LABEL = { owner: "власник", admin: "адмін", user: "без доступу" };
const VIEWS = ["setup", "auth", "pending", "app"];
const showView = id => VIEWS.forEach(v => ($(v).hidden = v !== id));

let me = null;          // профіль поточного користувача
let currentTab = "apps";

// ---------- Вхід / реєстрація ----------
let authMode = "login";

function setAuthMode(mode) {
  authMode = mode;
  const signup = mode === "signup";
  $("auth-title").textContent = signup ? "Реєстрація" : "Вхід";
  $("auth-submit").textContent = signup ? "Створити акаунт" : "Увійти";
  $("auth-switch-text").textContent = signup ? "Вже є акаунт?" : "Ще нема акаунта?";
  $("auth-switch").textContent = signup ? "Увійти" : "Зареєструватися";
  $("auth-form").password.autocomplete = signup ? "new-password" : "current-password";
  authMsg("");
}

function authMsg(text, cls = "err") {
  $("auth-status").textContent = text;
  $("auth-status").className = `form-status ${cls}`;
}

function setupAuth() {
  $("auth-switch").addEventListener("click", () => setAuthMode(authMode === "login" ? "signup" : "login"));
  $("auth-form").addEventListener("submit", async e => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    $("auth-submit").disabled = true;
    try {
      if (authMode === "signup") {
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) authMsg("Готово! Підтверди пошту (лист уже надіслано), потім увійди.", "ok");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      authMsg(/invalid login/i.test(err.message) ? "Неправильна пошта або пароль." :
              /not confirmed/i.test(err.message) ? "Спочатку підтверди пошту (перевір лист)." : err.message);
    } finally {
      $("auth-submit").disabled = false;
    }
  });
  $("logout").addEventListener("click", async () => {
    if (isDirty() && !confirm("Є незбережені зміни. Все одно вийти?")) return;
    await sb.auth.signOut();
  });
}

async function route() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    me = null;
    $("who").hidden = true;
    return showView("auth");
  }
  const { data } = await sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
  me = data;
  $("who").hidden = false;
  $("who-email").textContent = session.user.email;
  const role = (me && me.role) || "user";
  $("who-role").textContent = ROLE_LABEL[role];
  $("who-role").className = `role-chip ${role}`;
  if (role === "user") return showView("pending");

  showView("app");
  $("tab-users-btn").hidden = role !== "owner";
  openTab(currentTab === "users" && role !== "owner" ? "apps" : currentTab);
  refreshAppsBadge();
}

// ---------- Вкладки ----------
function openTab(tab) {
  currentTab = tab;
  document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === tab));
  ["apps", "content", "users"].forEach(t => ($(`tab-${t}`).hidden = t !== tab));
  if (tab === "apps") loadApps();
  if (tab === "content" && !draft) loadContent();
  if (tab === "users") loadUsers();
}

// ---------- Заявки ----------
const linkify = text =>
  esc(text).replace(/https?:\/\/[^\s,;]+/g, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);

async function refreshAppsBadge() {
  const { count } = await sb.from("applications").select("id", { count: "exact", head: true }).eq("status", "new");
  $("apps-badge").textContent = count || "";
  $("apps-badge").hidden = !count;
}

async function loadApps() {
  const list = $("apps-list");
  let q = sb.from("applications").select("*").order("created_at", { ascending: false });
  if ($("apps-only-new").checked) q = q.eq("status", "new");
  const { data, error } = await q;
  if (error) { list.innerHTML = `<p class="empty-note">Помилка: ${esc(error.message)}</p>`; return; }
  if (!data.length) { list.innerHTML = `<p class="empty-note">Заявок поки нема.</p>`; return; }
  list.innerHTML = data.map(a => `
    <article class="app-card ${a.status === "new" ? "new" : ""}">
      <div class="app-top">
        <h3>${esc(a.name)}</h3>
        <span class="app-meta">${fmt(a.created_at)} · ${esc((a.lang || "").toUpperCase())}${a.status === "new" ? " · <b style='color:var(--accent)'>нова</b>" : ""}</span>
      </div>
      <div class="app-row"><b>Контакт</b>${linkify(a.contact)}</div>
      <div class="app-row"><b>Треки</b>${linkify(a.tracks)}</div>
      ${a.about ? `<div class="app-row"><b>Про себе</b>${linkify(a.about)}</div>` : ""}
      <div class="app-actions">
        ${a.status === "new"
          ? `<button class="btn-mini" data-app-seen="${a.id}">Позначити переглянутою</button>`
          : `<button class="btn-mini" data-app-new="${a.id}">Повернути в нові</button>`}
        <button class="btn-mini danger" data-app-del="${a.id}">Видалити</button>
      </div>
    </article>`).join("");
}

function setupApps() {
  $("apps-only-new").addEventListener("change", loadApps);
  $("apps-list").addEventListener("click", async e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.appSeen) await sb.from("applications").update({ status: "seen" }).eq("id", b.dataset.appSeen);
    else if (b.dataset.appNew) await sb.from("applications").update({ status: "new" }).eq("id", b.dataset.appNew);
    else if (b.dataset.appDel) {
      if (!confirm("Видалити заявку назавжди?")) return;
      await sb.from("applications").delete().eq("id", b.dataset.appDel);
    } else return;
    loadApps();
    refreshAppsBadge();
  });
}

// ---------- Користувачі (тільки власник) ----------
async function loadUsers() {
  const list = $("users-list");
  const { data, error } = await sb.from("profiles").select("*").order("created_at");
  if (error) { list.innerHTML = `<p class="empty-note">Помилка: ${esc(error.message)}</p>`; return; }
  list.innerHTML = data.map(u => {
    const self = me && u.id === me.id;
    const action = u.role === "owner" ? ""
      : u.role === "admin"
        ? `<button class="btn-mini danger" data-role="user" data-uid="${u.id}">Забрати адмінку</button>`
        : `<button class="btn-mini" data-role="admin" data-uid="${u.id}">Зробити адміном</button>`;
    return `
      <div class="user-row">
        <div><div class="email">${esc(u.email || "—")}${self ? " (ти)" : ""}</div><div class="date">з ${fmt(u.created_at)}</div></div>
        <span class="role-chip ${u.role}">${ROLE_LABEL[u.role]}</span>
        <div>${action}</div>
      </div>`;
  }).join("");
}

function setupUsers() {
  $("users-list").addEventListener("click", async e => {
    const b = e.target.closest("[data-uid]");
    if (!b) return;
    const toAdmin = b.dataset.role === "admin";
    if (!confirm(toAdmin ? "Дати цьому акаунту права адміна?" : "Забрати права адміна?")) return;
    const { error } = await sb.from("profiles").update({ role: b.dataset.role }).eq("id", b.dataset.uid);
    if (error) alert(`Не вдалося: ${error.message}`);
    loadUsers();
  });
}

// ---------- Редактор контенту ----------
// Підпис розробника тут навмисно відсутній: він вшитий у app.js і через адмінку не редагується.
const LANGS_ED = [["uk", "UA"], ["ru", "RU"], ["pl", "PL"], ["en", "EN"]];
const PLATFORM_FIELDS = [
  ["bandlink", "band.link (усі платформи)"], ["spotify", "Spotify"], ["apple", "Apple Music"], ["youtube", "YouTube"],
  ["soundcloud", "SoundCloud"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["telegram", "Telegram"]
];
const emptyMl = () => ({ uk: "", ru: "", pl: "", en: "" });

const SCHEMA = [
  { key: "tagline", label: "Слоган під лого", type: "ml", multiline: true },
  { key: "heroPhoto", label: "Фото на першому екрані", type: "image" },
  { key: "ticker", label: "Біжуча стрічка", type: "strings", hint: "Кожен рядок — окремий пункт." },
  { type: "group", label: "Контакти організаторів", inline: true, fields: [
    { key: "instagram", label: "Instagram (нік без @)", type: "text" },
    { key: "telegram", label: "Telegram (нік без @)", type: "text" },
    { key: "telegramName", label: "Ім'я біля Telegram", type: "ml" },
    { key: "listen", label: "Посилання «Слухати»", type: "text" }
  ] },
  { key: "announcement", label: "Анонс наступного концерту", type: "group", fields: [
    { key: "show", label: "Показувати анонс на сайті", type: "bool" },
    { key: "badge", label: "Плашка (напр. «Концерт #8»)", type: "ml" },
    { key: "title", label: "Назва", type: "text" },
    { key: "date", label: "Дата і час", type: "date" },
    { key: "city", label: "Місто", type: "text" },
    { key: "venue", label: "Місце / адреса", type: "text" },
    { key: "price", label: "Вхід / ціна", type: "ml" },
    { key: "photo", label: "Афіша", type: "image" },
    { key: "text", label: "Опис", type: "ml", multiline: true },
    { key: "performTitle", label: "Заголовок «Хочеш виступити?»", type: "ml" },
    { key: "performText", label: "Текст над формою заявки", type: "ml", multiline: true }
  ] },
  { key: "concerts", label: "Концерти", type: "list", itemTitle: v => `${v.title || "Новий концерт"}${v.date ? ` · ${v.date.slice(0, 10)}` : ""}`,
    newItem: () => ({ title: "", date: "", city: "Wrocław", venue: "", price: "", photos: [] }), fields: [
    { key: "title", label: "Назва", type: "text" },
    { key: "date", label: "Дата і час", type: "date" },
    { key: "city", label: "Місто", type: "text" },
    { key: "venue", label: "Місце / адреса", type: "text" },
    { key: "price", label: "Вхід / ціна", type: "ml" },
    { key: "photos", label: "Фото (перше — афіша на картці)", type: "images" }
  ] },
  { key: "artists", label: "Артисти", type: "list", itemTitle: v => v.name || "Новий артист",
    newItem: () => ({ name: "", photo: "", bio: emptyMl(), links: {} }), fields: [
    { key: "name", label: "Ім'я", type: "text" },
    { key: "photo", label: "Фото", type: "image" },
    { key: "bio", label: "Біографія", type: "ml", multiline: true },
    { key: "links", label: "Посилання", type: "group", inline: true,
      fields: PLATFORM_FIELDS.map(([key, label]) => ({ key, label, type: "text" })) }
  ] },
  { key: "studio", label: "Студія", type: "group", fields: [
    { key: "name", label: "Назва", type: "text" },
    { key: "text", label: "Опис", type: "ml", multiline: true },
    { key: "services", label: "Послуги", type: "mllines", hint: "Кожен рядок — окрема послуга." },
    { key: "address", label: "Адреса", type: "text" },
    { key: "instagram", label: "Instagram студії (нік без @)", type: "text" },
    { key: "telegram", label: "Telegram студії (нік без @)", type: "text" },
    { key: "telegramName", label: "Ім'я біля Telegram", type: "text" },
    { key: "photos", label: "Фото студії (поки порожньо — анімований банер)", type: "images" },
    { key: "works", label: "Приклади робіт", type: "list", itemTitle: v => v.title || "Новий трек",
      newItem: () => ({ title: "", url: "" }), fields: [
      { key: "title", label: "Назва", type: "text" },
      { key: "url", label: "Посилання", type: "text" }
    ] }
  ] }
];

let draft = null;       // те, що редагуємо
let savedJson = "";     // останнє збережене (для "є зміни")
const openSet = new Set();
const listDefs = {};    // шлях списку → опис полів (для кнопки "Додати")

const getAt = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
function setAt(obj, path, val) {
  const ks = path.split(".");
  let o = obj;
  ks.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== "object") o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    o = o[k];
  });
  o[ks[ks.length - 1]] = val;
}
const join = (base, key) => (base ? `${base}.${key}` : key);
const isDirty = () => draft !== null && JSON.stringify(draft) !== savedJson;

function asMl(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) return { ...emptyMl(), ...v };
  return { ...emptyMl(), uk: v || "" };
}

// Значення для <input type=datetime-local>
const toLocalInput = v => (!v ? "" : v.includes("T") ? v.slice(0, 16) : `${v}T00:00`);

function imageField(path, val, extraBtns = "") {
  const src = val || "";
  return `
    <div class="img-field">
      <div class="img-prev">${src ? `<img src="${esc(src)}" alt="">` : "нема"}</div>
      <input type="text" data-path="${path}" data-kind="text" value="${esc(src)}" placeholder="img/фото.jpg або https://…">
      <label class="btn-mini">Завантажити<input type="file" accept="image/*" data-upload="${path}" hidden></label>
      ${extraBtns}
    </div>`;
}

function renderField(f, base) {
  const path = join(base, f.key);
  const val = getAt(draft, path);
  const hint = f.hint ? `<span class="hint">${esc(f.hint)}</span>` : "";

  switch (f.type) {
    case "text":
      return `<label class="field"><span class="lbl">${esc(f.label)}</span>
        <input type="text" data-path="${path}" data-kind="text" value="${esc(val || "")}">${hint}</label>`;
    case "bool":
      return `<label class="check"><input type="checkbox" data-path="${path}" data-kind="bool" ${val ? "checked" : ""}> ${esc(f.label)}</label>`;
    case "date":
      return `<label class="field"><span class="lbl">${esc(f.label)}</span>
        <input type="datetime-local" data-path="${path}" data-kind="date" value="${esc(toLocalInput(val))}">
        <span class="hint">Час 00:00 = час не показується.</span></label>`;
    case "ml": {
      const ml = asMl(val);
      const tag = f.multiline ? "textarea" : "input";
      return `<div class="field"><span class="lbl">${esc(f.label)}</span><div class="ml">${LANGS_ED.map(([l, lab]) =>
        `<label class="ml-item"><span>${lab}</span>${tag === "textarea"
          ? `<textarea rows="3" data-path="${path}" data-kind="ml" data-lang="${l}">${esc(ml[l])}</textarea>`
          : `<input type="text" data-path="${path}" data-kind="ml" data-lang="${l}" value="${esc(ml[l])}">`}</label>`).join("")}
        </div>${hint}</div>`;
    }
    case "mllines": {
      const ml = (val && typeof val === "object" && !Array.isArray(val)) ? val : { uk: Array.isArray(val) ? val : [] };
      return `<div class="field"><span class="lbl">${esc(f.label)}</span><div class="ml">${LANGS_ED.map(([l, lab]) =>
        `<label class="ml-item"><span>${lab}</span><textarea rows="4" data-path="${path}" data-kind="mllines" data-lang="${l}">${esc((ml[l] || []).join("\n"))}</textarea></label>`).join("")}
        </div>${hint}</div>`;
    }
    case "strings":
      return `<label class="field"><span class="lbl">${esc(f.label)}</span>
        <textarea rows="3" data-path="${path}" data-kind="strings">${esc((val || []).join("\n"))}</textarea>${hint}</label>`;
    case "image":
      return `<div class="field"><span class="lbl">${esc(f.label)}</span>${imageField(path, val)}</div>`;
    case "images": {
      const arr = val || [];
      return `<div class="field"><span class="lbl">${esc(f.label)}</span><div class="img-list">
        ${arr.map((p, i) => imageField(join(path, i), p,
          `<button type="button" class="icon-btn danger" data-act="del" data-path="${path}" data-idx="${i}" title="Прибрати">✕</button>`)).join("")}
        <button type="button" class="btn-mini add" data-act="add-img" data-path="${path}">+ Додати фото</button>
      </div></div>`;
    }
    case "group": {
      const inner = f.fields.map(sf => renderField(sf, f.key ? path : base)).join("");
      return `<fieldset><legend>${esc(f.label)}</legend>${inner}</fieldset>`;
    }
    case "list": {
      listDefs[path] = f;
      const arr = val || [];
      const items = arr.map((item, i) => {
        const ip = join(path, i);
        return `
          <details data-open-key="${ip}" ${openSet.has(ip) ? "open" : ""}>
            <summary><span class="summary-title">${esc(f.itemTitle(item))}</span>
              <span class="item-tools">
                <button type="button" class="icon-btn" data-act="up" data-path="${path}" data-idx="${i}" title="Вище">↑</button>
                <button type="button" class="icon-btn" data-act="down" data-path="${path}" data-idx="${i}" title="Нижче">↓</button>
                <button type="button" class="icon-btn danger" data-act="del-item" data-path="${path}" data-idx="${i}" title="Видалити">✕</button>
              </span></summary>
            <div class="item-body">${f.fields.map(sf => renderField(sf, ip)).join("")}</div>
          </details>`;
      }).join("");
      return `<fieldset><legend>${esc(f.label)}</legend>${items}
        <button type="button" class="btn-mini add" data-act="add-item" data-path="${path}">+ Додати</button></fieldset>`;
    }
  }
  return "";
}

function renderEditor() {
  $("editor").innerHTML = SCHEMA.map(f => renderField(f, "")).join("");
  updateSaveState();
}

function updateSaveState() {
  const dirty = isDirty();
  $("save").disabled = !dirty;
  $("revert").disabled = !dirty;
  const st = $("save-status");
  if (dirty) { st.textContent = "Є незбережені зміни"; st.className = "dirty"; }
  else if (!st.dataset.keep) { st.textContent = "Усе збережено"; st.className = ""; }
  delete st.dataset.keep;
}

async function loadContent() {
  $("editor").innerHTML = `<p class="empty-note">Завантаження…</p>`;
  const { data, error } = await sb.from("content").select("data, updated_at").eq("id", "site").maybeSingle();
  if (error) { $("editor").innerHTML = `<p class="empty-note">Помилка: ${esc(error.message)}</p>`; return; }
  const base = data && data.data ? data.data : structuredClone(SITE);
  $("content-info").textContent = data
    ? `Останнє збереження: ${fmt(data.updated_at)}`
    : "У базі ще пусто — показано вміст із data.js. Натисни «Зберегти», щоб перенести його в базу.";
  savedJson = data ? JSON.stringify(base) : "";
  draft = structuredClone(base);
  renderEditor();
}

async function saveContent() {
  $("save").disabled = true;
  const { error } = await sb.from("content").upsert({
    id: "site", data: draft, updated_at: new Date().toISOString(), updated_by: me.id
  });
  const st = $("save-status");
  if (error) {
    st.textContent = `Не збережено: ${error.message}`;
    st.className = "dirty";
    $("save").disabled = false;
    return;
  }
  savedJson = JSON.stringify(draft);
  $("content-info").textContent = `Останнє збереження: ${fmt(new Date().toISOString())}`;
  st.textContent = "Збережено ✓ Зміни вже на сайті.";
  st.className = "";
  st.dataset.keep = "1";
  updateSaveState();
}

async function uploadImage(path, file) {
  const st = $("save-status");
  st.textContent = "Завантажую фото…";
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from("media").upload(name, file, { cacheControl: "31536000", contentType: file.type });
  if (error) { st.textContent = `Фото не завантажилось: ${error.message}`; st.className = "dirty"; return; }
  const { data } = sb.storage.from("media").getPublicUrl(name);
  setAt(draft, path, data.publicUrl);
  renderEditor();
}

function setupEditor() {
  const ed = $("editor");

  ed.addEventListener("input", e => {
    const el = e.target;
    const path = el.dataset.path;
    if (!path) return;
    switch (el.dataset.kind) {
      case "text": setAt(draft, path, el.value); break;
      case "date": setAt(draft, path, el.value); break;
      case "strings": setAt(draft, path, el.value.split("\n").map(s => s.trim()).filter(Boolean)); break;
      case "ml": {
        const ml = asMl(getAt(draft, path));
        ml[el.dataset.lang] = el.value;
        setAt(draft, path, ml);
        break;
      }
      case "mllines": {
        const cur = getAt(draft, path);
        const ml = cur && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
        ml[el.dataset.lang] = el.value.split("\n").map(s => s.trim()).filter(Boolean);
        setAt(draft, path, ml);
        break;
      }
    }
    updateSaveState();
  });

  ed.addEventListener("change", e => {
    const el = e.target;
    if (el.dataset.kind === "bool") { setAt(draft, el.dataset.path, el.checked); updateSaveState(); }
    if (el.dataset.kind === "text" && el.closest(".img-field")) {
      const prev = el.closest(".img-field").querySelector(".img-prev");
      prev.innerHTML = el.value ? `<img src="${esc(el.value)}" alt="">` : "нема";
    }
    if (el.dataset.upload && el.files[0]) uploadImage(el.dataset.upload, el.files[0]);
  });

  ed.addEventListener("toggle", e => {
    const key = e.target.dataset && e.target.dataset.openKey;
    if (!key) return;
    e.target.open ? openSet.add(key) : openSet.delete(key);
  }, true);

  ed.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    e.preventDefault();
    const path = b.dataset.path;
    const arr = getAt(draft, path) || [];
    const i = +b.dataset.idx;
    switch (b.dataset.act) {
      case "add-item": {
        arr.push(listDefs[path].newItem());
        openSet.add(join(path, arr.length - 1));
        break;
      }
      case "add-img": arr.push(""); break;
      case "del":
        arr.splice(i, 1);
        break;
      case "del-item":
        if (!confirm("Видалити цей пункт?")) return;
        arr.splice(i, 1);
        break;
      case "up": if (i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; break;
      case "down": if (i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; break;
    }
    setAt(draft, path, arr);
    // після зсуву/видалення індекси змінились — закриваємо розгорнуті пункти цього списку
    if (b.dataset.act !== "add-item") [...openSet].forEach(k => k.startsWith(`${path}.`) && openSet.delete(k));
    renderEditor();
  });

  $("save").addEventListener("click", saveContent);
  $("revert").addEventListener("click", () => {
    if (!confirm("Скасувати всі незбережені зміни?")) return;
    draft = savedJson ? JSON.parse(savedJson) : structuredClone(SITE);
    renderEditor();
  });
  addEventListener("beforeunload", e => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });
}

// ---------- Старт ----------
function init() {
  if (!sb) return showView("setup");
  setAuthMode("login");
  setupAuth();
  setupApps();
  setupUsers();
  setupEditor();
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => openTab(b.dataset.tab)));
  // Колбек не має чекати інших запитів Supabase всередині себе — тому через setTimeout
  sb.auth.onAuthStateChange(() => setTimeout(route, 0));
}

init();
