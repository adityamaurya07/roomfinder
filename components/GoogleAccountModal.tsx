'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { X, UserPlus, ShieldCheck, Check, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';

interface GoogleAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
}

export default function GoogleAccountModal({
  isOpen,
  onClose,
  role = 'seeker'
}: GoogleAccountModalProps) {
  const { loginWithGmail, loginWithGoogle, isLoading } = useAuth();
  const [customGmail, setCustomGmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultAccounts = [
    {
      name: 'Aditya Maurya',
      email: 'adityamaurya07@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      badge: 'Room Seeker'
    },
    {
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma.delhi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      badge: 'Verified Landlord'
    }
  ];

  const handleSelectAccount = async (email: string, name: string) => {
    try {
      await loginWithGmail(email, name, role);
      onClose();
    } catch {
      setError('Google Sign-In failed. Please try again.');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmail.trim()) {
      setError('Please enter your Gmail address');
      return;
    }
    const cleanEmail = customGmail.trim().includes('@')
      ? customGmail.trim()
      : `${customGmail.trim()}@gmail.com`;

    const name = customName.trim() || cleanEmail.split('@')[0];
    await handleSelectAccount(cleanEmail, name);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-black/80 backdrop-blur-md animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 animate-scaleUp max-h-[90vh] flex flex-col"
      >
        {/* Header with Google Logo */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Google 'G' SVG Logo */}
          <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>

          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Choose an account
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            to continue to <span className="font-semibold text-emerald-600 dark:text-emerald-400">RoomFinder</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Accounts List */}
          <div className="space-y-2">
            {defaultAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectAccount(acc.email, acc.name)}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-left transition flex items-center gap-3 group cursor-pointer"
              >
                <img
                  src={acc.avatar}
                  alt={acc.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {acc.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {acc.email}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                  {acc.badge}
                </div>
              </button>
            ))}
          </div>

          {/* Option: Use another Gmail account */}
          {!showCustomInput ? (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              className="w-full p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 text-left transition flex items-center gap-3 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold">
                Use another Gmail account
              </div>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-fadeIn">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Enter your Gmail Address
              </div>
              <input
                type="text"
                required
                placeholder="yourname@gmail.com"
                value={customGmail}
                onChange={(e) => setCustomGmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Sign In with Gmail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Privacy Note */}
          <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 text-center">
            To continue, Google will share your name and email address with RoomFinder.
          </div>
        </div>
      </div>
    </div>
  );
}
