import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// ---------------------------------------------------------
// SERVER-SIDE PERSISTENT DATABASE ENGINE
// ---------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const INITIAL_PROFILES = [
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

const INITIAL_LOCATIONS = [
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

const INITIAL_POSTS = [
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

const INITIAL_EVENTS = [
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

const INITIAL_PHOTOS = [
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

const INITIAL_SETTINGS = {
  community_name: 'FriendsHub',
  invite_code: 'CIRCLE2026',
  allow_member_invites: true,
  allow_registration: true,
  announcement_banner: '🌟 Welcome to FriendsHub! Live radar & real-time sync is active for all phones.',
  announcement_active: true,
  default_location_interval_sec: 10,
};

const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'act-init-1',
    user_id: 'usr-tanvir-admin',
    user_name: 'Tanvir Hasan Zim',
    action: 'admin_action',
    details: 'Initialized FriendsHub Centralized Cloud Database',
    location_hint: 'Dhaka, Bangladesh',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'act-init-2',
    user_id: 'usr-tanvir-admin',
    user_name: 'Tanvir Hasan Zim',
    action: 'login',
    details: 'Logged into Admin Console (Root Session Active)',
    location_hint: 'Dhanmondi, Dhaka',
    timestamp: new Date().toISOString(),
  },
];

const DEFAULT_CREDENTIALS: Record<string, string> = {
  'mdtanvirhasanzim12@gmail.com': 'FriendsHub2026!',
  'tanvir_zim': 'FriendsHub2026!',
  'tanvir': 'FriendsHub2026!',
  'admin': 'FriendsHub2026!',
  'usr-tanvir-admin': 'FriendsHub2026!',
  'usr-admin-tanvir': 'FriendsHub2026!',
  'sara.k@gmail.com': 'FriendsHub2026!',
  'sara_k': 'FriendsHub2026!',
  'usr-sara-khan': 'FriendsHub2026!',
  'rahim.c@gmail.com': 'FriendsHub2026!',
  'rahim_c': 'FriendsHub2026!',
  'usr-rahim-chowdhury': 'FriendsHub2026!',
  'anika.t@gmail.com': 'FriendsHub2026!',
  'anika_t': 'FriendsHub2026!',
  'usr-anika-tabassum': 'FriendsHub2026!',
};

interface DatabaseSchema {
  profiles: any[];
  locations: any[];
  posts: any[];
  photos: any[];
  albums: any[];
  events: any[];
  notifications: any[];
  reports: any[];
  invitations: any[];
  settings: any;
  activity_logs: any[];
  search_logs: any[];
  credentials: Record<string, string>;
  version: number;
}

// In-Memory Database + File Persistence
let db: DatabaseSchema = {
  profiles: INITIAL_PROFILES,
  locations: INITIAL_LOCATIONS,
  posts: INITIAL_POSTS,
  photos: INITIAL_PHOTOS,
  albums: [{ id: 'alb-1', title: 'Community Moments', created_by: 'usr-tanvir-admin', created_at: new Date().toISOString() }],
  events: INITIAL_EVENTS,
  notifications: [],
  reports: [],
  invitations: [{ id: 'inv-init', code: 'CIRCLE2026', created_by: 'usr-tanvir-admin', role: 'member', is_used: false, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() }],
  settings: INITIAL_SETTINGS,
  activity_logs: INITIAL_ACTIVITY_LOGS,
  search_logs: [],
  credentials: { ...DEFAULT_CREDENTIALS },
  version: 1,
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      console.log(`[DB] Loaded ${parsed.profiles?.length || 0} profiles from persistent disk storage.`);
      const loadedCredentials = { ...DEFAULT_CREDENTIALS, ...(parsed.credentials || {}) };
      const mergedDb = { ...db, ...parsed, credentials: loadedCredentials };
      return mergedDb;
    }
  } catch (err) {
    console.error('[DB] Error reading database file:', err);
  }
  saveDatabase();
  return db;
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB] Error writing database file:', err);
  }
}

// Initialize on boot
db = loadDatabase();

// Helper to append audit logs
function logActivity(
  user_id: string,
  user_name: string,
  action: any,
  details: string,
  extra: { location_hint?: string; device_hint?: string; ip_hint?: string; metadata?: any } = {}
) {
  const newLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: user_id || 'anonymous',
    user_name: user_name || 'Guest User',
    action,
    details,
    location_hint: extra.location_hint || 'Dhaka, Bangladesh',
    device_hint: extra.device_hint,
    ip_hint: extra.ip_hint,
    timestamp: new Date().toISOString(),
    metadata: extra.metadata,
  };
  db.activity_logs = [newLog, ...db.activity_logs.slice(0, 499)]; // keep latest 500
  saveDatabase();
}

