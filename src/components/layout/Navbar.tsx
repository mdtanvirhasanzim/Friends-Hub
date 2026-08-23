import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  Settings,
  Radio,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { useNotifications } from '../../context/NotificationContext';
import { store } from '../../lib/storage';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfile,
}) => {
  const { currentUser, logout } = useAuth();
  const { isSharing, toggleLocationSharing, isLocating } = useLocationContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const sharingCount = store.getLocations().filter((l) => l.is_sharing).length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#1a1a1a] text-[#f0f0f0]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div 
          id="nav-brand-logo"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" 
          onClick={() => setActiveTab('feed')}
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white font-bold text-xs sm:text-sm tracking-tighter">
            FH
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-serif italic font-semibold text-lg sm:text-xl tracking-tight text-white">
              FriendsHub
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Private
            </span>
          </div>
        </div>

        {/* Center Live Radar Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[#121212] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/5 text-xs">
          <button
            id="nav-center-map-link"
            type="button"
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-300 font-medium text-[11px] sm:text-xs">
              {sharingCount} live
            </span>
          </button>

          <div className="h-3 w-px bg-[#262626]" />

          {/* Location Sharing Quick Button */}
          <button
            id="nav-quick-location-toggle"
            onClick={() => toggleLocationSharing()}
            disabled={isLocating}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium transition-all text-[11px] sm:text-xs ${
              isSharing
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80 border border-white/5'
            }`}
          >
            <Radio className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isSharing ? 'animate-pulse text-indigo-400' : 'text-zinc-400'}`} />
            <span className="hidden xs:inline sm:inline">
              {isLocating ? 'Locating...' : isSharing ? 'Sharing: ON' : 'Sharing: OFF'}
            </span>
            <span className="xs:hidden sm:hidden">
              {isLocating ? '...' : isSharing ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Right Section: Notifications & Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Notifications Center */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-indigo-600 rounded-full ring-2 ring-[#080808]">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-80 md:w-96 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl p-3 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-serif italic font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-400 rounded-full font-medium border border-indigo-500/30">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500 text-xs font-serif italic">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link_tab) setActiveTab(n.link_tab);
                          setShowNotifications(false);
                        }}
                        className={`p-2.5 rounded-xl cursor-pointer transition-colors text-xs flex gap-3 items-start ${
                          n.is_read ? 'bg-zinc-900/40 text-zinc-300' : 'bg-indigo-950/20 border border-indigo-500/20 text-white'
                        }`}
                      >
                        {n.actor?.avatar_url ? (
                          <img
                            src={n.actor.avatar_url}
                            alt=""
                            className="w-7 h-7 rounded-lg object-cover shrink-0 mt-0.5"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-zinc-200">{n.title}</div>
                          <div className="text-zinc-400 truncate text-[11px]">{n.message}</div>
                        </div>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 sm:pl-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-medium text-zinc-200 truncate max-w-[120px]">
                  {currentUser?.full_name}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  @{currentUser?.username}
                </div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[1px] shrink-0">
                <img
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={currentUser?.full_name}
                  className="w-full h-full rounded-[11px] object-cover bg-[#050505]"
                />
              </div>
            </button>

            {showUserMenu && (
              <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-56 rounded-2xl bg-[#0c0c0c] border border-white/10 shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/5">
                  <p className="font-serif italic font-semibold text-sm text-white truncate">{currentUser?.full_name}</p>
                  <p className="text-xs text-zinc-500 font-mono truncate">@{currentUser?.username}</p>
                </div>

                <div className="py-1 space-y-0.5 text-xs">
                  <button
                    id="btn-menu-my-profile"
                    onClick={() => {
                      if (onOpenProfile) onOpenProfile();
                      else setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    id="btn-menu-settings"
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Settings & Privacy</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-white/5">
                  <button
                    id="btn-menu-signout"
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/20 transition-colors text-xs font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
