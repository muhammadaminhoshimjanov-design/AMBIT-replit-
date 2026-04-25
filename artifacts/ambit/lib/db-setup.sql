-- Run this in Supabase SQL Editor
-- Ambit schema — full 25-page app

-- profiles table (extended)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  nickname text,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  avatar_style text default 'A',
  ambition_title text,
  focus_topics text[] default '{}',
  student_identity text,
  circle_preference text,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  role text default 'user' check (role in ('user','mod','admin')),
  is_banned boolean default false,
  is_premium boolean default false,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add columns if upgrading from older schema
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists ambition_title text;
alter table public.profiles add column if not exists xp integer default 0;
alter table public.profiles add column if not exists level integer default 1;
alter table public.profiles add column if not exists streak integer default 0;
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists is_banned boolean default false;
alter table public.profiles add column if not exists is_premium boolean default false;

-- circles (kept for back-compat) and communities (new alias)
create table if not exists public.circles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  topic text,
  icon_url text,
  member_count integer default 0,
  created_at timestamptz default now()
);
alter table public.circles add column if not exists icon_url text;

create or replace view public.communities as
  select id, name, description, topic, icon_url, member_count, created_at from public.circles;

-- circle_members
create table if not exists public.circle_members (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references public.circles on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

create or replace view public.community_members as
  select id, circle_id as community_id, user_id, joined_at from public.circle_members;

-- posts
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles on delete cascade,
  circle_id uuid references public.circles on delete set null,
  content text not null,
  image_url text,
  post_type text default 'general' check (post_type in ('question','debate','experience','general')),
  like_count integer default 0,
  comment_count integer default 0,
  status text default 'active' check (status in ('active','hidden','removed')),
  created_at timestamptz default now()
);
alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists status text default 'active';

-- comments
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade,
  author_id uuid references public.profiles on delete cascade,
  content text not null,
  status text default 'active' check (status in ('active','hidden','removed')),
  created_at timestamptz default now()
);
alter table public.comments add column if not exists status text default 'active';

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

-- goals
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  title text not null,
  description text,
  type text default 'general' check (type in ('study','health','career','habit','general')),
  progress integer default 0 check (progress between 0 and 100),
  deadline date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- badges
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  icon text default 'award',
  color text default '#F5B942',
  xp_required integer default 0,
  created_at timestamptz default now()
);

-- user_badges
create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  badge_id uuid references public.badges on delete cascade,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- reports
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  reporter_id uuid references public.profiles on delete cascade,
  reported_user_id uuid references public.profiles on delete cascade,
  post_id uuid references public.posts on delete set null,
  comment_id uuid references public.comments on delete set null,
  reason text not null,
  details text,
  severity text default 'low' check (severity in ('low','medium','high','critical')),
  status text default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz default now()
);

-- notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  title text not null,
  body text,
  type text default 'system' check (type in ('like','comment','follow','badge','mention','system','goal')),
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- mentor_messages (Lion Mentor chat)
create table if not exists public.mentor_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.follows enable row level security;
alter table public.goals enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.mentor_messages enable row level security;

-- Drop and recreate idempotently
do $$ begin
  -- profiles
  drop policy if exists "Profiles readable by all" on public.profiles;
  drop policy if exists "Profiles insertable by owner" on public.profiles;
  drop policy if exists "Profiles updatable by owner" on public.profiles;
  -- circles
  drop policy if exists "Circles readable by all" on public.circles;
  drop policy if exists "Circle members readable" on public.circle_members;
  drop policy if exists "Circle members insertable" on public.circle_members;
  drop policy if exists "Circle members deletable" on public.circle_members;
  -- posts
  drop policy if exists "Posts readable" on public.posts;
  drop policy if exists "Posts insertable" on public.posts;
  drop policy if exists "Posts updatable by owner" on public.posts;
  drop policy if exists "Posts deletable by owner" on public.posts;
  -- comments
  drop policy if exists "Comments readable" on public.comments;
  drop policy if exists "Comments insertable" on public.comments;
  -- likes
  drop policy if exists "Likes readable" on public.post_likes;
  drop policy if exists "Likes insertable" on public.post_likes;
  drop policy if exists "Likes deletable" on public.post_likes;
  -- follows
  drop policy if exists "Follows readable" on public.follows;
  drop policy if exists "Follows insertable" on public.follows;
  drop policy if exists "Follows deletable" on public.follows;
