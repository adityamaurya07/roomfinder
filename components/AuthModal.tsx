'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import {
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Home,
  Users
} from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    openAuthModal,
    login,
    signup,
    loginWithGoogle,
    loginWithGmail,
    quickDemoLogin,
    isLoading
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode);
  const [role, setRole] = useState<UserRole>('seeker');
  const [emailOrPhone, setEmailOrPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync mode with context authModalMode when opening
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, isAuthModalOpen]);

  // Lock background body scroll completely while modal is open
  React.useEffect(() => {
    if (isAuthModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrPhone.trim()) {
      setError('Please enter your mobile number or email address.');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(emailOrPhone, role);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          return;
        }
        await signup({
          name: name.trim(),
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@kirayepe.com`,
          phone: emailOrPhone.includes('@') ? '+91 98100 00000' : emailOrPhone,
          role
        });
      }
    } catch {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div
      onClick={closeAuthModal}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div
        className="relative w-full max-w-md my-auto bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-scaleUp max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 z-10" />
        <div className="absolute -top-14 -right-14 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Owner & Safe Flatmates</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Login to chat with verified owners, post rooms, and save favorites'
                : 'Join RoomFinder to discover rooms with exact map pins & zero broker fees'}
            </p>
          </div>

          {/* Quick 1-Click Demo Login Chips */}
          <div className="mb-6 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant 1-Click Demo Logins</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('owner')}
                className="px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Verified Owner</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Rajesh Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => quickDemoLogin('seeker')}
                className="px-3 py-2 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 border border-teal-500/40 text-left transition group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                  <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span className="truncate">Room Seeker</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Aman Verma</div>
              </button>
            </div>
          </div>

          {/* NextAuth Google / Gmail Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle(role)}
            disabled={isLoading}
            className="w-full mb-4 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-3 border border-slate-300 active:scale-[0.98] cursor-pointer"
          >
            {/* Google SVG Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Or with Email / Phone</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Tab Switcher: Login vs Sign Up */}
          <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                mode === 'signup'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            {/* Role selection on Signup or Login */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                I am using RoomFinder as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('seeker')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'seeker'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Room Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    role === 'owner'
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Property Owner</span>
                </button>
              </div>
            </div>

            {/* Name Field (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Mobile / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210 or email@example.com"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setEmailOrPhone('rajesh.sharma@kirayepe.com')}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm text-white shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to RoomFinder' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Footnote */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe & Encrypted • No telemarketer spam</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
