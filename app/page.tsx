'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RoomListing, RoomType, SuitableFor } from '@/types/room';
import Navbar from '@/components/Navbar';
import RoomCard from '@/components/RoomCard';
import RoomDetailModal from '@/components/RoomDetailModal';
import PostRoomModal from '@/components/PostRoomModal';
import MyListingsModal from '@/components/MyListingsModal';
import RoomsMap from '@/components/RoomsMap';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  PlusCircle,
  Sparkles,
  Home as HomeIcon,
  Check,
  RefreshCw,
  X,
  Building,
  DollarSign,
  Users,
  Grid3X3,
  Map as MapIcon,
  ShieldCheck,
  MessageSquare
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedSuitable, setSelectedSuitable] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<number>(35000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);

  // Modals state
  const [selectedRoom, setSelectedRoom] = useState<RoomListing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState<boolean>(false);

  // Local owner state
  const [myRoomIds, setMyRoomIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Load My Listings IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('kirayepe_my_rooms');
      if (stored) {
        setMyRoomIds(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch rooms from backend API
  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCity !== 'All') params.append('city', selectedCity);
      if (selectedType !== 'All') params.append('roomType', selectedType);
      if (selectedSuitable !== 'All') params.append('suitableFor', selectedSuitable);
      if (maxBudget < 35000) params.append('maxPrice', maxBudget.toString());
      if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));
      if (onlyAvailable) params.append('onlyAvailable', 'true');
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
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedCity, selectedType, selectedSuitable, maxBudget, selectedAmenities, onlyAvailable, sortBy]);

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
    selectedAmenities.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
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
      <div className="relative bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow decorative orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero Brokerage • Exact GPS Pin • Direct WhatsApp Contact</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Find Your Next Room or{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Post Vacant Rooms
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            View exact room locations on the interactive map, or list your vacant room with photos and exact GPS pin in 2 minutes.
          </p>

          {/* Unified Search Box */}
          <div className="pt-4 max-w-3xl mx-auto">
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
                  placeholder="Search colony, area (e.g. Saket, Koramangala, Viman Nagar)..."
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

          {/* Quick Stats or Highlights */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Direct Owner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Exact GPS Coordinates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Instant WhatsApp Chat</span>
            </div>
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
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-emerald-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {/* View Mode Toggle (Grid vs Map) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => setActiveTab('explore')}
                className={`p-1.5 rounded-lg transition ${
                  activeTab === 'explore'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`p-1.5 rounded-lg transition ${
                  activeTab === 'map'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filter Drawer */}
        {showFilterDrawer && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg mb-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Refine Search Results</span>
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Suitable For */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tenant Preference
                </label>
                <select
                  value={selectedSuitable}
                  onChange={(e) => setSelectedSuitable(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {SUITABLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === 'All' ? 'All Tenants' : opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Max Budget Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Max Monthly Rent
                  </label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{maxBudget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={3000}
                  max={35000}
                  step={500}
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Only Available toggle */}
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Only show Vacant rooms</span>
                </label>
              </div>
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {selectedCity !== 'All' ? `Available Rooms in ${selectedCity}` : 'Available Rooms'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {rooms.length} {rooms.length === 1 ? 'room listing' : 'room listings'} with verified owners
            </p>
          </div>

          {/* Quick Post Room Button */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Have a room to rent? Post it</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Finding best available rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No rooms match your filters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Try broadening your search criteria or resetting filters to see all vacant listings.
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

      {/* Floating Mobile Post Button */}
      <div className="fixed bottom-5 right-5 sm:hidden z-30">
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full shadow-2xl font-bold text-xs flex items-center gap-2 border-2 border-white"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Room</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <HomeIcon className="w-4 h-4 text-emerald-600" />
            <span>RoomFinder • Direct Room Rental Platform</span>
          </div>
          <p>© 2026 RoomFinder. Direct Owner to Room Seeker with Exact Map Pinning.</p>
        </div>
      </footer>

      {/* Modals */}
      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
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
    </div>
  );
}
