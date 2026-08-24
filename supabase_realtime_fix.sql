-- FriendsHub production realtime repair
-- Run this once in Supabase SQL Editor after the existing schema is installed.
-- This is intentionally idempotent: it only adds tables that are not already
-- members of the supabase_realtime publication.

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'locations', 'posts', 'post_likes', 'post_comments',
    'albums', 'photos', 'events', 'event_rsvps', 'notifications',
    'invitations', 'reports', 'activity_logs', 'search_logs',
    'community_settings'
  ] LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = table_name
    )
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format(
        'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
        table_name
      );
    END IF;
  END LOOP;
END $$;

-- Send complete rows for UPDATE/DELETE payloads.
ALTER TABLE IF EXISTS public.profiles REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.locations REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.posts REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.albums REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.photos REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.events REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.event_rsvps REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.notifications REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.invitations REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.reports REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.activity_logs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.search_logs REPLICA IDENTITY FULL;
ALTER TABLE IF EXISTS public.community_settings REPLICA IDENTITY FULL;

-- The private FriendsHub circle can read shared community data.
DROP POLICY IF EXISTS "Realtime public profiles read" ON public.profiles;
CREATE POLICY "Realtime public profiles read"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Realtime public locations read" ON public.locations;
CREATE POLICY "Realtime public locations read"
  ON public.locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Realtime public posts read" ON public.posts;
CREATE POLICY "Realtime public posts read"
  ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Realtime public photos read" ON public.photos;
CREATE POLICY "Realtime public photos read"
  ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Realtime public events read" ON public.events;
CREATE POLICY "Realtime public events read"
  ON public.events FOR SELECT USING (true);

-- Verify after running:
-- SELECT pubname, schemaname, tablename
-- FROM pg_publication_tables
-- WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
-- ORDER BY tablename;
