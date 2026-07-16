-- Create characters table
create table public.characters (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams not null,
  name text not null,
  health integer not null default 100,
  damage integer not null default 10,
  speed integer not null default 5,
  cost integer not null default 1
);

-- Enable RLS
alter table public.characters enable row level security;

-- Allow anyone to view characters
create policy "Anyone can view characters"
  on public.characters for select
  to anon, authenticated
  using (true);

-- Allow users to insert their own characters
create policy "Users can insert own characters"
  on public.characters for insert
  to authenticated
  with check (auth.uid() = team_id);

-- Allow users to update their own characters
create policy "Users can update own characters"
  on public.characters for update
  to authenticated
  using (auth.uid() = team_id);

-- Allow users to delete their own characters
create policy "Users can delete own characters"
  on public.characters for delete
  to authenticated
  using (auth.uid() = team_id);

-- Grant privileges to roles
GRANT ALL ON public.characters TO anon, authenticated, service_role;
