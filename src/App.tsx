import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider, useLocationContext } from './context/LocationContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
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
    if (coords) {
      setTargetMapCoords(coords);
    }
    setActiveTab('map');
  };

  const handleOpenUserProfile = (userId: string) => {
    setSelectedFriendId(userId);
    setActiveTab('friends');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] flex flex-col antialiased selection:bg-indigo-600/30 selection:text-indigo-200">
      {/* Top Fixed Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Layout (Sidebar + Center Content) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-6">
        {/* Left Sidebar (Desktop) */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Center Canvas View */}
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
          <MainAppContent />
        </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