end $$;

create policy "Profiles readable by all" on public.profiles for select using (true);
create policy "Profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);

create policy "Circles readable by all" on public.circles for select using (true);
create policy "Circle members readable" on public.circle_members for select using (true);
create policy "Circle members insertable" on public.circle_members for insert with check (auth.uid() = user_id);
create policy "Circle members deletable" on public.circle_members for delete using (auth.uid() = user_id);

create policy "Posts readable" on public.posts for select using (status = 'active' or auth.uid() = author_id);
create policy "Posts insertable" on public.posts for insert with check (auth.uid() = author_id);
create policy "Posts updatable by owner" on public.posts for update using (auth.uid() = author_id);
create policy "Posts deletable by owner" on public.posts for delete using (auth.uid() = author_id);

create policy "Comments readable" on public.comments for select using (status = 'active' or auth.uid() = author_id);
create policy "Comments insertable" on public.comments for insert with check (auth.uid() = author_id);
create policy "Comments deletable by owner" on public.comments for delete using (auth.uid() = author_id);

create policy "Likes readable" on public.post_likes for select using (true);
create policy "Likes insertable" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Likes deletable" on public.post_likes for delete using (auth.uid() = user_id);

create policy "Follows readable" on public.follows for select using (true);
create policy "Follows insertable" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Follows deletable" on public.follows for delete using (auth.uid() = follower_id);

-- Goals
create policy "Goals readable by owner" on public.goals for select using (auth.uid() = user_id);
create policy "Goals insertable by owner" on public.goals for insert with check (auth.uid() = user_id);
create policy "Goals updatable by owner" on public.goals for update using (auth.uid() = user_id);
create policy "Goals deletable by owner" on public.goals for delete using (auth.uid() = user_id);

-- Badges (publicly readable)
create policy "Badges readable" on public.badges for select using (true);
create policy "User badges readable" on public.user_badges for select using (true);
create policy "User badges insertable by owner" on public.user_badges for insert with check (auth.uid() = user_id);

-- Reports
create policy "Reports insertable by anyone" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "Reports readable by reporter or staff" on public.reports for select using (
  auth.uid() = reporter_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('mod','admin'))
);
create policy "Reports updatable by staff" on public.reports for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('mod','admin'))
);

-- Notifications
create policy "Notifications readable by owner" on public.notifications for select using (auth.uid() = user_id);
create policy "Notifications insertable system" on public.notifications for insert with check (true);
create policy "Notifications updatable by owner" on public.notifications for update using (auth.uid() = user_id);

-- Mentor messages
create policy "Mentor messages readable by owner" on public.mentor_messages for select using (auth.uid() = user_id);
create policy "Mentor messages insertable by owner" on public.mentor_messages for insert with check (auth.uid() = user_id);

-- toggle_like RPC
create or replace function toggle_like(p_post_id uuid, p_user_id uuid)
returns json language plpgsql security definer as $$
declare like_exists boolean; new_count integer;
begin
  select exists(select 1 from public.post_likes where post_id = p_post_id and user_id = p_user_id) into like_exists;
  if like_exists then
    delete from public.post_likes where post_id = p_post_id and user_id = p_user_id;
    update public.posts set like_count = greatest(0, like_count - 1) where id = p_post_id returning like_count into new_count;
    return json_build_object('liked', false, 'like_count', new_count);
  else
    insert into public.post_likes(post_id, user_id) values(p_post_id, p_user_id) on conflict do nothing;
    update public.posts set like_count = like_count + 1 where id = p_post_id returning like_count into new_count;
    -- award xp
    update public.profiles set xp = xp + 1 where id = (select author_id from public.posts where id = p_post_id);
    insert into public.notifications(user_id, title, body, type, link)
      select p.author_id, 'New upvote', coalesce(pr.nickname,'Someone') || ' upvoted your post', 'like', '/post/' || p.id
      from public.posts p left join public.profiles pr on pr.id = p_user_id
      where p.id = p_post_id and p.author_id <> p_user_id;
    return json_build_object('liked', true, 'like_count', new_count);
  end if;
