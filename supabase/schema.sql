create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  avatar_emoji text default '☕',
  role text not null default 'consumer'
    check (role in ('consumer','barista','roaster','admin')),
  locale text default 'en',
  created_at timestamptz default now()
);

-- Taste profiles
create table taste_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  level text not null check (level in ('casual','exploring','expert')),
  sliders jsonb not null default '{}',
  flavors jsonb not null default '[]',
  brew_methods text[] not null default '{}',
  location_prefs text[] not null default '{}',
  max_distance_km numeric default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on taste_profiles (user_id);

-- Roasteries
create table roasteries (
  id text primary key,
  name text not null,
  city text not null,
  color text default '#1A1A1A',
  emoji text default '☕',
  website text,
  description text,
  tags text[] default '{}',
  owner_id uuid references auth.users(id) on delete set null
);

-- Beans
create table beans (
  id text primary key,
  roastery_id text references roasteries(id) on delete cascade not null,
  name text not null,
  origin text,
  process text,
  roast text,
  score numeric(4,1),
  price text,
  flavors text[] default '{}',
  acidity numeric(3,1),
  body numeric(3,1),
  sweetness numeric(3,1),
  fruitiness numeric(3,1),
  intensity numeric(3,1),
  aroma numeric(3,1),
  finish numeric(3,1),
  trend text default 'steady' check (trend in ('hot','rising','steady','new')),
  methods text[] default '{}'
);
create index on beans (roastery_id);

-- Cafes
create table cafes (
  id uuid primary key default uuid_generate_v4(),
  roastery_id text references roasteries(id) on delete set null,
  name text not null,
  addr text,
  lat numeric(9,6),
  lng numeric(9,6),
  hours text
);

-- Barista profiles
create table barista_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  cafe_id uuid references cafes(id) on delete set null,
  specialties text[] default '{}',
  bio text,
  yrs integer default 0,
  kudos integer default 0,
  rating numeric(2,1) default 0.0
);

-- Menu today
create table menu_today (
  id uuid primary key default uuid_generate_v4(),
  cafe_id uuid references cafes(id) on delete cascade not null,
  barista_id uuid references barista_profiles(id) on delete set null,
  bean_id text references beans(id) on delete cascade not null,
  brew_method text,
  active boolean default true,
  updated_at timestamptz default now()
);
create index on menu_today (cafe_id);

-- Check-ins
create table checkins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  cafe_id uuid references cafes(id) on delete set null,
  bean_id text references beans(id) on delete set null,
  barista_id uuid references barista_profiles(id) on delete set null,
  note text,
  rating integer check (rating between 1 and 5),
  created_at timestamptz default now()
);

-- Social posts
create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  cafe_id uuid references cafes(id) on delete set null,
  bean_id text references beans(id) on delete set null,
  upvotes integer default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (user_id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'consumer'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table taste_profiles enable row level security;
alter table roasteries enable row level security;
alter table beans enable row level security;
alter table cafes enable row level security;
alter table barista_profiles enable row level security;
alter table menu_today enable row level security;
alter table checkins enable row level security;
alter table social_posts enable row level security;

-- Helper: is_admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "read own profile" on profiles for select using (auth.uid() = user_id);
create policy "read all profiles (admin)" on profiles for select using (is_admin());
create policy "update own profile" on profiles for update using (auth.uid() = user_id);
create policy "admin manage profiles" on profiles for all using (is_admin());

-- taste_profiles
create policy "own taste profile" on taste_profiles for all using (auth.uid() = user_id);

-- roasteries
create policy "public read roasteries" on roasteries for select using (true);
create policy "admin manage roasteries" on roasteries for all using (is_admin());
create policy "roaster manage own roastery" on roasteries for all using (owner_id = auth.uid());

-- beans
create policy "public read beans" on beans for select using (true);
create policy "admin manage beans" on beans for all using (is_admin());
create policy "roaster manage own beans" on beans for all using (
  exists (select 1 from roasteries where id = roastery_id and owner_id = auth.uid())
);

-- cafes
create policy "public read cafes" on cafes for select using (true);
create policy "admin manage cafes" on cafes for all using (is_admin());

-- barista_profiles
create policy "public read baristas" on barista_profiles for select using (true);
create policy "own barista profile" on barista_profiles for all using (user_id = auth.uid());
create policy "admin manage baristas" on barista_profiles for all using (is_admin());

-- menu_today
create policy "public read menu" on menu_today for select using (true);
create policy "barista manage own menu" on menu_today for all using (
  exists (select 1 from barista_profiles where id = barista_id and user_id = auth.uid())
);
create policy "admin manage menu" on menu_today for all using (is_admin());

-- checkins
create policy "public read checkins" on checkins for select using (true);
create policy "own checkins" on checkins for all using (auth.uid() = user_id);

-- social_posts
create policy "public read posts" on social_posts for select using (true);
create policy "own posts" on social_posts for all using (auth.uid() = user_id);
