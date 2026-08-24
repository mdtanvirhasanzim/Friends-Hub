import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { LiveMap } from './components/map/LiveMap';
import { CommunityFeed } from './components/feed/CommunityFeed';
import { PhotoGallery } from './components/photos/PhotoGallery';
import { EventsView } from './components/events/EventsView';
import { FriendsDirectory } from './components/friends/FriendsDirectory';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { store } from './lib/storage';

/**
 * Supabase-authoritative realtime bridge.
 *
 * The old app had two competing sources of truth: localStorage/API fallback
 * state and Supabase. The fallback /api/sync poll could overwrite fresh cloud
 * data every few seconds. In configured Supabase mode we stop that poll and
 * rebuild the in-memory store from the cloud after every database change.
 *
 * Child tables (likes/comments/RSVPs) are also loaded here because changing a
 * child row does not change its parent post/event row.
 */
const RealtimeSync: React.FC = () => {
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshingRef = useRef(false);

  const refreshFromCloud = async () => {
    if (!isSupabaseConfigured || !supabase || refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const s = store as any;

      // Supabase is the source of truth. Do not let demo/localStorage rows
      // survive when a cloud table is empty.
      const cloudKeys = [
        'fh_profiles',
        'fh_locations',
        'fh_posts',
        'fh_albums',
        'fh_photos',
        'fh_events',
        'fh_notifications',
        'fh_reports',
        'fh_invitations',
        'fh_settings',
        'fh_activity_logs',
        'fh_search_logs',
      ];
      cloudKeys.forEach((key) => localStorage.removeItem(key));

      s.profiles = [];
      s.locations = [];
      s.posts = [];
      s.albums = [];
      s.photos = [];
      s.events = [];
      s.notifications = [];
      s.reports = [];
      s.invitations = [];
      s.activity_logs = [];
      s.search_logs = [];

      await store.fetchFromSupabase();

      // Load relational/secondary tables and attach them to their parent
      // records so the UI updates immediately without a page refresh.
      const [
        likesRes,
        commentsRes,
        rsvpRes,
        albumsRes,
        notificationsRes,
        invitationsRes,
        reportsRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from('post_likes').select('*'),
        supabase.from('post_comments').select('*').order('created_at', { ascending: true }),
        supabase.from('event_rsvps').select('*'),
        supabase.from('albums').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
        supabase.from('invitations').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('community_settings').select('*').limit(1),
      ]);

      const likes = likesRes.data || [];
      const comments = commentsRes.data || [];
      const rsvps = rsvpRes.data || [];

      s.posts = (s.posts || []).map((post: any) => ({
        ...post,
        likes: likes.filter((like: any) => like.post_id === post.id),
        comments: comments.filter((comment: any) => comment.post_id === post.id),
      }));

      s.events = (s.events || []).map((event: any) => ({
        ...event,
        attendees: rsvps.filter((rsvp: any) => rsvp.event_id === event.id),
      }));

      s.albums = albumsRes.data || [];
      s.notifications = notificationsRes.data || [];
      s.invitations = invitationsRes.data || [];
      s.reports = reportsRes.data || [];
      if (settingsRes.data?.[0]) {
        s.settings = settingsRes.data[0];
      }

      localStorage.setItem('fh_posts', JSON.stringify(s.posts));
      localStorage.setItem('fh_events', JSON.stringify(s.events));
      localStorage.setItem('fh_albums', JSON.stringify(s.albums));
      localStorage.setItem('fh_notifications', JSON.stringify(s.notifications));
      localStorage.setItem('fh_invitations', JSON.stringify(s.invitations));
      localStorage.setItem('fh_reports', JSON.stringify(s.reports));
      localStorage.setItem('fh_settings', JSON.stringify(s.settings));

      // Notify every subscribed React context/component once the complete
      // snapshot has been assembled.
      s.notify();
    } catch (error) {
      console.warn('[Realtime] Cloud refresh failed:', error);
    } finally {
      refreshingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const s = store as any;

    // Disable the legacy /api/sync polling loop. It can overwrite the fresh
    // Supabase state and was the main cause of different browsers showing
    // different data.
    if (s.syncTimer) {
      clearInterval(s.syncTimer);
      s.syncTimer = null;
    }
    s.syncWithServer = async () => false;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) return;
      refreshTimerRef.current = setTimeout(() => {
        refreshTimerRef.current = null;
        void refreshFromCloud();
      }, 100);
    };

    void refreshFromCloud();

    const channel = supabase
      .channel(`fh-global-realtime-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public' }, scheduleRefresh)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void refreshFromCloud();
        }
      });

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};

const MainAppContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('map');
  const [targetMapCoords, setTargetMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-300">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center animate-pulse mb-3">
          <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
        <span className="text-sm font-serif italic text-zinc-300 tracking-wide">Loading FriendsHub...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const handleOpenMapWithCoords = (coords?: { lat: number; lng: number }) => {
    if (coords) setTargetMapCoords(coords);
    setActiveTab('map');
  };

  const handleOpenUserProfile = (userId: string) => {
    setSelectedFriendId(userId);
    setActiveTab('friends');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] flex flex-col antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0 overflow-y-auto">
          {activeTab === 'map' && (
            <LiveMap
              targetCoords={targetMapCoords}
              onClearTargetCoords={() => setTargetMapCoords(null)}
              onOpenProfile={handleOpenUserProfile}
            />
          )}

          {activeTab === 'feed' && (
            <CommunityFeed
              onOpenMap={handleOpenMapWithCoords}
              onOpenProfile={handleOpenUserProfile}
            />
          )}

          {activeTab === 'photos' && <PhotoGallery />}

          {activeTab === 'events' && (
            <EventsView
              onOpenEventOnMap={(eventId, coords) => handleOpenMapWithCoords(coords)}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsDirectory
              onOpenMap={handleOpenMapWithCoords}
              selectedUserId={selectedFriendId}
              onClearSelectedUser={() => setSelectedFriendId(null)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <NotificationProvider>
          <RealtimeSync />
          <MainAppContent />
        </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
