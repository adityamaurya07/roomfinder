'use client';

import React, { useState } from 'react';
import { RoomListing } from '@/types/room';
import {
  Train,
  ShoppingBag,
  Dumbbell,
  GraduationCap,
  MapPin,
  Navigation,
  ExternalLink,
  Clock,
  Car,
  Footprints
} from 'lucide-react';

interface HyperLocalDistanceCalculatorProps {
  room: RoomListing;
}

// Preset popular destinations across Indian metro hubs
const POPULAR_DESTINATIONS: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  Delhi: [
    { name: 'Connaught Place (CP)', lat: 28.6315, lng: 77.2167 },
    { name: 'Cyber City (Gurugram)', lat: 28.4905, lng: 77.0898 },
    { name: 'Delhi University (North Campus)', lat: 28.6900, lng: 77.2100 },
    { name: 'Noida Sector 62 / Electronic City', lat: 28.6280, lng: 77.3650 },
    { name: 'Saket Select Citywalk', lat: 28.5284, lng: 77.2193 }
  ],
  Bengaluru: [
    { name: 'Manyata Tech Park', lat: 13.0487, lng: 77.6200 },
    { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602 },
    { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408 },
    { name: 'Embassy GolfLinks (EGL)', lat: 12.9482, lng: 77.6496 },
    { name: 'Whitefield ITPL', lat: 12.9854, lng: 77.7314 }
  ],
  Pune: [
    { name: 'Hinjawadi IT Park (Phase 1)', lat: 18.5913, lng: 73.7389 },
    { name: 'Magarpatta Cybercity', lat: 18.5147, lng: 73.9317 },
    { name: 'Symbiosis International University', lat: 18.5670, lng: 73.9140 },
    { name: 'FC Road / Deccan', lat: 18.5204, lng: 73.8415 }
  ],
  default: [
    { name: 'Central Railway Station', lat: 28.6429, lng: 77.2195 },
    { name: 'City Tech Park / Business District', lat: 28.5500, lng: 77.2500 },
    { name: 'Main Metro Junction', lat: 28.6139, lng: 77.2090 }
  ]
};

// Calculate distance in km using Haversine formula
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export default function HyperLocalDistanceCalculator({ room }: HyperLocalDistanceCalculatorProps) {
  const cityPresets = POPULAR_DESTINATIONS[room.city] || POPULAR_DESTINATIONS.default;

  const [destinationName, setDestinationName] = useState<string>(cityPresets[0]?.name || 'City Tech Park');
  const [targetCoords, setTargetCoords] = useState<{ lat: number; lng: number }>(
    cityPresets[0] ? { lat: cityPresets[0].lat, lng: cityPresets[0].lng } : { lat: room.coordinates.lat + 0.03, lng: room.coordinates.lng + 0.03 }
  );

  // Compute distance
  const customDistance = calculateHaversineDistance(
    room.coordinates.lat,
    room.coordinates.lng,
    targetCoords.lat,
    targetCoords.lng
  );

  // Commute estimates
  const walkingMins = Math.round(customDistance * 12);
  const bikeMins = Math.max(4, Math.round(customDistance * 3.5));
  const carMins = Math.max(7, Math.round(customDistance * 4.5));

  const nearby = room.nearbyPlaces || {
    metro: { name: 'Nearest Metro / Bus Terminal', distanceKm: 0.8 },
    grocery: { name: 'Supermarket / Grocery Mart', distanceKm: 0.3 },
    gym: { name: 'Fitness Gym & Yoga Centre', distanceKm: 0.5 },
    collegeOrOffice: { name: 'Local Commercial / College Hub', distanceKm: 1.4 }
  };

  const handleSelectPreset = (dest: { name: string; lat: number; lng: number }) => {
    setDestinationName(dest.name);
    setTargetCoords({ lat: dest.lat, lng: dest.lng });
  };

  const mapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${room.coordinates.lat},${room.coordinates.lng}&destination=${encodeURIComponent(
    destinationName + ', ' + room.city
  )}`;

  return (
    <div className="space-y-4">
      {/* Amenities Distance Matrix */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
          <Navigation className="w-4 h-4 text-emerald-600" />
          <span>Hyper-Local Proximity & Nearby Spots</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Metro Station */}
          {nearby.metro && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Metro / Transit</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {nearby.metro.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {nearby.metro.distanceKm} km away
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Footprints className="w-3 h-3" />
                  ~{Math.round(nearby.metro.distanceKm * 12)} min walk
                </span>
              </div>
            </div>
          )}

          {/* Grocery */}
          {nearby.grocery && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Daily Grocery</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {nearby.grocery.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {nearby.grocery.distanceKm} km away
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Footprints className="w-3 h-3" />
                  ~{Math.round(nearby.grocery.distanceKm * 12)} min walk
                </span>
              </div>
            </div>
          )}

          {/* Gym / Fitness */}
          {nearby.gym && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">Gym & Fitness</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {nearby.gym.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {nearby.gym.distanceKm} km away
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Footprints className="w-3 h-3" />
                  ~{Math.round(nearby.gym.distanceKm * 12)} min walk
                </span>
              </div>
            </div>
          )}

          {/* College / Office */}
          {nearby.collegeOrOffice && (
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">College / IT Hub</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {nearby.collegeOrOffice.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {nearby.collegeOrOffice.distanceKm} km away
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Car className="w-3 h-3" />
                  ~{Math.round(nearby.collegeOrOffice.distanceKm * 4)} min drive
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Seeker Commute Calculator */}
      <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/50 dark:from-slate-800/90 dark:via-slate-900/80 dark:to-emerald-950/30">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Calculate Commute: Distance to Your Office or College
            </h5>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
            Live Route Estimator
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
          Select or enter your work/college destination to see exact distance and travel time from this room:
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {cityPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                destinationName === preset.name
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
          <input
            type="text"
            placeholder="Or type any office/college landmark..."
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <a
            href={mapsRouteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Estimated Commute Summary Pills */}
        <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Distance:</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
              {customDistance} km
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Car className="w-3.5 h-3.5 text-blue-500" />
              <span>~{carMins} mins (Cab/Car)</span>
            </span>

            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>~{bikeMins} mins (Bike/Metro)</span>
            </span>

            {customDistance <= 2.5 && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Footprints className="w-3.5 h-3.5 text-amber-500" />
                <span>~{walkingMins} mins (Walk)</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
