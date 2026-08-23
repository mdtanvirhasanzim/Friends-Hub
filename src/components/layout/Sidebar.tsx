import React from 'react';
import {
  Home,
  MapPin,
  Users,
  Image as ImageIcon,
  Calendar,
  Bell,
  User,
  Settings,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { useNotifications } from '../../context/NotificationContext';
import { store } from '../../lib/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin } = useAuth();
  const { isSharing, toggleLocationSharing } = useLocationContext();
  const { unreadCount } = useNotifications();

  const sharingCount = store.getLocations().filter((l) => l.is_sharing).length;
  const activeMembersCount = store.getProfiles().filter((p) => p.online_status !== 'offline').length;

  const navItems = [
    {
      id: 'feed',
      label: 'Home Feed',
      icon: Home,
      badge: null,
    },
    {
      id: 'map',
      label: 'Live Radar',
      icon: MapPin,
      badge: sharingCount > 0 ? `${sharingCount} Live` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-mono',
      pulse: isSharing || sharingCount > 0,
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: Users,
      badge: `${activeMembersCount} online`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono',
    },
    {
      id: 'photos',
      label: 'Photo Memories',
      icon: ImageIcon,
      badge: null,
    },
    {
      id: 'events',
      label: 'Meetups & Events',
      icon: Calendar,
      badge: null,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : null,
      badgeColor: 'bg-indigo-600 text-white font-bold',
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  // Only append Admin Panel to navItems if authenticated user has admin role
  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin Panel',
      icon: ShieldAlert,
      badge: 'Admin',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      pulse: false,
    });
  }

  // Mobile navigation items
  const mobileNavItems = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'map', label: 'Radar', icon: MapPin, pulse: isSharing || sharingCount > 0 },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'photos', label: 'Photos', icon: ImageIcon },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isAdmin) {
    mobileNavItems.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 shrink-0 bg-[#080808] border-r border-[#1a1a1a] min-h-[calc(100vh-4rem)] p-5 justify-between select-none"
      >
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 font-semibold">
            Community
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'feed' && activeTab === 'home');
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-indigo-400 font-medium border border-white/5 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                      {item.pulse && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Location Sharing Bottom Widget */}
        <div className="mt-6 pt-4 border-t border-[#1a1a1a]">
          <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400 font-medium">Location Sharing</span>
              <button
                id="sidebar-location-toggle"
                onClick={() => toggleLocationSharing()}
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  isSharing ? 'bg-indigo-600' : 'bg-zinc-800 border border-white/10'
                }`}
                title="Toggle Location Sharing"
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    isSharing ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-indigo-400 font-medium">
                {isSharing ? 'Currently ON (Live)' : 'Currently OFF (Hidden)'}
              </div>
              <button
                onClick={() => setActiveTab('map')}
                className="text-[10px] text-zinc-400 hover:text-white transition-colors"
              >
                Map →
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-t border-[#1a1a1a] px-1 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom"
        aria-label="Mobile Navigation"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'feed' && activeTab === 'home');
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[44px] min-h-[44px] ${
                isActive ? 'text-indigo-400 font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                {item.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 leading-none ${isActive ? 'text-indigo-300 font-semibold' : 'text-zinc-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
