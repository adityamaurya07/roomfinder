'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RoomListing, RoomType, SuitableFor } from '@/types/room';
import Navbar from '@/components/Navbar';
import RoomCard from '@/components/RoomCard';
import RoomDetailModal from '@/components/RoomDetailModal';
import PostRoomModal from '@/components/PostRoomModal';
import MyListingsModal from '@/components/MyListingsModal';
import RoomsMap from '@/components/RoomsMap';
import InAppChatModal from '@/components/InAppChatModal';
import Hero3DCanvas from '@/components/Hero3DCanvas';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  PlusCircle,
  Sparkles,
  Home as HomeIcon,
  RefreshCw,
  X,
  Building,
  DollarSign,
  Users,
  Grid3X3,
  Map as MapIcon,
  ShieldCheck,
  MessageSquare,
  Compass,
  Utensils,
  Cigarette,
  Check
} from 'lucide-react';

const CITIES = ['All', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Noida', 'Gurugram', 'Jaipur'];

const ROOM_TYPES: Array<RoomType | 'All'> = [
  'All',
  'Single Room',
  'Shared Room',
  '1 RK',
  '1 BHK',
  '2 BHK',
  'Flatmate'
];

const SUITABLE_OPTIONS: Array<SuitableFor | 'All'> = [
  'All',
  'Boys',
  'Girls',
  'Family',
  'Working Professionals',
  'Students'
];

const POPULAR_AMENITIES = ['WiFi', 'AC', 'Attached Washroom', 'Food/Tiffin', 'Power Backup', 'Washing Machine', 'Parking'];

export default function RoomFinderApp() {
  const [rooms, setRooms] = useState<RoomListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'explore' | 'map'>('explore');

  // Search & Basic Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSuitable, setSelectedSuitable] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(35000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Next-Gen 6 Core Features Filter States
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [selectedPricingType, setSelectedPricingType] = useState<string>('All');
  const [hasVirtualTour, setHasVirtualTour] = useState<boolean>(false);
  const [roommateFood, setRoommateFood] = useState<string>('All');
  const [roommateSmoking, setRoommateSmoking] = useState<string>('All');
  const [roommateProfession, setRoommateProfession] = useState<string>('all');

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState<RoomListing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState<boolean>(false);
  const [chatRoom, setChatRoom] = useState<RoomListing | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Local owner state
  const [myRoomIds, setMyRoomIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kirayepe_my_rooms');
        if (stored) return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenChat = (room: RoomListing) => {
    setChatRoom(room);
    setIsChatOpen(true);
  };

  // Fetch rooms from backend API
  const fetchRooms = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedType !== 'All') params.append('roomType', selectedType);
      if (selectedSuitable !== 'All') params.append('suitableFor', selectedSuitable);
      if (maxBudget < 35000) params.append('maxPrice', maxBudget.toString());
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));
      if (onlyAvailable) params.append('onlyAvailable', 'true');
      if (verifiedOnly) params.append('verifiedOnly', 'true');
      if (selectedPricingType !== 'All') params.append('pricingType', selectedPricingType);
      if (hasVirtualTour) params.append('hasVirtualTour', 'true');
      if (roommateFood !== 'All') params.append('roommateFood', roommateFood);
      if (roommateSmoking !== 'All') params.append('roommateSmoking', roommateSmoking);
      if (roommateProfession !== 'all') params.append('roommateProfession', roommateProfession);
      params.append('sortBy', sortBy);

      const res = await fetch(`/api/rooms?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    searchQuery,
    selectedCity,
    selectedType,
    selectedSuitable,
    maxBudget,
    selectedAmenities,
    onlyAvailable,
    verifiedOnly,
    selectedPricingType,
    hasVirtualTour,
    roommateFood,
    roommateSmoking,
    roommateProfession,
    sortBy
  ]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setIsLoading(true);
        fetchRooms();
      }
    });
    return () => {
      ignore = true;
    };
  }, [fetchRooms]);

  // Handle Search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedType('All');
    setSelectedSuitable('All');
    setMaxBudget(35000);
    setSelectedAmenities([]);
    setOnlyAvailable(true);
    setSortBy('newest');
    setVerifiedOnly(false);
    setSelectedPricingType('All');
    setHasVirtualTour(false);
    setRoommateFood('All');
    setRoommateSmoking('All');
    setRoommateProfession('all');
  };

  // Handle new room posted by owner
  const handleRoomCreated = (newRoom: RoomListing) => {
    setRooms((prev) => [newRoom, ...prev]);
    setMyRoomIds((prev) => [newRoom.id, ...prev]);
    showToast(`🎉 Room "${newRoom.title}" published with exact map pin!`);
  };

  // Toggle availability status (Vacant / Occupied)
  const handleToggleStatus = async (roomId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, isAvailable: !currentStatus } : r))
        );
        showToast(
          !currentStatus ? 'Marked room as Vacant / Available' : 'Marked room as Occupied / Booked'
        );
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Delete listing
  const handleDeleteRoom = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
        const updatedMyIds = myRoomIds.filter((id) => id !== roomId);
        setMyRoomIds(updatedMyIds);
        localStorage.setItem('kirayepe_my_rooms', JSON.stringify(updatedMyIds));
        showToast('Room listing deleted successfully');
      }
    } catch (err) {
      console.error('Delete room error:', err);
    }
  };

  const myPostedRooms = useMemo(() => {
    return rooms.filter((r) => myRoomIds.includes(r.id));
  }, [rooms, myRoomIds]);

  const activeFilterCount =
    (selectedCity !== 'All' ? 1 : 0) +
    (selectedType !== 'All' ? 1 : 0) +
    (selectedSuitable !== 'All' ? 1 : 0) +
    (maxBudget < 35000 ? 1 : 0) +
    (verifiedOnly ? 1 : 0) +
    (selectedPricingType !== 'All' ? 1 : 0) +
    (hasVirtualTour ? 1 : 0) +
    (roommateFood !== 'All' ? 1 : 0) +
    (roommateSmoking !== 'All' ? 1 : 0) +
    (roommateProfession !== 'all' ? 1 : 0) +
    selectedAmenities.length;

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenMyListings={() => setIsMyListingsOpen(true)}
        myListingsCount={myPostedRooms.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Hero Search Section */}
      <div className="relative bg-gradient-to-b from-emerald-950/70 via-teal-950/50 to-slate-950/60 text-white pt-10 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-emerald-900/30">
        {/* Three.js 3D Interactive Graphics Canvas */}
        <Hero3DCanvas />

        {/* Glow decorative orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ID Verified Hosts • Hyper-Local Maps • 360° Tours • Safe Direct Chat</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Find Your Room with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Hyper-Local Precision
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Check exact distance to your metro, gym & office, inspect rooms in 360° virtual tours, and chat directly with verified owners without broker spam.
          </p>

          {/* Unified Search Box */}
          <div className="pt-2 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 text-slate-900 dark:text-white"
            >
              {/* City selector */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-800 w-full sm:w-44">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold focus:outline-none cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">
                      {c === 'All' ? 'All Cities' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keyword / Area Search input */}
              <div className="flex items-center gap-2 px-3 py-2 flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search colony, metro, tech park (e.g. Saket, Koramangala, Viman Nagar)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400"
                />
              </div>

              {/* Submit search button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md transition shrink-0"
              >
                Search Rooms
              </button>
            </form>
          </div>

          {/* Quick Smart Filter Pills Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            {/* Verified Badge Filter Pill */}
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md border ${
                verifiedOnly
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>🛡️ ID Verified Only</span>
              {verifiedOnly && <Check className="w-3 h-3" />}
            </button>

            {/* Negotiable Price Filter Pill */}
            <button
              type="button"
              onClick={() => setSelectedPricingType(selectedPricingType === 'Negotiable' ? 'All' : 'Negotiable')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md border ${
                selectedPricingType === 'Negotiable'
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <span>💬 Negotiable Price Only</span>
              {selectedPricingType === 'Negotiable' && <Check className="w-3 h-3" />}
            </button>

            {/* 360 Virtual Tour Filter Pill */}
            <button
              type="button"
              onClick={() => setHasVirtualTour(!hasVirtualTour)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md border ${
                hasVirtualTour
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>✨ 360° / Video Tour</span>
              {hasVirtualTour && <Check className="w-3 h-3" />}
            </button>

            {/* Flatmates / Roommates */}
            <button
              type="button"
              onClick={() => setSelectedType(selectedType === 'Flatmate' ? 'All' : 'Flatmate')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md border ${
                selectedType === 'Flatmate'
                  ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👥 Roommate / Flatmate Wanted</span>
              {selectedType === 'Flatmate' && <Check className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Controls Bar: View Toggle, Filters, and Sort */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Quick Room Type Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {ROOM_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedType === type
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Right Action buttons: Filter drawer, Sort, and Map/List switcher */}
          <div className="flex items-center gap-2.5 self-end md:self-center">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                activeFilterCount > 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Smart Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-emerald-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'price_asc' | 'price_desc')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* View Mode Toggle (Grid vs Map) */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'explore'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'map'
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400 hover:text-white'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <MapIcon className="w-3.5 h-3.5 text-emerald-300" />
                <span>Map ({rooms.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Smart Filter Drawer */}
        {showFilterDrawer && (
          <div className="bg-slate-900/85 backdrop-blur-xl p-5 rounded-2xl border border-slate-700/60 shadow-2xl mb-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters & Roommate Compatibility</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Row 1: Tenant Preference, Budget, and Negotiation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant Preference
                </label>
                <select
                  value={selectedSuitable}
                  onChange={(e) => setSelectedSuitable(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {SUITABLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All' ? 'All Tenants' : opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Budget: ₹{maxBudget.toLocaleString()} / month
                </label>
                <input
                  type="range"
                  min={3000}
                  max={35000}
                  step={500}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Price Negotiation Policy
                </label>
                <select
                  value={selectedPricingType}
                  onChange={(e) => setSelectedPricingType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="All">All Pricing Types</option>
                  <option value="Negotiable">💬 Negotiable Only</option>
                  <option value="Fixed Price">🔒 Fixed Price Only</option>
                </select>
              </div>
            </div>

            {/* Row 2: Roommate Lifestyle Matchers */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Roommate Matching Filters (Habits & Profession)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Food Preference
                  </label>
                  <select
                    value={roommateFood}
                    onChange={(e) => setRoommateFood(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All">All Food Habits</option>
                    <option value="Veg">Vegetarian Roommates Only</option>
                    <option value="Non-Veg">Non-Veg Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Smoking Habits
                  </label>
                  <select
                    value={roommateSmoking}
                    onChange={(e) => setRoommateSmoking(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="All">Any Smoking Policy</option>
                    <option value="Non-Smoker">Strictly Non-Smokers</option>
                    <option value="Smoker">Smoker Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tenant Profession Focus
                  </label>
                  <select
                    value={roommateProfession}
                    onChange={(e) => setRoommateProfession(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Professions</option>
                    <option value="it">IT / Software Engineers</option>
                    <option value="student">Students & Interns</option>
                    <option value="finance">Finance / Corporate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 3: Toggles for Verified, Vacant, Virtual Tour */}
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Listings & Owners Only</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={hasVirtualTour}
                  onChange={(e) => setHasVirtualTour(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Has 360° Panorama or Video Tour</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Only show Vacant / Available rooms</span>
              </label>
            </div>

            {/* Popular Amenities Filter */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Required Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_AMENITIES.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                        } else {
                          setSelectedAmenities([...selectedAmenities, amenity]);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{selectedCity !== 'All' ? `Available Rooms in ${selectedCity}` : 'Available Rooms'}</span>
              {verifiedOnly && (
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                  🛡️ Verified Only
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Showing {rooms.length} {rooms.length === 1 ? 'room listing' : 'room listings'} • Direct owner & flatmate connections
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Prominent Map View Callout Button */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'explore' ? 'map' : 'explore')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>{activeTab === 'explore' ? `🗺️ View ${rooms.length} Pins on Live Map` : '📋 Show Room Grid'}</span>
            </button>

            {/* Quick Post Room Button */}
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/50 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post Room</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">
              Finding best available rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8">
            <HomeIcon className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-white mb-1">
              No rooms found matching your criteria
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
              Try broadening your filters, turning off &quot;Verified Only&quot; or budget constraints to see all rooms.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : activeTab === 'explore' ? (
          /* Room Cards Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onSelect={(selected) => setSelectedRoom(selected)}
                onOpenChat={handleOpenChat}
                onViewOnMap={(selected) => {
                  setSelectedRoom(selected);
                  setActiveTab('map');
                }}
              />
            ))}
          </div>
        ) : (
          /* Live Interactive Map View */
          <div className="h-[650px] w-full">
            <RoomsMap
              rooms={rooms}
              onSelectRoom={(selected) => setSelectedRoom(selected)}
              selectedRoomId={selectedRoom?.id}
            />
          </div>
        )}
      </main>

      {/* Floating Bottom Live Map Toggle Button (Accessible on Mobile & Desktop) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'explore' ? 'map' : 'explore')}
          className="group px-5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-900/60 border border-emerald-500/50 backdrop-blur-xl flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {activeTab === 'explore' ? (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <MapIcon className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>🗺️ Show Map ({rooms.length})</span>
            </>
          ) : (
            <>
              <Grid3X3 className="w-4 h-4 text-teal-400" />
              <span>📋 Show Listings</span>
            </>
          )}
        </button>
      </div>

      {/* Floating Mobile Post Button */}
      <div className="fixed bottom-6 right-4 sm:hidden z-30">
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl font-bold text-xs flex items-center justify-center border border-emerald-400/50"
          title="Post Room"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <HomeIcon className="w-4 h-4 text-emerald-600" />
            <span>RoomFinder • Hyper-Local Direct Room Rental Platform</span>
          </div>
          <p>© 2026 RoomFinder. Direct Owner to Room Seeker with Verified Badges & 360° Virtual Tours.</p>
        </div>
      </footer>

      {/* Modals */}
      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onOpenChat={handleOpenChat}
      />

      <PostRoomModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      <MyListingsModal
        isOpen={isMyListingsOpen}
        onClose={() => setIsMyListingsOpen(false)}
        rooms={myPostedRooms}
        onToggleStatus={handleToggleStatus}
        onDeleteRoom={handleDeleteRoom}
        onSelectRoom={(r) => setSelectedRoom(r)}
        onOpenPostModal={() => setIsPostModalOpen(true)}
      />

      {/* In-App Direct Chat Gateway Modal */}
      <InAppChatModal
        room={chatRoom}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
