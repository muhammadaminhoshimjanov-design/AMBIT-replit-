-- Run this in Supabase SQL Editor

-- profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nickname text,
  bio text,
  avatar_url text,
  avatar_style text default 'A',
  focus_topics text[] default '{}',
  student_identity text,
  circle_preference text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- circles table
create table if not exists public.circles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  topic text,
  member_count integer default 0,
  created_at timestamptz default now()
);

-- circle_members
create table if not exists public.circle_members (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

-- posts
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles on delete cascade,
  circle_id uuid references public.circles on delete set null,
  content text not null,
  post_type text default 'general' check (post_type in ('question','debate','experience','general')),
  like_count integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now()
);

-- comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade,
  author_id uuid references public.profiles on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- post_likes
create table if not exists public.post_likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- follows
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles on delete cascade,
  following_id uuid references public.profiles on delete cascade,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.follows enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles readable by all" on public.profiles for select using (true);
create policy "Profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);

-- Circles: readable by all
create policy "Circles readable by all" on public.circles for select using (true);

-- Circle members: readable by all, insertable/deletable by owner
create policy "Circle members readable" on public.circle_members for select using (true);
create policy "Circle members insertable" on public.circle_members for insert with check (auth.uid() = user_id);
create policy "Circle members deletable" on public.circle_members for delete using (auth.uid() = user_id);

-- Posts: readable by all, insertable/deletable by owner
create policy "Posts readable" on public.posts for select using (true);
create policy "Posts insertable" on public.posts for insert with check (auth.uid() = author_id);
create policy "Posts updatable by owner" on public.posts for update using (auth.uid() = author_id);
create policy "Posts deletable by owner" on public.posts for delete using (auth.uid() = author_id);

-- Comments
create policy "Comments readable" on public.comments for select using (true);
create policy "Comments insertable" on public.comments for insert with check (auth.uid() = author_id);

-- Post likes
create policy "Likes readable" on public.post_likes for select using (true);
create policy "Likes insertable" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Likes deletable" on public.post_likes for delete using (auth.uid() = user_id);

-- toggle_like function (SECURITY DEFINER bypasses RLS so it can update like_count on any post)
create or replace function toggle_like(p_post_id uuid, p_user_id uuid)
returns json
language plpgsql security definer
as $$
declare
  existing_like record;
  new_count integer;
begin
  select * into existing_like from public.post_likes where post_id = p_post_id and user_id = p_user_id;
  if found then
    delete from public.post_likes where post_id = p_post_id and user_id = p_user_id;
    update public.posts set like_count = greatest(0, like_count - 1) where id = p_post_id returning like_count into new_count;
    return json_build_object('liked', false, 'like_count', new_count);
  else
    insert into public.post_likes(post_id, user_id) values(p_post_id, p_user_id) on conflict do nothing;
    update public.posts set like_count = like_count + 1 where id = p_post_id returning like_count into new_count;
    return json_build_object('liked', true, 'like_count', new_count);
  end if;
end;
$$;

-- Follows
create policy "Follows readable" on public.follows for select using (true);
create policy "Follows insertable" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Follows deletable" on public.follows for delete using (auth.uid() = follower_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed circles
insert into public.circles (name, description, topic) values
  ('SAT 1500+', 'Students aiming for top SAT scores', 'Exams'),
  ('Ivy / Top Universities', 'Track to Ivy League and top schools', 'Universities'),
  ('Business & Economics', 'Future economists and founders', 'Career'),
  ('Scholarship Hunters', 'Find and win scholarships together', 'Scholarships'),
  ('STEM Builders', 'Science, tech, engineering, math focused', 'STEM'),
  ('Self-Improvement', 'Habits, productivity, and mindset', 'Growth'),
  ('International Students', 'Global student community', 'Community'),
  ('Productivity Circle', 'Systems and tools to get more done', 'Productivity'),
  ('Future Entrepreneurs', 'Building something while in school', 'Business'),
  ('Essay & Applications', 'Refine your college essays together', 'Admissions')
on conflict (name) do nothing;

-- Update member counts function
create or replace function update_circle_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.circles set member_count = member_count + 1 where id = NEW.circle_id;
  elsif TG_OP = 'DELETE' then
    update public.circles set member_count = greatest(0, member_count - 1) where id = OLD.circle_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_circle_member_change on public.circle_members;
create trigger on_circle_member_change
  after insert or delete on public.circle_members
  for each row execute procedure update_circle_member_count();

-- Update comment count
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = OLD.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute procedure update_post_comment_count();
