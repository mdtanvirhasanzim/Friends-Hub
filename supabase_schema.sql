-- ==============================================================================
-- FriendsHub PostgreSQL Database Schema
-- Automatic User Profile Creation, Storage Buckets, Realtime Subscriptions & RLS
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. SCHEMAS & TABLES
-- ==============================================================================

-- 2.1 User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio TEXT DEFAULT 'Friend in the circle 👋',
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  online_status TEXT NOT NULL DEFAULT 'offline' CHECK (online_status IN ('online', 'away', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_mode TEXT NOT NULL DEFAULT 'exact' CHECK (privacy_mode IN ('exact', 'approximate')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 Live Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL UNIQUE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION DEFAULT 10,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  battery_level INTEGER DEFAULT 90,
  activity TEXT DEFAULT 'stationary' CHECK (activity IN ('stationary', 'walking', 'driving', 'cycling')),
  address_hint TEXT DEFAULT 'Live Location',
  is_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.3 Community Feed Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  post_type TEXT NOT NULL DEFAULT 'post' CHECK (post_type IN ('post', 'photo_upload', 'meetup_created', 'announcement')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2.5 Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Photo Albums
CREATE TABLE IF NOT EXISTS public.albums (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 Photos Table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.8 Meetups & Events Table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 Event Attendees (RSVPs)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 2.10 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  actor_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_tab TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.11 Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by TEXT,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 2.12 Content Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  reporter_id TEXT NOT NULL,
  reported_post_id TEXT,
  reported_user_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.13 Activity Audit Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  location_hint TEXT,
  device_hint TEXT,
  ip_hint TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 2.14 Search Query Logs Table
CREATE TABLE IF NOT EXISTS public.search_logs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'global',
  result_count INTEGER DEFAULT 0,
  ip_hint TEXT,
  device_hint TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.15 Community Settings Table
CREATE TABLE IF NOT EXISTS public.community_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  community_name TEXT NOT NULL DEFAULT 'FriendsHub',
  invite_code TEXT NOT NULL DEFAULT 'CIRCLE2026',
  allow_member_invites BOOLEAN NOT NULL DEFAULT TRUE,
  allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
  announcement_banner TEXT DEFAULT '🌟 Welcome to FriendsHub! Live radar & real-time sync is active for all members.',
  announcement_active BOOLEAN NOT NULL DEFAULT TRUE,
  default_location_interval_sec INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
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

-- ==============================================================================
-- 4. AUTOMATIC PROFILE CREATION TRIGGER & FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_username TEXT;
  new_full_name TEXT;
  new_avatar TEXT;
  new_role TEXT;
BEGIN
  -- Extract and sanitize username
  new_username := LOWER(COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    SPLIT_PART(NEW.email, '@', 1)
  ));
  new_username := REGEXP_REPLACE(new_username, '[^a-z0-9_]', '', 'g');
  IF new_username = '' THEN
    new_username := 'user_' || SUBSTRING(NEW.id::TEXT, 1, 6);
  END IF;

  -- Ensure unique username in profiles table to prevent trigger transaction abort
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username AND id <> NEW.id::TEXT) THEN
    new_username := new_username || '_' || SUBSTRING(NEW.id::TEXT, 1, 4);
  END IF;

  -- Extract full_name or fallback
  new_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    INITCAP(SPLIT_PART(NEW.email, '@', 1))
  );

  -- Extract avatar or fallback
  new_avatar := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  -- Check if user is first user or requested admin
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  END IF;

  -- Insert or update profile in public.profiles table
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    email,
    avatar_url,
    bio,
    phone,
    role,
    status,
    is_active,
    online_status,
    last_seen,
    location_sharing_enabled,
    privacy_mode
  ) VALUES (
    NEW.id::TEXT,
    new_username,
    new_full_name,
    NEW.email,
    new_avatar,
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Friend in the circle 👋'),
    NEW.raw_user_meta_data->>'phone',
    new_role,
    'active',
    TRUE,
    'online',
    NOW(),
    COALESCE((NEW.raw_user_meta_data->>'location_sharing_enabled')::BOOLEAN, TRUE),
    'exact'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    online_status = 'online',
    last_seen = NOW();

  -- Also create default location entry
  INSERT INTO public.locations (
    user_id,
    latitude,
    longitude,
    accuracy,
    battery_level,
    activity,
    address_hint,
    is_sharing
  ) VALUES (
    NEW.id::TEXT,
    23.7461,
    90.3742,
    10,
    95,
    'stationary',
    'Dhaka, Bangladesh',
    TRUE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Set REPLICA IDENTITY to FULL for complete Realtime updates
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.locations REPLICA IDENTITY FULL;

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_locations_updated_at ON public.locations;
CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
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

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::TEXT AND role = 'admin'
  );
$$;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users and service can insert profile" ON public.profiles;
CREATE POLICY "Users and service can insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::TEXT = id OR public.is_admin() OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin() OR auth.uid() IS NULL);

-- --- LOCATIONS POLICIES ---
DROP POLICY IF EXISTS "View locations" ON public.locations;
CREATE POLICY "View locations" ON public.locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage locations" ON public.locations;
CREATE POLICY "Manage locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);

-- --- POSTS POLICIES ---
DROP POLICY IF EXISTS "Public can view posts" ON public.posts;
CREATE POLICY "Public can view posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage posts" ON public.posts;
CREATE POLICY "Manage posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);

-- --- POST LIKES & COMMENTS ---
DROP POLICY IF EXISTS "View likes" ON public.post_likes;
CREATE POLICY "View likes" ON public.post_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage likes" ON public.post_likes;
CREATE POLICY "Manage likes" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "View comments" ON public.post_comments;
CREATE POLICY "View comments" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage comments" ON public.post_comments;
CREATE POLICY "Manage comments" ON public.post_comments FOR ALL USING (true) WITH CHECK (true);

-- --- ALBUMS & PHOTOS ---
DROP POLICY IF EXISTS "View albums" ON public.albums;
CREATE POLICY "View albums" ON public.albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage albums" ON public.albums;
CREATE POLICY "Manage albums" ON public.albums FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "View photos" ON public.photos;
CREATE POLICY "View photos" ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage photos" ON public.photos;
CREATE POLICY "Manage photos" ON public.photos FOR ALL USING (true) WITH CHECK (true);

-- --- EVENTS & RSVPS ---
DROP POLICY IF EXISTS "View events" ON public.events;
CREATE POLICY "View events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage events" ON public.events;
CREATE POLICY "Manage events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "View RSVPs" ON public.event_rsvps;
CREATE POLICY "View RSVPs" ON public.event_rsvps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage RSVPs" ON public.event_rsvps;
CREATE POLICY "Manage RSVPs" ON public.event_rsvps FOR ALL USING (true) WITH CHECK (true);

-- --- NOTIFICATIONS ---
DROP POLICY IF EXISTS "View notifications" ON public.notifications;
CREATE POLICY "View notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage notifications" ON public.notifications;
CREATE POLICY "Manage notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- --- INVITATIONS & REPORTS ---
DROP POLICY IF EXISTS "View invitations" ON public.invitations;
CREATE POLICY "View invitations" ON public.invitations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage invitations" ON public.invitations;
CREATE POLICY "Manage invitations" ON public.invitations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "View reports" ON public.reports;
CREATE POLICY "View reports" ON public.reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage reports" ON public.reports;
CREATE POLICY "Manage reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- --- ACTIVITY & SEARCH AUDIT LOGS ---
DROP POLICY IF EXISTS "View activity logs" ON public.activity_logs;
CREATE POLICY "View activity logs" ON public.activity_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert activity logs" ON public.activity_logs;
CREATE POLICY "Insert activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "View search logs" ON public.search_logs;
CREATE POLICY "View search logs" ON public.search_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insert search logs" ON public.search_logs;
CREATE POLICY "Insert search logs" ON public.search_logs FOR INSERT WITH CHECK (true);

-- --- COMMUNITY SETTINGS ---
DROP POLICY IF EXISTS "View settings" ON public.community_settings;
CREATE POLICY "View settings" ON public.community_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage settings" ON public.community_settings;
CREATE POLICY "Manage settings" ON public.community_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. SUPABASE STORAGE BUCKETS SETUP (AVATARS & PHOTOS)
-- ==============================================================================

-- Create Storage Buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies for Avatars and Photos
DROP POLICY IF EXISTS "Public Storage Read" ON storage.objects;
CREATE POLICY "Public Storage Read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('avatars', 'photos'));

DROP POLICY IF EXISTS "Public Storage Insert" ON storage.objects;
CREATE POLICY "Public Storage Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'photos'));

DROP POLICY IF EXISTS "Public Storage Update" ON storage.objects;
CREATE POLICY "Public Storage Update" ON storage.objects
  FOR UPDATE USING (bucket_id IN ('avatars', 'photos'));

DROP POLICY IF EXISTS "Public Storage Delete" ON storage.objects;
CREATE POLICY "Public Storage Delete" ON storage.objects
  FOR DELETE USING (bucket_id IN ('avatars', 'photos'));

-- ==============================================================================
-- 7. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.photos;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.albums;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.event_rsvps;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.search_logs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.community_settings;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
