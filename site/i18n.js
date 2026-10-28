// ============================================================
//  ПЕРЕКЛАДИ ІНТЕРФЕЙСУ (кнопки, заголовки, форма).
//  Тексти контенту (біо, анонс, студія) — у data.js.
// ============================================================

const LANGS = {
  uk: { label: "UA", locale: "uk-UA" },
  ru: { label: "RU", locale: "ru-RU" },
  pl: { label: "PL", locale: "pl-PL" },
  en: { label: "EN", locale: "en-GB" }
};

const I18N = {
  uk: {
    "nav.next": "Концерт #8", "nav.concerts": "Концерти", "nav.artists": "Артисти", "nav.studio": "Студія", "nav.photos": "Фото", "sec.photos": "Фото",
    "hero.listen": "▶ Слухати", "hero.perform": "Хочу виступити",
    "stats.concerts": { one: "концерт", few: "концерти", many: "концертів", other: "концерту" },
    "stats.artists": { one: "артист", few: "артисти", many: "артистів", other: "артиста" },
    "stats.studio": { one: "студія", other: "студії" },
    "sec.concerts": "Концерти", "sec.artists": "Артисти", "sec.studio": "Студія",
    "concerts.upcoming": "Найближчі дати й бронювання місць.",
    "concerts.past": (n, w) => `${n} ${w} позаду. Тисни на будь-який, щоб глянути фото.`,
    "concerts.history": "Історія концертів", "concerts.more": "Детальніше →", "concerts.book": "Забронювати",
    "concerts.photos": { one: "фото", other: "фото" }, "concerts.noPhotos": "Фото скоро з'являться.",
    "announce.badge": "Анонс", "announce.soon": "Дата скоро", "announce.book": "Забронювати місце",
    "form.name": "Ім'я / псевдонім *", "form.contact": "Як з тобою зв'язатись *", "form.contactPh": "@telegram, Instagram або телефон",
    "form.tracks": "Посилання на треки *", "form.tracksPh": "SoundCloud, YouTube, band.link…",
    "form.about": "Про себе", "form.aboutPh": "Жанр, досвід виступів, місто", "form.submit": "Надіслати заявку",
    "form.local": "Форма ще не підключена. Поки напиши в директ 👇",
    "form.ok": "Заявку надіслано! Ми з тобою зв'яжемось.", "form.err": "Заявку не надіслано. Перевір інтернет і натисни «Надіслати» ще раз: усе введене збережено.",
    "form.offline": "Нема інтернету. Заявку не надіслано, але введене збережено. Підключись і спробуй ще раз.",
    "form.rejected": "Заявку відхилено. Перевір, чи правильно заповнені поля, і спробуй ще раз.",
    "form.badName": "Вкажи ім'я або псевдонім: від 2 до 100 символів, без < > { }.",
    "form.badContact": "Вкажи, як з тобою зв'язатися: @нік, Instagram або телефон, без < > { }.",
    "form.badTracks": "Додай хоча б одне посилання на трек, яке починається з https://",
    "form.badAbout": "Поле «Про себе» до 1500 символів і без знаків < >.",
    "contact.alt": "Або напиши напряму:", "contact.write": "Написати в Instagram", "contact.studio": "Записатися на студію",
    "studio.works": "Приклади робіт", "modal.close": "Закрити", "footer.listen": "Слухати", "footer.author": "Розробка сайту —", "footer.support": "при підтримці"
  },
  ru: {
    "nav.next": "Концерт #8", "nav.concerts": "Концерты", "nav.artists": "Артисты", "nav.studio": "Студия", "nav.photos": "Фото", "sec.photos": "Фото",
    "hero.listen": "▶ Слушать", "hero.perform": "Хочу выступить",
    "stats.concerts": { one: "концерт", few: "концерта", many: "концертов", other: "концерта" },
    "stats.artists": { one: "артист", few: "артиста", many: "артистов", other: "артиста" },
    "stats.studio": { one: "студия", other: "студии" },
    "sec.concerts": "Концерты", "sec.artists": "Артисты", "sec.studio": "Студия",
    "concerts.upcoming": "Ближайшие даты и бронирование мест.",
    "concerts.past": (n, w) => `${n} ${w} позади. Жми на любой, чтобы посмотреть фото.`,
    "concerts.history": "История концертов", "concerts.more": "Подробнее →", "concerts.book": "Забронировать",
    "concerts.photos": { one: "фото", other: "фото" }, "concerts.noPhotos": "Фото скоро появятся.",
    "announce.badge": "Анонс", "announce.soon": "Дата скоро", "announce.book": "Забронировать место",
    "form.name": "Имя / псевдоним *", "form.contact": "Как с тобой связаться *", "form.contactPh": "@telegram, Instagram или телефон",
    "form.tracks": "Ссылки на треки *", "form.tracksPh": "SoundCloud, YouTube, band.link…",
    "form.about": "О себе", "form.aboutPh": "Жанр, опыт выступлений, город", "form.submit": "Отправить заявку",
    "form.local": "Форма ещё не подключена. Пока напиши в директ 👇",
    "form.ok": "Заявка отправлена! Мы с тобой свяжемся.", "form.err": "Заявка не отправлена. Проверь интернет и нажми «Отправить» ещё раз: всё введённое сохранено.",
    "form.offline": "Нет интернета. Заявка не отправлена, но введённое сохранено. Подключись и попробуй ещё раз.",
    "form.rejected": "Заявка отклонена. Проверь, правильно ли заполнены поля, и попробуй ещё раз.",
    "form.badName": "Укажи имя или псевдоним: от 2 до 100 символов, без < > { }.",
    "form.badContact": "Укажи, как с тобой связаться: @ник, Instagram или телефон, без < > { }.",
    "form.badTracks": "Добавь хотя бы одну ссылку на трек, которая начинается с https://",
    "form.badAbout": "Поле «О себе» до 1500 символов и без знаков < >.",
    "contact.alt": "Или напиши напрямую:", "contact.write": "Написать в Instagram", "contact.studio": "Записаться на студию",
    "studio.works": "Примеры работ", "modal.close": "Закрыть", "footer.listen": "Слушать", "footer.author": "Разработка сайта —", "footer.support": "при поддержке"
  },
  pl: {
    "nav.next": "Koncert #8", "nav.concerts": "Koncerty", "nav.artists": "Artyści", "nav.studio": "Studio", "nav.photos": "Zdjęcia", "sec.photos": "Zdjęcia",
    "hero.listen": "▶ Słuchaj", "hero.perform": "Chcę wystąpić",
    "stats.concerts": { one: "koncert", few: "koncerty", many: "koncertów", other: "koncertu" },
    "stats.artists": { one: "artysta", few: "artystów", many: "artystów", other: "artysty" },
    "stats.studio": { one: "studio", other: "studia" },
    "sec.concerts": "Koncerty", "sec.artists": "Artyści", "sec.studio": "Studio",
    "concerts.upcoming": "Najbliższe terminy i rezerwacja miejsc.",
    "concerts.past": (n, w) => `${n} ${w} za nami. Kliknij dowolny, żeby zobaczyć zdjęcia.`,
    "concerts.history": "Historia koncertów", "concerts.more": "Więcej →", "concerts.book": "Zarezerwuj",
    "concerts.photos": { one: "zdjęcie", few: "zdjęcia", many: "zdjęć", other: "zdjęcia" }, "concerts.noPhotos": "Zdjęcia wkrótce.",
    "announce.badge": "Zapowiedź", "announce.soon": "Data wkrótce", "announce.book": "Zarezerwuj miejsce",
    "form.name": "Imię / ksywka *", "form.contact": "Jak się z tobą skontaktować *", "form.contactPh": "@telegram, Instagram lub telefon",
    "form.tracks": "Linki do numerów *", "form.tracksPh": "SoundCloud, YouTube, band.link…",
    "form.about": "O sobie", "form.aboutPh": "Gatunek, doświadczenie sceniczne, miasto", "form.submit": "Wyślij zgłoszenie",
    "form.local": "Formularz nie jest jeszcze podłączony. Na razie napisz na DM 👇",
    "form.ok": "Zgłoszenie wysłane! Odezwiemy się.", "form.err": "Zgłoszenie nie zostało wysłane. Sprawdź internet i kliknij „Wyślij” jeszcze raz: wpisane dane są zapisane.",
    "form.offline": "Brak internetu. Zgłoszenie nie zostało wysłane, ale dane są zapisane. Połącz się i spróbuj ponownie.",
    "form.rejected": "Zgłoszenie odrzucone. Sprawdź, czy pola są poprawnie wypełnione, i spróbuj ponownie.",
    "form.badName": "Podaj imię lub ksywkę: od 2 do 100 znaków, bez < > { }.",
    "form.badContact": "Podaj kontakt: @nick, Instagram lub telefon, bez < > { }.",
    "form.badTracks": "Dodaj przynajmniej jeden link do numeru zaczynający się od https://",
    "form.badAbout": "Pole „O sobie” do 1500 znaków i bez znaków < >.",
    "contact.alt": "Albo napisz bezpośrednio:", "contact.write": "Napisz na Instagramie", "contact.studio": "Umów sesję w studiu",
    "studio.works": "Przykładowe realizacje", "modal.close": "Zamknij", "footer.listen": "Słuchaj", "footer.author": "Projekt strony —", "footer.support": "przy wsparciu"
  },
  en: {
    "nav.next": "Show #8", "nav.concerts": "Shows", "nav.artists": "Artists", "nav.studio": "Studio", "nav.photos": "Photos", "sec.photos": "Photos",
    "hero.listen": "▶ Listen", "hero.perform": "I want to perform",
    "stats.concerts": { one: "show", other: "shows" },
    "stats.artists": { one: "artist", other: "artists" },
    "stats.studio": { one: "studio", other: "studios" },
    "sec.concerts": "Shows", "sec.artists": "Artists", "sec.studio": "Studio",
    "concerts.upcoming": "Upcoming dates and seat booking.",
    "concerts.past": (n, w) => `${n} ${w} done. Tap any of them to see the photos.`,
    "concerts.history": "Past shows", "concerts.more": "Details →", "concerts.book": "Book",
    "concerts.photos": { one: "photo", other: "photos" }, "concerts.noPhotos": "Photos coming soon.",
    "announce.badge": "Coming up", "announce.soon": "Date TBA", "announce.book": "Book a spot",
    "form.name": "Name / alias *", "form.contact": "How to reach you *", "form.contactPh": "@telegram, Instagram or phone",
    "form.tracks": "Links to your tracks *", "form.tracksPh": "SoundCloud, YouTube, band.link…",
    "form.about": "About you", "form.aboutPh": "Genre, stage experience, city", "form.submit": "Send application",
    "form.local": "The form isn't connected yet. For now, DM us 👇",
    "form.ok": "Application sent! We'll get back to you.", "form.err": "Form was not submitted. Check your connection and press Send again: everything you typed is saved.",
    "form.offline": "You're offline. The form was not submitted, but your answers are saved. Reconnect and try again.",
    "form.rejected": "The form was rejected. Check that the fields are filled in correctly and try again.",
    "form.badName": "Enter a name or alias: 2 to 100 characters, no < > { }.",
    "form.badContact": "Enter how to reach you: @handle, Instagram or phone, no < > { }.",
    "form.badTracks": "Add at least one track link starting with https://",
    "form.badAbout": "“About you” must be under 1500 characters, without < >.",
    "contact.alt": "Or message us directly:", "contact.write": "Message on Instagram", "contact.studio": "Book a studio session",
    "studio.works": "Our work", "modal.close": "Close", "footer.listen": "Listen", "footer.author": "Website by", "footer.support": "with support from"
  }
};

function detectLang() {
  try {
    const saved = localStorage.getItem("lang");
    if (saved && LANGS[saved]) return saved;
  } catch {}
  for (const l of navigator.languages || [navigator.language || ""]) {
    const code = l.slice(0, 2).toLowerCase();
    if (LANGS[code]) return code;
  }
  return "uk";
}

let lang = detectLang();

// Текст інтерфейсу за ключем
const ui = key => (I18N[lang][key] !== undefined ? I18N[lang][key] : I18N.uk[key]);

// Текст контенту: або рядок, або { uk, ru, pl, en }
const tr = v => (v && typeof v === "object" && !Array.isArray(v) ? (v[lang] || v.uk || "") : v);

// Правильна форма слова для числа (1 концерт, 3 концерти, 7 концертів)
const plural = (n, forms) => {
  const rule = new Intl.PluralRules(LANGS[lang].locale).select(n);
  return forms[rule] || forms.other || forms.many;
};
