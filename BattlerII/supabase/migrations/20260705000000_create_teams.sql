-- Create the teams table linked to Supabase Auth
create table public.teams (
  id uuid references auth.users not null primary key,
  team_name text not null unique,
  coins integer not null default 0
);

-- Turn on Row Level Security
alter table public.teams enable row level security;

-- Allow anyone to read the teams (so we can see enemy stats/names)
create policy "Anyone can view teams"
  on public.teams for select 
  to anon, authenticated
  using (true);

-- Allow authenticated users to update their OWN team
create policy "Users can update own team"
  on public.teams for update 
  to authenticated 
  using (auth.uid() = id);

-- Function to handle new user registration automatically
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.teams (id, team_name, coins)
  values (new.id, new.raw_user_meta_data->>'team_name', 0);
  return new;
end;
$$;

-- Trigger the function every time a user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
