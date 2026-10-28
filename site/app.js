const PLATFORMS = {
  bandlink:   { uk: "Усі платформи", ru: "Все платформы", pl: "Wszystkie platformy", en: "All platforms" },
  spotify:    "Spotify",
  apple:      "Apple Music",
  youtube:    "YouTube",
  soundcloud: "SoundCloud",
  deezer:     "Deezer",
  instagram:  "Instagram",
  tiktok:     "TikTok",
  telegram:   "Telegram"
};

// Підпис розробника. Навмисно в коді, а не в data.js чи базі: через адмінку його не змінити.
const CREDIT = {
  author:    { name: { uk: "Роман", ru: "Роман", pl: "Roman", en: "Roman" }, url: "https://t.me/roman_bls" },
  supporter: { name: { uk: "Ельдара", ru: "Эльдара", pl: "Eldara", en: "Eldar" }, url: "https://t.me/youngpolanski" }
};

// Посилання з контенту пропускаємо тільки безпечні (http/https, відносні шляхи)
const safeUrl = u => (/^(https?:\/\/|img\/|\/|#)/i.test(String(u || "").trim()) ? String(u).trim() : "#");

// Запит до бази Supabase без бібліотеки (публічний anon-ключ)
const db = (path, opts = {}) =>
  fetch(`${CONFIG.supabaseUrl}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const initials = name => name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

// Фото або заглушка (ph — текст на заглушці, за замовчуванням ініціали)
const media = (src, alt, ph = initials(alt || "?")) =>
  src ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">` : `<div class="ph">${esc(ph)}</div>`;

// Контакти: src — SITE (організатори) або SITE.studio (студія)
const igOf = src => src.instagram && `https://ig.me/m/${src.instagram}`;
const tgOf = src => src.telegram && `https://t.me/${src.telegram}`;
const igLink = () => igOf(SITE);
const tgLink = () => tgOf(SITE);
const tgLabel = (src = SITE) => `Telegram${src.telegramName ? ` (${esc(tr(src.telegramName))})` : ""}`;

// Кнопки "Instagram" + "Telegram (Вадим)"
function contactButtons(labelKey, src = SITE) {
  const btns = [];
  if (igOf(src)) btns.push(`<a class="btn btn-primary btn-sm" href="${igOf(src)}" target="_blank" rel="noopener">${esc(ui(labelKey))}</a>`);
  if (tgOf(src)) btns.push(`<a class="btn btn-ghost btn-sm" href="${tgOf(src)}" target="_blank" rel="noopener">${tgLabel(src)}</a>`);
  return btns.join("");
}

const logoHtml = () =>
  `<span>${esc(SITE.logo.main).replace(/\./g, "<i>.</i>")}</span>` +
  (SITE.logo.tag ? `<span class="logo-tag">${esc(SITE.logo.tag)}</span>` : "");

const fmtDate = iso => {
  if (!iso) return null;
  const loc = LANGS[lang].locale;
  const hasTime = iso.includes("T") && !iso.endsWith("T00:00"); // 00:00 = час не вказано
  const d = new Date(hasTime ? iso : `${iso}T12:00`);
  const full = d.toLocaleDateString(loc, { day: "numeric", month: "long", year: "numeric" });
  const time = hasTime ? d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" }) : "";
  return {
    day: d.getDate(),
    month: d.toLocaleDateString(loc, { month: "short" }).replace(".", ""),
    full,
    withTime: time ? `${full}, ${time}` : full
  };
};

const place = (city, venue) => [city, venue].filter(Boolean).map(esc).join(" · ");
const concertNum = c => { const m = c.title.match(/\d+/); return m ? `#${m[0]}` : initials(c.title); };
const cover = c => (c.photos && c.photos[0]) || c.photo || "";

// ---------- Статичні тексти інтерфейсу ----------
function renderStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => (el.textContent = ui(el.dataset.i18n)));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => (el.placeholder = ui(el.dataset.i18nPh)));
  document.querySelectorAll("[data-i18n-aria]").forEach(el => el.setAttribute("aria-label", ui(el.dataset.i18nAria)));
  document.querySelectorAll("[data-contacts]").forEach(el =>
    (el.innerHTML = contactButtons(el.dataset.contacts, el.dataset.source === "studio" ? SITE.studio : SITE)));
  document.getElementById("form-lang").value = lang;

  document.getElementById("lang-switch").innerHTML = Object.entries(LANGS)
    .map(([code, l]) => `<button type="button" data-lang="${code}" aria-pressed="${code === lang}">${l.label}</button>`)
    .join("");
}