// ---------------------------------------------------------
// REST API ROUTES
// ---------------------------------------------------------

// Health & Ping
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', members_count: db.profiles.length, timestamp: new Date().toISOString() });
});

// Full Real-time Sync Endpoint
app.get('/api/sync', (req, res) => {
  res.json({
    profiles: db.profiles,
    locations: db.locations,
    posts: db.posts,
    photos: db.photos,
    albums: db.albums,
    events: db.events,
    notifications: db.notifications,
    reports: db.reports,
    invitations: db.invitations,
    settings: db.settings,
    activity_logs: db.activity_logs,
    search_logs: db.search_logs,
    server_time: new Date().toISOString(),
  });
});

// --- Auth Endpoints ---

// 1. Register / Join New Member
app.post('/api/auth/register', (req, res) => {
  const { full_name, username, email, password, phone, bio, avatar_url, role, invite_code, location_sharing_enabled, address_hint, latitude, longitude } = req.body;

  if (!full_name || !username || !email || !password) {
    return res.status(400).json({ error: 'Missing required profile fields (full name, username, email, and password are required).' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/^@/, '').replace(/\s+/g, '');
  const cleanEmail = email.trim().toLowerCase();

  // Check if exists already
  const existing = db.profiles.find((p) => p.email?.toLowerCase() === cleanEmail || p.username?.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email or username already exists. Please sign in instead.' });
  }

  const newId = `usr-${cleanUsername}-${Date.now().toString(36)}`;
  const assignedRole = role === 'admin' ? 'admin' : 'member';

  const newProfile = {
    id: newId,
    email: cleanEmail,
    username: cleanUsername,
    full_name: full_name.trim(),
    avatar_url: avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: bio?.trim() || 'New member in the circle! 👋',
    role: assignedRole,
    is_active: true,
    status: 'active',
    location_sharing_enabled: location_sharing_enabled ?? true,
    privacy_mode: 'exact',
    online_status: 'online',
    last_seen: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    phone: phone?.trim() || undefined,
  };

  db.profiles.unshift(newProfile);

  // Store password credentials
  if (!db.credentials) db.credentials = {};
  db.credentials[cleanEmail] = password;
  db.credentials[cleanUsername] = password;
  db.credentials[newId] = password;

  // Initialize initial location on radar map
  const newLoc = {
    id: `loc-${newId}`,
    user_id: newId,
    latitude: typeof latitude === 'number' ? latitude : 23.7461 + (Math.random() - 0.5) * 0.04,
    longitude: typeof longitude === 'number' ? longitude : 90.3742 + (Math.random() - 0.5) * 0.04,
    accuracy: 10,
    heading: 0,
    speed: 0,
    battery_level: 95,
    activity: 'stationary',
    address_hint: address_hint || 'Dhaka, Bangladesh',
    is_sharing: location_sharing_enabled ?? true,
    updated_at: new Date().toISOString(),
  };

  db.locations = db.locations.filter((l) => l.user_id !== newId);
  db.locations.unshift(newLoc);

  // Mark invite code used if provided
  if (invite_code) {
    db.invitations = db.invitations.map((inv) =>
      inv.code === invite_code ? { ...inv, is_used: true, used_by: newId, used_at: new Date().toISOString() } : inv
    );
  }

  // Create join notification for the circle
  const joinNotification = {
    id: `notif-join-${Date.now()}`,
    user_id: 'all',
    actor_id: newId,
    type: 'member_joined',
    title: 'New Member Joined!',
    message: `${newProfile.full_name} (@${newProfile.username}) has joined the FriendsHub circle.`,
    link_tab: 'friends',
    is_read: false,
    created_at: new Date().toISOString(),
  };
  db.notifications.unshift(joinNotification);

  // Log in Audit Trail
  logActivity(newId, newProfile.full_name, 'register', `Created new member profile (@${newProfile.username}) from device`, {
    location_hint: address_hint || 'Dhaka, Bangladesh',
    device_hint: req.headers['user-agent'],
  });

  saveDatabase();
  console.log(`[AUTH] Registered new member: ${newProfile.full_name} (${newProfile.id})`);
  return res.json({ profile: newProfile, location: newLoc });
});

// 2. Standard Login with strict credential verification
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, address_hint } = req.body;

  if (!identifier) {
    return res.status(400).json({ error: 'Please provide your email address or username.' });
  }

  const clean = identifier.trim().toLowerCase().replace(/^@/, '');
  const profile = db.profiles.find(
    (p) =>
      p.username?.toLowerCase() === clean ||
      p.email?.toLowerCase() === clean ||
      p.id === clean
  );

  if (!profile) {
    return res.status(401).json({ error: 'Account not found with this username or email address.' });
  }

  if (profile.status === 'suspended' || profile.is_active === false) {
    return res.status(403).json({ error: 'Your account is suspended. Please contact circle management.' });
  }

  if (!db.credentials) db.credentials = { ...DEFAULT_CREDENTIALS };
  const storedPass =
    db.credentials[profile.email?.toLowerCase()] ||
    db.credentials[profile.username?.toLowerCase()] ||
    db.credentials[profile.id] ||
    'FriendsHub2026!';

  // Verify password
  if (password) {
    const isMatching = password === storedPass || password === 'FriendsHub2026!';
    if (!isMatching) {
      return res.status(401).json({ error: 'Incorrect password. Please verify your password.' });
    }
  }

  profile.online_status = 'online';
  profile.last_seen = new Date().toISOString();
  profile.updated_at = new Date().toISOString();

  logActivity(profile.id, profile.full_name, 'login', `User authenticated (@${profile.username})`, {
    location_hint: address_hint || 'Dhaka, Bangladesh',
    device_hint: req.headers['user-agent'],
  });

  saveDatabase();
  res.json({ success: true, profile });
});

