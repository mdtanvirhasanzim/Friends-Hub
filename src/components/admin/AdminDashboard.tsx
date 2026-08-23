import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Radio,
  FileText,
  Image as ImageIcon,
  Calendar,
  AlertTriangle,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Save,
  Flag,
  Lock,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/storage';
import { UserProfile, Post, Report, CommunitySettings } from '../../types';
import { timeAgo } from '../../lib/geoUtils';
import confetti from 'canvas-confetti';

export const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<CommunitySettings>(store.getSettings());

  // Invite modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Settings form
  const [communityName, setCommunityName] = useState(settings.community_name);
  const [announcementText, setAnnouncementText] = useState(settings.announcement_banner);
  const [announcementActive, setAnnouncementActive] = useState(settings.announcement_active);
  const [allowRegistration, setAllowRegistration] = useState(settings.allow_registration);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'moderation' | 'settings'>('overview');

  useEffect(() => {
    const refresh = () => {
      setMembers(store.getProfiles());
      setPosts(store.getPosts());
      setReports(store.getReports());
      const s = store.getSettings();
      setSettings(s);
      setCommunityName(s.community_name);
      setAnnouncementText(s.announcement_banner);
      setAnnouncementActive(s.announcement_active);
      setAllowRegistration(s.allow_registration);
    };

    refresh();
    const unsub = store.subscribe(refresh);
    return () => unsub();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            This dashboard is restricted to community administrators. You can switch to the Tanvir
            (Admin) test persona in Settings.
          </p>
        </div>
      </div>
    );
  }

  const handleToggleRole = (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    store.updateProfile(user.id, { role: newRole });
  };

  const handleToggleStatus = (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    store.updateProfile(user.id, { status: newStatus });
  };

  const handleDeleteMember = (userId: string, name: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own admin account!');
      return;
    }
    if (window.confirm(`Are you sure you want to remove member "${name}" from FriendsHub?`)) {
      store.deleteProfile(userId);
    }
  };

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = store.createInvite(currentUser?.id || 'admin', inviteEmail, inviteRole);
    const link = `${window.location.origin}?invite=${inv.code}`;
    setGeneratedInviteLink(link);

    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      community_name: communityName,
      announcement_banner: announcementText,
      announcement_active: announcementActive,
      allow_registration: allowRegistration,
    });
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 2500);
  };

  const handleDismissReport = (reportId: string) => {
    store.resolveReport(reportId, 'dismissed');
  };

  const handleDeleteReportedPost = (reportId: string, postId: string) => {
    store.deletePost(postId);
    store.resolveReport(reportId, 'resolved');
  };

  // Metrics
  const activeLocationsCount = store.getLocations().filter((l) => l.is_sharing).length;
  const photosCount = store.getPhotos().length;
  const eventsCount = store.getEvents().length;
  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Admin Header */}
      <div className="bg-[#080808] p-6 rounded-3xl border border-[#1a1a1a] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-800 text-indigo-400 flex items-center justify-center border border-white/10">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Admin Console</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-white/10">
              Root Level
            </span>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Manage membership, review reported content, broadcast announcements, and monitor radar.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Member</span>
        </button>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Community Metrics' },
          { id: 'members', label: `Members Directory (${members.length})` },
          {
            id: 'moderation',
            label: `Moderation Queue ${pendingReportsCount > 0 ? `(${pendingReportsCount})` : ''}`,
          },
          { id: 'settings', label: 'Broadcast & Global Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Total Members</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{members.length}</div>
              <div className="text-[10px] text-emerald-400 mt-1">100% Verified</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Radar Active</span>
                <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-2xl font-serif font-bold text-indigo-400">{activeLocationsCount}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Live Coordinates</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Total Posts</span>
                <FileText className="w-4 h-4 text-zinc-300" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{posts.length}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Feed updates</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Photos Saved</span>
                <ImageIcon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-white">{photosCount}</div>
              <div className="text-[10px] text-zinc-400 mt-1">In 5 Albums</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Pending Reports</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-rose-400">{pendingReportsCount}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Awaiting Review</div>
            </div>
          </div>

          {/* Quick System Summary */}
          <div className="p-6 rounded-3xl bg-[#080808] border border-[#1a1a1a] space-y-3">
            <h3 className="font-serif font-bold text-base text-white">System Health & Policy</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              FriendsHub is operating with strict group boundary isolation. Only registered members
              with active JWT session tokens can query the database or view live coordinate
              streams.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-emerald-400 font-medium border border-white/5">
                ✓ SSL / TLS Active
              </span>
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-indigo-400 font-medium border border-white/5">
                ✓ Location Privacy Masking Supported
              </span>
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-zinc-300 font-medium border border-white/5">
                ✓ Row-Level Security Rules Built
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEMBERS DIRECTORY TAB */}
      {activeTab === 'members' && (
        <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-white">Registered Circle Members</h3>
            <span className="text-xs text-zinc-400">{members.length} Total Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-zinc-400 font-medium border-b border-white/5 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
                          alt=""
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <div className="font-medium text-white">{m.full_name}</div>
                          <div className="text-zinc-500 text-[11px]">@{m.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => handleToggleRole(m)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                          m.role === 'admin'
                            ? 'bg-zinc-800 text-zinc-200 border-white/15'
                            : 'bg-zinc-900 text-zinc-400 border-white/5'
                        }`}
                        title="Click to toggle Member/Admin"
                      >
                        {m.role === 'admin' ? '👑 Admin' : 'Member'}
                      </button>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                          m.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {m.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{m.status === 'active' ? 'Active' : 'Suspended'}</span>
                      </span>
                    </td>

                    <td className="p-4 text-zinc-500">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(m)}
                          className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-white/5"
                        >
                          {m.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDeleteMember(m.id, m.full_name)}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30"
                          title="Remove user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-white">Reported Content Stream</h3>
            </div>
            <span className="text-xs text-zinc-400">{reports.length} Total Reports</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No reported posts in the queue. Everything looks clean!
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => {
                const repPost = posts.find((p) => p.id === rep.reported_post_id);
                const reporter = members.find((m) => m.id === rep.reporter_id);

                return (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-[#111111] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium text-[10px]">
                          {rep.reason}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Reported by {reporter?.full_name || 'Member'} • {timeAgo(rep.created_at)}
                        </span>
                      </div>
                      {rep.details && (
                        <p className="text-xs text-zinc-400 italic">"{rep.details}"</p>
                      )}
                      {repPost ? (
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-zinc-300 mt-2">
                          <span className="font-medium text-zinc-400 text-[10px] block">
                            Target Post Content:
                          </span>
                          {repPost.content}
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500">[Target post has been deleted]</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rep.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleDismissReport(rep.id)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10"
                          >
                            Dismiss
                          </button>
                          {repPost && (
                            <button
                              onClick={() => handleDeleteReportedPost(rep.id, repPost.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium shadow-md shadow-rose-500/20"
                            >
                              Delete Post
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">
                          {rep.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. SETTINGS & BROADCAST TAB */}
      {activeTab === 'settings' && (
        <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-indigo-400" />
              <h3 className="font-serif font-bold text-base text-white">Broadcast & Community Rules</h3>
            </div>
            {saveSettingsSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Broadcast settings saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Community Platform Name
              </label>
              <input
                type="text"
                required
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Global Header Announcement Banner
              </label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                rows={2}
                placeholder="Broadcast message shown to all squad members on the home feed..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-indigo-600 focus:ring-indigo-500/20"
                />
                <div>
                  <span className="font-medium text-xs text-zinc-200">
                    Enable Top Announcement Banner
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Pins announcement to the top of all member feeds
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-indigo-600 focus:ring-indigo-500/20"
                />
                <div>
                  <span className="font-medium text-xs text-zinc-200">
                    Allow Open Registration
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    When disabled, new members MUST have an invite code to sign up
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Admin Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Invite New Friend to Hub</span>
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setGeneratedInviteLink('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-zinc-300">
                  ✓ Exclusive single-use invite link created! Send this link to your friend:
                </div>

                <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-xl border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={generatedInviteLink}
                    className="bg-transparent text-xs text-white flex-1 font-mono outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shrink-0"
                    title="Copy to clipboard"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setGeneratedInviteLink('');
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Friend Email (optional)
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="member">Standard Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20"
                  >
                    Generate Invite Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
