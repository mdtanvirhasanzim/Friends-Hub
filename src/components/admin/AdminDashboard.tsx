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
  Eye,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Sparkles,
  Search,
  KeyRound,
  LogIn,
  LogOut,
  Activity,
  Globe,
  Compass,
  Laptop,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { store } from '../../lib/storage';
import { UserProfile, Post, Report, CommunitySettings, Invitation, UserLocation, Photo, ActivityLog, SearchLog } from '../../types';
import { timeAgo } from '../../lib/geoUtils';
import confetti from 'canvas-confetti';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
];

export const AdminDashboard: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();

  const [members, setMembers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [settings, setSettings] = useState<CommunitySettings>(store.getSettings());

  // Search & filter in members
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'admin' | 'member' | 'suspended'>('all');

  // Member profile detail modal
  const [selectedMember, setSelectedMember] = useState<UserProfile | null>(null);
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: '',
    role: 'member' as 'member' | 'admin',
  });

  // Add / Invite Member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'direct' | 'invite'>('direct');

  // Direct add form state
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState(PRESET_AVATARS[0]);
  const [newRole, setNewRole] = useState<'member' | 'admin'>('member');
  const [newLocationSharing, setNewLocationSharing] = useState(true);
  const [newAddressHint, setNewAddressHint] = useState('Dhanmondi, Dhaka');
  const [addMemberSuccess, setAddMemberSuccess] = useState(false);

  // Invite link state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(store.getActivityLogs());
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>(store.getSearchLogs());
  const [activityFilter, setActivityFilter] = useState<'all' | 'login_logout' | 'search' | 'posts' | 'register' | 'location'>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');

  // Settings form
  const [communityName, setCommunityName] = useState(settings.community_name);
  const [announcementText, setAnnouncementText] = useState(settings.announcement_banner);
  const [announcementActive, setAnnouncementActive] = useState(settings.announcement_active);
  const [allowRegistration, setAllowRegistration] = useState(settings.allow_registration);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activity' | 'moderation' | 'settings'>('overview');

  useEffect(() => {
    const refresh = () => {
      const allProfiles = store.getProfiles();
      setMembers(allProfiles);
      setPosts(store.getPosts());
      setReports(store.getReports());
      setInvitations(store.getInvites());
      setLocations(store.getLocations());
      setActivityLogs(store.getActivityLogs());
      setSearchLogs(store.getSearchLogs());
      const s = store.getSettings();
      setSettings(s);
      setCommunityName(s.community_name);
      setAnnouncementText(s.announcement_banner);
      setAnnouncementActive(s.announcement_active);
      setAllowRegistration(s.allow_registration);

      // Keep selected member fresh
      if (selectedMember) {
        const freshSelected = allProfiles.find((p) => p.id === selectedMember.id);
        if (freshSelected) {
          setSelectedMember(freshSelected);
        }
      }
    };

    refresh();
    const unsub = store.subscribe(refresh);
    return () => unsub();
  }, [selectedMember?.id]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-[#080808] border border-[#1a1a1a] shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-white">Administrator Access Required</h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            This dashboard is restricted exclusively to authorized community administrators.
          </p>
        </div>
      </div>
    );
  }

  const handleOpenMemberProfile = (user: UserProfile) => {
    setSelectedMember(user);
    setIsEditingMember(false);
    setEditFormData({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
      avatar_url: user.avatar_url || PRESET_AVATARS[0],
      role: user.role,
    });
  };

  const handleToggleRole = (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    const updated = store.updateProfile(user.id, { role: newRole });
    if (selectedMember?.id === user.id) {
      setSelectedMember(updated);
    }
  };

  const handleToggleStatus = (user: UserProfile) => {
    const currentStatus = user.status || (user.is_active ? 'active' : 'suspended');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const updated = store.updateProfile(user.id, {
      status: newStatus,
      is_active: newStatus === 'active',
    });
    if (selectedMember?.id === user.id) {
      setSelectedMember(updated);
    }
  };

  const handleDeleteMember = (userId: string, name: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own admin account!');
      return;
    }
    if (window.confirm(`Are you sure you want to remove member "${name}" from FriendsHub?`)) {
      store.deleteProfile(userId);
      if (selectedMember?.id === userId) {
        setSelectedMember(null);
      }
    }
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    const updated = store.updateProfile(selectedMember.id, {
      full_name: editFormData.full_name.trim(),
      username: editFormData.username.trim().replace(/^@/, ''),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      bio: editFormData.bio.trim(),
      avatar_url: editFormData.avatar_url,
      role: editFormData.role,
    });
    setSelectedMember(updated);
    setIsEditingMember(false);
  };

  // Direct Member Creation
  const handleDirectAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = (newUsername.trim() || newFullName.toLowerCase().replace(/\s+/g, '')).replace(/^@/, '');
    const uniqueId = `usr-${cleanUsername}-${Date.now().toString(36)}`;
    const cleanEmail = newEmail.trim() || `${cleanUsername}@friendshub.internal`;

    const newProfile: UserProfile = {
      id: uniqueId,
      full_name: newFullName.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: newPhone.trim() || undefined,
      bio: newBio.trim() || 'New member in the circle! 👋',
      avatar_url: newAvatar,
      role: newRole,
      is_active: true,
      status: 'active',
      location_sharing_enabled: newLocationSharing,
      privacy_mode: 'exact',
      online_status: 'online',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const added = store.addProfile(newProfile);

    // Give initial GPS coordinate & address hint
    store.updateLocation(uniqueId, {
      latitude: 23.7461 + (Math.random() - 0.5) * 0.04,
      longitude: 90.3742 + (Math.random() - 0.5) * 0.04,
      is_sharing: newLocationSharing,
      address_hint: newAddressHint || 'Dhaka Metropolitan, Bangladesh',
      activity: 'stationary',
      battery_level: 95,
    });

    setAddMemberSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Reset fields
    setTimeout(() => {
      setAddMemberSuccess(false);
      setShowAddMemberModal(false);
      setNewFullName('');
      setNewUsername('');
      setNewEmail('');
      setNewPhone('');
      setNewBio('');
      // Open the newly created profile so admin can inspect it!
      handleOpenMemberProfile(added);
      setActiveTab('members');
    }, 1200);
  };

  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = store.createInvite(currentUser?.id || 'admin', inviteEmail, inviteRole);
    const link = `${window.location.origin}?invite=${inv.code}`;
    setGeneratedInviteLink(link);

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedInviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteInvite = (inviteId: string) => {
    store.deleteInvite(inviteId);
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

  // Filter members list
  const filteredMembers = members.filter((m) => {
    const q = searchMemberQuery.toLowerCase();
    const matchesQuery =
      !q ||
      m.full_name.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.toLowerCase().includes(q));

    if (!matchesQuery) return false;

    if (memberRoleFilter === 'admin') return m.role === 'admin';
    if (memberRoleFilter === 'member') return m.role === 'member';
    if (memberRoleFilter === 'suspended') {
      const isSuspended = (m.status || (m.is_active ? 'active' : 'suspended')) === 'suspended';
      return isSuspended;
    }
    return true;
  });

  // Metrics
  const activeLocationsCount = locations.filter((l) => l.is_sharing).length;
  const photosCount = store.getPhotos().length;
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
            Directly manage circle members, view full profiles, inspect live telemetry, and control access.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setAddModalTab('direct');
              setShowAddMemberModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member Directly</span>
          </button>

          <button
            onClick={() => {
              setAddModalTab('invite');
              setShowAddMemberModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 font-medium text-xs transition-all"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span>Invite Link</span>
          </button>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Community Metrics' },
          { id: 'members', label: `Members Directory (${members.length})` },
          { id: 'activity', label: `Live Activity & Search Audit (${activityLogs.length})` },
          {
            id: 'moderation',
            label: `Moderation Queue ${pendingReportsCount > 0 ? `(${pendingReportsCount})` : ''}`,
          },
          { id: 'settings', label: 'Broadcast & Global Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.id === 'activity' && <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
            <span>{tab.label}</span>
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
              <div className="text-[10px] text-emerald-400 mt-1">100% Verified Profiles</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a]">
              <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-xs font-medium">Radar Active</span>
                <Radio className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-2xl font-serif font-bold text-indigo-400">{activeLocationsCount}</div>
              <div className="text-[10px] text-zinc-400 mt-1">Live GPS Stream</div>
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
              <div className="text-[10px] text-zinc-400 mt-1">Gallery items</div>
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
            <h3 className="font-serif font-bold text-base text-white">System Security & Member Privacy</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              FriendsHub operates as an exclusive, private circle. Admin console enables direct full-profile visibility, role promotion, account suspension, and instant testing persona switching.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-emerald-400 font-medium border border-white/5">
                ✓ Full Profile Inspection Active
              </span>
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-indigo-400 font-medium border border-white/5">
                ✓ Direct Member Addition Enabled
              </span>
              <span className="px-3 py-1 bg-zinc-900 rounded-xl text-zinc-300 font-medium border border-white/5">
                ✓ Local Persistent Storage Synchronized
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. MEMBERS DIRECTORY TAB */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] shadow-xl overflow-hidden">
            {/* Table Header & Search */}
            <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Registered Circle Members</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Click on any member to view their complete profile, phone, GPS location & actions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    placeholder="Search name, username, email..."
                    className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'admin', label: 'Admins' },
                    { id: 'member', label: 'Members' },
                    { id: 'suspended', label: 'Suspended' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setMemberRoleFilter(f.id as any)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                        memberRoleFilter === f.id
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111111] text-zinc-400 font-medium border-b border-white/5 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Radar / GPS</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {filteredMembers.map((m) => {
                    const memberLoc = locations.find((l) => l.user_id === m.id);
                    const isSuspended = (m.status || (m.is_active ? 'active' : 'suspended')) === 'suspended';

                    return (
                      <tr
                        key={m.id}
                        onClick={() => handleOpenMemberProfile(m)}
                        className="hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={m.avatar_url || PRESET_AVATARS[0]}
                                alt=""
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                              />
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#080808] ${
                                  m.online_status === 'online'
                                    ? 'bg-emerald-500'
                                    : m.online_status === 'away'
                                    ? 'bg-amber-500'
                                    : 'bg-zinc-600'
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                                <span>{m.full_name}</span>
                                {m.role === 'admin' && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <div className="text-zinc-500 text-[11px]">@{m.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="text-zinc-300 text-xs font-mono">{m.email}</div>
                          {m.phone && (
                            <div className="text-zinc-500 text-[11px] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-zinc-600" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
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
                              !isSuspended
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {!isSuspended ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span>{!isSuspended ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>

                        <td className="p-4">
                          {memberLoc?.is_sharing ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400">
                              <Radio className="w-3 h-3 animate-pulse" />
                              <span className="truncate max-w-[120px]">{memberLoc.address_hint || 'Sharing GPS'}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-500">Hidden</span>
                          )}
                        </td>

                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenMemberProfile(m)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 text-[11px] font-medium border border-indigo-500/20 flex items-center gap-1"
                              title="View full profile"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(m)}
                              className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-white/5"
                            >
                              {!isSuspended ? 'Suspend' : 'Activate'}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Invitations Tracker */}
          {invitations.length > 0 && (
            <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Generated Invite Codes & Links</span>
                </div>
                <span className="text-xs text-zinc-400">{invitations.length} Total</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {inv.code}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          inv.is_used ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {inv.is_used ? 'Used' : 'Pending'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 truncate">
                      {inv.email ? `Sent to: ${inv.email}` : 'General invite link'} • Role: {inv.role}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      <span className="text-zinc-500">{timeAgo(inv.created_at)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}?invite=${inv.code}`;
                            navigator.clipboard.writeText(link);
                            alert(`Invite link copied:\n${link}`);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(inv.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. LIVE ACTIVITY & SEARCH AUDIT TAB */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white">Live Multi-Device Activity & Search Audit</h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Real-time Central DB
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Tracks logins, logouts, member registrations, live location changes, and user search queries across all phones and browsers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    store.syncWithServer();
                    setActivityLogs(store.getActivityLogs());
                    setSearchLogs(store.getSearchLogs());
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Force refresh logs from server"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div className="text-xs text-zinc-400 font-medium">Total Activity Events</div>
                <div className="text-xl font-serif font-bold text-white mt-1">{activityLogs.length}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Recorded in DB</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div className="text-xs text-zinc-400 font-medium">Logins & Sessions</div>
                <div className="text-xl font-serif font-bold text-emerald-400 mt-1">
                  {activityLogs.filter((l) => l.action === 'login' || l.action === 'logout').length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Device connections</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div className="text-xs text-zinc-400 font-medium">Search Queries</div>
                <div className="text-xl font-serif font-bold text-indigo-400 mt-1">{searchLogs.length}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Keywords logged</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div className="text-xs text-zinc-400 font-medium">Active Synchronized Users</div>
                <div className="text-xl font-serif font-bold text-amber-400 mt-1">
                  {members.filter((m) => m.online_status === 'online').length} / {members.length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Online right now</div>
              </div>
            </div>

            {/* Filters and Search in logs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: `All Events (${activityLogs.length})` },
                  {
                    id: 'login_logout',
                    label: `Logins & Logouts (${activityLogs.filter((a) => a.action === 'login' || a.action === 'logout').length})`,
                  },
                  { id: 'search', label: `Searches (${searchLogs.length})` },
                  {
                    id: 'register',
                    label: `Registrations (${activityLogs.filter((a) => a.action === 'register' || a.action === 'add_member').length})`,
                  },
                  {
                    id: 'posts',
                    label: `Posts & Media (${activityLogs.filter((a) => a.action === 'create_post' || a.action === 'upload_photo').length})`,
                  },
                  {
                    id: 'location',
                    label: `GPS Updates (${activityLogs.filter((a) => a.action === 'update_location').length})`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActivityFilter(f.id as any)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                      activityFilter === f.id
                        ? 'bg-zinc-800 text-white border border-white/10 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative shrink-0">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  placeholder="Filter activity details..."
                  className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Search Queries Deep-Dive (If Search filter is selected or has queries) */}
          {activityFilter === 'search' && (
            <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-serif font-bold text-sm text-white">All Logged User Searches</h4>
                </div>
                <span className="text-xs text-zinc-400">{searchLogs.length} total searches</span>
              </div>

              {searchLogs.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No searches recorded yet. When users search for friends, posts, or places, they will appear here in real time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#111111] text-zinc-400 font-medium border-b border-white/5 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Search Query</th>
                        <th className="p-3">User</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Results Count</th>
                        <th className="p-3">Device / IP</th>
                        <th className="p-3 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-zinc-300">
                      {searchLogs
                        .filter((s) =>
                          !activitySearchQuery ||
                          s.query.toLowerCase().includes(activitySearchQuery.toLowerCase()) ||
                          s.user_name.toLowerCase().includes(activitySearchQuery.toLowerCase())
                        )
                        .map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="p-3">
                              <span className="font-mono px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-medium">
                                "{s.query}"
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-white">{s.user_name}</div>
                              <div className="text-[10px] text-zinc-500">ID: {s.user_id.slice(0, 10)}</div>
                            </td>
                            <td className="p-3">
                              <span className="capitalize px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] border border-white/5">
                                {s.category || 'all'}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-xs text-zinc-300 font-mono font-medium">{s.results_count} found</span>
                            </td>
                            <td className="p-3 text-zinc-400 text-[11px] font-mono">
                              {s.device || 'Mobile / Web'} • {s.ip || '127.0.0.1'}
                            </td>
                            <td className="p-3 text-right text-zinc-400 text-[11px]">
                              <div>{timeAgo(s.created_at || s.timestamp)}</div>
                              <div className="text-[10px] text-zinc-500">{new Date(s.created_at || s.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Activity Timeline Feed */}
          <div className="bg-[#080808] rounded-3xl border border-[#1a1a1a] p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h4 className="font-serif font-bold text-sm text-white">Full Event Stream & Activity Audit</h4>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Showing {activityLogs.length} events
              </span>
            </div>

            {activityLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No activity logged yet. All actions will stream here live.
              </div>
            ) : (
              <div className="space-y-2.5">
                {activityLogs
                  .filter((log) => {
                    if (activityFilter === 'login_logout') return log.action === 'login' || log.action === 'logout';
                    if (activityFilter === 'search') return log.action === 'search';
                    if (activityFilter === 'register') return log.action === 'register' || log.action === 'add_member';
                    if (activityFilter === 'posts') return log.action === 'create_post' || log.action === 'upload_photo';
                    if (activityFilter === 'location') return log.action === 'update_location';
                    return true;
                  })
                  .filter((log) => {
                    if (!activitySearchQuery) return true;
                    const q = activitySearchQuery.toLowerCase();
                    return (
                      log.details.toLowerCase().includes(q) ||
                      log.user_name.toLowerCase().includes(q) ||
                      log.action.toLowerCase().includes(q) ||
                      (log.location_hint && log.location_hint.toLowerCase().includes(q))
                    );
                  })
                  .map((log) => {
                    const profile = members.find((m) => m.id === log.user_id);
                    const isLogin = log.action === 'login';
                    const isLogout = log.action === 'logout';
                    const isSearch = log.action === 'search';
                    const isRegister = log.action === 'register' || log.action === 'add_member';
                    const isPost = log.action === 'create_post';
                    const isPhoto = log.action === 'upload_photo';
                    const isLocation = log.action === 'update_location';

                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          {/* Action Icon Badge */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isLogin
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : isLogout
                                ? 'bg-zinc-800 text-zinc-400 border-white/10'
                                : isSearch
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                : isRegister
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : isPost
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : isPhoto
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                            }`}
                          >
                            {isLogin && <LogIn className="w-4 h-4" />}
                            {isLogout && <LogOut className="w-4 h-4" />}
                            {isSearch && <Search className="w-4 h-4" />}
                            {isRegister && <UserPlus className="w-4 h-4" />}
                            {isPost && <FileText className="w-4 h-4" />}
                            {isPhoto && <ImageIcon className="w-4 h-4" />}
                            {isLocation && <MapPin className="w-4 h-4" />}
                            {!isLogin && !isLogout && !isSearch && !isRegister && !isPost && !isPhoto && !isLocation && (
                              <Activity className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-xs text-white">{log.user_name}</span>
                              {profile && (
                                <span className="text-[10px] text-zinc-500">@{profile.username}</span>
                              )}
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium uppercase tracking-wider ${
                                  isLogin
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isLogout
                                    ? 'bg-zinc-800 text-zinc-400 border border-white/5'
                                    : isSearch
                                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                                    : isRegister
                                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                    : 'bg-zinc-800 text-zinc-300 border border-white/5'
                                }`}
                              >
                                {log.action.replace('_', ' ')}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-300 leading-relaxed">{log.details}</p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-500 pt-0.5">
                              {log.location_hint && (
                                <span className="flex items-center gap-1 text-zinc-400">
                                  <MapPin className="w-3 h-3 text-indigo-400" />
                                  <span>{log.location_hint}</span>
                                </span>
                              )}
                              {log.device && (
                                <span className="flex items-center gap-1 font-mono text-[10px]">
                                  <Laptop className="w-3 h-3 text-zinc-600" />
                                  <span>{log.device}</span>
                                </span>
                              )}
                              {log.ip && (
                                <span className="font-mono text-[10px] text-zinc-600">IP: {log.ip}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right sm:self-center pl-12 sm:pl-0">
                          <div className="text-xs text-zinc-400 font-medium">{timeAgo(log.created_at || log.timestamp)}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {new Date(log.created_at || log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MODERATION QUEUE */}
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

      {/* ========================================================================= */}
      {/* MEMBER PROFILE DETAIL MODAL (ADMIN INSPECTION & EDITING) */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
            {/* Modal Header Banner */}
            <div className="relative bg-gradient-to-r from-indigo-950/60 to-zinc-900 p-6 border-b border-white/5">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setIsEditingMember(false);
                }}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 text-zinc-400 hover:text-white hover:bg-black/60 transition-colors"
              >
                ✕
              </button>

              <div className="flex items-start gap-4">
                <img
                  src={selectedMember.avatar_url || PRESET_AVATARS[0]}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-lg shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-bold text-white truncate">
                      {selectedMember.full_name}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        selectedMember.role === 'admin'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-white/5'
                      }`}
                    >
                      {selectedMember.role === 'admin' ? '👑 Administrator' : 'Circle Member'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">@{selectedMember.username}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    Joined: {new Date(selectedMember.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {isEditingMember ? (
                /* Edit Form */
                <form onSubmit={handleSaveMemberEdit} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Member Information</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingMember(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editFormData.full_name}
                        onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={editFormData.username}
                        onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Phone (optional)</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="+880 17..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Bio</label>
                    <textarea
                      rows={2}
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Avatar Preset</label>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <img
                          key={idx}
                          src={av}
                          alt=""
                          onClick={() => setEditFormData({ ...editFormData, avatar_url: av })}
                          className={`w-9 h-9 rounded-xl object-cover cursor-pointer transition-all ${
                            editFormData.avatar_url === av
                              ? 'ring-2 ring-indigo-500 scale-105'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Role Permission</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="member">Standard Circle Member</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingMember(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* Profile View Details */
                <div className="space-y-4">
                  {/* Bio block */}
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">About / Bio</span>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {selectedMember.bio || 'No bio written yet.'}
                    </p>
                  </div>

                  {/* Contact details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-zinc-500 uppercase">Email Address</div>
                        <div className="text-xs text-white font-mono truncate">{selectedMember.email}</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] text-zinc-500 uppercase">Phone Number</div>
                        <div className="text-xs text-white truncate">
                          {selectedMember.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Live Location Radar Status */}
                  {(() => {
                    const loc = locations.find((l) => l.user_id === selectedMember.id);
                    return (
                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-medium text-white">
                            <Radio className="w-4 h-4 text-indigo-400" />
                            <span>Live Location Radar Status</span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              loc?.is_sharing
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {loc?.is_sharing ? '🟢 Sharing Active' : '⚪ Sharing Disabled'}
                          </span>
                        </div>

                        {loc?.is_sharing && (
                          <div className="text-xs text-zinc-300 space-y-1 font-mono text-[11px] pt-1">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{loc.address_hint || 'Dhaka Central Area'}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              Coordinates: {loc.latitude.toFixed(4)}° N, {loc.longitude.toFixed(4)}° E • Battery: {loc.battery_level ?? 90}%
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Activity Stats */}
                  {(() => {
                    const memberPosts = posts.filter((p) => p.user_id === selectedMember.id);
                    const memberPhotos = store.getPhotos().filter((p) => p.user_id === selectedMember.id);

                    return (
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-white/5">
                          <div className="text-lg font-serif font-bold text-white">{memberPosts.length}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">Posts Shared</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-zinc-900/40 border border-white/5">
                          <div className="text-lg font-serif font-bold text-white">{memberPhotos.length}</div>
                          <div className="text-[10px] text-zinc-500 uppercase">Photos in Albums</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Quick Admin Actions Bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditingMember(true)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleToggleRole(selectedMember)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10"
                      >
                        {selectedMember.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                      </button>

                      <button
                        onClick={() => handleToggleStatus(selectedMember)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/10"
                      >
                        {(selectedMember.status || (selectedMember.is_active ? 'active' : 'suspended')) === 'active'
                          ? 'Suspend Account'
                          : 'Activate Account'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteMember(selectedMember.id, selectedMember.full_name)}
                        className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / INVITE MEMBER MODAL */}
      {/* ========================================================================= */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl my-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Add / Invite Circle Member</span>
              </div>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setGeneratedInviteLink('');
                }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <button
                type="button"
                onClick={() => setAddModalTab('direct')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  addModalTab === 'direct'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                + Direct Add Member (সরাসরি যুক্ত করুন)
              </button>
              <button
                type="button"
                onClick={() => setAddModalTab('invite')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  addModalTab === 'invite'
                    ? 'bg-zinc-800 text-white border border-white/10'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🔗 Generate Invite Link (ইনভাইট লিংক)
              </button>
            </div>

            {/* DIRECT ADD TAB */}
            {addModalTab === 'direct' && (
              <form onSubmit={handleDirectAddMember} className="space-y-4">
                {addMemberSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Member profile created successfully! Added to directory.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFullName}
                      onChange={(e) => {
                        setNewFullName(e.target.value);
                        if (!newUsername) {
                          setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                        }
                      }}
                      placeholder="e.g. Shakil Ahmed"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. shakil"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="shakil@friendshub.internal"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Phone Number (optional)
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+880 1700-000000"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Bio & Interests
                  </label>
                  <input
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="e.g. Cafe lover, developer, football fan ⚽"
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Avatar picker */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Select Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <img
                        key={idx}
                        src={av}
                        alt=""
                        onClick={() => setNewAvatar(av)}
                        className={`w-9 h-9 rounded-xl object-cover cursor-pointer transition-all ${
                          newAvatar === av
                            ? 'ring-2 ring-indigo-500 scale-105'
                            : 'opacity-50 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="member">Standard Circle Member</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Initial Area Hint
                    </label>
                    <input
                      type="text"
                      value={newAddressHint}
                      onChange={(e) => setNewAddressHint(e.target.value)}
                      placeholder="e.g. Dhanmondi, Dhaka"
                      className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={newLocationSharing}
                    onChange={(e) => setNewLocationSharing(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-white/10 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span className="text-xs text-zinc-300">
                    Enable Live Radar location sharing by default
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Create & Add Member Profile</span>
                  </button>
                </div>
              </form>
            )}

            {/* INVITE LINK TAB */}
            {addModalTab === 'invite' && (
              <div>
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
                        setShowAddMemberModal(false);
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
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Assigned Role
                      </label>
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
                        onClick={() => setShowAddMemberModal(false)}
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};
