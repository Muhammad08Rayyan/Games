ALTER TABLE public.characters ADD COLUMN is_preset boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.teams (id, team_name, coins)
  VALUES (new.id, new.raw_user_meta_data->>'team_name', 0);
  
  INSERT INTO public.characters (team_id, name, health, damage, speed, cost, is_preset)
  VALUES 
    (new.id, 'Grunt', 50, 5, 5, 1, true),
    (new.id, 'Tank', 100, 3, 3, 3, true),
    (new.id, 'Assassin', 40, 10, 8, 3, true),
    (new.id, 'Bruiser', 80, 7, 6, 4, true),
    (new.id, 'Juggernaut', 150, 12, 4, 7, true);
    
  RETURN new;
END;
$$;