// ---------- Анонс + форма заявки ----------
function renderAnnouncement() {
  const a = SITE.announcement;
  if (!a || !a.show) return;
  const d = fmtDate(a.date);
  const price = tr(a.price);
  const am = document.getElementById("announce-media");
  am.innerHTML = media(a.photo, a.title, concertNum(a));
  document.getElementById("announce-info").innerHTML = `
    <span class="badge">${esc(tr(a.badge) || ui("announce.badge"))}</span>
    <h3>${esc(a.title)}</h3>
    <div class="meta">
      <strong>${d ? esc(d.withTime) : ui("announce.soon")}</strong>
      ${place(a.city, a.venue) ? `<span>${place(a.city, a.venue)}</span>` : ""}
      ${price ? `<span class="price">${esc(price)}</span>` : ""}
    </div>
    <p>${esc(tr(a.text))}</p>
    ${d && igLink() ? `<a class="btn btn-primary btn-sm book-btn" href="${igLink()}" target="_blank" rel="noopener">${esc(ui("announce.book"))}</a>` : ""}`;
  document.getElementById("perform-title").textContent = tr(a.performTitle);
  document.getElementById("perform-text").textContent = tr(a.performText);
  document.getElementById("announcement").hidden = false;
}

// Перевірка полів заявки. Ті самі правила дублюються в базі (supabase/02-telegram-and-validation.sql),
// тож обійти їх, відправивши запит напряму, не вийде.
const FORBIDDEN = /[<>{}]/;
const clean = (v, multiline = false) =>
  String(v || "").replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ").trim();
const FIELD_RULES = {
  name:    { msg: "form.badName",    ok: v => v.length >= 2 && v.length <= 100 && !FORBIDDEN.test(v) },
  contact: { msg: "form.badContact", ok: v => v.length >= 3 && v.length <= 150 && !FORBIDDEN.test(v) },
  tracks:  { msg: "form.badTracks",  ok: v => v.length <= 500 && /https?:\/\/\S+\.\S+/i.test(v) && !FORBIDDEN.test(v) },
  about:   { msg: "form.badAbout",   ok: v => v.length <= 1500 && !/[<>]/.test(v) }
};
const DRAFT_KEY = "apply-draft";

function setupApplyForm() {
  const form = document.getElementById("apply-form");
  const status = document.getElementById("apply-status");
  const btn = form.querySelector("button[type=submit]");
  const show = (key, cls) => { status.textContent = ui(key); status.className = `form-status ${cls}`; };
  const fields = Object.keys(FIELD_RULES).map(n => form.elements[n]);

  // Чернетка: якщо сторінку перезавантажили чи пропав інтернет, введене не губиться
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    fields.forEach(el => { if (draft[el.name] && !el.value) el.value = draft[el.name]; });
  } catch {}
  const saveDraft = () => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(Object.fromEntries(fields.map(el => [el.name, el.value])))); } catch {}
  };
  form.addEventListener("input", e => {
    e.target.removeAttribute("aria-invalid");
    saveDraft();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!HAS_DB) return show("form.local", "err");
    if (form.elements["bot-field"].value) { form.reset(); return show("form.ok", "ok"); } // бот: мовчки "успіх"

    const data = {
      name: clean(form.elements.name.value),
      contact: clean(form.elements.contact.value),
      tracks: clean(form.elements.tracks.value),
      about: clean(form.elements.about.value, true)
    };
    const bad = fields.find(el => !FIELD_RULES[el.name].ok(data[el.name]));
    if (bad) {
      bad.setAttribute("aria-invalid", "true");
      bad.focus();
      return show(FIELD_RULES[bad.name].msg, "err");
    }
    if (!navigator.onLine) return show("form.offline", "err");

    btn.disabled = true;
    status.textContent = "";
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await db("applications", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ ...data, about: data.about || null, lang }),
        signal: ctrl.signal
      });
      if (res.status === 400 || res.status === 401 || res.status === 403) return show("form.rejected", "err");
      if (!res.ok) throw new Error(res.status);
      form.reset();
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      show("form.ok", "ok");
    } catch {
      // Поля НЕ очищаємо: людина просто тисне "Надіслати" ще раз
      show("form.err", "err");
    } finally {
      clearTimeout(timer);
      btn.disabled = false;
    }
  });
}

// ---------- Концерти + галерея ----------
let concertsSorted = [];

