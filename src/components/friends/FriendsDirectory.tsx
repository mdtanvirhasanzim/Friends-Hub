import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Radio,
  MapPin,
  Clock,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Shield,
  ExternalLink,
  Phone,
  X,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/storage';
import { UserProfile, UserLocation, Post, Photo } from '../../types';
import { timeAgo } from '../../lib/geoUtils';

interface FriendsDirectoryProps {
  onOpenMap?: (coords?: { lat: number; lng: number }) => void;
  selectedUserId?: string | null;
  onClearSelectedUser?: () => void;
}

export const FriendsDirectory: React.FC<FriendsDirectoryProps> = ({
  onOpenMap,
  selectedUserId,
  onClearSelectedUser,
}) => {
  const { currentUser } = useAuth();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'online' | 'sharing' | 'admins'>('all');

  const [activeProfileModal, setActiveProfileModal] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userPhotos, setUserPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const refresh = () => {
      setProfiles(store.getProfiles());
      setLocations(store.getLocations());
    };

    refresh();
    const unsub = store.subscribe(refresh);
    return () => unsub();
  }, []);

  // Search logging with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    const timer = setTimeout(() => {
      const matchCount = profiles.filter((p) =>
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      ).length;

      store.logSearch({
        user_id: currentUser?.id || 'anonymous',
        user_name: currentUser?.full_name || 'Anonymous User',
        query: searchQuery.trim(),
        category: 'friends',
        results_count: matchCount,
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser?.id, currentUser?.full_name, profiles]);

  // Open modal if selectedUserId prop changed
  useEffect(() => {
    if (selectedUserId) {
      const p = store.getProfile(selectedUserId);
      if (p) {
        handleOpenProfile(p);
      }
    }
  }, [selectedUserId]);

  const handleOpenProfile = (profile: UserProfile) => {
    setActiveProfileModal(profile);
    const allPosts = store.getPosts().filter((p) => p.user_id === profile.id);
    const allPhotos = store.getPhotos().filter((p) => p.user_id === profile.id);
    setUserPosts(allPosts);
    setUserPhotos(allPhotos);
  };

  const handleCloseModal = () => {
    setActiveProfileModal(null);
    if (onClearSelectedUser) onClearSelectedUser();
  };

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    if (
      searchQuery &&
      !p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    if (filterMode === 'online') return p.online_status === 'online';
    if (filterMode === 'sharing') return p.location_sharing_enabled;
    if (filterMode === 'admins') return p.role === 'admin';
    return true;
  });

  return (
    <div id="friends-directory-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Card */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Friends Directory</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-white/5">
              {profiles.length} Members
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Private inner circle. View live statuses, member profiles & shared memories.
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member..."
              className="w-full sm:w-60 pl-9 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/5">
            {[
              { id: 'all', label: 'All' },
              { id: 'online', label: 'Online' },
              { id: 'sharing', label: 'Live' },
              { id: 'admins', label: 'Admins' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id as any)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  filterMode === f.id
                    ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Friends Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProfiles.map((member) => {
          const loc = locations.find((l) => l.user_id === member.id);
          const isMe = member.id === currentUser?.id;
          const isOnline = member.online_status === 'online';

          return (
            <div
              key={member.id}
              onClick={() => handleOpenProfile(member)}
              className="p-5 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl hover:border-white/20 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Avatar & Online status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <img
                      src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                      alt={member.full_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zinc-800 group-hover:ring-white/30 transition-all shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
                        isOnline ? 'bg-emerald-400' : 'bg-zinc-600'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {member.role === 'admin' && (
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-medium border border-white/10 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-indigo-400" /> Admin
                      </span>
                    )}
                    {isMe && (
                      <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-medium border border-indigo-500/30">
                        You
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Username */}
                <h3 className="font-serif font-bold text-base text-white group-hover:text-indigo-400 transition-colors">
                  {member.full_name}
                </h3>
                <p className="text-xs text-zinc-400 mb-2">@{member.username}</p>

                {member.bio && (
                  <p className="text-xs text-zinc-300 line-clamp-2 mb-3">{member.bio}</p>
                )}
              </div>

              {/* Footer status badges */}
              <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                {/* Location Sharing status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radio
                      className={`w-3.5 h-3.5 ${
                        loc?.is_sharing
                          ? 'text-indigo-400 animate-pulse'
                          : 'text-zinc-600'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        loc?.is_sharing ? 'text-indigo-400' : 'text-zinc-500'
                      }`}
                    >
                      {loc?.is_sharing ? 'Live Radar ON' : 'Location OFF'}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500">
                    {isOnline ? 'Active now' : timeAgo(member.last_seen)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Profile Modal */}
      {activeProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <img
                  src={activeProfileModal.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10 shadow-xl"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-bold text-white">
                      {activeProfileModal.full_name}
                    </h3>
                    {activeProfileModal.role === 'admin' && (
                      <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full font-medium border border-white/10">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">@{activeProfileModal.username}</p>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Joined{' '}
                      {new Date(activeProfileModal.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      {activeProfileModal.online_status === 'online' ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio & Details */}
            <div className="py-4 space-y-4">
              {activeProfileModal.bio && (
                <div className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 text-xs text-zinc-200 leading-relaxed">
                  {activeProfileModal.bio}
                </div>
              )}

              {/* Location telemetry if sharing */}
              {(() => {
                const loc = locations.find((l) => l.user_id === activeProfileModal.id);
                if (loc && loc.is_sharing) {
                  return (
                    <div className="p-4 rounded-2xl bg-[#111111] border border-indigo-500/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-xs">
                          <Radio className="w-4 h-4 animate-pulse" />
                          <span>Live Location Active</span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          {loc.address_hint || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
                        </p>
                      </div>

                      {onOpenMap && (
                        <button
                          onClick={() => {
                            handleCloseModal();
                            onOpenMap({ lat: loc.latitude, lng: loc.longitude });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 transition-colors shrink-0"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>View On Map</span>
                        </button>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Shared Photos Reel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-serif font-bold text-zinc-300 uppercase tracking-wider">
                    Photos by {activeProfileModal.full_name.split(' ')[0]} ({userPhotos.length})
                  </span>
                </div>
                {userPhotos.length === 0 ? (
                  <p className="text-xs text-zinc-500">No photos shared yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {userPhotos.slice(0, 3).map((ph) => (
                      <img
                        key={ph.id}
                        src={ph.image_url}
                        alt=""
                        className="w-full aspect-square rounded-xl object-cover border border-white/10"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Posts Stream */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-serif font-bold text-zinc-300 uppercase tracking-wider">
                    Recent Posts ({userPosts.length})
                  </span>
                </div>
                {userPosts.length === 0 ? (
                  <p className="text-xs text-zinc-500">No posts shared yet.</p>
                ) : (
                  <div className="space-y-2">
                    {userPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-2xl bg-[#111111] border border-white/5 text-xs"
                      >
                        <div className="text-[10px] text-zinc-500 mb-1">{timeAgo(post.created_at)}</div>
                        <p className="text-zinc-200">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
