-- Friends-Hub: build the missing Supabase tables while preserving profiles.id = auth.users.id (UUID).
-- Run this whole file once in Supabase SQL Editor.
-- It is safe to re-run because all CREATE statements use IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  is_sharing boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  latitude double precision,
  longitude double precision,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text,
  message text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Useful indexes for realtime feeds/maps.
CREATE INDEX IF NOT EXISTS locations_user_id_idx ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS locations_updated_at_idx ON public.locations(updated_at DESC);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS photos_user_id_idx ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);
CREATE INDEX IF NOT EXISTS events_starts_at_idx ON public.events(starts_at);
CREATE INDEX IF NOT EXISTS event_rsvps_event_id_idx ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

-- Enable RLS.
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Private Friends-Hub: authenticated friends can read shared community data.
DROP POLICY IF EXISTS "Friends can read locations" ON public.locations;
CREATE POLICY "Friends can read locations" ON public.locations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can write own location" ON public.locations;
CREATE POLICY "Friends can write own location" ON public.locations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can update own location" ON public.locations;
CREATE POLICY "Friends can update own location" ON public.locations FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Friends can read posts" ON public.posts;
CREATE POLICY "Friends can read posts" ON public.posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create own posts" ON public.posts;
CREATE POLICY "Friends can create own posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can update own posts" ON public.posts;
CREATE POLICY "Friends can update own posts" ON public.posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can delete own posts" ON public.posts;
CREATE POLICY "Friends can delete own posts" ON public.posts FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Friends can read likes" ON public.post_likes;
CREATE POLICY "Friends can read likes" ON public.post_likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create own likes" ON public.post_likes;
CREATE POLICY "Friends can create own likes" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can delete own likes" ON public.post_likes;
CREATE POLICY "Friends can delete own likes" ON public.post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Friends can read comments" ON public.post_comments;
CREATE POLICY "Friends can read comments" ON public.post_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create own comments" ON public.post_comments;
CREATE POLICY "Friends can create own comments" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can update own comments" ON public.post_comments;
CREATE POLICY "Friends can update own comments" ON public.post_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can delete own comments" ON public.post_comments;
CREATE POLICY "Friends can delete own comments" ON public.post_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Friends can read photos" ON public.photos;
CREATE POLICY "Friends can read photos" ON public.photos FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create own photos" ON public.photos;
CREATE POLICY "Friends can create own photos" ON public.photos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can delete own photos" ON public.photos;
CREATE POLICY "Friends can delete own photos" ON public.photos FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Friends can read events" ON public.events;
CREATE POLICY "Friends can read events" ON public.events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create events" ON public.events;
CREATE POLICY "Friends can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "Friends can update events" ON public.events;
CREATE POLICY "Friends can update events" ON public.events FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "Friends can delete events" ON public.events;
CREATE POLICY "Friends can delete events" ON public.events FOR DELETE TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Friends can read event rsvps" ON public.event_rsvps;
CREATE POLICY "Friends can read event rsvps" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Friends can create own rsvps" ON public.event_rsvps;
CREATE POLICY "Friends can create own rsvps" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Friends can update own rsvps" ON public.event_rsvps;
CREATE POLICY "Friends can update own rsvps" ON public.event_rsvps FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Realtime publication: add only tables that exist and are not already members.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname AS table_name
    FROM (VALUES
      ('locations'), ('posts'), ('post_likes'), ('post_comments'),
      ('photos'), ('events'), ('event_rsvps'), ('notifications')
    ) AS v(table_name)
    JOIN pg_class c ON c.relname = v.table_name
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    WHERE NOT EXISTS (
      SELECT 1 FROM pg_publication_tables p
      WHERE p.pubname = 'supabase_realtime'
        AND p.schemaname = 'public'
        AND p.tablename = c.relname
    )
  LOOP
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', r.table_name);
  END LOOP;
END $$;

ALTER TABLE public.locations REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.post_comments REPLICA IDENTITY FULL;
ALTER TABLE public.photos REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_rsvps REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Verification: this should now list the realtime tables.
SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;
