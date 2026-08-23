-- ==============================================================================
-- FriendsHub PostgreSQL Schema, Automatic User Profile Creation,
-- Supabase Storage Buckets, Realtime Subscriptions & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. SCHEMAS & TABLES
-- ==============================================================================

-- 2.1 User Profiles Table (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 2.5 Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.6 Photo Albums
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.7 Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.9 Event Attendees (RSVPs)
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 2.10 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL, -- UUID or 'all' for circle-wide broadcasts
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_tab TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.11 Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 2.12 Content Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.13 Activity Audit Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Function to handle new user registration in auth.users
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
  -- Extract username from raw_user_meta_data or email prefix
  new_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    LOWER(SPLIT_PART(NEW.email, '@', 1))
  );

  -- Extract full_name or fallback
  new_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    INITCAP(SPLIT_PART(NEW.email, '@', 1))
  );

  -- Extract avatar or fallback
  new_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  );

  -- Check if user is first user or requested admin
  IF (SELECT COUNT(*) FROM public.profiles) = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
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
    NEW.id,
    new_username,
    new_full_name,
    new_avatar,
    COALESCE(NEW.raw_user_meta_data->>'bio', 'New member in FriendsHub circle! 👋'),
    NEW.raw_user_meta_data->>'phone',
    new_role,
    'active',
    TRUE,
    'online',
    NOW(),
    COALESCE((NEW.raw_user_meta_data->>'location_sharing_enabled')::BOOLEAN, FALSE),
    'exact'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    online_status = 'online',
    last_seen = NOW(),
    updated_at = NOW();

  -- Insert Initial Location row
  INSERT INTO public.locations (
    user_id,
    latitude,
    longitude,
    accuracy,
    is_sharing
  ) VALUES (
    NEW.id,
    23.7461,
    90.3742,
    10,
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create welcome notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    title,
    message,
    link_tab
  ) VALUES (
    'all',
    NEW.id,
    'member_joined',
    'New Member Joined',
    new_full_name || ' (@' || new_username || ') has joined FriendsHub!',
    'friends'
  );

  -- Log Activity
  INSERT INTO public.activity_logs (
    user_id,
    user_name,
    action,
    details
  ) VALUES (
    NEW.id::TEXT,
    new_full_name,
    'register',
    'Created new community account (@' || new_username || ')'
  );

  RETURN NEW;
END;
$$;

-- Trigger on auth.users after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Automatic updated_at trigger helper
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
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

-- --- LOCATIONS POLICIES ---
DROP POLICY IF EXISTS "View locations if sharing enabled or self or admin" ON public.locations;
CREATE POLICY "View locations if sharing enabled or self or admin" ON public.locations
  FOR SELECT TO authenticated USING (is_sharing = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage own location" ON public.locations;
CREATE POLICY "Users manage own location" ON public.locations
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- --- POSTS POLICIES ---
DROP POLICY IF EXISTS "Circle members can view posts" ON public.posts;
CREATE POLICY "Circle members can view posts" ON public.posts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can create posts" ON public.posts;
CREATE POLICY "Members can create posts" ON public.posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and admins can update posts" ON public.posts;
CREATE POLICY "Authors and admins can update posts" ON public.posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Authors and admins can delete posts" ON public.posts;
CREATE POLICY "Authors and admins can delete posts" ON public.posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- --- POST LIKES & COMMENTS ---
DROP POLICY IF EXISTS "Members can view likes" ON public.post_likes;
CREATE POLICY "Members can view likes" ON public.post_likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can like/unlike posts" ON public.post_likes;
CREATE POLICY "Members can like/unlike posts" ON public.post_likes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Members can view comments" ON public.post_comments;
CREATE POLICY "Members can view comments" ON public.post_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can insert comments" ON public.post_comments;
CREATE POLICY "Members can insert comments" ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.post_comments;
CREATE POLICY "Authors and admins can delete comments" ON public.post_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- --- ALBUMS & PHOTOS ---
DROP POLICY IF EXISTS "Members can view albums" ON public.albums;
CREATE POLICY "Members can view albums" ON public.albums FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can create albums" ON public.albums;
CREATE POLICY "Members can create albums" ON public.albums FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Members can view photos" ON public.photos;
CREATE POLICY "Members can view photos" ON public.photos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can upload photos" ON public.photos;
CREATE POLICY "Members can upload photos" ON public.photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authors and admins can delete photos" ON public.photos;
CREATE POLICY "Authors and admins can delete photos" ON public.photos FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- --- EVENTS & RSVPS ---
DROP POLICY IF EXISTS "Members can view events" ON public.events;
CREATE POLICY "Members can view events" ON public.events FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can create events" ON public.events;
CREATE POLICY "Members can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators and admins can update/delete events" ON public.events;
CREATE POLICY "Creators and admins can update/delete events" ON public.events FOR ALL TO authenticated
  USING (auth.uid() = created_by OR public.is_admin());

DROP POLICY IF EXISTS "Members can view RSVPs" ON public.event_rsvps;
CREATE POLICY "Members can view RSVPs" ON public.event_rsvps FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Members can manage their own RSVP" ON public.event_rsvps;
CREATE POLICY "Members can manage their own RSVP" ON public.event_rsvps FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- --- NOTIFICATIONS ---
DROP POLICY IF EXISTS "Members can view their notifications" ON public.notifications;
CREATE POLICY "Members can view their notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid()::TEXT OR user_id = 'all');

DROP POLICY IF EXISTS "Members can update their notifications" ON public.notifications;
CREATE POLICY "Members can update their notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()::TEXT OR user_id = 'all');

-- --- ACTIVITY & SEARCH AUDIT LOGS ---
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid()::TEXT = user_id);

DROP POLICY IF EXISTS "Members can insert activity logs" ON public.activity_logs;
CREATE POLICY "Members can insert activity logs" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view search logs" ON public.search_logs;
CREATE POLICY "Admins can view search logs" ON public.search_logs
  FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid()::TEXT = user_id);

DROP POLICY IF EXISTS "Members can insert search logs" ON public.search_logs;
CREATE POLICY "Members can insert search logs" ON public.search_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- --- COMMUNITY SETTINGS ---
DROP POLICY IF EXISTS "Members can view settings" ON public.community_settings;
CREATE POLICY "Members can view settings" ON public.community_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.community_settings;
CREATE POLICY "Admins can update settings" ON public.community_settings
  FOR ALL TO authenticated USING (public.is_admin());

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

-- Storage Policies for Avatars
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars' OR bucket_id = 'photos');

DROP POLICY IF EXISTS "Authenticated users upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users update avatars" ON storage.objects;
CREATE POLICY "Authenticated users update avatars" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users upload photos" ON storage.objects;
CREATE POLICY "Authenticated users upload photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "Authenticated users delete own photos" ON storage.objects;
CREATE POLICY "Authenticated users delete own photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'photos' OR bucket_id = 'avatars');

-- ==============================================================================
-- 7. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
  -- Add tables to realtime publication
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
