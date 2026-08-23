import React, { useState } from 'react';
import {
  Compass,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Phone,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, quickLogin, register, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('mdtanvirhasanzim12@gmail.com');
  const [password, setPassword] = useState('FriendsHub2026!');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration specifics
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('CIRCLE2026');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  ];

  const quickAccounts = [
    {
      id: 'usr-tanvir-admin',
      name: 'Tanvir Hasan Zim',
      handle: 'tanvir_zim',
      email: 'mdtanvirhasanzim12@gmail.com',
      role: 'Organizer & Admin',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-sara-khan',
      name: 'Sara Khan',
      handle: 'sara_k',
      email: 'sara.k@gmail.com',
      role: 'Member (Gulshan)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'usr-rahim-chowdhury',
      name: 'Rahim Chowdhury',
      handle: 'rahim_c',
      email: 'rahim.c@gmail.com',
      role: 'Member (Agargaon)',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const handleInstantSignIn = async (userEmailOrId: string) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await quickLogin(userEmailOrId);
      if (!res.success) {
        // Try fallback login with default password
        const fallbackRes = await login(userEmailOrId, 'FriendsHub2026!');
        if (!fallbackRes.success) {
          setErrorMsg(fallbackRes.error || 'Authentication error. Please try again.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your email address or username.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanId, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your username and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanMail = email.trim().toLowerCase();

    if (!cleanName || !cleanUser || !cleanMail || !password) {
      setErrorMsg('Please fill in all required account fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entry.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        full_name: cleanName,
        username: cleanUser,
        email: cleanMail,
        password,
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl || sampleAvatars[0],
        invite_code: inviteCode.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Account registration failed. Please try a different username or email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanMail = identifier.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      setErrorMsg('Please enter a valid registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(cleanMail);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset instructions have been dispatched to your email.');
      } else {
        setErrorMsg(res.error || 'Unable to find an account with that email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-view-root" className="min-h-screen bg-[#050505] text-[#f0f0f0] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-60 sm:w-96 h-60 sm:h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xl shadow-indigo-600/20 mb-1">
            <Compass className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">FriendsHub</h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto">
            Private Friends Circle & Real-Time Location Radar
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          {/* Navigation Mode Switcher */}
          {mode !== 'forgot' && (
            <div className="flex bg-[#141414] p-1 rounded-2xl mb-5 border border-white/5">
              <button
                id="tab-sign-in"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-create-account"
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Email or Username
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-identifier"
                      type="text"
                      required
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="mdtanvirhasanzim12@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                    <button
                      id="btn-forgot-password"
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="input-login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-indigo-600 focus:ring-indigo-500/20"
                    />
                    <span>Remember session</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">Default pass: FriendsHub2026!</span>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Sign In to FriendsHub</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click Access for Primary Accounts */}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-medium text-zinc-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Instant 1-Click Access
                  </span>
                  <span className="text-zinc-500">No typing needed</span>
                </div>
                <div className="space-y-1.5">
                  {quickAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      id={`btn-quick-login-${acc.handle}`}
                      type="button"
                      disabled={loading}
                      onClick={() => handleInstantSignIn(acc.id)}
                      className="w-full p-2 rounded-xl bg-[#141414] hover:bg-[#1c1c1c] border border-white/5 hover:border-indigo-500/40 transition-all flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                            {acc.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {acc.email} • {acc.role}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-indigo-400 group-hover:text-indigo-300 shrink-0 ml-2">
                        Enter &rarr;
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-register-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Hasan"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Username</label>
                  <input
                    id="input-register-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="tanvir_zim"
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Invite Code</label>
                  <input
                    id="input-register-invite"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="CIRCLE2026"
                    className="w-full px-3 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-indigo-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Phone Number (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input-register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712-345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Create Password</label>
                  <div className="relative">
                    <input
                      id="input-register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-3 pr-8 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="input-register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-3 pr-8 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {sampleAvatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Avatar option ${idx + 1}`}
                      onClick={() => setAvatarUrl(url)}
                      className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-all shrink-0 ${
                        (avatarUrl || sampleAvatars[0]) === url
                          ? 'ring-2 ring-indigo-500 scale-105 opacity-100'
                          : 'opacity-60 hover:opacity-100 ring-1 ring-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Profile...
                  </span>
                ) : (
                  <>
                    <span>Join Friends Circle</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-2 border border-indigo-500/20">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-serif font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your registered email address and we will dispatch password recovery instructions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-forgot-email"
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. tanvir@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#262626] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                id="btn-submit-forgot"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all min-h-[44px]"
              >
                {loading ? 'Dispatching Instructions...' : 'Send Recovery Link'}
              </button>

              <button
                id="btn-back-to-login"
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-200 mt-2 py-2"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Security & Access Protection Notice */}
        <div className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 px-4">
          <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Private closed circle. Secure authentication & end-to-end access control.</span>
        </div>
      </div>
    </div>
  );
};
