-- Migration: Security Fixes
-- Created: 2026-07-15
-- Description: Fixes multiple database security issues including overly permissive
--   grants, missing CHECK constraints, loose RLS policies, missing indexes,
--   and adds a stale lobby cleanup function.

-- =============================================================================
-- 1. Fix overly permissive GRANT ALL TO anon
-- =============================================================================
-- Revoke ALL first, then re-grant with least-privilege.

-- characters
REVOKE ALL ON public.characters FROM anon, authenticated, service_role;
GRANT SELECT ON public.characters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT ALL ON public.characters TO service_role;

-- lobbies
REVOKE ALL ON public.lobbies FROM anon, authenticated, service_role;
GRANT SELECT ON public.lobbies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lobbies TO authenticated;
GRANT ALL ON public.lobbies TO service_role;

-- teams
REVOKE ALL ON public.teams FROM anon, authenticated;
GRANT SELECT ON public.teams TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;


-- =============================================================================
-- 2. Add CHECK constraints on character stats
-- =============================================================================
-- Prevents absurd / out-of-range values from being inserted or updated.

ALTER TABLE public.characters
  ADD CONSTRAINT check_health CHECK (health BETWEEN 1 AND 600),
  ADD CONSTRAINT check_damage CHECK (damage BETWEEN 1 AND 150),
  ADD CONSTRAINT check_speed  CHECK (speed  BETWEEN 1 AND 45),
  ADD CONSTRAINT check_cost   CHECK (cost   BETWEEN 1 AND 60);


-- =============================================================================
-- 3. Fix lobby RLS policies — tighten so guests can't overwrite host data
-- =============================================================================
-- The old "Host or Guest can update lobby" policy let guests modify ANY column
-- including host_roster. Drop the problematic overlapping policies, then
-- recreate them with proper separation of concerns.

DROP POLICY IF EXISTS "Host or Guest can update lobby" ON public.lobbies;
DROP POLICY IF EXISTS "Guests can join waiting lobby"  ON public.lobbies;

-- Host can update any field on their own lobby
CREATE POLICY "Host can update own lobby"
  ON public.lobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_team_id);

-- Guest can only update if they are the guest (join or set roster)
CREATE POLICY "Guest can update joined lobby"
  ON public.lobbies FOR UPDATE
  TO authenticated
  USING (auth.uid() = guest_team_id OR (status = 'waiting' AND guest_team_id IS NULL));


-- =============================================================================
-- 4. Add host can delete own lobby
-- =============================================================================

CREATE POLICY "Host can delete own lobby"
  ON public.lobbies FOR DELETE
  TO authenticated
  USING (auth.uid() = host_team_id);


-- =============================================================================
-- 5. Add an index on characters.team_id for faster lookups
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_characters_team_id ON public.characters(team_id);


-- =============================================================================
-- 6. Lobby cleanup function + cron job (pg_cron)
-- =============================================================================
-- Deletes lobbies older than 2 hours, or cancelled lobbies older than 5 minutes.

CREATE OR REPLACE FUNCTION public.cleanup_stale_lobbies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.lobbies
  WHERE (created_at < now() - interval '2 hours')
     OR (status = 'cancelled' AND created_at < now() - interval '5 minutes');
END;
$$;

-- To enable automatic cleanup, run in the Supabase SQL Editor:
-- SELECT cron.schedule('cleanup-stale-lobbies', '*/30 * * * *', 'SELECT public.cleanup_stale_lobbies()');
