GRANT SELECT, UPDATE ON public.teams TO service_role;

UPDATE public.teams SET coins = 10 WHERE team_name = 'Team Alpha';
UPDATE public.teams SET coins = 20 WHERE team_name = 'Team Beta';
