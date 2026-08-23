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
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-tanvir',
    email: 'tanvir@friendshub.internal',
    username: 'tanvir',
    full_name: 'Tanvir Hasan',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'Founder of FriendsHub. Photography enthusiast, cafe hopper & tech geek ☕📸',
    role: 'admin',
    is_active: true,
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-10T10:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1711-000001',
  },
  {
    id: 'usr-rahim',
    email: 'rahim@friendshub.internal',
    username: 'rahim',
    full_name: 'Rahim Chowdhury',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    bio: 'Always down for late-night coffee meetups and weekend drives 🚗💨',
    role: 'member',
    is_active: true,
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-12T14:00:00Z',
    updated_at: new Date().toISOString(),
    phone: '+880 1711-000002',
  },
  {
    id: 'usr-saimon',
    email: 'saimon@friendshub.internal',
    username: 'saimon',
    full_name: 'Saimon Ahmed',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    bio: 'Fullstack coder, football fanatic & foodie explorer ⚽🍕',
    role: 'member',
    is_active: true,
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-01-15T09:30:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-fahim',
    email: 'fahim@friendshub.internal',
    username: 'fahim',
    full_name: 'Fahim Karim',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    bio: 'Graphic designer & anime lover. Let us make memories! 🎨✨',
    role: 'member',
    is_active: true,
    location_sharing_enabled: false,
    privacy_mode: 'approximate',
    online_status: 'away',
    last_seen: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    created_at: '2026-01-20T11:15:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-ayesha',
    email: 'ayesha@friendshub.internal',
    username: 'ayesha',
    full_name: 'Ayesha Siddiqua',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    bio: 'Bookworm, baker & roadtrip planner. Currently hunting for the best cappuccino! 📚🧁',
    role: 'member',
    is_active: true,
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: '2026-02-01T08:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'usr-priya',
    email: 'priya@friendshub.internal',
    username: 'priya',
    full_name: 'Priya Roy',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    bio: 'Wildlife photography & hiking trails enthusiast 🌿🏕️',
    role: 'member',
    is_active: true,
    location_sharing_enabled: true,
    privacy_mode: 'exact',
    online_status: 'offline',
    last_seen: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    created_at: '2026-02-05T12:00:00Z',
    updated_at: new Date().toISOString(),
  },
];

// Initial realistic locations (Centered around vibrant Dhaka / Central districts)
const INITIAL_LOCATIONS: UserLocation[] = [
  {
    user_id: 'usr-admin-tanvir',
    latitude: 23.7461,
    longitude: 90.3742,
    accuracy: 8,
    heading: 45,
    speed: 0,
    battery_level: 92,
    activity: 'stationary',
    address_hint: 'Dhanmondi Lake Cafe, Dhaka',
    is_sharing: true,
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'usr-rahim',
    latitude: 23.7925,
    longitude: 90.4078,
    accuracy: 12,
    heading: 180,
    speed: 4.2,
    battery_level: 78,
    activity: 'walking',
    address_hint: 'Gulshan 2 Avenue, Dhaka',
    is_sharing: true,
    updated_at: new Date(Date.now() - 45 * 1000).toISOString(),
  },
  {
    user_id: 'usr-saimon',
    latitude: 23.7937,
    longitude: 90.4043,
    accuracy: 15,
    heading: 90,
    speed: 8.5,
    battery_level: 64,
    activity: 'driving',
    address_hint: 'Banani Road 11, Dhaka',
    is_sharing: true,
    updated_at: new Date(Date.now() - 120 * 1000).toISOString(),
  },
  {
    user_id: 'usr-ayesha',
    latitude: 23.7509,
    longitude: 90.3934,
    accuracy: 10,
    heading: null,
    speed: 0,
    battery_level: 85,
    activity: 'stationary',
    address_hint: 'Pan Pacific Lounge, Karwan Bazar',
    is_sharing: true,
    updated_at: new Date(Date.now() - 90 * 1000).toISOString(),
  },
  {
    user_id: 'usr-priya',
    latitude: 23.8759,
    longitude: 90.3795,
    accuracy: 25,
    heading: null,
    speed: 0,
    battery_level: 45,
    activity: 'stationary',
    address_hint: 'Sector 4 Park, Uttara',
    is_sharing: true,
    updated_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
  },
];

