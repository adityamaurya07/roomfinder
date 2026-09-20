'use client';

import React from 'react';
import { Home, PlusCircle, Building2, KeyRound } from 'lucide-react';

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
  setActiveTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              RoomFinder
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Direct Owner
            </span>
          </div>
        </div>

        {/* Center View Buttons */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-medium">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'explore'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Explore Rooms
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'map'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🗺️ Live Map View
          </button>
        </div>

        {/* Actions: My Listings & Post Room */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMyListings}
            className="relative px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            title="Rooms you have posted"
          >
            <KeyRound className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">My Listings</span>
            {myListingsCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                {myListingsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenPostModal}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Room <span className="hidden md:inline font-normal opacity-90">(List Vacant)</span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
