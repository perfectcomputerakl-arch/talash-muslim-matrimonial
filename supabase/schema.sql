-- TALASH starter schema. Apply in Supabase SQL Editor.
create type public.profile_status as enum ('incomplete','pending_review','approved','rejected','suspended');
create type public.verification_status as enum ('not_submitted','pending','verified','rejected');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 gender text not null check (gender in ('Bride','Groom','Woman','Man')),
 city text,
 country text default 'India',
 date_of_birth date,
 education text,
 profession text,
 about text,
 religion_declaration boolean not null default false,
 privacy_consent boolean not null default false,
 profile_photo_path text,
 status public.profile_status not null default 'incomplete',
 verification_status public.verification_status not null default 'not_submitted',
 is_visible boolean not null default false,
 role text not null default 'user' check (role in ('user','admin')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (religion_declaration = true),
 check (privacy_consent = true)
);

create table public.verification_requests (
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 selfie_path text not null,
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 reviewer_note text,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.verification_requests enable row level security;

create policy "Users read own profile" on public.profiles for select to authenticated
 using (auth.uid() = id or exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='admin'));
create policy "Users insert own profile" on public.profiles for insert to authenticated
 with check (auth.uid() = id and role='user' and religion_declaration and privacy_consent);
create policy "Users update own profile" on public.profiles for update to authenticated
 using (auth.uid() = id) with check (auth.uid() = id and role='user');

create policy "Users create own verification request" on public.verification_requests for insert to authenticated
 with check (auth.uid() = user_id);
create policy "Users read own verification request" on public.verification_requests for select to authenticated
 using (auth.uid() = user_id or exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='admin'));
create policy "Admins review verification requests" on public.verification_requests for update to authenticated
 using (exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='admin'))
 with check (exists(select 1 from public.profiles me where me.id=auth.uid() and me.role='admin'));

-- Storage buckets: create in Supabase Dashboard:
-- profile-photos (public or signed URL delivery; recommended private + signed URLs)
-- verification-private (PRIVATE; never make public)
-- Apply Storage policies so a user can upload only under their own auth.uid() folder.
