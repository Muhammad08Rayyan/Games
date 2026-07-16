create table public.lobbies (
  id uuid default gen_random_uuid() primary key,
  room_code text unique not null,
  host_team_id uuid references public.teams not null,
  guest_team_id uuid references public.teams,
  status text not null default 'waiting',
  host_roster jsonb default '[]'::jsonb,
  guest_roster jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.lobbies enable row level security;

-- Anyone can read lobbies (needed for joining by room_code)
create policy "Anyone can view lobbies"
  on public.lobbies for select
  to anon, authenticated
  using (true);

-- Authenticated users can create a lobby (they become the host)
create policy "Users can create lobbies"
  on public.lobbies for insert
  to authenticated
  with check (auth.uid() = host_team_id);

-- Host or Guest can update the lobby
create policy "Host or Guest can update lobby"
  on public.lobbies for update
  to authenticated
  using (auth.uid() = host_team_id or auth.uid() = guest_team_id);

-- Enable realtime for lobbies
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.lobbies;

GRANT ALL ON public.lobbies TO anon, authenticated, service_role;
