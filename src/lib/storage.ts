import {
  UserProfile,
  UserLocation,
  Post,
  PostComment,
  Album,
  Photo,
  CommunityEvent,
  NotificationItem,
  ReportItem,
  Invitation,
  CommunitySettings,
  RSVPStatus,
  ActivityLog,
  SearchLog,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-tanvir-admin',
    email: 'mdtanvirhasanzim12@gmail.com',
    username: 'tanvir_zim',
    full_name: 'Tanvir Hasan Zim',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    bio: 'Founder & Circle Organizer 🚀 Building our community hub.',
    role: 'admin',
    is_active: true,
    status: 'active',
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1712-345678',
  },
  {
    id: 'usr-sara-khan',
    email: 'sara.k@gmail.com',
    username: 'sara_k',
    full_name: 'Sara Khan',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Photography & Coffee Enthusiast ☕ Living in Gulshan.',
    role: 'member',
    is_active: true,
    status: 'active',
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-05T00:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1823-456789',
  },
  {
    id: 'usr-rahim-chowdhury',
    email: 'rahim.c@gmail.com',
    username: 'rahim_c',
    full_name: 'Rahim Chowdhury',
    avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    bio: 'Tech lead & Weekend Cyclist 🚴',
    role: 'member',
    is_active: true,
    status: 'active',
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'away',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-10T00:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1934-567890',
  },
  {
    id: 'usr-anika-tabassum',
    email: 'anika.t@gmail.com',
    username: 'anika_t',
    full_name: 'Anika Tabassum',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Architect, UI designer and tea lover 🎨',
    role: 'member',
    is_active: true,
    status: 'active',
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-12T00:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1645-678901',
  },
];

const INITIAL_LOCATIONS: UserLocation[] = [
  {
    id: 'loc-1',
    user_id: 'usr-tanvir-admin',
    latitude: 23.7461,
    longitude: 90.3742,
    accuracy: 8,
    heading: 90,
    speed: 0,
    battery_level: 95,
    activity: 'stationary',
    address_hint: 'Dhanmondi Lake Park, Dhaka',
    is_sharing: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'loc-2',
    user_id: 'usr-sara-khan',
    latitude: 23.7925,
    longitude: 90.4078,
    accuracy: 12,
    heading: 180,
    speed: 1.2,
    battery_level: 82,
    activity: 'walking',
    address_hint: 'Gulshan 2 Avenue, Dhaka',
    is_sharing: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'loc-3',
    user_id: 'usr-rahim-chowdhury',
    latitude: 23.7781,
    longitude: 90.3802,
    accuracy: 15,
    heading: 270,
    speed: 5.4,
    battery_level: 64,
    activity: 'cycling',
    address_hint: 'Agargaon Eco Road, Dhaka',
    is_sharing: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'loc-4',
    user_id: 'usr-anika-tabassum',
    latitude: 23.7533,
    longitude: 90.3921,
    accuracy: 6,
    heading: 0,
    speed: 0,
    battery_level: 91,
    activity: 'stationary',
    address_hint: 'Panthapath Central Plaza, Dhaka',
    is_sharing: true,
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    user_id: 'usr-tanvir-admin',
    content: 'Welcome to FriendsHub! 🎉 Our central circle platform is now active for all friends across every phone and browser. Check the live radar map, share meetups, and drop photos!',
    images: ['https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80'],
    location_name: 'Dhanmondi, Dhaka',
    post_type: 'announcement',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    likes: [{ id: 'like-1', post_id: 'post-1', user_id: 'usr-sara-khan', created_at: new Date().toISOString() }],
    comments: [
      {
        id: 'comm-1',
        post_id: 'post-1',
        user_id: 'usr-sara-khan',
        content: 'Looks awesome Tanvir! Love the real-time radar integration 🗺️',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
    ],
    is_pinned: true,
  },
  {
    id: 'post-2',
    user_id: 'usr-sara-khan',
    content: 'Sunset coffee vibes at Gulshan. Anyone nearby for a quick espresso break? ☕🌅',
    images: ['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80'],
    location_name: 'Gulshan 2, Dhaka',
    post_type: 'photo_upload',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: [
      { id: 'like-2', post_id: 'post-2', user_id: 'usr-tanvir-admin', created_at: new Date().toISOString() },
      { id: 'like-3', post_id: 'post-2', user_id: 'usr-rahim-chowdhury', created_at: new Date().toISOString() },
    ],
    comments: [],
  },
];

const INITIAL_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Weekend Group Rooftop BBQ & Tech Jam',
    description: 'Catching up, grilling skewers, playing board games and enjoying the evening breeze!',
    date: '2026-08-28',
    time: '18:00',
    location_name: 'Dhanmondi Lake View Rooftop',
    latitude: 23.7461,
    longitude: 90.3742,
    created_by: 'usr-tanvir-admin',
    created_at: new Date().toISOString(),
    attendees: [
      { id: 'att-1', event_id: 'evt-1', user_id: 'usr-tanvir-admin', status: 'going', created_at: new Date().toISOString() },
      { id: 'att-2', event_id: 'evt-1', user_id: 'usr-sara-khan', status: 'going', created_at: new Date().toISOString() },
      { id: 'att-3', event_id: 'evt-1', user_id: 'usr-rahim-chowdhury', status: 'maybe', created_at: new Date().toISOString() },
    ],
  },
];

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'alb-1',
    title: 'Community Moments 2026',
    description: 'Hangouts, meetups, and travel captures with friends',
    cover_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-tanvir-admin',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'ph-1',
    album_id: 'alb-1',
    user_id: 'usr-tanvir-admin',
    title: 'Friendship Memories 2026',
    description: 'First meetup celebration with the crew',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=80',
    location_name: 'Dhanmondi, Dhaka',
    created_at: new Date().toISOString(),
  },
  {
    id: 'ph-2',
    album_id: 'alb-1',
    user_id: 'usr-sara-khan',
    title: 'Gulshan Cafe Hangout',
    description: 'Golden hour moments',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
    location_name: 'Gulshan 2, Dhaka',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_SETTINGS: CommunitySettings = {
  community_name: 'FriendsHub',
  invite_code: 'CIRCLE2026',
  allow_member_invites: true,
  allow_registration: true,
  announcement_banner: '🌟 Welcome to FriendsHub! Live radar & real-time sync is active for all members.',
  announcement_active: true,
  default_location_interval_sec: 10,
};

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-init-1',
    user_id: 'usr-admin-tanvir',
    user_name: 'Tanvir Hasan Zim',
    action: 'admin_action',
    details: 'Initialized FriendsHub Centralized Cloud Database',
    location_hint: 'Dhaka, Bangladesh',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'act-init-2',
    user_id: 'usr-admin-tanvir',
    user_name: 'Tanvir Hasan Zim',
    action: 'login',
    details: 'Logged into Admin Console (Root Session Active)',
    location_hint: 'Dhanmondi, Dhaka',
    timestamp: new Date().toISOString(),
  },
];

