-- FriendsHub: create the missing public tables and enable realtime.
-- IMPORTANT: public.profiles already exists in the live project and must remain UUID,
-- linked to auth.users(id). This migration intentionally does NOT alter profiles.id.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION DEFAULT 10,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  battery_level INTEGER DEFAULT 90,
  activity TEXT DEFAULT 'stationary' CHECK (activity IN ('stationary','walking','driving','cycling')),
  address_hint TEXT DEFAULT 'Live Location',
  is_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  post_type TEXT NOT NULL DEFAULT 'post' CHECK (post_type IN ('post','photo_upload','meetup_created','announcement')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_likes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id,user_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.albums (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.photos (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  album_id TEXT,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going','maybe','not_going')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id,user_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  actor_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_tab TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invitations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  reporter_id TEXT NOT NULL,
  reported_post_id TEXT,
  reported_user_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  location_hint TEXT,
  device_hint TEXT,
  ip_hint TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS public.search_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'global',
  result_count INTEGER DEFAULT 0,
  ip_hint TEXT,
  device_hint TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'FriendsHub',
  invite_code TEXT NOT NULL DEFAULT 'CIRCLE2026',
  allow_member_invites BOOLEAN NOT NULL DEFAULT TRUE,
  allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
  announcement_banner TEXT,
  announcement_active BOOLEAN NOT NULL DEFAULT TRUE,
  default_location_interval_sec INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_sharing ON public.locations(is_sharing);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON public.photos(album_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON public.activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_time ON public.search_logs(timestamp DESC);

-- RLS: authenticated FriendsHub members can read/write shared community data.
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['locations','posts','post_likes','post_comments','albums','photos','events','event_rsvps','notifications','invitations','reports','activity_logs','search_logs','community_settings'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'FriendsHub authenticated access', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', 'FriendsHub authenticated access', t);
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
  END LOOP;
END $$;

-- profiles is already present and is UUID -> auth.users.id.
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Enable Supabase Realtime for every table that actually exists.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','locations','posts','post_likes','post_comments','albums','photos','events','event_rsvps','notifications','invitations','reports','activity_logs','search_logs','community_settings'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t)
       AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Verification
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
ORDER BY table_name;

SELECT tablename
FROM pg_publication_tables
WHERE pubname='supabase_realtime' AND schemaname='public'
ORDER BY tablename;