end; $$;

-- handle_new_user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- update circle counts
create or replace function update_circle_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.circles set member_count = member_count + 1 where id = NEW.circle_id;
  elsif TG_OP = 'DELETE' then
    update public.circles set member_count = greatest(0, member_count - 1) where id = OLD.circle_id;
  end if;
  return null;
end; $$ language plpgsql security definer;

drop trigger if exists on_circle_member_change on public.circle_members;
create trigger on_circle_member_change after insert or delete on public.circle_members
  for each row execute procedure update_circle_member_count();

-- comment count + notify
create or replace function update_post_comment_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = NEW.post_id;
    insert into public.notifications(user_id, title, body, type, link)
      select p.author_id, 'New comment', 'Someone commented on your post', 'comment', '/post/' || p.id
      from public.posts p where p.id = NEW.post_id and p.author_id <> NEW.author_id;
  elsif TG_OP = 'DELETE' then
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = OLD.post_id;
  end if;
  return null;
end; $$ language plpgsql security definer;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change after insert or delete on public.comments
  for each row execute procedure update_post_comment_count();

-- follow notify
create or replace function notify_on_follow()
returns trigger as $$
begin
  insert into public.notifications(user_id, title, body, type, link)
    select NEW.following_id, 'New follower',
      coalesce((select nickname from public.profiles where id = NEW.follower_id),'Someone') || ' started following you',
      'follow', '/user/' || NEW.follower_id;
  return null;
end; $$ language plpgsql security definer;

drop trigger if exists on_follow on public.follows;
create trigger on_follow after insert on public.follows
  for each row execute procedure notify_on_follow();

-- xp -> level (1 level per 100xp)
create or replace function update_user_level()
returns trigger as $$
begin
  NEW.level := greatest(1, 1 + (NEW.xp / 100));
  return NEW;
end; $$ language plpgsql;

drop trigger if exists on_xp_change on public.profiles;
create trigger on_xp_change before update of xp on public.profiles
  for each row execute procedure update_user_level();

-- Suggested users
create or replace function get_suggested_users(current_user_id uuid, limit_count int default 20)
returns table(user_id uuid, nickname text, bio text, avatar_style text, avatar_url text,
  student_identity text, focus_topics text[], shared_circles bigint, score bigint)
language plpgsql security definer as $$
begin
  return query
  select p.id, p.nickname, p.bio, p.avatar_style, p.avatar_url, p.student_identity, p.focus_topics,
    count(distinct cm2.circle_id) as shared_circles,
    (count(distinct cm2.circle_id) * 3
      + (case when p.student_identity = (select student_identity from public.profiles where id = current_user_id) then 1 else 0 end)
    ) as score
  from public.profiles p
  left join public.circle_members cm1 on cm1.user_id = current_user_id
  left join public.circle_members cm2 on cm2.circle_id = cm1.circle_id and cm2.user_id = p.id
  where p.id <> current_user_id and p.onboarding_completed = true
    and p.id not in (select following_id from public.follows where follower_id = current_user_id)
  group by p.id
  order by score desc, p.created_at desc
  limit limit_count;
end; $$;

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

-- Seed badges
insert into public.badges (name, description, icon, color, xp_required) values
  ('First Step', 'Created your account', 'flag', '#F5B942', 0),
  ('Voice Found', 'Posted your first idea', 'edit-3', '#3B82F6', 5),
  ('Conversationalist', 'Left 10 comments', 'message-circle', '#8B5CF6', 25),
  ('Crowd Favorite', 'Earned 50 upvotes', 'heart', '#EF4444', 50),
  ('Goal Setter', 'Created your first goal', 'target', '#10B981', 10),
  ('Streak Starter', '3-day streak', 'zap', '#F59E0B', 30),
  ('Community Builder', 'Joined 5 communities', 'users', '#06B6D4', 40),
  ('Rising Star', 'Reached level 5', 'star', '#F5B942', 400),
  ('Mentor', 'Helped 20 students', 'award', '#FFD76A', 200),
  ('Legend', 'Reached level 10', 'shield', '#FFD76A', 900)
on conflict (name) do nothing;