const INITIAL_ALBUMS: Album[] = [
  {
    id: 'alb-1',
    title: 'Friends Trip to Sylhet',
    description: 'Tea gardens, Ratargul swamp forest and endless memories!',
    cover_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-admin-tanvir',
    created_at: '2026-01-28T16:00:00Z',
    photo_count: 5,
  },
  {
    id: 'alb-2',
    title: 'Friday Meetups & Cafe Crawls',
    description: 'All our weekend hangout sessions, food tasting & debates.',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-rahim',
    created_at: '2026-02-04T18:30:00Z',
    photo_count: 4,
  },
  {
    id: 'alb-3',
    title: 'University Reunion',
    description: 'Reconnecting after 2 years. Feels like yesterday!',
    cover_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-saimon',
    created_at: '2026-02-12T10:00:00Z',
    photo_count: 3,
  },
  {
    id: 'alb-4',
    title: 'Birthday Celebrations',
    description: 'Surprise parties, cake cuts and celebration shots 🎂🎉',
    cover_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-ayesha',
    created_at: '2026-02-18T19:00:00Z',
    photo_count: 3,
  },
  {
    id: 'alb-5',
    title: 'Random Moments',
    description: 'Candid snapshots, funny faces and daily life with the gang.',
    cover_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    created_by: 'usr-admin-tanvir',
    created_at: '2026-02-20T12:00:00Z',
    photo_count: 4,
  },
];

const INITIAL_PHOTOS: Photo[] = [
  {
    id: 'p-1',
    album_id: 'alb-1',
    user_id: 'usr-admin-tanvir',
    title: 'Ratargul Rainforest boat ride',
    description: 'Green canopy and mirror reflections everywhere.',
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
    location_name: 'Ratargul Swamp Forest',
    created_at: '2026-01-28T17:00:00Z',
  },
  {
    id: 'p-2',
    album_id: 'alb-1',
    user_id: 'usr-admin-tanvir',
    title: 'Sunset over Jaflong stones',
    description: 'Golden hour at its peak with the mountains in view.',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    location_name: 'Jaflong, Sylhet',
    created_at: '2026-01-29T18:20:00Z',
  },
  {
    id: 'p-3',
    album_id: 'alb-2',
    user_id: 'usr-rahim',
    title: 'Freshly roasted cold brews & pastry',
    description: 'Starting the weekend with good vibes and discussions.',
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
    location_name: 'North End Coffee Roasters',
    created_at: '2026-02-04T19:00:00Z',
  },
  {
    id: 'p-4',
    album_id: 'alb-3',
    user_id: 'usr-saimon',
    title: 'The whole gang together!',
    description: 'Cannot believe it has been 4 years since our grad day.',
    image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&auto=format&fit=crop&q=80',
    location_name: 'University Campus Plaza',
    created_at: '2026-02-12T11:30:00Z',
  },
  {
    id: 'p-5',
    album_id: 'alb-4',
    user_id: 'usr-ayesha',
    title: 'Chocolate hazelnut birthday cake',
    description: 'Surprise was a massive success! Look at that grin.',
    image_url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1000&auto=format&fit=crop&q=80',
    location_name: 'Dhanmondi Rooftop',
    created_at: '2026-02-18T20:15:00Z',
  },
  {
    id: 'p-6',
    album_id: 'alb-5',
    user_id: 'usr-admin-tanvir',
    title: 'Stargazing by the lake',
    description: 'Late night chats under the open sky.',
    image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1000&auto=format&fit=crop&q=80',
    location_name: 'Hatirjheel Overlook',
    created_at: '2026-02-20T22:45:00Z',
  },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'pst-1',
    user_id: 'usr-admin-tanvir',
    content: 'Welcome everyone to our private FriendsHub space! 🚀\n\nReal-time location sharing is officially live. Turn it on in the Live Map tab when you head out so the squad knows when you are nearby for impromptu coffee runs!',
    post_type: 'announcement',
    is_pinned: true,
    created_at: '2026-02-22T09:00:00Z',
    updated_at: '2026-02-22T09:00:00Z',
    likes: [
      { id: 'lk-1', post_id: 'pst-1', user_id: 'usr-rahim', created_at: '2026-02-22T09:15:00Z' },
      { id: 'lk-2', post_id: 'pst-1', user_id: 'usr-saimon', created_at: '2026-02-22T09:20:00Z' },
      { id: 'lk-3', post_id: 'pst-1', user_id: 'usr-ayesha', created_at: '2026-02-22T09:30:00Z' },
    ],
    comments: [
      {
        id: 'cm-1',
        post_id: 'pst-1',
        user_id: 'usr-rahim',
        content: 'This is super sleek Tanvir! Already tested the live map and pinpoint accuracy is amazing 🙌',
        created_at: '2026-02-22T09:16:00Z',
      },
      {
        id: 'cm-2',
        post_id: 'pst-1',
        user_id: 'usr-ayesha',
        content: 'So excited for this! No more sending "where are you" texts 20 times a day haha 😆',
        created_at: '2026-02-22T09:32:00Z',
      },
    ],
  },
  {
    id: 'pst-2',
    user_id: 'usr-rahim',
    content: 'Who is up for an evening coffee & debate session at North End Dhanmondi? I am nearby right now and the weather is amazing!',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
    ],
    location_name: 'North End Coffee, Dhanmondi',
    post_type: 'post',
    created_at: '2026-02-23T10:30:00Z',
    updated_at: '2026-02-23T10:30:00Z',
    likes: [
      { id: 'lk-4', post_id: 'pst-2', user_id: 'usr-admin-tanvir', created_at: '2026-02-23T10:35:00Z' },
      { id: 'lk-5', post_id: 'pst-2', user_id: 'usr-saimon', created_at: '2026-02-23T10:40:00Z' },
    ],
    comments: [
      {
        id: 'cm-3',
        post_id: 'pst-2',
        user_id: 'usr-saimon',
        content: 'Leaving Banani now, will be there in 20 mins!',
        created_at: '2026-02-23T10:42:00Z',
      },
    ],
  },
  {
    id: 'pst-3',
    user_id: 'usr-admin-tanvir',
    content: 'Uploaded new high-res photos from our weekend trip to the Sylhet album! Check them out in the Photos tab.',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    ],
    location_name: 'Sylhet Division',
    post_type: 'photo_upload',
    created_at: '2026-02-23T11:15:00Z',
    updated_at: '2026-02-23T11:15:00Z',
    likes: [
      { id: 'lk-6', post_id: 'pst-3', user_id: 'usr-ayesha', created_at: '2026-02-23T11:20:00Z' },
      { id: 'lk-7', post_id: 'pst-3', user_id: 'usr-priya', created_at: '2026-02-23T11:22:00Z' },
    ],
    comments: [],
  },
];

