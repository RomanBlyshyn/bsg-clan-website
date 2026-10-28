// ============================================================
//  ВЕСЬ КОНТЕНТ САЙТУ ТУТ. Міняй тексти, дати, фото й посилання.
//  Фото клади в папку site/img/ і пиши шлях типу "img/photo.jpg".
//  Якщо фото нема — залиш "" і буде заглушка.
//  Дата: "2026-11-20T19:00" (з часом) або "2026-06-26" (без часу).
//
//  ПЕРЕКЛАДИ: текст можна писати просто рядком (однаковий для всіх мов)
//  або так: { uk: "...", ru: "...", pl: "...", en: "..." }
// ============================================================

const FREE = { uk: "Вхід вільний", ru: "Вход свободный", pl: "Wstęp wolny", en: "Free entry" };

const SITE = {
  // Лого: крапки автоматично підсвічуються жовтим
  logo: { main: "B.S.G.REC.", tag: "CLAN" },
  name: "B.S.G.REC. Clan",
  tagline: {
    uk: "Big Shaark Gang — хіп-хоп колектив із Вроцлава та студія звукозапису Studio Kush 37",
    ru: "Big Shaark Gang — хип-хоп коллектив из Вроцлава и студия звукозаписи Studio Kush 37",
    pl: "Big Shaark Gang — kolektyw hip-hopowy z Wrocławia i studio nagraniowe Studio Kush 37",
    en: "Big Shaark Gang — a hip-hop collective from Wrocław and the Studio Kush 37 recording studio"
  },
  heroPhoto: "img/photo-3.jpg",
  // Біжуча стрічка під першим екраном
  ticker: ["B.S.G.REC. CLAN", "NIGHT CYPHER 20.11", "WROCŁAW", "STUDIO KUSH 37", "BIG SHAARK GANG"],

  // Нік в Інсті БЕЗ @ — сюди ведуть кнопки "Забронювати" / "Написати"
  instagram: "optimusprinceps",
  // Телеграм БЕЗ @ (можна "" — тоді кнопки не буде)
  telegram: "optimus228",
  telegramName: { uk: "Вадим", ru: "Вадим", pl: "Wadim", en: "Vadym" },
  // Посилання "Слухати" (band.link з усіма платформами)
  listen: "https://band.link/trapbaby2026",

  // ---------- Анонс восьмого концерту ----------
  announcement: {
    show: true,
    badge: { uk: "Концерт #8", ru: "Концерт #8", pl: "Koncert #8", en: "Show #8" },
    title: "Night Cypher",
    date: "2026-11-20T19:00",
    city: "Wrocław",
    venue: "Stary Klasztor, ul. Purkyniego 1",
    price: FREE,
    photo: "img/poster-8.jpg",
    text: {
      uk: "Восьмий концерт B.S.G. Clan. Big Shaark, Optimus Princeps і нові імена на одній сцені. Приходь слухати або виходь читати сам.",
      ru: "Восьмой концерт B.S.G. Clan. Big Shaark, Optimus Princeps и новые имена на одной сцене. Приходи слушать или выходи читать сам.",
      pl: "Ósmy koncert B.S.G. Clan. Big Shaark, Optimus Princeps i nowe nazwiska na jednej scenie. Przyjdź posłuchać albo wejdź na scenę i nawijaj sam.",
      en: "The eighth B.S.G. Clan show. Big Shaark, Optimus Princeps and new names on one stage. Come to listen — or grab the mic yourself."
    },
    performTitle: { uk: "Хочеш виступити?", ru: "Хочешь выступить?", pl: "Chcesz wystąpić?", en: "Want to perform?" },
    performText: {
      uk: "Заповни форму: хто ти, що робиш, і скинь 1–2 треки. Відповімо кожному.",
      ru: "Заполни форму: кто ты, что делаешь, и скинь 1–2 трека. Ответим каждому.",
      pl: "Wypełnij formularz: kim jesteś, co robisz, i podeślij 1–2 numery. Odpowiemy każdemu.",
      en: "Fill in the form: who you are, what you do, and drop 1–2 tracks. We reply to everyone."
    }
  },

  // ---------- Концерти ----------
  // Минулі йдуть в "Історію", майбутні — з кнопкою броні.
  // photos: перше — обкладинка картки (афіша), далі фото з концерту. Клік по картці відкриває галерею.
  concerts: [
    {
      title: "Hip Hop Rap",
      date: "2026-02-21T21:00",
      city: "Wrocław",
      venue: "Stacja Międzyrzecka, ul. Międzyrzecka 3A",
      price: FREE,
      photos: ["img/poster-1.jpg", "img/photo-1.jpg", "img/photo-3.jpg"]
    },
    {
      title: "Hip Hop Cypher",
      date: "2026-04-15T18:30",
      city: "Wrocław",
      venue: "Nietota Club, ul. Kazimierza Wielkiego 50",
      price: "",
      photos: ["img/poster-2.jpg", "img/photo-4.jpg", "img/photo-5.jpg"]
    },
    {
      title: "Urban Voice",
      date: "2026-05-20T19:00",
      city: "Wrocław",
      venue: "Nietota Club, ul. Kazimierza Wielkiego 50",
      price: "",
      photos: ["img/poster-3.jpg", "img/photo-2.jpg", "img/photo-1.jpg"]
    },
    {
      title: "808 Paradise Friday",
      date: "2026-06-26",
      city: "Wrocław",
      venue: "Mieszczańska Beach Bar, ul. Paczkowska 26",
      price: FREE,
      photos: ["img/poster-4.jpg", "img/photo-3.jpg", "img/photo-4.jpg"]
    },
    {
      title: "B.S.G. Clan Movement",
      date: "2026-07-15T18:00",
      city: "Wrocław",
      venue: "Club Nietota, ul. Kazimierza Wielkiego 50",
      price: "",
      photos: ["img/poster-5.jpg", "img/photo-5.jpg", "img/photo-2.jpg"]
    },
    {
      title: "Optimus Princeps × Big Shaark",
      date: "2026-09-18T20:00",
      city: "Wrocław",
      venue: "Sikalafa Freaky Neon Bar, ul. Ruska 46C/1",
      price: "",
      photos: ["img/poster-6.jpg", "img/photo-1.jpg", "img/photo-3.jpg"]
    },
    {
      title: "Afterdark Cypher Friday",
      date: "2026-10-23T19:00",
      city: "Wrocław",
      venue: "Stary Klasztor, ul. Purkyniego 1",
      price: FREE,
      photos: ["img/poster-7.jpg", "img/photo-4.jpg", "img/photo-5.jpg"]
    }
  ],

  // ---------- Артисти ----------
  // links: залиш тільки ті платформи, які є (порожні не показуються)
  // доступні ключі: bandlink, spotify, apple, youtube, soundcloud, deezer, instagram, tiktok, telegram
  artists: [
    {
      name: "Big Shaark",
      photo: "img/artist-bigshaark.jpg",
      bio: {
        uk: "Артем Демченко — незалежний український реп-виконавець і музичний продюсер родом із Нетішина (Хмельницька область). Засновник і власник студії звукозапису Studio Kush 37 у Вроцлаві, де розвиває музичне об'єднання Big Shaark Gang (B.S.G. Rec. Clan).",
        ru: "Артём Демченко — независимый украинский рэп-исполнитель и музыкальный продюсер родом из Нетешина (Хмельницкая область). Основатель и владелец студии звукозаписи Studio Kush 37 во Вроцлаве, где развивает музыкальное объединение Big Shaark Gang (B.S.G. Rec. Clan).",
        pl: "Artem Demczenko — niezależny ukraiński raper i producent muzyczny z Netiszyna (obwód chmielnicki). Założyciel i właściciel studia nagraniowego Studio Kush 37 we Wrocławiu, gdzie rozwija kolektyw Big Shaark Gang (B.S.G. Rec. Clan).",
        en: "Artem Demchenko — an independent Ukrainian rapper and music producer from Netishyn (Khmelnytskyi region). Founder and owner of the Studio Kush 37 recording studio in Wrocław and the Big Shaark Gang collective (B.S.G. Rec. Clan)."
      },
      links: { spotify: "", youtube: "", instagram: "" }
    },
    {
      name: "Optimus Princeps",
      photo: "img/artist-optimus.jpg",
      bio: {
        uk: "Реп-виконавець, який випускає музику під власним ім'ям і розвиває хіп-хоп-проєкт на незалежній сцені Вроцлава.",
        ru: "Рэп-исполнитель, выпускающий музыку под собственным именем и развивающий хип-хоп-проект на независимой сцене Вроцлава.",
        pl: "Raper wydający muzykę pod własnym pseudonimem i rozwijający projekt hip-hopowy na niezależnej scenie Wrocławia.",
        en: "A rapper releasing music under the Optimus Princeps name and building a hip-hop project on Wrocław's independent scene."
      },
      links: {
        bandlink: "https://band.link/trapbaby2026",
        instagram: "https://www.instagram.com/optimusprinceps"
      }
    }
  ],


  // ---------- Студія ----------
  studio: {
    name: "Studio Kush 37",
    text: {
      uk: "Студія звукозапису у Вроцлаві від Big Shaark. Пишемо, зводимо й мастеримо — приходь із демкою, підеш із треком.",
      ru: "Студия звукозаписи во Вроцлаве от Big Shaark. Пишем, сводим и мастерим — приходи с демкой, уйдёшь с треком.",
      pl: "Studio nagraniowe we Wrocławiu prowadzone przez Big Shaarka. Nagrywamy, miksujemy i robimy mastering — przyjdź z demem, wyjdziesz z gotowym numerem.",
      en: "A recording studio in Wrocław run by Big Shaark. Recording, mixing and mastering — come in with a demo, leave with a track."
    },
    services: {
      uk: ["Запис вокалу та інструментів", "Зведення", "Мастеринг", "Аранжування / біти"],
      ru: ["Запись вокала и инструментов", "Сведение", "Мастеринг", "Аранжировка / биты"],
      pl: ["Nagrywanie wokalu i instrumentów", "Miks", "Mastering", "Aranżacje / bity"],
      en: ["Vocal & instrument recording", "Mixing", "Mastering", "Arrangement / beats"]
    },
    address: "Wrocław",
    // Окремі контакти студії
    instagram: "studiokush37",
    telegram: "Big_shaark",
    telegramName: "Big Shaark",
    // Фото студії. Поки порожньо — показується анімований банер KUSH 37
    photos: [],
    // Приклади робіт: треки, записані на студії
    works: [
      { title: "trapbaby2026", url: "https://band.link/trapbaby2026" }
    ]
  }
};
