export type UserRole = 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  is_active: boolean;
  status?: 'active' | 'suspended';
  location_sharing_enabled: boolean;
  privacy_mode: 'exact' | 'approximate';
  online_status: 'online' | 'away' | 'offline';
  last_seen: string;
  created_at: string;
  updated_at: string;
  phone?: string;
}

export interface UserLocation {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number | null;
  speed?: number | null;
  battery_level?: number | null;
  activity?: 'stationary' | 'walking' | 'driving' | 'cycling';
  address_hint?: string;
  is_sharing: boolean;
  updated_at: string;
  profile?: UserProfile;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: UserProfile;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  location_name?: string;
  post_type: 'post' | 'photo_upload' | 'meetup_created' | 'announcement';
  created_at: string;
  updated_at: string;
  profile?: UserProfile;
  likes: PostLike[];
  comments: PostComment[];
  is_pinned?: boolean;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  created_by: string;
  created_at: string;
  photo_count?: number;
}

export interface Photo {
  id: string;
  album_id?: string | null;
  user_id: string;
  title?: string;
  description?: string;
  image_url: string;
  storage_path?: string;
  location_name?: string;
  created_at: string;
  profile?: UserProfile;
}

export type RSVPStatus = 'going' | 'maybe' | 'not_going';

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
  profile?: UserProfile;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  created_by: string;
  created_at: string;
  creator?: UserProfile;
  attendees: EventAttendee[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'like' | 'comment' | 'event' | 'photo' | 'member_joined' | 'location_alert' | 'system';
  title: string;
  message: string;
  link_tab?: string;
  is_read: boolean;
  created_at: string;
  actor?: UserProfile;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reported_post_id?: string;
  reported_user_id?: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: UserProfile;
  post?: Post;
}

export type Report = ReportItem;

export interface Invitation {
  id: string;
  code: string;
  created_by: string;
  email?: string;
  role: 'member' | 'admin';
  is_used: boolean;
  used_by?: string;
  used_at?: string;
  created_at: string;
  expires_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: 'login' | 'logout' | 'register' | 'add_member' | 'search' | 'create_post' | 'upload_photo' | 'update_location' | 'profile_updated' | 'admin_action' | string;
  details: string;
  ip_hint?: string;
  ip?: string;
  device_hint?: string;
  device?: string;
  location_hint?: string;
  timestamp: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export interface SearchLog {
  id: string;
  user_id: string;
  user_name: string;
  query: string;
  category: 'friends' | 'posts' | 'events' | 'photos' | 'places' | 'global' | string;
  result_count?: number;
  results_count?: number;
  timestamp: string;
  created_at?: string;
  ip?: string;
  device?: string;
}

export interface CommunitySettings {
  community_name: string;
  invite_code: string;
  allow_member_invites: boolean;
  allow_registration: boolean;
  announcement_banner: string;
  announcement_active: boolean;
  default_location_interval_sec: number;
}

