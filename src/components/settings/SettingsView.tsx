import React, { useState, useEffect } from 'react';
import {
  Radio,
  Bell,
  Database,
  Users,
  RotateCcw,
  CheckCircle2,
  Lock,
  ExternalLink,
  Sliders,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  UploadCloud,
  Mail,
  Key,
  Globe,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { store } from '../../lib/storage';
import { UserProfile } from '../../types';
import {
  saveSupabaseConfig,
  testSupabaseConnection,
  getActiveSupabaseCredentials,
  isSupabaseConfigured,
} from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { currentUser, updateCurrentUser, switchUser, isSupabaseConnected } = useAuth();
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

  // Supabase dynamic config state
  const activeCreds = getActiveSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('fh_supabase_url') || activeCreds.url || '' : ''
  );
  const [supabaseKey, setSupabaseKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('fh_supabase_anon_key') || '' : ''
  );
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    error?: string;
  } | null>(null);

  const [isSyncingData, setIsSyncingData] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

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

  const handleSaveSupabaseConfig = async () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    setIsTestingConn(true);
    setTestResult(null);

    const res = await testSupabaseConnection();
    setIsTestingConn(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
      error: res.error,
    });
  };

  const handleTestConnectionOnly = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setIsTestingConn(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message,
      error: res.error,
    });
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingData(true);
    setSyncResult(null);
    try {
      const res = await store.syncAllToSupabase();
      setIsSyncingData(false);
      setSyncResult({
        synced: true,
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setIsSyncingData(false);
      setSyncResult({
        synced: true,
        success: false,
        message: err.message || 'Failed to sync data to Supabase.',
      });
    }
  };

  const handleCopySql = () => {
    fetch('/supabase_schema.sql')
      .then((res) => res.text())
      .then((text) => {
        navigator.clipboard.writeText(text);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      })
      .catch(() => {
        navigator.clipboard.writeText('-- Run supabase_schema.sql in Supabase SQL Editor');
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
      });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Settings & Database Management</h2>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Configure your Supabase cloud database, real-time live radar, notification alerts, and member accounts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5 ${
                isSupabaseConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isSupabaseConnected ? 'Supabase Realtime Connected' : 'Local Storage Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. SUPABASE CLOUD DATABASE INTEGRATION */}
      <div id="supabase-config-card" className="bg-[#080808] p-6 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Supabase Cloud Database & Auth</h3>
              <p className="text-zinc-400 text-xs">Connect your Supabase project to store real user profiles, live locations, posts, and events.</p>
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="space-y-4 bg-[#111111] p-5 rounded-2xl border border-white/5 mb-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#181818] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveSupabaseConfig}
              disabled={isTestingConn}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              {isTestingConn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Save & Connect Database</span>
            </button>

            <button
              onClick={handleTestConnectionOnly}
              disabled={isTestingConn || !supabaseUrl || !supabaseKey}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 text-xs font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncingData || !isSupabaseConfigured}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all flex items-center gap-2"
            >
              {isSyncingData ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              <span>1-Click Sync All Data to Supabase</span>
            </button>

            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/10 text-xs font-medium transition-all flex items-center gap-1.5 ml-auto"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showSqlGuide ? 'Hide SQL Guide' : 'SQL Setup Script'}</span>
            </button>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-4 rounded-2xl border text-xs mb-4 flex items-start gap-3 ${
              testResult.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-semibold">{testResult.message}</div>
              {testResult.error && <div className="text-xs text-rose-300/80 font-mono">{testResult.error}</div>}
            </div>
          </div>
        )}

        {/* Sync Result Message */}
        {syncResult && (
          <div
            className={`p-4 rounded-2xl border text-xs mb-4 flex items-start gap-3 ${
              syncResult.success
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
            }`}
          >
            {syncResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>{syncResult.message}</div>
          </div>
        )}

        {/* SQL Script Guide Accordion */}
        {showSqlGuide && (
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-xs space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Supabase SQL Schema Script (`supabase_schema.sql`)</span>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1.5 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <p className="text-zinc-400 text-[11px]">
              If you haven't created your tables in Supabase yet, open your <strong>Supabase Dashboard &gt; SQL Editor</strong>, click <strong>New Query</strong>, paste this script and click <strong>RUN</strong>. It creates all tables, triggers for new user auto-registration, and real-time publications.
            </p>
          </div>
        )}

        {/* Email & SMTP Instructions for Password Reset */}
        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-zinc-300 space-y-2">
          <div className="font-semibold text-indigo-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Why did no email arrive during Password Reset? (Supabase Auth Notice)</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            By default, Supabase's built-in email service is rate-limited to 3 emails per hour for free accounts and may land in spam folders. To ensure instant delivery of password reset links to your Gmail (<code>mdtanvirhasanzim12@gmail.com</code>):
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-[11px] space-y-1 ml-1">
            <li>In Supabase Dashboard: Go to <strong>Authentication &gt; Email Templates</strong> &gt; <em>Reset Password</em></li>
            <li>Go to <strong>Project Settings &gt; Authentication &gt; SMTP Settings</strong> and enable custom SMTP (using Gmail App Password, Resend, or SendGrid) for 100% deliverability.</li>
          </ul>
        </div>
      </div>

      {/* 2. MASTER LOCATION RADAR CONTROL */}
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
                ? 'Your location coordinates are securely shared in real-time with authenticated circle members.'
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

      {/* 3. NOTIFICATION PREFERENCES */}
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

      {/* 4. DEMO PERSONA SWITCHER */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-lg text-white">Switch Active Member Persona</h3>
          </div>
          <span className="text-[11px] text-zinc-400">Multi-Device Simulation</span>
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
