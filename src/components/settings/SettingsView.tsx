import React, { useState, useEffect } from 'react';
import {
  Radio,
  Shield,
  Bell,
  Database,
  Users,
  RotateCcw,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sliders,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { store } from '../../lib/storage';
import { UserProfile } from '../../types';

export const SettingsView: React.FC = () => {
  const { currentUser, updateCurrentUser, logout, switchUser, isSupabaseConnected } = useAuth();
  const { isSharing, toggleLocationSharing, permissionStatus } = useLocationContext();

  const [allProfiles, setAllProfiles] = useState<UserProfile[]>(store.getProfiles());
  const [privacyMode, setPrivacyMode] = useState<'exact' | 'approximate'>(
    currentUser?.privacy_mode || 'exact'
  );
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyProximity, setNotifyProximity] = useState(true);

  const [resetSuccess, setResetSuccess] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setAllProfiles(store.getProfiles());
    };
    refresh();
    const unsub = store.subscribe(refresh);
    return () => unsub();
  }, []);

  const handlePrivacyModeChange = (mode: 'exact' | 'approximate') => {
    setPrivacyMode(mode);
    updateCurrentUser({ privacy_mode: mode });
  };

  const handleResetData = () => {
    if (
      window.confirm(
        'Reset all demo community data back to default initial profiles, meetups, and photos?'
      )
    ) {
      store.resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div id="settings-view" className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Settings & Privacy</h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Configure real-time location radar, notification alerts, and data preferences.
        </p>
      </div>

      {/* 1. MASTER LOCATION RADAR CONTROL */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-lg text-white">Live Location Radar</h3>
        </div>

        {/* Master Indicator Card */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-zinc-200">LOCATION SHARING STATUS:</span>
              <span
                className={`text-xs font-semibold px-3 py-0.5 rounded-full ${
                  isSharing
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border border-white/5'
                }`}
              >
                {isSharing ? '🟢 ACTIVE' : '⚪ DISABLED'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isSharing
                ? 'Your location coordinates are securely shared with authenticated circle members.'
                : 'Your location is hidden. No background GPS data is being transmitted.'}
            </p>
            <div className="text-[11px] text-zinc-500 mt-1">
              Browser Permission:{' '}
              <span className="text-zinc-300 font-medium uppercase">{permissionStatus}</span>
            </div>
          </div>

          <button
            onClick={() => toggleLocationSharing()}
            className={`px-5 py-2.5 rounded-xl font-medium text-xs shadow-lg transition-all shrink-0 ${
              isSharing
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isSharing ? 'Turn Location OFF' : 'Turn Location ON 🟢'}
          </button>
        </div>

        {/* Privacy Granularity */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            Location Precision Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => handlePrivacyModeChange('exact')}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                privacyMode === 'exact'
                  ? 'bg-zinc-800/80 border-white/20 text-white shadow-sm'
                  : 'bg-[#111111] border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="font-medium text-xs text-zinc-200 mb-1 flex items-center justify-between">
                <span>Exact GPS Coordinates</span>
                {privacyMode === 'exact' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </div>
              <p className="text-[11px] text-zinc-400">
                Pinpoints high precision marker for meeting up in cafes or crowded spots.
              </p>
            </div>

            <div
              onClick={() => handlePrivacyModeChange('approximate')}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                privacyMode === 'approximate'
                  ? 'bg-zinc-800/80 border-white/20 text-white shadow-sm'
                  : 'bg-[#111111] border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="font-medium text-xs text-zinc-200 mb-1 flex items-center justify-between">
                <span>Approximate / Fuzzed Location</span>
                {privacyMode === 'approximate' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Displays general district/neighborhood zone with ±500m privacy offset.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NOTIFICATION PREFERENCES */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-lg text-white">Notification Alerts</h3>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              label: 'Post Likes & Reactions',
              desc: 'Get notified when a friend likes your post or picture.',
              state: notifyLikes,
              setter: setNotifyLikes,
            },
            {
              label: 'Comments & Discussions',
              desc: 'Alerts when someone comments on your updates.',
              state: notifyComments,
              setter: setNotifyComments,
            },
            {
              label: 'Meetup & Event Invites',
              desc: 'Updates when new meetups are published or friends RSVP.',
              state: notifyEvents,
              setter: setNotifyEvents,
            },
            {
              label: 'Nearby Friend Radar Alerts',
              desc: 'Notify when a friend sharing location is within 1 km.',
              state: notifyProximity,
              setter: setNotifyProximity,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#111111] border border-white/5 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-medium text-zinc-200">{item.label}</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">{item.desc}</div>
              </div>

              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.setter(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-indigo-600 focus:ring-indigo-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. DEMO PERSONA SWITCHER */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-lg text-white">Switch Test Persona</h3>
          </div>
          <span className="text-[11px] text-zinc-400">Multi-Account Testing</span>
        </div>

        <p className="text-xs text-zinc-400 mb-4">
          Instantly switch between administrator and member personas to inspect permissions, map
          telemetry, and RSVP views:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allProfiles.map((p) => {
            const isCurrent = currentUser?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => switchUser(p.id)}
                className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center gap-3 ${
                  isCurrent
                    ? 'bg-zinc-800/90 border-white/20 shadow-sm'
                    : 'bg-[#111111] hover:bg-zinc-900 border-white/5'
                }`}
              >
                <img
                  src={p.avatar_url}
                  alt={p.full_name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-xs text-white truncate">{p.full_name}</div>
                  <div className="text-[10px] text-zinc-400">
                    @{p.username} • {p.role === 'admin' ? '👑 Admin' : 'Member'}
                  </div>
                </div>
                {isCurrent && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SUPABASE & PRODUCTION CONNECTION STATUS */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-lg text-white">Database & Deployment</h3>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              isSupabaseConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-300 border border-white/10'
            }`}
          >
            {isSupabaseConnected ? 'Supabase Connected' : 'Reactive Local Store Mode'}
          </span>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-4">
          {isSupabaseConnected
            ? 'Connected to live Supabase PostgreSQL database with Row Level Security (RLS) and Realtime active.'
            : 'Running in high-performance reactive storage mode with LocalStorage persistence. To connect your live Supabase database on Netlify/GitHub, set the environment variables in .env.example.'}
        </p>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 font-mono text-[11px] text-zinc-400 space-y-1">
          <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
          <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
        </div>
      </div>

      {/* 5. DANGER ZONE & RESET */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-sm text-zinc-200">Reset Demo State</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Clear all created posts, test photos, and reset back to clean initial demo data.
          </p>
          {resetSuccess && (
            <span className="text-xs text-emerald-400 mt-1 block font-medium">
              ✓ Demo data successfully reset!
            </span>
          )}
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-medium transition-all flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </div>
  );
};