function concertCard(c, i, upcoming) {
  const d = fmtDate(c.date);
  const count = Math.max(0, (c.photos || []).length - 1); // перше — афіша, не рахуємо
  const price = tr(c.price);
  return `
    <article class="card" data-concert="${i}" tabindex="0" role="button" aria-label="${esc(c.title)}">
      <div class="card-media">
        ${media(cover(c), c.title, concertNum(c))}
        <div class="date-chip"><span class="d">${d.day}</span><span class="m">${esc(d.month)}</span></div>
      </div>
      <div class="card-body">
        <h3>${esc(c.title)}</h3>
        <div class="meta">
          <strong>${esc(d.withTime)}</strong>
          <span>${place(c.city, c.venue)}</span>
          ${price ? `<span class="price">${esc(price)}</span>` : ""}
        </div>
        <div class="card-foot">
          <span class="more">${count ? `${count} ${esc(plural(count, ui("concerts.photos")))} →` : esc(ui("concerts.more"))}</span>
          ${upcoming && igLink() ? `<a class="btn btn-primary btn-sm" href="${igLink()}" target="_blank" rel="noopener">${esc(ui("concerts.book"))}</a>` : ""}
        </div>
      </div>
    </article>`;
}

function renderConcerts() {
  const now = Date.now();
  concertsSorted = [...SITE.concerts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const withIdx = concertsSorted.map((c, i) => ({ c, i }));
  const upcoming = withIdx.filter(x => new Date(x.c.date) >= now);
  const past = withIdx.filter(x => new Date(x.c.date) < now).reverse();

  document.getElementById("concerts-sub").textContent = upcoming.length
    ? ui("concerts.upcoming")
    : ui("concerts.past")(past.length, plural(past.length, ui("stats.concerts")));
  document.getElementById("concerts-upcoming").innerHTML = upcoming.map(x => concertCard(x.c, x.i, true)).join("");

  if (past.length) {
    document.getElementById("concerts-past").innerHTML = past.map(x => concertCard(x.c, x.i, false)).join("");
    document.getElementById("concerts-past-title").hidden = !upcoming.length;
  }
}

const modalEl = () => document.getElementById("concert-modal");

function openModal(html, mode) {
  document.getElementById("modal-content").innerHTML = html;
  const modal = modalEl();
  modal.className = `modal modal-${mode}`;
  if (!modal.open) modal.showModal();
}

// Вікно концерту: афіша зліва, оформлення й інфа справа
function openConcert(i) {
  const c = concertsSorted[i];
  const d = fmtDate(c.date);
  const photos = c.photos || [];
  const price = tr(c.price);
  const src = cover(c);
  const num = String(i + 1).padStart(2, "0");
  openModal(`
    <div class="cm">
      <div class="cm-poster poster-stage">
        ${src ? `<button type="button" class="lb-open" data-lb="0" data-concert-idx="${i}">${media(src, c.title)}</button>` : media("", c.title, concertNum(c))}
      </div>
      <div class="cm-info">
        <span class="cm-presents">B.S.G. CLAN PRESENTS</span>
        <div class="cm-num" aria-hidden="true">#${num}</div>
        <h3>${esc(c.title)}</h3>
        <div class="meta">
          <strong>${esc(d.withTime)}</strong>
          <span>${place(c.city, c.venue)}</span>
          ${price ? `<span class="price">${esc(price)}</span>` : ""}
        </div>
        ${photos.length > 1
          ? `<div class="gallery">${photos.slice(1).map((p, k) =>
              `<button type="button" class="lb-open" data-lb="${k + 1}" data-concert-idx="${i}">${media(p, c.title)}</button>`).join("")}</div>`
          : ""}
        <div class="hazard" aria-hidden="true"></div>
      </div>
    </div>`, "concert");
}

// Перегляд фото концерту на весь екран; при закритті повертає у вікно концерту
let photoIdx = 0;
let photoList = [];
let photoReturn = null;
function openPhoto(i) {
  const list = photoList;
  photoIdx = (i + list.length) % list.length;
  openModal(`
    <figure class="lb">
      <img src="${esc(list[photoIdx])}" alt="B.S.G. Clan">
      ${list.length > 1 ? `
        <button class="lb-nav lb-prev" data-nav="-1" aria-label="‹">‹</button>
        <button class="lb-nav lb-next" data-nav="1" aria-label="›">›</button>
        <figcaption>${photoIdx + 1} / ${list.length}</figcaption>` : ""}
    </figure>`, "photo");
}

function setupModal() {
  const modal = modalEl();
  const concerts = document.getElementById("concerts");
  concerts.addEventListener("click", e => {
    if (e.target.closest("a")) return; // кнопка "Забронювати" не відкриває вікно
    const card = e.target.closest("[data-concert]");
    if (card) openConcert(+card.dataset.concert);
  });
  concerts.addEventListener("keydown", e => {
    const card = e.target.closest("[data-concert]");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openConcert(+card.dataset.concert); }
  });
  const closeModal = () => {
    if (modal.classList.contains("modal-photo") && photoReturn !== null) {
      const back = photoReturn;
      photoReturn = null;
      openConcert(back);
    } else modal.close();
  };
  modal.addEventListener("click", e => {
    const nav = e.target.closest("[data-nav]");
    if (nav) return openPhoto(photoIdx + +nav.dataset.nav);
    const lb = e.target.closest("[data-lb]");
    if (lb) {
      photoReturn = +lb.dataset.concertIdx;
      photoList = concertsSorted[photoReturn].photos || [];
      return openPhoto(+lb.dataset.lb);
    }
    if (e.target === modal || e.target.closest("[data-close]")) closeModal();
  });
  modal.addEventListener("cancel", e => {
    if (photoReturn !== null) { e.preventDefault(); closeModal(); }
  });
  document.addEventListener("keydown", e => {
    if (!modal.open || !modal.classList.contains("modal-photo")) return;
    if (e.key === "ArrowLeft") openPhoto(photoIdx - 1);
    if (e.key === "ArrowRight") openPhoto(photoIdx + 1);
  });
}

