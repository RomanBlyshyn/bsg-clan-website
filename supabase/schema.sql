-- =============================================================
--  B.S.G.REC. Clan — база даних для адмінки (Supabase)
--  Запустити ОДИН раз: Supabase → SQL Editor → New query → вставити все → Run
-- =============================================================

-- ---------- Профілі та ролі ----------
-- owner — власник (розробник): бачить усіх, видає/забирає адмінку
-- admin — редагує контент і бачить заявки
-- user  — зареєструвався, але доступу ще нема
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  role text not null default 'user' check (role in ('owner', 'admin', 'user')),
  created_at timestamptz not null default now()
);

-- Новий акаунт → автоматично профіль з роллю user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'admin'));
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

alter table public.profiles enable row level security;

drop policy if exists "read own profile or all for admins" on public.profiles;
create policy "read own profile or all for admins" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

-- Ролі змінює тільки власник, і тільки між admin/user (власника не чіпає ніхто)
drop policy if exists "owner manages roles" on public.profiles;
create policy "owner manages roles" on public.profiles
  for update to authenticated
  using (public.is_owner() and role <> 'owner')
  with check (role in ('admin', 'user'));

-- ---------- Контент сайту ----------
-- Один рядок id = 'site' з усім вмістом (те саме, що в data.js)
create table if not exists public.content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null
);

alter table public.content enable row level security;

drop policy if exists "anyone reads content" on public.content;
create policy "anyone reads content" on public.content for select using (true);

drop policy if exists "admins insert content" on public.content;
create policy "admins insert content" on public.content
  for insert to authenticated with check (public.is_admin());

drop policy if exists "admins update content" on public.content;
create policy "admins update content" on public.content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Заявки артистів ----------
create table if not exists public.applications (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null,
  contact text not null,
  tracks text not null,
  about text,
  lang text,
  status text not null default 'new' check (status in ('new', 'seen'))
);

alter table public.applications enable row level security;

drop policy if exists "anyone can apply" on public.applications;
create policy "anyone can apply" on public.applications
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 100
    and char_length(contact) between 1 and 150
    and char_length(tracks) between 1 and 500
    and char_length(coalesce(about, '')) <= 1500
    and status = 'new'
  );

drop policy if exists "admins read applications" on public.applications;
create policy "admins read applications" on public.applications
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update applications" on public.applications;
create policy "admins update applications" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete applications" on public.applications;
create policy "admins delete applications" on public.applications
  for delete to authenticated using (public.is_admin());

-- ---------- Фото (сховище) ----------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());


-- =============================================================
--  ПІСЛЯ того як зареєструєшся в адмінці — зроби себе власником.
--  Заміни пошту на свою і запусти ТІЛЬКИ цей рядок окремо:
--
--  update public.profiles set role = 'owner' where email = 'ТВОЯ@ПОШТА';
-- =============================================================
