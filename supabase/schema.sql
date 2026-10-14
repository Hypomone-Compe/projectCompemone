-- ===========================================================================
-- Hypomonē @GRIT, skema Supabase
--
-- Jalankan SEKALI di Supabase Dashboard → SQL Editor → New query → Run.
-- Aman dijalankan ulang (idempoten).
--
-- Isi:
--   1. Penjaga satu akun: hanya lvnasandbox@gmail.com yang boleh ada & masuk
--   2. app_state   : progres topik, nilai, rencana, harian, asdos, anggaran (jsonb per bagian)
--   3. transaksi   : arus kas, termasuk hasil scan struk
--   4. investasi   : portofolio manual
--   5. storage     : bucket privat "struk" untuk foto struk
--   6. realtime    : laptop & HP langsung sinkron
--
-- Kalau suatu saat ganti email, ubah SATU baris di fungsi owner_email() di
-- bawah, lalu set NEXT_PUBLIC_ALLOWED_EMAIL di Vercel dengan nilai yang sama.
-- ===========================================================================

-- 1. Penjaga satu akun -------------------------------------------------------
create or replace function public.owner_email()
returns text language sql immutable as $$ select 'lvnasandbox@gmail.com'::text $$;

create or replace function public.is_owner()
returns boolean language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email'), '') = public.owner_email()
$$;

-- Lapis terakhir: walau "Allow new users to sign up" lupa dimatikan, akun
-- dengan email lain tetap tidak bisa dibuat sama sekali.
-- Catatan: buat user pemilik DULU (Authentication → Users), baru jalankan bagian ini.
-- Fungsi dibuat mandiri (email ditulis langsung, search_path kosong) supaya aman
-- dipanggil dari sistem auth Supabase.
create or replace function public.tolak_email_asing()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if lower(coalesce(new.email, '')) <> 'lvnasandbox@gmail.com' then
    raise exception 'Pendaftaran ditutup. Hypomone hanya untuk satu akun.';
  end if;
  return new;
end $$;

drop trigger if exists hypomone_satu_akun on auth.users;
create trigger hypomone_satu_akun
  before insert on auth.users
  for each row execute function public.tolak_email_asing();

-- 2. app_state ---------------------------------------------------------------
create table if not exists public.app_state (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- progress:<matkul>, scores:<matkul>, plans, asdos, harian, anggaran
  slice      text not null check (slice ~ '^(progress|scores):[a-z0-9-]+$' or slice in ('plans', 'asdos', 'harian', 'anggaran')),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, slice)
);

-- 3. transaksi ---------------------------------------------------------------
create table if not exists public.transaksi (
  id         text primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tanggal    date not null,
  jenis      text not null check (jenis in ('masuk', 'keluar')),
  kategori   text not null,
  jumlah     bigint not null check (jumlah > 0),
  catatan    text not null default '',
  merchant   text,
  struk_path text,
  sumber     text not null default 'manual' check (sumber in ('manual', 'struk', 'impor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists transaksi_user_tanggal on public.transaksi (user_id, tanggal desc);

-- 4. investasi ---------------------------------------------------------------
create table if not exists public.investasi (
  id         text primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nama       text not null,
  jenis      text not null,
  modal      bigint not null default 0,
  nilai      bigint not null default 0,
  diperbarui date,
  catatan    text not null default '',
  updated_at timestamptz not null default now()
);

-- RLS: hanya pemilik, hanya barisnya sendiri ---------------------------------
alter table public.app_state enable row level security;
alter table public.transaksi enable row level security;
alter table public.investasi enable row level security;

drop policy if exists "pemilik" on public.app_state;
create policy "pemilik" on public.app_state for all to authenticated
  using (user_id = auth.uid() and public.is_owner())
  with check (user_id = auth.uid() and public.is_owner());

drop policy if exists "pemilik" on public.transaksi;
create policy "pemilik" on public.transaksi for all to authenticated
  using (user_id = auth.uid() and public.is_owner())
  with check (user_id = auth.uid() and public.is_owner());

drop policy if exists "pemilik" on public.investasi;
create policy "pemilik" on public.investasi for all to authenticated
  using (user_id = auth.uid() and public.is_owner())
  with check (user_id = auth.uid() and public.is_owner());

-- 5. Storage: foto struk -----------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('struk', 'struk', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "struk pemilik baca" on storage.objects;
create policy "struk pemilik baca" on storage.objects for select to authenticated
  using (bucket_id = 'struk' and (storage.foldername(name))[1] = auth.uid()::text and public.is_owner());

drop policy if exists "struk pemilik tulis" on storage.objects;
create policy "struk pemilik tulis" on storage.objects for insert to authenticated
  with check (bucket_id = 'struk' and (storage.foldername(name))[1] = auth.uid()::text and public.is_owner());

drop policy if exists "struk pemilik hapus" on storage.objects;
create policy "struk pemilik hapus" on storage.objects for delete to authenticated
  using (bucket_id = 'struk' and (storage.foldername(name))[1] = auth.uid()::text and public.is_owner());

-- 6. Realtime: perubahan dari HP langsung muncul di laptop, dan sebaliknya ---
do $$
begin
  begin alter publication supabase_realtime add table public.app_state; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.transaksi; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.investasi; exception when duplicate_object then null; end;
end $$;