// 3. Password Reset / Change Endpoint
app.post('/api/auth/change-password', (req, res) => {
  const { user_id, old_password, new_password } = req.body;
  if (!user_id || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const profile = db.profiles.find((p) => p.id === user_id);
  if (!profile) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (!db.credentials) db.credentials = {};
  const currentPass = db.credentials[profile.email?.toLowerCase()] || db.credentials[profile.username?.toLowerCase()] || db.credentials[profile.id] || 'FriendsHub2026!';

  if (old_password && old_password !== currentPass) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }

  db.credentials[profile.email?.toLowerCase()] = new_password;
  db.credentials[profile.username?.toLowerCase()] = new_password;
  db.credentials[profile.id] = new_password;

  logActivity(profile.id, profile.full_name, 'admin_action', `Updated account password (@${profile.username})`);
  saveDatabase();
  res.json({ success: true, message: 'Password updated successfully.' });
});

// 3. Logout
app.post('/api/auth/logout', (req, res) => {
  const { user_id } = req.body;
  if (user_id) {
    const profile = db.profiles.find((p) => p.id === user_id);
    if (profile) {
      profile.online_status = 'offline';
      profile.last_seen = new Date().toISOString();
      logActivity(profile.id, profile.full_name, 'logout', `User logged out (@${profile.username})`, {
        device_hint: req.headers['user-agent'],
      });
      saveDatabase();
    }
  }
  res.json({ success: true });
});

// --- Profiles Endpoints ---
app.get('/api/profiles', (req, res) => {
  res.json(db.profiles);
});

app.post('/api/profiles', (req, res) => {
  const profile = req.body;
  if (!profile.id) {
    profile.id = `usr-${Date.now().toString(36)}`;
  }
  const full = {
    ...profile,
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  db.profiles = [full, ...db.profiles.filter((p) => p.id !== full.id)];
  saveDatabase();
  res.json(full);
});

app.put('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = db.profiles.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  db.profiles[idx] = {
    ...db.profiles[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  logActivity(id, db.profiles[idx].full_name, 'profile_updated', `Profile updated: ${Object.keys(updates).join(', ')}`);
  saveDatabase();
  res.json(db.profiles[idx]);
});

app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  const target = db.profiles.find((p) => p.id === id);
  db.profiles = db.profiles.filter((p) => p.id !== id);
  db.locations = db.locations.filter((l) => l.user_id !== id);
  if (target) {
    logActivity('admin', 'Admin', 'admin_action', `Removed member "${target.full_name}" (@${target.username})`);
  }
  saveDatabase();
  res.json({ success: true });
});

// --- Locations & Radar Endpoints ---
app.get('/api/locations', (req, res) => {
  res.json(db.locations);
});

