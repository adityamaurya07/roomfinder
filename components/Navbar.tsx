'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  PlusCircle,
  KeyRound,
  MapPin,
  Map as MapIcon,
  Grid3X3,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenPostModal: () => void;
  onOpenMyListings: () => void;
  myListingsCount: number;
  activeTab: 'explore' | 'map';
  setActiveTab: (tab: 'explore' | 'map') => void;
}

export default function Navbar({
  onOpenPostModal,
  onOpenMyListings,
  myListingsCount,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo & Direct Owner Pill */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => setActiveTab('explore')}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              RoomFinder
            </span>
            <span className="hidden md:inline-block ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
              Direct Owner
            </span>
          </div>
        </div>

        {/* Center: Prominent Map & Explore View Switcher (Visible on Mobile & Desktop) */}
        <div className="flex items-center bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>Listings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`relative px-2.5 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/40'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <MapIcon className="w-3.5 h-3.5 text-emerald-300" />
            <span>Live Map</span>
          </button>
        </div>

        {/* Right Actions: Post Room, My Listings, & Auth (Login / Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* My Listings Button */}
          <button
            type="button"
            onClick={onOpenMyListings}
            className="hidden sm:flex relative px-3 py-2 text-xs font-semibold rounded-xl text-slate-200 hover:bg-slate-800/80 transition items-center gap-1.5 border border-slate-700/80"
            title="Rooms you have posted"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>My Listings</span>
            {myListingsCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                {myListingsCount}
              </span>
            )}
          </button>

          {/* Post Room Button */}
          <button
            type="button"
            onClick={onOpenPostModal}
            className="px-2.5 sm:px-3.5 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Post Room</span>
            <span className="xs:hidden">Post</span>
          </button>

          {/* Authentication Section: Login Button OR User Profile Dropdown */}
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500/50"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-bold text-white max-w-[90px] truncate">
                  {user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden py-2 text-slate-200 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>{user?.name}</span>
                      {user?.isVerified && (
                        <span title="Verified User">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 truncate">{user?.phone}</div>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 border border-emerald-500/30 text-emerald-300 uppercase">
                      {user?.role === 'owner' ? '🛡️ Property Owner' : '👤 Room Seeker'}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenMyListings();
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-left hover:bg-slate-800/80 flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                      <span>My Posted Rooms</span>
                      {myListingsCount > 0 && (
                        <span className="ml-auto text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                          {myListingsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenPostModal();
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-left hover:bg-slate-800/80 flex items-center gap-2 text-slate-300 hover:text-white"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-teal-400" />
                      <span>Post a New Vacant Room</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-xs font-semibold text-left hover:bg-rose-950/30 text-rose-400 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
