-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  avatar_url text,
  wanikani_level integer,
  genki_chapter integer,
  tadoku_level integer
);

-- Create stories table
create table stories (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references profiles(id) not null,
  title text not null,
  content_jp text not null,
  content_en text not null,
  wanikani_level integer not null,
  genki_chapter integer not null,
  tadoku_level integer not null,
  topic text not null,
  upvotes integer default 0,
  vocabulary text[] not null,
  grammar text[] not null
);

-- Create quizzes table
create table quizzes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  story_id uuid references stories(id) not null,
  question text not null,
  options text[] not null,
  correct_answer integer not null,
  explanation text not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table stories enable row level security;
alter table quizzes enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Create policies for stories
create policy "Anyone can view stories"
  on stories for select
  using (true);

create policy "Authenticated users can create stories"
  on stories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own stories"
  on stories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own stories"
  on stories for delete
  using (auth.uid() = user_id);

-- Create policies for quizzes
create policy "Anyone can view quizzes"
  on quizzes for select
  using (true);

create policy "Authenticated users can create quizzes"
  on quizzes for insert
  with check (
    exists (
      select 1 from stories
      where stories.id = quizzes.story_id
      and stories.user_id = auth.uid()
    )
  );

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 