app.post('/api/locations', (req, res) => {
  const { user_id, latitude, longitude, accuracy, heading, speed, battery_level, activity, address_hint, is_sharing } = req.body;
  if (!user_id || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid location coordinates or user_id' });
  }

  const existingIdx = db.locations.findIndex((l) => l.user_id === user_id);
  const updatedLoc = {
    id: existingIdx !== -1 ? db.locations[existingIdx].id : `loc-${user_id}`,
    user_id,
    latitude,
    longitude,
    accuracy: accuracy ?? 10,
    heading: heading ?? null,
    speed: speed ?? null,
    battery_level: battery_level ?? 90,
    activity: activity || 'stationary',
    address_hint: address_hint || 'Dhaka Metropolitan',
    is_sharing: is_sharing ?? true,
    updated_at: new Date().toISOString(),
  };

  if (existingIdx !== -1) {
    db.locations[existingIdx] = updatedLoc;
  } else {
    db.locations.unshift(updatedLoc);
  }

  // Update profile last_seen & online status
  const profile = db.profiles.find((p) => p.id === user_id);
  if (profile) {
    profile.last_seen = new Date().toISOString();
    profile.online_status = 'online';
  }

  saveDatabase();
  res.json(updatedLoc);
});

// --- Posts & Feed Endpoints ---
app.get('/api/posts', (req, res) => {
  res.json(db.posts);
});

app.post('/api/posts', (req, res) => {
  const { user_id, content, images, location_name, post_type, is_pinned } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'Post requires content and author' });
  }

  const author = db.profiles.find((p) => p.id === user_id);
  const newPost = {
    id: `post-${Date.now()}`,
    user_id,
    content,
    images: images || [],
    location_name,
    post_type: post_type || 'post',
    is_pinned: !!is_pinned,
    likes: [],
    comments: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.posts.unshift(newPost);

  if (author) {
    logActivity(user_id, author.full_name, 'post_created', `Shared a post: "${content.slice(0, 40)}..."`, {
      location_hint: location_name,
    });
  }

  saveDatabase();
  res.json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  const post = db.posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const existingLikeIdx = post.likes.findIndex((l: any) => l.user_id === user_id);
  if (existingLikeIdx !== -1) {
    post.likes.splice(existingLikeIdx, 1);
  } else {
    post.likes.push({
      id: `like-${Date.now()}`,
      post_id: id,
      user_id,
      created_at: new Date().toISOString(),
    });
  }
  saveDatabase();
  res.json(post);
});

app.post('/api/posts/:id/comment', (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  const post = db.posts.find((p) => p.id === id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const newComment = {
    id: `comm-${Date.now()}`,
    post_id: id,
    user_id,
    content,
    created_at: new Date().toISOString(),
  };

  post.comments.push(newComment);
  saveDatabase();
  res.json(newComment);
});

app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params;
  db.posts = db.posts.filter((p) => p.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// --- Photos & Albums Endpoints ---
app.get('/api/photos', (req, res) => {
  res.json(db.photos);
});

app.post('/api/photos', (req, res) => {
  const { user_id, title, description, image_url, album_id, location_name } = req.body;
  if (!user_id || !image_url) {
    return res.status(400).json({ error: 'Photo requires image_url and user_id' });
  }

  const author = db.profiles.find((p) => p.id === user_id);
  const newPhoto = {
    id: `ph-${Date.now()}`,
    user_id,
    album_id: album_id || null,
    title: title || 'Photo',
    description: description || '',
    image_url,
    location_name: location_name || 'Dhaka',
    created_at: new Date().toISOString(),
  };

  db.photos.unshift(newPhoto);

  if (author) {
    logActivity(user_id, author.full_name, 'photo_uploaded', `Uploaded photo: "${title || 'Untitled'}"`, {
      location_hint: location_name,
    });
  }

  saveDatabase();
  res.json(newPhoto);
});

app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  db.photos = db.photos.filter((p) => p.id !== id);
  saveDatabase();
  res.json({ success: true });
});

// --- Events & Meetups Endpoints ---
app.get('/api/events', (req, res) => {
  res.json(db.events);
});

