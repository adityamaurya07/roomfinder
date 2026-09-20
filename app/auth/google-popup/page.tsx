'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { UserPlus, ArrowRight, Shield, Info, ExternalLink } from 'lucide-react';

export default function GooglePopupPage() {
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState<boolean>(true);
  const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if Google OAuth Client ID is configured on server
    const checkConfig = async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.isGoogleConfigured) {
          setIsGoogleConfigured(true);
          // Directly redirect to official Google OAuth endpoint
          signIn('google', { callbackUrl: `${window.location.origin}/auth/google-success` });
          return;
        }
      } catch (err) {
        console.error('Error checking google auth status:', err);
      } finally {
        setIsCheckingConfig(false);
      }
    };

    checkConfig();
  }, []);

  const defaultAccounts = [
    {
      name: 'Aditya Maurya',
      email: 'adityamaurya07@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Aditya (Personal)',
      email: 'aditya.personal@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    }
  ];

  const handleSelectAccount = (account: { name: string; email: string; avatar?: string }) => {
    setIsProcessing(true);
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_SUCCESS',
          account: {
            name: account.name,
            email: account.email,
            avatar:
              account.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(account.name)}`
          }
        },
        window.location.origin
      );
    }
    setTimeout(() => {
      window.close();
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const cleanEmail = customEmail.trim().includes('@')
      ? customEmail.trim()
      : `${customEmail.trim()}@gmail.com`;

    const name = customName.trim() || cleanEmail.split('@')[0];
    handleSelectAccount({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: cleanEmail
    });
  };

  if (isCheckingConfig) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Connecting to Google...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans antialiased text-slate-800 select-none">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 flex flex-col">
        {/* Google Multicolor Logo */}
        <div className="text-center mb-5">
          <svg className="w-9 h-9 mx-auto mb-3" viewBox="0 0 24 24">
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign in with Google</h1>
          <p className="text-xs text-slate-500 mt-1">
            Choose an account to continue to <span className="font-semibold text-emerald-700">RoomFinder</span>
          </p>
        </div>

        {/* Processing State */}
        {isProcessing ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Signing in with Google...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Account List */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {defaultAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleSelectAccount(account)}
                  className="w-full p-3.5 hover:bg-slate-50 text-left transition flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {account.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {account.email}
                    </div>
                  </div>
                </button>
              ))}

              {/* Use another account toggle */}
              {!showInput ? (
                <button
                  type="button"
                  onClick={() => setShowInput(true)}
                  className="w-full p-3.5 hover:bg-slate-50 text-left transition flex items-center gap-3 text-slate-700 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Use your exact system Gmail
                  </div>
                </button>
              ) : null}
            </div>

            {/* Custom Gmail Form */}
            {showInput && (
              <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fadeIn">
                <div className="text-xs font-bold text-slate-800">
                  Enter your Gmail Address
                </div>
                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. yourname@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Your Name (Optional)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInput(false)}
                    className="py-2 px-3 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-300 transition cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {/* Explanatory note for browser-saved accounts */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full text-left flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>How to auto-fetch system browser Gmails?</span>
              </button>

              {showGuide && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 space-y-1.5 animate-fadeIn">
                  <p className="font-bold">Google OAuth Security Rule:</p>
                  <p>
                    Browsers only reveal your computer&apos;s real saved Gmails when redirected through official Google OAuth.
                  </p>
                  <p>
                    Add your free <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">GOOGLE_CLIENT_ID</code> in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">.env.local</code> from Google Cloud Console.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy notice */}
            <div className="pt-1 text-center text-[10px] text-slate-400">
              <p>Google Identity Services • RoomFinder Local Auth</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        <span>Secured by Google Identity Services</span>
      </div>
    </div>
  );
}