const INITIAL_EVENTS: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'FRIDAY NIGHT MEETUP',
    description: 'Weekly squad meetup! Dinner, dessert, board games and planning our next camping roadtrip. Bring your appetite!',
    date: '2026-08-28',
    time: '8:00 PM',
    location_name: 'Dhanmondi Lake View Lounge, Dhaka',
    latitude: 23.7461,
    longitude: 90.3742,
    created_by: 'usr-admin-tanvir',
    created_at: '2026-02-20T10:00:00Z',
    attendees: [
      { id: 'att-1', event_id: 'evt-1', user_id: 'usr-admin-tanvir', status: 'going', created_at: '2026-02-20T10:00:00Z' },
      { id: 'att-2', event_id: 'evt-1', user_id: 'usr-rahim', status: 'going', created_at: '2026-02-20T10:15:00Z' },
      { id: 'att-3', event_id: 'evt-1', user_id: 'usr-saimon', status: 'going', created_at: '2026-02-20T11:00:00Z' },
      { id: 'att-4', event_id: 'evt-1', user_id: 'usr-ayesha', status: 'maybe', created_at: '2026-02-20T11:45:00Z' },
    ],
  },
  {
    id: 'evt-2',
    title: 'Sunday Morning Cycling & Lake Breakfast',
    description: 'Hatirjheel perimeter cycling sprint followed by fresh parathas and spiced milk tea.',
    date: '2026-08-30',
    time: '6:30 AM',
    location_name: 'Hatirjheel Amphitheatre, Dhaka',
    latitude: 23.7705,
    longitude: 90.4107,
    created_by: 'usr-rahim',
    created_at: '2026-02-21T14:30:00Z',
    attendees: [
      { id: 'att-5', event_id: 'evt-2', user_id: 'usr-rahim', status: 'going', created_at: '2026-02-21T14:30:00Z' },
      { id: 'att-6', event_id: 'evt-2', user_id: 'usr-admin-tanvir', status: 'going', created_at: '2026-02-21T15:00:00Z' },
      { id: 'att-7', event_id: 'evt-2', user_id: 'usr-priya', status: 'going', created_at: '2026-02-21T16:00:00Z' },
    ],
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'usr-admin-tanvir',
    actor_id: 'usr-rahim',
    type: 'comment',
    title: 'New Comment',
    message: 'Rahim Chowdhury commented on your post.',
    link_tab: 'home',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'usr-admin-tanvir',
    actor_id: 'usr-ayesha',
    type: 'like',
    title: 'Post Liked',
    message: 'Ayesha Siddiqua liked your photo update.',
    link_tab: 'home',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'usr-admin-tanvir',
    actor_id: 'usr-rahim',
    type: 'event',
    title: 'Meetup RSVP',
    message: 'Rahim RSVPed "Going" to Friday Night Meetup.',
    link_tab: 'events',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const INITIAL_SETTINGS: CommunitySettings = {
  community_name: 'FriendsHub',
  invite_code: 'FRIENDS-2026-VIP',
  allow_member_invites: true,
  allow_registration: true,
  announcement_banner: 'Welcome to FriendsHub! Live location sharing is active.',
  announcement_active: true,
  default_location_interval_sec: 15,
};

// Storage helper with fallback to LocalStorage
class DataStore {
  private profiles: UserProfile[];
  private locations: UserLocation[];
  private posts: Post[];
  private albums: Album[];
  private photos: Photo[];
  private events: CommunityEvent[];
  private notifications: NotificationItem[];
  private reports: ReportItem[];
  private invitations: Invitation[];
  private settings: CommunitySettings;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.profiles = this.loadFromStorage('fh_profiles', INITIAL_PROFILES);
    this.locations = this.loadFromStorage('fh_locations', INITIAL_LOCATIONS);
    this.posts = this.loadFromStorage('fh_posts', INITIAL_POSTS);
    this.albums = this.loadFromStorage('fh_albums', INITIAL_ALBUMS);
    this.photos = this.loadFromStorage('fh_photos', INITIAL_PHOTOS);
    this.events = this.loadFromStorage('fh_events', INITIAL_EVENTS);
    this.notifications = this.loadFromStorage('fh_notifications', INITIAL_NOTIFICATIONS);
    this.reports = this.loadFromStorage('fh_reports', []);
    this.invitations = this.loadFromStorage('fh_invitations', []);
    this.settings = this.loadFromStorage('fh_settings', INITIAL_SETTINGS);
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultValue;
  }

  private saveToStorage(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota errors
    }
    this.notify();
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
        // Safe notify
      }
    });
  }

  // --- Profiles ---
  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getProfile(id: string): UserProfile | undefined {
    return this.profiles.find((p) => p.id === id);
  }

  public updateProfile(id: string, updates: Partial<UserProfile>): UserProfile {
    this.profiles = this.profiles.map((p) =>
      p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );
    this.saveToStorage('fh_profiles', this.profiles);
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
    this.profiles = [fullProfile, ...this.profiles];
    this.saveToStorage('fh_profiles', this.profiles);

    // Provide initial GPS position if not already present
    if (!this.locations.some((l) => l.user_id === fullProfile.id)) {
      this.updateLocation(fullProfile.id, {
        latitude: 23.7461 + (Math.random() - 0.5) * 0.04,
        longitude: 90.3742 + (Math.random() - 0.5) * 0.04,
        is_sharing: fullProfile.location_sharing_enabled ?? true,
        address_hint: 'Dhaka Metropolitan, Bangladesh',
        activity: 'stationary',
        battery_level: 88,
      });
    }

    return fullProfile;
  }

  public deleteProfile(id: string) {
    this.profiles = this.profiles.filter((p) => p.id !== id);
    this.locations = this.locations.filter((l) => l.user_id !== id);
    this.saveToStorage('fh_profiles', this.profiles);
    this.saveToStorage('fh_locations', this.locations);
  }

  // --- Locations ---
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
      user_id: userId,
      latitude: locData.latitude ?? 23.7461,
      longitude: locData.longitude ?? 90.3742,
      accuracy: locData.accuracy ?? 10,
      heading: locData.heading,
      speed: locData.speed,
      battery_level: locData.battery_level ?? 90,
      activity: locData.activity ?? 'stationary',
      address_hint: locData.address_hint,
      is_sharing: locData.is_sharing ?? true,
      updated_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.locations[existingIndex] = {
        ...this.locations[existingIndex],
        ...updatedRecord,
      };
    } else {
      this.locations.push(updatedRecord);
    }
    this.saveToStorage('fh_locations', this.locations);

    // Also sync user profile sharing state
    if (locData.is_sharing !== undefined) {
      this.updateProfile(userId, { location_sharing_enabled: locData.is_sharing });
    }
  }

  // --- Posts ---
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

    // Notify other users
    this.createNotification({
      user_id: 'usr-admin-tanvir',
      actor_id: post.user_id,
      type: 'photo',
      title: 'New Community Post',
      message: `${this.getProfile(post.user_id)?.full_name || 'A friend'} shared a new post.`,
      link_tab: 'home',
    });

    return newPost;
  }

  public deletePost(postId: string) {
    this.posts = this.posts.filter((p) => p.id !== postId);
    this.saveToStorage('fh_posts', this.posts);
  }

  public toggleLike(postId: string, userId: string): boolean {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return false;

    const existingIndex = post.likes.findIndex((l) => l.user_id === userId);
    let liked = false;
    if (existingIndex >= 0) {
      post.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      post.likes.push({
        id: `lk-${Date.now()}`,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      liked = true;

      if (post.user_id !== userId) {
        this.createNotification({
          user_id: post.user_id,
          actor_id: userId,
          type: 'like',
          title: 'Post Liked',
          message: `${this.getProfile(userId)?.full_name || 'Someone'} liked your post.`,
          link_tab: 'home',
        });
      }
    }
    this.saveToStorage('fh_posts', this.posts);
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

    if (post.user_id !== userId) {
      this.createNotification({
        user_id: post.user_id,
        actor_id: userId,
        type: 'comment',
        title: 'New Comment',
        message: `${this.getProfile(userId)?.full_name || 'Someone'} commented on your post: "${content.slice(0, 30)}..."`,
        link_tab: 'home',
      });
    }
    return newComment;
  }

  public deleteComment(postId: string, commentId: string) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;
    post.comments = (post.comments || []).filter((c) => c.id !== commentId);
    this.saveToStorage('fh_posts', this.posts);
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
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.photos = [newPhoto, ...this.photos];
    this.saveToStorage('fh_photos', this.photos);

    // Also auto-post to feed
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
  }

  // --- Events ---
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

    // Also auto-post to feed
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
  }

  public deleteEvent(eventId: string) {
    this.events = this.events.filter((e) => e.id !== eventId);
    this.saveToStorage('fh_events', this.events);
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    return this.notifications
      .filter((n) => n.user_id === userId)
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
    return newNotif;
  }

  public markNotificationAsRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveToStorage('fh_notifications', this.notifications);
  }

  public markAllNotificationsRead(userId: string) {
    this.notifications = this.notifications.map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n
    );
    this.saveToStorage('fh_notifications', this.notifications);
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
    return newReport;
  }

  public updateReportStatus(reportId: string, status: 'resolved' | 'dismissed') {
    this.reports = this.reports.map((r) => (r.id === reportId ? { ...r, status } : r));
    this.saveToStorage('fh_reports', this.reports);
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
    return invite;
  }

  public deleteInvite(inviteId: string) {
    this.invitations = this.invitations.filter((i) => i.id !== inviteId);
    this.saveToStorage('fh_invitations', this.invitations);
  }

  public markInviteUsed(code: string, userId: string) {
    this.invitations = this.invitations.map((i) =>
      i.code === code ? { ...i, is_used: true, used_by: userId, used_at: new Date().toISOString() } : i
    );
    this.saveToStorage('fh_invitations', this.invitations);
  }

  // --- Settings ---
  public getSettings(): CommunitySettings {
    return this.settings;
  }

  public updateSettings(updates: Partial<CommunitySettings>): CommunitySettings {
    this.settings = { ...this.settings, ...updates };
    this.saveToStorage('fh_settings', this.settings);
    return this.settings;
  }

  // Reset demo data
  public resetToDefaults() {
    this.profiles = INITIAL_PROFILES;
    this.locations = INITIAL_LOCATIONS;
    this.posts = INITIAL_POSTS;
    this.albums = INITIAL_ALBUMS;
    this.photos = INITIAL_PHOTOS;
    this.events = INITIAL_EVENTS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.reports = [];
    this.invitations = [];
    this.settings = INITIAL_SETTINGS;

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

    this.notify();
  }
}

export const store = new DataStore();
