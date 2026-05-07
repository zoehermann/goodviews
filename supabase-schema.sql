-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run

-- Profiles table (auto-created for each user)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Watchlist
create table if not exists watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie','tv')),
  title text not null,
  poster_path text,
  status text not null check (status in ('want','watching','watched')),
  updated_at timestamptz default now(),
  unique(user_id, tmdb_id)
);

-- Reviews
create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  updated_at timestamptz default now(),
  unique(user_id, tmdb_id)
);

-- Friends
create table if not exists friends (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  friend_id uuid references profiles(id) on delete cascade not null,
  status text not null check (status in ('pending','accepted')),
  created_at timestamptz default now(),
  unique(user_id, friend_id)
);

-- Row Level Security (keeps data private)
alter table profiles  enable row level security;
alter table watchlist enable row level security;
alter table reviews   enable row level security;
alter table friends   enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "Public profiles" on profiles for select using (true);
create policy "Own profile" on profiles for update using (auth.uid() = id);

-- Watchlist: only owner can read/write
create policy "Own watchlist read"   on watchlist for select using (auth.uid() = user_id);
create policy "Own watchlist write"  on watchlist for insert with check (auth.uid() = user_id);
create policy "Own watchlist update" on watchlist for update using (auth.uid() = user_id);
create policy "Own watchlist delete" on watchlist for delete using (auth.uid() = user_id);

-- Reviews: anyone can read, only owner can write
create policy "Public reviews"  on reviews for select using (true);
create policy "Own review write"  on reviews for insert with check (auth.uid() = user_id);
create policy "Own review update" on reviews for update using (auth.uid() = user_id);

-- Friends: users can see their own friend rows
create policy "Own friends" on friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "Send request" on friends for insert with check (auth.uid() = user_id);
create policy "Accept request" on friends for update using (auth.uid() = friend_id);
