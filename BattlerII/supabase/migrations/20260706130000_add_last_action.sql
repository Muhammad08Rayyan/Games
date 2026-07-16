alter table public.lobbies add column last_action jsonb default '{}'::jsonb;
