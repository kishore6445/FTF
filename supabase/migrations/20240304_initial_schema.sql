-- Create tables for the Covey Task Manager

-- Enable RLS (Row Level Security)
alter table if exists public.tasks enable row level security;
alter table if exists public.subtasks enable row level security;
alter table if exists public.roles enable row level security;
alter table if exists public.goals enable row level security;
alter table if exists public.user_profiles enable row level security;
alter table if exists public.journal_entries enable row level security;

-- Create tasks table
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  quadrant text not null,
  role_id uuid references public.roles(id) on delete set null,
  completed boolean not null default false,
  time_spent integer not null default 0,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Create subtasks table
create table if not exists public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Create roles table
create table if not exists public.roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text not null,
  description text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Create goals table
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  deadline date,
  timeframe text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  mission text,
  vision text,
  eulogy text,
  long_term_goals text,
  ten_year_vision text,
  five_year_vision text,
  one_year_vision text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone
);

-- Create journal_entries table
create table if not exists public.journal_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  do_over_reflection text,
  gratitude_reflection text,
  journal_entry text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone,
  unique(user_id, date)
);

-- Create RLS policies
-- Tasks policies
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Subtasks policies
create policy "Users can view their own subtasks"
  on public.subtasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subtasks"
  on public.subtasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subtasks"
  on public.subtasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subtasks"
  on public.subtasks for delete
  using (auth.uid() = user_id);

-- Roles policies
create policy "Users can view their own roles"
  on public.roles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own roles"
  on public.roles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own roles"
  on public.roles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own roles"
  on public.roles for delete
  using (auth.uid() = user_id);

-- Goals policies
create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- User profiles policies
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);

-- Journal entries policies
create policy "Users can view their own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