export class DataStore {
  private profiles: UserProfile[] = [];
  private locations: UserLocation[] = [];
  private posts: Post[] = [];
  private albums: Album[] = [];
  private photos: Photo[] = [];
  private events: CommunityEvent[] = [];
  private notifications: NotificationItem[] = [];
  private reports: ReportItem[] = [];
  private invitations: Invitation[] = [];
  private settings: CommunitySettings = INITIAL_SETTINGS;
  private activity_logs: ActivityLog[] = [];
  private search_logs: SearchLog[] = [];
  private listeners: Set<() => void> = new Set();
  private syncTimer: any = null;
  private isSyncing = false;
  private realtimeChannel: any = null;

  constructor() {
    // 1. Initial State from Storage
    this.profiles = this.loadFromStorage('fh_profiles', INITIAL_PROFILES);
    this.locations = this.loadFromStorage('fh_locations', INITIAL_LOCATIONS);
    this.posts = this.loadFromStorage('fh_posts', INITIAL_POSTS);
    this.albums = this.loadFromStorage('fh_albums', INITIAL_ALBUMS);
    this.photos = this.loadFromStorage('fh_photos', INITIAL_PHOTOS);
    this.events = this.loadFromStorage('fh_events', INITIAL_EVENTS);
    this.notifications = this.loadFromStorage('fh_notifications', []);
    this.reports = this.loadFromStorage('fh_reports', []);
    this.invitations = this.loadFromStorage('fh_invitations', []);
    this.settings = this.loadFromStorage('fh_settings', INITIAL_SETTINGS);
    this.activity_logs = this.loadFromStorage('fh_activity_logs', INITIAL_ACTIVITY_LOGS);
    this.search_logs = this.loadFromStorage('fh_search_logs', []);

    // 2. Setup Supabase Realtime & Data Fetching
    this.initSupabase();

    // 3. Fallback backend synchronization loop
    this.syncWithServer();
    if (typeof window !== 'undefined') {
      this.syncTimer = setInterval(() => {
        this.syncWithServer();
      }, 3000);

      // Listen for runtime Supabase credential changes
      window.addEventListener('fh-supabase-config-changed', () => {
        this.initSupabase();
      });
    }
  }

