import React, { useState, useEffect } from 'react';
import {
  Radio,
  Bell,
  Database,
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
  Shield,
  Eye,
  EyeOff,
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
  const { currentUser, updateCurrentUser, isSupabaseConnected } = useAuth();
  const { isSharing, toggleLocationSharing, permissionStatus } = useLocationContext();

  const [privacyMode, setPrivacyMode] = useState<'exact' | 'approximate'>(
    currentUser?.privacy_mode || 'exact'
  );
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyProximity, setNotifyProximity] = useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handlePrivacyModeChange = (mode: 'exact' | 'approximate') => {
    setPrivacyMode(mode);
    updateCurrentUser({ privacy_mode: mode });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.id,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ type: 'success', text: 'Password successfully updated!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Network error. Could not update password.' });
    } finally {
      setPasswordLoading(false);
    }
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

  const handleResetData = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset demo data? All local sample posts, events, and mock photos will revert to defaults.'
      )
    ) {
      await store.resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div id="settings-view-root" className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Settings & Privacy</h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Manage account security, real-time location telemetry, notifications, and cloud database connections.
        </p>
      </div>

      {/* 1. ACCOUNT SECURITY & PASSWORD CHANGE */}
      <div className="bg-[#080808] p-4 sm:p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-base sm:text-lg text-white">Account Security & Credentials</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passwordMsg && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2.5 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-8 py-2 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-3 pr-8 py-2 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-3 pr-8 py-2 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50 min-h-[38px]"
            >
              {passwordLoading ? (
                <span>Updating...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. MASTER LOCATION RADAR CONTROL */}
      <div className="bg-[#080808] p-4 sm:p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-base sm:text-lg text-white">Live Location Radar</h3>
        </div>

        {/* Master Indicator Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#111111] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-xs sm:text-sm text-zinc-200">LOCATION SHARING STATUS:</span>
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
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-medium text-xs shadow-lg transition-all shrink-0 min-h-[44px] ${
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
      <div className="bg-[#080808] p-4 sm:p-6 rounded-3xl border border-[#1a1a1a] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-indigo-400" />
          <h3 className="font-serif font-bold text-base sm:text-lg text-white">Notification Alerts</h3>
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

      {/* 4. SUPABASE DATABASE & REALTIME SYNCHRONIZATION */}
      <div className="bg-[#080808] p-4 sm:p-6 rounded-3xl border border-[#1a1a1a] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-white">Supabase Cloud Database & Storage</h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isSupabaseConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {isSupabaseConnected ? 'Connected to PostgreSQL' : 'Local Fallback Storage Active'}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          FriendsHub integrates with your Supabase PostgreSQL cloud database for zero-latency persistence,
          user authentication, and realtime presence channels.
        </p>

        {/* Dynamic Credentials Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Buttons Action Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleSaveSupabaseConfig}
            disabled={isTestingConn}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            {isTestingConn ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>Save & Connect</span>
          </button>

          <button
            onClick={handleTestConnectionOnly}
            disabled={isTestingConn}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/10 text-xs font-medium transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncingData}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all flex items-center gap-2 ml-auto shadow-md shadow-emerald-600/20"
          >
            {isSyncingData ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>1-Click Sync to Supabase Tables</span>
          </button>

          <button
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5 text-xs transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showSqlGuide ? 'Hide Schema' : 'View SQL Schema'}</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
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
            <div>
              <div className="font-semibold">{testResult.message}</div>
              {testResult.error && (
                <div className="text-[11px] opacity-80 mt-0.5 font-mono">{testResult.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Sync Result Feedback */}
        {syncResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
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
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Supabase SQL Schema Script</span>
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
            <span>Password Recovery & SMTP Settings Notice</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Supabase's built-in email service is rate-limited to 3 emails per hour for free accounts and may land in spam folders. To ensure instant delivery of password reset links to your Gmail (<code>mdtanvirhasanzim12@gmail.com</code>):
          </p>
          <ul className="list-disc list-inside text-zinc-400 text-[11px] space-y-1 ml-1">
            <li>In Supabase Dashboard: Go to <strong>Authentication &gt; Email Templates</strong> &gt; <em>Reset Password</em></li>
            <li>Go to <strong>Project Settings &gt; Authentication &gt; SMTP Settings</strong> and enable custom SMTP (using Gmail App Password, Resend, or SendGrid) for 100% deliverability.</li>
          </ul>
        </div>
      </div>

      {/* 5. RESET / RE-SYNC LOCAL STATE */}
      <div className="bg-[#080808] p-4 sm:p-6 rounded-3xl border border-[#1a1a1a] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-sm text-zinc-200">Re-sync & Clear Local Cache</h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Reset circle records and re-fetch clean database records.
          </p>
          {resetSuccess && (
            <span className="text-xs text-emerald-400 mt-1 block font-medium">
              ✓ Data successfully re-synchronized!
            </span>
          )}
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 text-zinc-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-medium transition-all flex items-center gap-2 shrink-0 min-h-[40px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Re-sync Cache</span>
        </button>
      </div>
    </div>
  );
};