// ---------- Артисти ----------
function renderArtists() {
  document.getElementById("artists-list").innerHTML = SITE.artists.map(a => {
    const links = Object.entries(a.links || {})
      .filter(([, url]) => url)
      .map(([key, url]) => `<a class="link-pill" href="${esc(safeUrl(url))}" target="_blank" rel="noopener">${esc(tr(PLATFORMS[key]) || key)}</a>`)
      .join("");
    return `
      <article class="card artist-card">
        <div class="artist-media">${media(a.photo, a.name)}</div>
        <div class="card-body">
          <h3>${esc(a.name)}</h3>
          <p class="muted">${esc(tr(a.bio))}</p>
          <div class="links">${links}</div>
        </div>
      </article>`;
  }).join("");
}

// ---------- Студія ----------
function renderStudio() {
  const s = SITE.studio;
  document.getElementById("studio-title").textContent = s.name ? `${ui("sec.studio")} ${s.name}` : ui("sec.studio");
  document.getElementById("studio-text").textContent = tr(s.text);
  document.getElementById("studio-services").innerHTML = (tr(s.services) || []).map(x => `<li>${esc(x)}</li>`).join("");
  document.getElementById("studio-address").textContent = s.address ? `📍 ${tr(s.address)}` : "";
  const photos = s.photos || [];
  const box = document.getElementById("studio-photos");
  box.innerHTML = photos.length ? photos.map(p => `<div>${media(p, s.name || "Studio")}</div>`).join("") : studioVisual(s);
  box.classList.toggle("is-visual", !photos.length);
  const works = (s.works || []).filter(w => w.url);
  if (works.length) {
    document.getElementById("studio-works").innerHTML = works
      .map(w => `<a class="link-pill" href="${esc(safeUrl(w.url))}" target="_blank" rel="noopener">▶ ${esc(tr(w.title))}</a>`).join("");
    document.getElementById("studio-works-wrap").hidden = false;
  }
}

// Анімований банер студії (поки нема фото): REC, назва, еквалайзер
function studioVisual(s) {
  const words = (s.name || "Studio").replace(/^studio\s*/i, "").toUpperCase().split(/\s+/);
  const num = /^\d+$/.test(words[words.length - 1]) ? words.pop() : "";
  const bars = Array.from({ length: 36 }, (_, i) => {
    const h = (0.35 + 0.65 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37))).toFixed(2);
    return `<i style="--h:${h};--d:${((i * 0.13) % 1.1).toFixed(2)}s"></i>`;
  }).join("");
  return `
    <div class="sv" aria-label="${esc(s.name)}">
      <div class="sv-top"><span class="sv-rec"><i></i>REC</span><span>${esc(tr(s.address) || "")}</span></div>
      <div class="sv-title">${esc(words.join(" "))}${num ? `<b>${esc(num)}</b>` : ""}</div>
      <div class="sv-sub">RECORDING · MIXING · MASTERING</div>
      <div class="sv-eq">${bars}</div>
    </div>`;
}

