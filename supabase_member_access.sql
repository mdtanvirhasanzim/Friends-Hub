-- FriendsHub: member access + no-confirmation checklist
-- Run this in Supabase SQL Editor after the main schema.
-- IMPORTANT: Email confirmation itself is controlled by Supabase Auth settings,
-- not by PostgreSQL RLS. Disable Confirm email in: Authentication -> Providers -> Email.

-- 1) Authenticated members can read every public table.
DO $$
DECLARE
  t RECORD;
  policy_name TEXT := 'Authenticated members can read all rows';
BEGIN
  FOR t IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename <> 'schema_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, t.tablename);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      policy_name, t.tablename
    );
  END LOOP;
END $$;

-- 2) Profiles are also readable by members. Keep public read access because
-- the app's username lookup happens before password authentication.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- 3) A signed-in member may maintain their own profile.
DROP POLICY IF EXISTS "Members can update own profile" ON public.profiles;
CREATE POLICY "Members can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- 4) Authenticated members may create their own profile if the trigger did not
-- create it (the app also has an ensureProfile fallback).
DROP POLICY IF EXISTS "Members can insert own profile" ON public.profiles;
CREATE POLICY "Members can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- 5) Make sure the community setting permits registration.
UPDATE public.community_settings
SET allow_registration = TRUE
WHERE id = 'default';

-- If no default row exists, create one.
INSERT INTO public.community_settings (id, community_name, allow_registration)
VALUES ('default', 'FriendsHub', TRUE)
ON CONFLICT (id) DO UPDATE SET allow_registration = TRUE;