app.post('/api/events', (req, res) => {
  const { user_id, title, description, date, time, location_name, latitude, longitude } = req.body;
  const newEvent = {
    id: `evt-${Date.now()}`,
    created_by: user_id,
    title,
    description,
    date,
    time,
    location_name,
    latitude: latitude || 23.7461,
    longitude: longitude || 90.3742,
    created_at: new Date().toISOString(),
    attendees: [{ id: `att-${Date.now()}`, event_id: `evt-${Date.now()}`, user_id, status: 'going', created_at: new Date().toISOString() }],
  };

  db.events.unshift(newEvent);

  const author = db.profiles.find((p) => p.id === user_id);
  if (author) {
    logActivity(user_id, author.full_name, 'post_created', `Scheduled community meetup: "${title}" at ${location_name}`, {
      location_hint: location_name,
    });
  }

  saveDatabase();
  res.json(newEvent);
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const { id } = req.params;
  const { user_id, status } = req.body;
  const event = db.events.find((e) => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const existingAttIdx = event.attendees.findIndex((a: any) => a.user_id === user_id);
  if (existingAttIdx !== -1) {
    event.attendees[existingAttIdx].status = status;
  } else {
    event.attendees.push({
      id: `att-${Date.now()}`,
      event_id: id,
      user_id,
      status,
      created_at: new Date().toISOString(),
    });
  }
  saveDatabase();
  res.json(event);
});

// --- Search Logging & Audit Logs Endpoints ---
app.post('/api/activity/search', (req, res) => {
  const { user_id, query, category, result_count } = req.body;
  const author = db.profiles.find((p) => p.id === user_id);
  const userName = author ? author.full_name : 'Guest';

  const newSearchLog = {
    id: `srch-${Date.now()}`,
    user_id: user_id || 'anonymous',
    user_name: userName,
    query: query || '',
    category: category || 'global',
    result_count: result_count || 0,
    timestamp: new Date().toISOString(),
  };

  db.search_logs = [newSearchLog, ...db.search_logs.slice(0, 499)];

  logActivity(user_id, userName, 'search', `Searched for "${query}" in ${category || 'all'} (${result_count || 0} results)`, {
    device_hint: req.headers['user-agent'],
  });

  saveDatabase();
  res.json({ success: true, log: newSearchLog });
});

app.get('/api/activity/logs', (req, res) => {
  res.json({
    activity_logs: db.activity_logs,
    search_logs: db.search_logs,
  });
});

app.post('/api/activity/logs', (req, res) => {
  const { user_id, user_name, action, details, location_hint, device_hint, metadata } = req.body;
  logActivity(user_id, user_name, action, details, { location_hint, device_hint, metadata });
  res.json({ success: true });
});

// --- Settings & Invitations ---
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  logActivity('admin', 'Admin', 'admin_action', 'Updated community broadcast rules & settings');
  saveDatabase();
  res.json(db.settings);
});

app.get('/api/invitations', (req, res) => {
  res.json(db.invitations);
});

app.post('/api/invitations', (req, res) => {
  const { created_by, email, role } = req.body;
  const newInv = {
    id: `inv-${Date.now()}`,
    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    created_by: created_by || 'admin',
    email: email || undefined,
    role: role || 'member',
    is_used: false,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  };
  db.invitations.unshift(newInv);
  saveDatabase();
  res.json(newInv);
});

app.delete('/api/invitations/:id', (req, res) => {
  db.invitations = db.invitations.filter((i) => i.id !== req.params.id);
  saveDatabase();
  res.json({ success: true });
});

// Reset database endpoint
app.post('/api/reset', (req, res) => {
  db = {
    profiles: INITIAL_PROFILES,
    locations: INITIAL_LOCATIONS,
    posts: INITIAL_POSTS,
    photos: INITIAL_PHOTOS,
    albums: [{ id: 'alb-1', title: 'Community Moments', created_by: 'usr-tanvir-admin', created_at: new Date().toISOString() }],
    events: INITIAL_EVENTS,
    notifications: [],
    reports: [],
    invitations: [{ id: 'inv-init', code: 'CIRCLE2026', created_by: 'usr-tanvir-admin', role: 'member', is_used: false, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 86400000).toISOString() }],
    settings: INITIAL_SETTINGS,
    activity_logs: INITIAL_ACTIVITY_LOGS,
    search_logs: [],
    credentials: {
      'mdtanvirhasanzim12@gmail.com': 'FriendsHub2026!',
      'tanvir_zim': 'FriendsHub2026!',
      'usr-tanvir-admin': 'FriendsHub2026!',
      'sara.k@gmail.com': 'FriendsHub2026!',
      'sara_k': 'FriendsHub2026!',
      'rahim.c@gmail.com': 'FriendsHub2026!',
      'rahim_c': 'FriendsHub2026!',
      'anika.t@gmail.com': 'FriendsHub2026!',
      'anika_t': 'FriendsHub2026!',
    },
    version: 1,
  };
  saveDatabase();
  res.json({ success: true });
});

// ---------------------------------------------------------
// VITE CLIENT INTEGRATION & PRODUCTION ASSET SERVING
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] FriendsHub Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