// ---------- Загальне ----------
function renderCommon() {
  document.title = SITE.name;
  document.querySelectorAll("[data-logo]").forEach(el => (el.innerHTML = logoHtml()));
  document.getElementById("tagline").textContent = tr(SITE.tagline);

  if (SITE.heroPhoto) {
    const hero = document.getElementById("hero");
    hero.style.setProperty("--hero-photo", `url("${SITE.heroPhoto}")`);
    hero.classList.add("has-photo");
  }

  // Стрічка дублюється, щоб анімація йшла без розриву
  const items = (SITE.ticker || []).map(t => `<span>${esc(tr(t))}</span>`).join("");
  document.getElementById("ticker").innerHTML = items + items + items + items;

  const pastCount = SITE.concerts.filter(c => new Date(c.date) < Date.now()).length;
  document.getElementById("stats").innerHTML = [
    [pastCount, "stats.concerts"],
    [SITE.artists.length, "stats.artists"],
    [1, "stats.studio"]
  ].map(([n, key]) => `<div><b data-count="${n}">${n}</b><span>${esc(plural(n, ui(key)))}</span></div>`).join("");

  const listen = document.getElementById("listen-btn");
  if (SITE.listen) { listen.href = safeUrl(SITE.listen); listen.hidden = false; }

  const footer = [];
  if (SITE.listen) footer.push(`<a href="${esc(safeUrl(SITE.listen))}" target="_blank" rel="noopener">${esc(ui("footer.listen"))}</a>`);
  if (SITE.instagram) footer.push(`<a href="https://instagram.com/${esc(SITE.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
  if (SITE.telegram) footer.push(`<a href="${tgLink()}" target="_blank" rel="noopener">${tgLabel()}</a>`);
  if (SITE.studio.instagram) footer.push(`<a href="https://instagram.com/${esc(SITE.studio.instagram)}" target="_blank" rel="noopener">${esc(SITE.studio.name)}</a>`);
  document.getElementById("footer-links").innerHTML = footer.join("");

  const person = p => `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(tr(p.name))}</a>`;
  document.getElementById("footer-credit").innerHTML =
    `${esc(ui("footer.author"))} ${person(CREDIT.author)} · ${esc(ui("footer.support"))} ${person(CREDIT.supporter)}`;
}

function renderAll() {
  renderStatic();
  renderCommon();
  renderAnnouncement();
  renderConcerts();
  renderArtists();
  renderStudio();
}

// ---------- Анімації ----------
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Плавна поява блоків при скролі
const revealObs = "IntersectionObserver" in window && !calm
  ? new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
  : null;

function setupReveal() {
  if (!revealObs) return;
  document.querySelectorAll(".section h2, .section-sub, .sub-title, .grid > .card, .announce, .studio > div")
    .forEach(el => {
      if (el.classList.contains("in")) return;
      const idx = el.parentElement.classList.contains("grid") ? [...el.parentElement.children].indexOf(el) % 3 : 0;
      el.style.setProperty("--rd", `${idx * 90}ms`);
      el.classList.add("reveal");
      revealObs.observe(el);
    });
}

// Лічильники на першому екрані рахують від нуля
function countUp() {
  if (calm) return;
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = +el.dataset.count;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// Жовта смужка прогресу скролу + підсвітка активного пункту меню
function setupScrollUi() {
  const bar = document.getElementById("progress");
  const links = [...document.querySelectorAll(".nav nav a")];
  const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    const y = scrollY + innerHeight * 0.35;
    let current = null;
    sections.forEach(s => { if (!s.hidden && s.offsetTop <= y) current = s; });
    links.forEach(a => a.classList.toggle("active", current && a.getAttribute("href") === `#${current.id}`));
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
}

function setupLangSwitch() {
  document.getElementById("lang-switch").addEventListener("click", e => {
    const btn = e.target.closest("[data-lang]");
    if (!btn || btn.dataset.lang === lang) return;
    lang = btn.dataset.lang;
    try { localStorage.setItem("lang", lang); } catch {}
    document.getElementById("apply-status").textContent = "";
    renderAll();
    document.querySelectorAll(".grid > .card").forEach(el => el.classList.add("in"));
    setupReveal();
  });
}

// Контент з адмінки (база) має пріоритет над data.js. Якщо база недоступна — лишається data.js.
async function loadContent() {
  if (!HAS_DB) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3000);
  try {
    const res = await db("content?id=eq.site&select=data", { signal: ctrl.signal });
    if (!res.ok) return;
    const rows = await res.json();
    if (rows[0] && rows[0].data) Object.assign(SITE, rows[0].data);
  } catch {
  } finally {
    clearTimeout(timer);
  }
}

loadContent().then(() => {
  renderAll();
  setupApplyForm();
  setupModal();
  setupLangSwitch();
  setupReveal();
  setupScrollUi();
  countUp();
});