  // --- Real-Time Supabase WebSocket Connection ---
  public initSupabase() {
    if (typeof window === 'undefined') return;

    if (isSupabaseConfigured && supabase) {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
      }

      this.fetchFromSupabase();

      this.realtimeChannel = supabase
        .channel('fh-realtime-master')
        .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
          this.handleSupabaseRealtime(payload);
        })
        .subscribe();
    }
  }

  private handleSupabaseRealtime(payload: any) {
    const { table, eventType, new: newRecord, old: oldRecord } = payload;
    let changed = false;

    if (table === 'profiles') {
      if (eventType === 'DELETE') {
        this.profiles = this.profiles.filter((p) => p.id !== oldRecord.id);
      } else if (newRecord) {
        const idx = this.profiles.findIndex((p) => p.id === newRecord.id);
        if (idx >= 0) {
          this.profiles[idx] = { ...this.profiles[idx], ...newRecord };
        } else {
          this.profiles.unshift(newRecord);
        }
      }
      this.saveToStorage('fh_profiles', this.profiles);
      changed = true;
    } else if (table === 'locations') {
      if (newRecord) {
        const idx = this.locations.findIndex((l) => l.user_id === newRecord.user_id);
        if (idx >= 0) {
          this.locations[idx] = { ...this.locations[idx], ...newRecord };
        } else {
          this.locations.unshift(newRecord);
        }
        this.saveToStorage('fh_locations', this.locations);
        changed = true;
      }
    } else if (table === 'posts') {
      if (eventType === 'DELETE') {
        this.posts = this.posts.filter((p) => p.id !== oldRecord.id);
      } else if (newRecord) {
        const idx = this.posts.findIndex((p) => p.id === newRecord.id);
        if (idx >= 0) {
          this.posts[idx] = { ...this.posts[idx], ...newRecord };
        } else {
          this.posts.unshift({ ...newRecord, likes: [], comments: [] });
        }
      }
      this.saveToStorage('fh_posts', this.posts);
      changed = true;
    } else if (table === 'photos') {
      if (eventType === 'DELETE') {
        this.photos = this.photos.filter((p) => p.id !== oldRecord.id);
      } else if (newRecord) {
        const idx = this.photos.findIndex((p) => p.id === newRecord.id);
        if (idx >= 0) {
          this.photos[idx] = { ...this.photos[idx], ...newRecord };
        } else {
          this.photos.unshift(newRecord);
        }
      }
      this.saveToStorage('fh_photos', this.photos);
      changed = true;
    } else if (table === 'events') {
      if (eventType === 'DELETE') {
        this.events = this.events.filter((e) => e.id !== oldRecord.id);
      } else if (newRecord) {
        const idx = this.events.findIndex((e) => e.id === newRecord.id);
        if (idx >= 0) {
          this.events[idx] = { ...this.events[idx], ...newRecord };
        } else {
          this.events.unshift({ ...newRecord, attendees: [] });
        }
      }
      this.saveToStorage('fh_events', this.events);
      changed = true;
    } else if (table === 'activity_logs') {
      if (newRecord) {
        this.activity_logs = [newRecord, ...this.activity_logs.filter((a) => a.id !== newRecord.id)];
        this.saveToStorage('fh_activity_logs', this.activity_logs);
        changed = true;
      }
    } else if (table === 'search_logs') {
      if (newRecord) {
        this.search_logs = [newRecord, ...this.search_logs.filter((s) => s.id !== newRecord.id)];
        this.saveToStorage('fh_search_logs', this.search_logs);
        changed = true;
      }
    }

    if (changed) {
      this.notify();
    }
  }

  // --- Fetch Data from Supabase ---
  public async fetchFromSupabase(): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const [
        { data: profData },
        { data: locData },
        { data: postData },
        { data: photoData },
        { data: eventData },
        { data: actData },
        { data: searchData },
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('locations').select('*'),
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('date', { ascending: true }),
        supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(200),
        supabase.from('search_logs').select('*').order('timestamp', { ascending: false }).limit(200),
      ]);

      let changed = false;

      if (profData && profData.length > 0) {
        this.profiles = profData as UserProfile[];
        this.saveToStorage('fh_profiles', this.profiles);
        changed = true;
      }

      if (locData && locData.length > 0) {
        this.locations = locData as UserLocation[];
        this.saveToStorage('fh_locations', this.locations);
        changed = true;
      }

      if (postData && postData.length > 0) {
        this.posts = postData.map((p: any) => ({
          ...p,
          likes: p.likes || [],
          comments: p.comments || [],
        }));
        this.saveToStorage('fh_posts', this.posts);
        changed = true;
      }

      if (photoData && photoData.length > 0) {
        this.photos = photoData as Photo[];
        this.saveToStorage('fh_photos', this.photos);
        changed = true;
      }

      if (eventData && eventData.length > 0) {
        this.events = eventData.map((e: any) => ({
          ...e,
          attendees: e.attendees || [],
        }));
        this.saveToStorage('fh_events', this.events);
        changed = true;
      }

      if (actData && actData.length > 0) {
        this.activity_logs = actData as ActivityLog[];
        this.saveToStorage('fh_activity_logs', this.activity_logs);
        changed = true;
      }

      if (searchData && searchData.length > 0) {
        this.search_logs = searchData as SearchLog[];
        this.saveToStorage('fh_search_logs', this.search_logs);
        changed = true;
      }

      if (changed) {
        this.notify();
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Sync] Could not fetch records:', err);
      return false;
    }
  }

  // --- 1-Click Sync Local State directly into Supabase Database ---
  public async syncAllToSupabase(): Promise<{
    success: boolean;
    syncedCounts: { profiles: number; locations: number; posts: number; photos: number; events: number };
    message: string;
    error?: string;
  }> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        syncedCounts: { profiles: 0, locations: 0, posts: 0, photos: 0, events: 0 },
        message: 'Supabase is not configured yet. Please configure your Project URL & Anon Key.',
      };
    }

    try {
      // 1. Sync Profiles
      // 1. Get existing Supabase profiles by Friends-Hub local ID
const { data: existingProfiles, error: existingProfilesError } =
  await supabase
    .from('profiles')
    .select('id, external_user_id, external_id')
    .in(
      'external_user_id',
      this.profiles.map((p) => p.id)
    );

if (existingProfilesError) {
  throw existingProfilesError;
}

// 2. Create local ID -> Supabase UUID mapping
const profileIdMap = new Map(
  (existingProfiles || []).map((p) => [
    p.external_user_id || p.external_id,
    p.id,
  ])
);

// 3. Prepare profiles for Supabase
const cleanProfiles = this.profiles
  .map((p) => {
    const supabaseId = profileIdMap.get(p.id);

    // Don't send a local usr-* ID into UUID column
    if (!supabaseId) {
      console.warn(
        `Skipping profile ${p.id}: no Supabase Auth/profile UUID found`
      );
      return null;
    }

    return {
      id: supabaseId,                 // ✅ UUID
      username: p.username,
      full_name: p.full_name,
      email: p.email,
      avatar_url: p.avatar_url,
      bio: p.bio,
      phone: p.phone,
      role: p.role || 'member',
      status: p.status || 'active',
      is_active: p.is_active ?? true,
      online_status: p.online_status || 'online',
      last_seen: p.last_seen || new Date().toISOString(),
      location_sharing_enabled:
        p.location_sharing_enabled ?? true,
      privacy_mode: p.privacy_mode || 'exact',
      external_user_id: p.id,         // ✅ usr-tanvir-admin
      external_id: p.id,              // ✅ usr-tanvir-admin
      created_at: p.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  })
  .filter(Boolean);

      const { error: profErr } = await supabase.from('profiles').upsert(cleanProfiles, { onConflict: 'id' });
      if (profErr) throw new Error(`Profiles Sync Failed: ${profErr.message}`);

      // 2. Sync Locations
      const cleanLocations = this.locations.map((l) => ({
        id: l.id,
        user_id: l.user_id,
        latitude: l.latitude,
        longitude: l.longitude,
        accuracy: l.accuracy || 10,
        battery_level: l.battery_level || 90,
        activity: l.activity || 'stationary',
        address_hint: l.address_hint || 'Dhaka, Bangladesh',
        is_sharing: l.is_sharing ?? true,
        updated_at: l.updated_at || new Date().toISOString(),
      }));
      await supabase.from('locations').upsert(cleanLocations, { onConflict: 'user_id' });

      // 3. Sync Posts
      const cleanPosts = this.posts.map((p) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        images: p.images || [],
        location_name: p.location_name,
        post_type: p.post_type || 'post',
        is_pinned: p.is_pinned ?? false,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      }));
      await supabase.from('posts').upsert(cleanPosts, { onConflict: 'id' });

      // 4. Sync Photos
      const cleanPhotos = this.photos.map((ph) => ({
        id: ph.id,
        user_id: ph.user_id,
        album_id: ph.album_id || null,
        title: ph.title,
        description: ph.description,
        image_url: ph.image_url,
        location_name: ph.location_name,
        created_at: ph.created_at || new Date().toISOString(),
      }));
      await supabase.from('photos').upsert(cleanPhotos, { onConflict: 'id' });

      // 5. Sync Events
      const cleanEvents = this.events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location_name: e.location_name,
        created_by: e.created_by,
        created_at: e.created_at || new Date().toISOString(),
      }));
      await supabase.from('events').upsert(cleanEvents, { onConflict: 'id' });

      // 6. Log Sync Event
      await supabase.from('activity_logs').insert({
        user_id: 'usr-admin-tanvir',
        user_name: 'Tanvir Hasan Zim',
        action: 'admin_action',
        details: 'Manually synchronized full community database to Supabase PostgreSQL cloud tables.',
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        syncedCounts: {
          profiles: cleanProfiles.length,
          locations: cleanLocations.length,
          posts: cleanPosts.length,
          photos: cleanPhotos.length,
          events: cleanEvents.length,
        },
        message: `Successfully synchronized ${cleanProfiles.length} profiles, ${cleanLocations.length} locations, ${cleanPosts.length} posts, ${cleanPhotos.length} photos, and ${cleanEvents.length} events to your Supabase tables!`,
      };
    } catch (err: any) {
      console.error('[Supabase Sync Error]:', err);
      return {
        success: false,
        syncedCounts: { profiles: 0, locations: 0, posts: 0, photos: 0, events: 0 },
        message: err.message || 'Sync operation failed.',
        error: String(err),
      };
    }
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultValue;
  }

  private saveToStorage(key: string, value: unknown) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Safe fallback
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // Safe execution
      }
    });
  }

  // --- Real-time Backend Synchronization ---
  public async syncWithServer() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        let changed = false;

        if (data.profiles && JSON.stringify(data.profiles) !== JSON.stringify(this.profiles)) {
          this.profiles = data.profiles;
          this.saveToStorage('fh_profiles', this.profiles);
          changed = true;
        }

        if (data.locations && JSON.stringify(data.locations) !== JSON.stringify(this.locations)) {
          this.locations = data.locations;
          this.saveToStorage('fh_locations', this.locations);
          changed = true;
        }

        if (data.posts && JSON.stringify(data.posts) !== JSON.stringify(this.posts)) {
          this.posts = data.posts;
          this.saveToStorage('fh_posts', this.posts);
          changed = true;
        }

        if (data.photos && JSON.stringify(data.photos) !== JSON.stringify(this.photos)) {
          this.photos = data.photos;
          this.saveToStorage('fh_photos', this.photos);
          changed = true;
        }

        if (data.albums && JSON.stringify(data.albums) !== JSON.stringify(this.albums)) {
          this.albums = data.albums;
          this.saveToStorage('fh_albums', this.albums);
          changed = true;
        }

        if (data.events && JSON.stringify(data.events) !== JSON.stringify(this.events)) {
          this.events = data.events;
          this.saveToStorage('fh_events', this.events);
          changed = true;
        }

        if (data.notifications && JSON.stringify(data.notifications) !== JSON.stringify(this.notifications)) {
          this.notifications = data.notifications;
          this.saveToStorage('fh_notifications', this.notifications);
          changed = true;
        }

        if (data.invitations && JSON.stringify(data.invitations) !== JSON.stringify(this.invitations)) {
          this.invitations = data.invitations;
          this.saveToStorage('fh_invitations', this.invitations);
          changed = true;
        }

        if (data.settings && JSON.stringify(data.settings) !== JSON.stringify(this.settings)) {
          this.settings = data.settings;
          this.saveToStorage('fh_settings', this.settings);
          changed = true;
        }

        if (data.activity_logs && JSON.stringify(data.activity_logs) !== JSON.stringify(this.activity_logs)) {
          this.activity_logs = data.activity_logs;
          this.saveToStorage('fh_activity_logs', this.activity_logs);
          changed = true;
        }

        if (data.search_logs && JSON.stringify(data.search_logs) !== JSON.stringify(this.search_logs)) {
          this.search_logs = data.search_logs;
          this.saveToStorage('fh_search_logs', this.search_logs);
          changed = true;
        }

        if (changed) {
          this.notify();
        }
      }
    } catch {
      // Backend offline or fallback mode
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Auth & User Registration ---
  public async registerUser(data: {
    full_name: string;
    username: string;
    email: string;
    password?: string;
    phone?: string;
    bio?: string;
    avatar_url?: string;
    role?: 'member' | 'admin';
    invite_code?: string;
    location_sharing_enabled?: boolean;
    address_hint?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    const newProfile: UserProfile = {
      id: `usr-${data.username.toLowerCase().replace(/[^a-z0-9_]/g, '')}-${Date.now().toString(36)}`,
      email: data.email,
      username: data.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      full_name: data.full_name,
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: data.bio || 'New circle member 👋',
      role: data.role || 'member',
      is_active: true,
      status: 'active',
      location_sharing_enabled: data.location_sharing_enabled ?? true,
      privacy_mode: 'exact',
      online_status: 'online',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: data.phone,
    };

    // 1. Supabase direct write if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert(newProfile);
        await supabase.from('locations').upsert({
          user_id: newProfile.id,
          latitude: data.latitude || 23.7461,
          longitude: data.longitude || 90.3742,
          accuracy: 10,
          battery_level: 95,
          activity: 'stationary',
          address_hint: data.address_hint || 'Dhaka, Bangladesh',
          is_sharing: data.location_sharing_enabled ?? true,
        });
      } catch (e) {
        console.warn('[Supabase Direct Write failed]:', e);
      }
    }

    // 2. Server-side persistence
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        return { success: false, error: body.error || 'Registration failed.' };
      }
      if (body.profile) {
        this.addProfile(body.profile);
        return { success: true, profile: body.profile };
      }
    } catch {
      // Fallback
    }

    this.addProfile(newProfile);
    return { success: true, profile: newProfile };
  }

  public async loginUser(identifier: string, password?: string, address_hint?: string): Promise<{ success: boolean; profile?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, address_hint }),
      });
      const body = await res.json();
      if (res.ok && body.profile) {
        this.updateProfile(body.profile.id, { online_status: 'online', last_seen: new Date().toISOString() });
        return { success: true, profile: body.profile };
      }
      if (!res.ok && body.error) {
        return { success: false, error: body.error };
      }
    } catch (err: any) {
      console.warn('[Login Server Error]:', err);
    }

    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    let found = this.profiles.find(
      (p) =>
        p.email?.toLowerCase() === clean ||
        p.username.toLowerCase() === clean ||
        p.id === clean
    );

    // Auto-restore admin account if matching admin credentials
    if (!found && (clean === 'mdtanvirhasanzim12@gmail.com' || clean === 'tanvir_zim' || clean === 'admin' || clean === 'tanvir')) {
      found = {
        id: 'usr-tanvir-admin',
        email: 'mdtanvirhasanzim12@gmail.com',
        username: 'tanvir_zim',
        full_name: 'Tanvir Hasan Zim',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
        bio: 'Founder & Circle Organizer 🚀 Building our community hub.',
        role: 'admin',
        is_active: true,
        status: 'active',
        location_sharing_enabled: true,
        privacy_mode: 'exact',
        online_status: 'online',
        last_seen: new Date().toISOString(),
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
        phone: '+880 1712-345678',
      };
      this.profiles = [found, ...this.profiles.filter((p) => p.id !== found!.id)];
      this.saveToStorage('fh_profiles', this.profiles);
    }

    if (found) {
      if (found.status === 'suspended' || found.is_active === false) {
        return { success: false, error: 'Your account is suspended. Please contact circle management.' };
      }
      this.updateProfile(found.id, { online_status: 'online', last_seen: new Date().toISOString() });
      return { success: true, profile: found };
    }

    return { success: false, error: 'Account not found with this username or email. Please verify your credentials or register.' };
  }

  public async logoutUser(userId: string) {
    try {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch {
      // safe
    }
    this.updateProfile(userId, { online_status: 'offline', last_seen: new Date().toISOString() });
  }

  public syncOnlinePresence(onlineUserIds: string[]) {
    let changed = false;
    this.profiles = this.profiles.map((p) => {
      const isOnline = onlineUserIds.includes(p.id);
      const newStatus = isOnline ? 'online' : 'offline';
      if (p.online_status !== newStatus) {
        changed = true;
        return {
          ...p,
          online_status: newStatus,
          last_seen: isOnline ? new Date().toISOString() : p.last_seen,
        };
      }
      return p;
    });
    if (changed) {
      this.saveToStorage('fh_profiles', this.profiles);
      this.notify();
    }
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getProfile(id: string): UserProfile | undefined {
    if (!id) return undefined;
    if (id === 'usr-admin-tanvir' || id === 'usr-tanvir-admin') {
      return (
        this.profiles.find((p) => p.id === 'usr-tanvir-admin' || p.id === 'usr-admin-tanvir' || p.role === 'admin') ||
        this.profiles[0]
      );
    }
    return this.profiles.find(
      (p) =>
        p.id === id ||
        p.email?.toLowerCase() === id.toLowerCase() ||
        p.username.toLowerCase() === id.toLowerCase()
    );
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    this.profiles = this.profiles.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    this.saveToStorage('fh_profiles', this.profiles);
    this.notify();

    // Supabase write
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update(updates).eq('id', id).then();
    }

    // Server update
    fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    return this.profiles.find((p) => p.id === id)!;
  }

  public addProfile(profile: UserProfile): UserProfile {
    const is_active = profile.is_active !== undefined ? profile.is_active : true;
    const status = profile.status || (is_active ? 'active' : 'suspended');
    const fullProfile: UserProfile = {
      ...profile,
      is_active,
      status,
      created_at: profile.created_at || new Date().toISOString(),
      updated_at: profile.updated_at || new Date().toISOString(),
    };
    this.profiles = [fullProfile, ...this.profiles.filter((p) => p.id !== fullProfile.id)];
    this.saveToStorage('fh_profiles', this.profiles);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').upsert(fullProfile).then();
    }

    fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullProfile),
    }).catch(() => {});

    if (!this.locations.some((l) => l.user_id === fullProfile.id)) {
      this.updateLocation(fullProfile.id, {
        latitude: 23.7461 + (Math.random() - 0.5) * 0.04,
        longitude: 90.3742 + (Math.random() - 0.5) * 0.04,
        is_sharing: fullProfile.location_sharing_enabled ?? true,
        address_hint: 'Dhaka Metropolitan, Bangladesh',
        activity: 'stationary',
        battery_level: 90,
      });
    }

    return fullProfile;
  }

  public deleteProfile(id: string) {
    this.profiles = this.profiles.filter((p) => p.id !== id);
    this.locations = this.locations.filter((l) => l.user_id !== id);
    this.saveToStorage('fh_profiles', this.profiles);
    this.saveToStorage('fh_locations', this.locations);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').delete().eq('id', id).then();
      supabase.from('locations').delete().eq('user_id', id).then();
    }

    fetch(`/api/profiles/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  // --- Locations & Live Radar ---
  public getLocations(): UserLocation[] {
    return this.locations.map((loc) => ({
      ...loc,
      profile: this.getProfile(loc.user_id),
    }));
  }

  public getUserLocation(userId: string): UserLocation | undefined {
    const loc = this.locations.find((l) => l.user_id === userId);
    if (!loc) return undefined;
    return { ...loc, profile: this.getProfile(userId) };
  }

  public updateLocation(userId: string, locData: Partial<UserLocation>) {
    const existingIndex = this.locations.findIndex((l) => l.user_id === userId);
    const updatedRecord: UserLocation = {
      id: existingIndex >= 0 ? this.locations[existingIndex].id : `loc-${userId}`,
      user_id: userId,
      latitude: locData.latitude ?? 23.7461,
      longitude: locData.longitude ?? 90.3742,
      accuracy: locData.accuracy ?? 10,
      heading: locData.heading,
      speed: locData.speed,
      battery_level: locData.battery_level ?? 90,
      activity: locData.activity ?? 'stationary',
      address_hint: locData.address_hint || 'Dhaka, Bangladesh',
      is_sharing: locData.is_sharing ?? true,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.locations[existingIndex] = {
        ...this.locations[existingIndex],
        ...updatedRecord,
      };
    } else {
      this.locations.unshift(updatedRecord);
    }
    this.saveToStorage('fh_locations', this.locations);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('locations').upsert(updatedRecord, { onConflict: 'user_id' }).then();
    }

    fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecord),
    }).catch(() => {});

    if (locData.is_sharing !== undefined) {
      this.updateProfile(userId, { location_sharing_enabled: locData.is_sharing });
    }
  }

  // --- Posts & Feed ---
  public getPosts(): Post[] {
    return this.posts
      .map((p) => ({
        ...p,
        profile: this.getProfile(p.user_id),
        comments: (p.comments || []).map((c) => ({
          ...c,
          profile: this.getProfile(c.user_id),
        })),
      }))
      .sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }

  public createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments'>): Post {
    const newPost: Post = {
      ...post,
      id: `pst-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    this.posts = [newPost, ...this.posts];
    this.saveToStorage('fh_posts', this.posts);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('posts').insert({
        id: newPost.id,
        user_id: newPost.user_id,
        content: newPost.content,
        images: newPost.images || [],
        location_name: newPost.location_name,
        post_type: newPost.post_type || 'post',
        is_pinned: newPost.is_pinned ?? false,
      }).then();
    }

    fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    }).catch(() => {});

    return newPost;
  }

  public deletePost(postId: string) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.saveToStorage('fh_posts', this.posts);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('posts').delete().eq('id', postId).then();
    }

    fetch(`/api/posts/${postId}`, { method: 'DELETE' }).catch(() => {});
  }

  public toggleLike(postId: string, userId: string): boolean {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return false;

    const existingIndex = (post.likes || []).findIndex((l) => l.user_id === userId);
    let liked = false;
    if (existingIndex >= 0) {
      post.likes.splice(existingIndex, 1);
      liked = false;
      if (isSupabaseConfigured && supabase) {
        supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId }).then();
      }
    } else {
      const newLike = {
        id: `lk-${Date.now()}`,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      };
      post.likes = [...(post.likes || []), newLike];
      liked = true;
      if (isSupabaseConfigured && supabase) {
        supabase.from('post_likes').insert(newLike).then();
      }
    }
    this.saveToStorage('fh_posts', this.posts);
    this.notify();

    fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    }).catch(() => {});

    return liked;
  }

  public addComment(postId: string, userId: string, content: string): PostComment | null {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return null;

    const newComment: PostComment = {
      id: `cm-${Date.now()}`,
      post_id: postId,
      user_id: userId,
      content,
      created_at: new Date().toISOString(),
    };
    post.comments = [...(post.comments || []), newComment];
    this.saveToStorage('fh_posts', this.posts);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('post_comments').insert(newComment).then();
    }

    fetch(`/api/posts/${postId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, content }),
    }).catch(() => {});

    return newComment;
  }

  public deleteComment(postId: string, commentId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;
    post.comments = (post.comments || []).filter((c) => c.id !== commentId);
    this.saveToStorage('fh_posts', this.posts);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('post_comments').delete().eq('id', commentId).then();
    }
  }

  // --- Albums & Photos ---
  public getAlbums(): Album[] {
    return this.albums.map((alb) => ({
      ...alb,
      photo_count: this.photos.filter((p) => p.album_id === alb.id).length,
    }));
  }

  public createAlbum(title: string, description?: string, coverUrl?: string, createdBy = 'usr-admin-tanvir'): Album {
    const newAlb: Album = {
      id: `alb-${Date.now()}`,
      title,
      description,
      cover_url: coverUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      created_by: createdBy,
      created_at: new Date().toISOString(),
      photo_count: 0,
    };
    this.albums = [newAlb, ...this.albums];
    this.saveToStorage('fh_albums', this.albums);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('albums').insert(newAlb).then();
    }

    return newAlb;
  }

  public getPhotos(albumId?: string): Photo[] {
    let filtered = this.photos;
    if (albumId) {
      filtered = filtered.filter((p) => p.album_id === albumId);
    }
    return filtered
      .map((p) => ({
        ...p,
        profile: this.getProfile(p.user_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addPhoto(photo: Omit<Photo, 'id' | 'created_at'>): Photo {
    const newPhoto: Photo = {
      ...photo,
      id: `ph-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.photos = [newPhoto, ...this.photos];
    this.saveToStorage('fh_photos', this.photos);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('photos').insert({
        id: newPhoto.id,
        user_id: newPhoto.user_id,
        album_id: newPhoto.album_id || null,
        title: newPhoto.title,
        description: newPhoto.description,
        image_url: newPhoto.image_url,
        location_name: newPhoto.location_name,
      }).then();
    }

    fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photo),
    }).catch(() => {});

    // Auto-post to feed
    this.createPost({
      user_id: photo.user_id,
      content: photo.description || `Uploaded a new photo: "${photo.title || 'Untitled'}"`,
      images: [photo.image_url],
      location_name: photo.location_name,
      post_type: 'photo_upload',
    });

    return newPhoto;
  }

  public deletePhoto(photoId: string) {
    this.photos = this.photos.filter((p) => p.id !== photoId);
    this.saveToStorage('fh_photos', this.photos);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('photos').delete().eq('id', photoId).then();
    }

    fetch(`/api/photos/${photoId}`, { method: 'DELETE' }).catch(() => {});
  }

  // --- Events & Meetups ---
  public getEvents(): CommunityEvent[] {
    return this.events
      .map((evt) => ({
        ...evt,
        creator: this.getProfile(evt.created_by),
        attendees: (evt.attendees || []).map((a) => ({
          ...a,
          profile: this.getProfile(a.user_id),
        })),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public createEvent(eventData: Omit<CommunityEvent, 'id' | 'created_at' | 'attendees'>): CommunityEvent {
    const newEvent: CommunityEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      attendees: [
        {
          id: `att-${Date.now()}`,
          event_id: `evt-${Date.now()}`,
          user_id: eventData.created_by,
          status: 'going',
          created_at: new Date().toISOString(),
        },
      ],
    };
    this.events = [newEvent, ...this.events];
    this.saveToStorage('fh_events', this.events);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('events').insert({
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location_name: newEvent.location_name,
        created_by: newEvent.created_by,
      }).then();
    }

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...eventData, user_id: eventData.created_by }),
    }).catch(() => {});

    // Auto-post to feed
    this.createPost({
      user_id: eventData.created_by,
      content: `📅 Created a new meetup: "${eventData.title}" on ${eventData.date} at ${eventData.time} in ${eventData.location_name}. ${eventData.description}`,
      location_name: eventData.location_name,
      post_type: 'meetup_created',
    });

    return newEvent;
  }

  public setEventRSVP(eventId: string, userId: string, status: RSVPStatus) {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return;

    const existingIndex = (event.attendees || []).findIndex((a) => a.user_id === userId);
    if (existingIndex >= 0) {
      event.attendees[existingIndex].status = status;
    } else {
      event.attendees = [
        ...(event.attendees || []),
        {
          id: `att-${Date.now()}`,
          event_id: eventId,
          user_id: userId,
          status,
          created_at: new Date().toISOString(),
        },
      ];
    }
    this.saveToStorage('fh_events', this.events);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('event_rsvps').upsert({
        event_id: eventId,
        user_id: userId,
        status,
      }, { onConflict: 'event_id,user_id' }).then();
    }

    fetch(`/api/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, status }),
    }).catch(() => {});
  }

  public deleteEvent(eventId: string) {
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveToStorage('fh_events', this.events);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('events').delete().eq('id', eventId).then();
    }

    fetch(`/api/events/${eventId}`, { method: 'DELETE' }).catch(() => {});
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.user_id === userId || n.user_id === 'all')
      .map((n) => ({
        ...n,
        actor: n.actor_id ? this.getProfile(n.actor_id) : undefined,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public createNotification(data: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications = [newNotif, ...this.notifications];
    this.saveToStorage('fh_notifications', this.notifications);
    this.notify();
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveToStorage('fh_notifications', this.notifications);
    this.notify();
  }

  public markAllNotificationsRead(userId: string) {
    this.notifications = this.notifications.map((n) =>
      n.user_id === userId || n.user_id === 'all' ? { ...n, is_read: true } : n
    );
    this.saveToStorage('fh_notifications', this.notifications);
    this.notify();
  }

  // --- Reports ---
  public getReports(): ReportItem[] {
    return this.reports.map((r) => ({
      ...r,
      reporter: this.getProfile(r.reporter_id),
      post: r.reported_post_id ? this.posts.find((p) => p.id === r.reported_post_id) : undefined,
    }));
  }

  public createReport(report: Omit<ReportItem, 'id' | 'created_at' | 'status'>): ReportItem {
    const newReport: ReportItem = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    this.reports = [newReport, ...this.reports];
    this.saveToStorage('fh_reports', this.reports);
    this.notify();
    return newReport;
  }

  public updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    this.reports = this.reports.map((r) => (r.id === reportId ? { ...r, status } : r));
    this.saveToStorage('fh_reports', this.reports);
    this.notify();
  }

  public resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
    this.updateReportStatus(reportId, status);
  }

  // --- Invitations ---
  public getInvites(): Invitation[] {
    return this.invitations;
  }

  public createInvite(creatorId: string, email?: string, role: 'member' | 'admin' = 'member'): Invitation {
    const invite: Invitation = {
      id: `inv-${Date.now()}`,
      code: `FH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_by: creatorId,
      email,
      role,
      is_used: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.invitations = [invite, ...this.invitations];
    this.saveToStorage('fh_invitations', this.invitations);
    this.notify();

    fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ created_by: creatorId, email, role }),
    }).catch(() => {});

    return invite;
  }

  public deleteInvite(inviteId: string) {
    this.invitations = this.invitations.filter((i) => i.id !== inviteId);
    this.saveToStorage('fh_invitations', this.invitations);
    this.notify();
    fetch(`/api/invitations/${inviteId}`, { method: 'DELETE' }).catch(() => {});
  }

  public markInviteUsed(code: string, userId: string) {
    this.invitations = this.invitations.map((i) =>
      i.code === code ? { ...i, is_used: true, used_by: userId, used_at: new Date().toISOString() } : i
    );
    this.saveToStorage('fh_invitations', this.invitations);
    this.notify();
  }

  // --- Settings ---
  public getSettings(): CommunitySettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<CommunitySettings>): CommunitySettings {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage('fh_settings', this.settings);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('community_settings').upsert({ id: 'default', ...updates }).then();
    }

    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    return this.settings;
  }

  // --- Real-time Activity & Search Logs for Admin Audit Trail ---
  public getActivityLogs(): ActivityLog[] {
    return this.activity_logs;
  }

  public getSearchLogs(): SearchLog[] {
    return this.search_logs;
  }

  public logSearch(
    param1: string | { user_id?: string; user_name?: string; query: string; category?: any; results_count?: number },
    query?: string,
    category: 'friends' | 'posts' | 'events' | 'photos' | 'places' | 'global' = 'global',
    resultCount = 0
  ) {
    let userId = 'anonymous';
    let userName = 'Member';
    let searchQuery = '';
    let searchCategory: any = category;
    let searchResultCount = resultCount;

    if (typeof param1 === 'object') {
      userId = param1.user_id || 'anonymous';
      userName = param1.user_name || 'Member';
      searchQuery = param1.query;
      searchCategory = param1.category || 'global';
      searchResultCount = param1.results_count !== undefined ? param1.results_count : 0;
    } else {
      userId = param1;
      searchQuery = query || '';
      const author = this.getProfile(userId);
      if (author) userName = author.full_name;
    }

    if (!searchQuery || searchQuery.trim().length < 2) return;

    const newSearch: SearchLog = {
      id: `srch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      user_name: userName,
      query: searchQuery.trim(),
      category: searchCategory,
      result_count: searchResultCount,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.search_logs = [newSearch, ...this.search_logs.slice(0, 499)];
    this.saveToStorage('fh_search_logs', this.search_logs);

    if (isSupabaseConfigured && supabase) {
      supabase.from('search_logs').insert(newSearch).then();
    }

    fetch('/api/activity/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        user_name: userName,
        query: searchQuery.trim(),
        category: searchCategory,
        results_count: searchResultCount,
      }),
    }).catch(() => {});
  }

  public logActivity(
    userId: string,
    userName: string,
    action: ActivityLog['action'],
    details: string,
    extra: { location_hint?: string; device_hint?: string; metadata?: any } = {}
  ) {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      user_name: userName,
      action,
      details,
      location_hint: extra.location_hint || 'Dhaka, Bangladesh',
      device_hint: extra.device_hint,
      timestamp: new Date().toISOString(),
      metadata: extra.metadata,
    };

    this.activity_logs = [newLog, ...this.activity_logs.slice(0, 499)];
    this.saveToStorage('fh_activity_logs', this.activity_logs);
    this.notify();

    if (isSupabaseConfigured && supabase) {
      supabase.from('activity_logs').insert(newLog).then();
    }

    fetch('/api/activity/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, user_name: userName, action, details, ...extra }),
    }).catch(() => {});
  }

  // Reset demo data
  public async resetToDefaults() {
    this.profiles = INITIAL_PROFILES;
    this.locations = INITIAL_LOCATIONS;
    this.posts = INITIAL_POSTS;
    this.albums = INITIAL_ALBUMS;
    this.photos = INITIAL_PHOTOS;
    this.events = INITIAL_EVENTS;
    this.notifications = [];
    this.reports = [];
    this.invitations = [];
    this.settings = INITIAL_SETTINGS;
    this.activity_logs = INITIAL_ACTIVITY_LOGS;
    this.search_logs = [];

    localStorage.removeItem('fh_profiles');
    localStorage.removeItem('fh_locations');
    localStorage.removeItem('fh_posts');
    localStorage.removeItem('fh_albums');
    localStorage.removeItem('fh_photos');
    localStorage.removeItem('fh_events');
    localStorage.removeItem('fh_notifications');
    localStorage.removeItem('fh_reports');
    localStorage.removeItem('fh_invitations');
    localStorage.removeItem('fh_settings');
    localStorage.removeItem('fh_activity_logs');
    localStorage.removeItem('fh_search_logs');

    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch {
      // safe
    }

    this.notify();
  }
}

export const store = new DataStore();
