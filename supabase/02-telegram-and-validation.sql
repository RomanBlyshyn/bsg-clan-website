-- =============================================================
--  Крок 2: перевірка заявок у базі + сповіщення в Telegram
--  Supabase → SQL Editor → New query → вставити ВСЕ → Run
--  (токен бота й chat_id вписуються ОКРЕМО, див. низ файлу)
-- =============================================================

-- ---------- Перевірка полів заявки на боці бази ----------
-- Ті самі правила, що й у формі на сайті. Якщо хтось шле запит напряму, оминаючи сайт,
-- база все одно відхилить заявку з < > { }, без посилання на трек чи задовгу.
drop policy if exists "anyone can apply" on public.applications;
create policy "anyone can apply" on public.applications
  for insert to anon, authenticated
  with check (
    char_length(btrim(name)) between 2 and 100
    and char_length(btrim(contact)) between 3 and 150
    and char_length(tracks) between 1 and 500
    and tracks ~* 'https?://[^[:space:]]+\.[^[:space:]]+'
    and char_length(coalesce(about, '')) <= 1500
    and name !~ '[<>{}]'
    and contact !~ '[<>{}]'
    and tracks !~ '[<>{}]'
    and coalesce(about, '') !~ '[<>]'
    and (lang is null or lang in ('uk', 'ru', 'pl', 'en'))
    and status = 'new'
  );

-- ---------- Сповіщення в Telegram ----------
create extension if not exists pg_net with schema extensions;

-- Нова заявка → повідомлення в Telegram усім chat_id зі списку.
-- Токен і chat_id лежать у зашифрованому сховищі Supabase (Vault), не в коді сайту.
-- Текст іде без розмітки (parse_mode не задано), тож нічого з заявки не виконається як код.
create or replace function public.notify_telegram_application()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  token text;
  chats text;
  chat text;
  msg text;
begin
  select decrypted_secret into token from vault.decrypted_secrets where name = 'tg_bot_token';
  select decrypted_secret into chats from vault.decrypted_secrets where name = 'tg_chat_ids';
  if token is null or chats is null then
    return new; -- бот ще не налаштований: заявка просто зберігається
  end if;

  msg := 'Нова заявка на виступ' || E'\n\n'
      || 'Ім''я: ' || new.name || E'\n'
      || 'Контакт: ' || new.contact || E'\n'
      || 'Треки: ' || new.tracks
      || coalesce(E'\n' || 'Про себе: ' || new.about, '')
      || E'\n' || 'Мова сайту: ' || upper(coalesce(new.lang, '?'))
      || E'\n\n' || 'Усі заявки: https://bsgclan.com/admin.html';

  foreach chat in array string_to_array(chats, ',') loop
    if btrim(chat) <> '' then
      perform net.http_post(
        url := 'https://api.telegram.org/bot' || token || '/sendMessage',
        body := jsonb_build_object('chat_id', btrim(chat), 'text', msg, 'disable_web_page_preview', true),
        headers := '{"Content-Type": "application/json"}'::jsonb
      );
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists applications_notify_telegram on public.applications;
create trigger applications_notify_telegram
  after insert on public.applications
  for each row execute function public.notify_telegram_application();


-- =============================================================
--  ПІСЛЯ того як створиш бота — запусти ОКРЕМО (кожен рядок раз):
--
--  1) Токен від @BotFather:
--     select vault.create_secret('ТОКЕН_БОТА', 'tg_bot_token');
--
--  2) Кому слати (chat_id через кому, без пробілів можна):
--     select vault.create_secret('123456789,987654321', 'tg_chat_ids');
--
--  Змінити пізніше:
--     select vault.update_secret((select id from vault.secrets where name = 'tg_bot_token'), 'НОВИЙ_ТОКЕН');
--     select vault.update_secret((select id from vault.secrets where name = 'tg_chat_ids'), 'НОВІ_CHAT_ID');
-- =============================================================
