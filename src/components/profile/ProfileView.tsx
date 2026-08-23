import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Camera,
  Calendar,
  Radio,
  Save,
  CheckCircle2,
  Lock,
  Phone,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { store } from '../../lib/storage';
import { Post, Photo } from '../../types';

export const ProfileView: React.FC = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const { isSharing, toggleLocationSharing } = useLocationContext();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  // Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [myPhotos, setMyPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setUsername(currentUser.username);
      setBio(currentUser.bio || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatar_url || '');

      setMyPosts(store.getPosts().filter((p) => p.user_id === currentUser.id));
      setMyPhotos(store.getPhotos().filter((p) => p.user_id === currentUser.id));
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateCurrentUser({
      full_name: fullName,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      bio,
      phone,
      avatar_url: avatarUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Success simulation
    setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div id="profile-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Profile Banner */}
      <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] shadow-xl overflow-hidden">
        {/* Banner Top Gradient */}
        <div className="h-32 bg-gradient-to-r from-zinc-900 via-indigo-950/60 to-zinc-900 border-b border-white/5 relative">
          <div className="absolute top-4 right-4">
            <span className="text-xs px-3 py-1 bg-black/60 backdrop-blur-md text-white rounded-full font-medium border border-white/10 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isSharing ? 'text-indigo-400 animate-pulse' : 'text-zinc-500'}`} />
              <span>{isSharing ? 'Location Sharing: ON' : 'Location Sharing: OFF'}</span>
            </span>
          </div>
        </div>

        {/* Profile Card Info */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 gap-4 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                  alt={fullName}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-[#080808] shadow-2xl bg-zinc-900"
                />
              </div>
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-serif font-bold text-white">{fullName}</h2>
                </div>
                <p className="text-xs text-zinc-400">@{username}</p>
              </div>
            </div>

            <button
              onClick={() => toggleLocationSharing()}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md flex items-center gap-1.5 ${
                isSharing
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isSharing ? 'Disable Location' : 'Enable Location Radar'}</span>
            </button>
          </div>

          {bio && (
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#111111] p-4 rounded-2xl border border-white/5 mb-4">
              {bio}
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#111111] border border-white/5 text-center">
              <span className="text-lg font-serif font-bold text-white block">{myPosts.length}</span>
              <span className="text-[11px] text-zinc-400">Shared Posts</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#111111] border border-white/5 text-center">
              <span className="text-lg font-serif font-bold text-indigo-400 block">{myPhotos.length}</span>
              <span className="text-[11px] text-zinc-400">Photos Uploaded</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#111111] border border-white/5 text-center">
              <span className="text-lg font-serif font-bold text-zinc-200 block">
                {isSharing ? 'Active' : 'Standby'}
              </span>
              <span className="text-[11px] text-zinc-400">Radar Status</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-[#080808] p-6 sm:p-8 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-lg text-white">Edit Profile Details</h3>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/5 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Managed via Supabase Auth credentials.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Bio & About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell your friends what you are up to..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Quick Avatar Presets */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Choose Avatar Preset or Paste Custom URL
            </label>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {sampleAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => setAvatarUrl(url)}
                  className={`w-11 h-11 rounded-2xl object-cover cursor-pointer transition-all ${
                    avatarUrl === url
                      ? 'ring-2 ring-indigo-400 scale-105 shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-[#080808] p-6 sm:p-8 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-lg text-white">Security & Password</h3>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-medium ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3.5 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 text-xs font-medium transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
