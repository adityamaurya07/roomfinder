'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RoomListing } from '@/types/room';
import type * as LeafletType from 'leaflet';
import HyperLocalDistanceCalculator from './HyperLocalDistanceCalculator';
import VirtualTourViewer from './VirtualTourViewer';
import {
  X,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Share2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Compass,
  Utensils,
  Cigarette,
  Wine,
  Briefcase,
  Users
} from 'lucide-react';

interface RoomDetailModalProps {
  room: RoomListing | null;
  onClose: () => void;
  onOpenChat?: (room: RoomListing) => void;
}

export default function RoomDetailModal({ room, onClose, onOpenChat }: RoomDetailModalProps) {
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'virtualTour'>('photos');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [prevRoomId, setPrevRoomId] = useState<string | undefined>(room?.id);

  if (room?.id !== prevRoomId) {
    setPrevRoomId(room?.id);
    setActiveImgIndex(0);
    setActiveMediaTab('photos');
  }

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletType.Map | null>(null);

  const hasVirtualTour = Boolean(room?.virtualTour360Url || room?.videoUrl);

  // Leaflet map setup for exact location
  useEffect(() => {
    if (!room || !mapRef.current) return;

    let isMounted = true;
    const loadMap = async () => {
      const L = await import('leaflet');
      if (!isMounted || !mapRef.current) return;

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(mapRef.current).setView([room.coordinates.lat, room.coordinates.lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
      });

      const marker = L.marker([room.coordinates.lat, room.coordinates.lng], { icon: DefaultIcon }).addTo(map);
      marker.bindPopup(`<b>${room.title}</b><br>${room.area}`).openPopup();

      mapInstance.current = map;
    };

    loadMap();

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [room]);

  if (!room) return null;

  const rawWa = room.contact.whatsapp || room.contact.phone;
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Hello ${room.contact.name}, I am interested in your room "${room.title}" (${room.area}, ${room.city}) listed on RoomFinder for ₹${room.pricePerMonth}/mo. Please let me know if a visit is possible!`
  )}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${room.coordinates.lat},${room.coordinates.lng}`;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const images = room.images && room.images.length > 0 ? room.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Top Header / Close Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition backdrop-blur-md"
            title="Copy room link"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition backdrop-blur-md"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {copiedLink && (
          <div className="absolute top-16 right-4 z-20 bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-bounce">
            Link copied to clipboard!
          </div>
        )}

        {/* Media Switcher Tab Header if Virtual Tour is available */}
        {hasVirtualTour && (
          <div className="bg-slate-900 px-4 pt-3 flex gap-2 border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMediaTab('photos')}
              className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeMediaTab === 'photos'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Room Photos ({images.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMediaTab('virtualTour')}
              className={`px-4 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeMediaTab === 'virtualTour'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>✨ Virtual 360° & Video Walkthrough</span>
            </button>
          </div>
        )}

        {/* Media Display Container */}
        {activeMediaTab === 'virtualTour' && hasVirtualTour ? (
          <div className="p-3 bg-slate-950">
            <VirtualTourViewer
              videoUrl={room.videoUrl}
              virtualTour360Url={room.virtualTour360Url}
              roomTitle={room.title}
            />
          </div>
        ) : (
          <div className="relative w-full h-72 sm:h-96 bg-slate-950">
            <img
              src={images[activeImgIndex]}
              alt={room.title}
              className="w-full h-full object-cover"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === activeImgIndex ? 'bg-emerald-400 w-5' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges on Gallery */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                {room.roomType}
              </span>

              {room.isVerified && (
                <span className="bg-emerald-700/95 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{room.verificationBadge || 'ID Verified Host'}</span>
                </span>
              )}

              <span
                className={`text-xs font-bold px-3 py-1 rounded-lg shadow-md ${
                  room.isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {room.isAvailable ? '● Vacant' : '● Booked'}
              </span>

              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                For: {room.suitableFor}
              </span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[calc(85vh-350px)] overflow-y-auto">
          {/* Title & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {room.listerType || 'Owner'} Listing
                </span>
                {room.isVerified && (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Authenticity</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
                {room.title}
              </h2>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-600 dark:text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{room.fullAddress}</span>
              </div>
              {room.landmark && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-5">
                  Landmark: {room.landmark}
                </div>
              )}
            </div>

            {/* Price Box with Negotiation Tag */}
            <div className="sm:text-right shrink-0 bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
              {/* Negotiation Badge */}
              <div className="mb-1.5 sm:flex sm:justify-end">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                    room.pricingType === 'Negotiable'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  <span>{room.pricingType === 'Negotiable' ? '💬 Price is Negotiable' : '🔒 Fixed Price Listing'}</span>
                </span>
              </div>

              <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                ₹{room.pricePerMonth.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / month</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Deposit: <span className="font-semibold">₹{room.securityDeposit.toLocaleString()}</span>
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {room.maintenanceIncluded ? '✓ Society Maintenance Included' : 'Maintenance billed separately'}
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-xs text-slate-400 block">Available From</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {room.availableFrom}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-xs text-slate-400 block">Furnishing</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {room.furnishedStatus}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-xs text-slate-400 block">Preferred Tenant</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {room.suitableFor}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-xs text-slate-400 block">City</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {room.city}
              </span>
            </div>
          </div>

          {/* Description */}
          {room.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                About this Room
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {room.description}
              </p>
            </div>
          )}

          {/* Roommate / Lifestyle Preferences Section */}
          {room.roommatePreferences && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Roommate & Flatmate Lifestyle Preferences</span>
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  Compatibility Matching
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-emerald-600" /> Food Preference
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {room.roommatePreferences.foodPreference}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Cigarette className="w-3 h-3 text-rose-500" /> Smoking Habits
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {room.roommatePreferences.smoking}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Wine className="w-3 h-3 text-purple-500" /> Drinking Habits
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {room.roommatePreferences.drinking}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[10px] text-slate-400 block flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-blue-500" /> Profession Focus
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {room.roommatePreferences.professionPreference.join(', ') || 'Any'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Amenities & Facilities */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amenities & Facilities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {room.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hyper-Local Distance & Nearby Places Calculator */}
          <HyperLocalDistanceCalculator room={room} />

          {/* Exact Location & Interactive Map */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Exact Location on Map
              </h4>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Get Google Maps Directions</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
              <div ref={mapRef} className="w-full h-52 sm:h-64 z-0" />
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>📍 Lat: {room.coordinates.lat.toFixed(5)}, Lng: {room.coordinates.lng.toFixed(5)}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{room.area}</span>
              </div>
            </div>
          </div>

          {/* Host Card & Quick Safe Connect Gateway */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow">
                    {room.contact.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {room.contact.name}
                      {room.isVerified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                      )}
                    </h4>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      {room.isVerified ? `✓ 100% ${room.verificationBadge || 'ID Verified'} (${room.listerType || 'Owner'})` : `${room.listerType || 'Owner'} Lister`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* Safe In-App Direct Chat */}
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => onOpenChat(room)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>In-App Chat (No Spam)</span>
                  </button>
                )}

                {/* WhatsApp */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                {/* Direct Call */}
                {room.contact.phone && (
                  <a
                    href={`tel:${room.contact.phone}`}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold text-sm transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Host</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
