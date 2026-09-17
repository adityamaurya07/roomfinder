'use client';

import React from 'react';
import { RoomListing } from '@/types/room';
import { MapPin, Phone, MessageCircle, Eye, Wifi, Wind, ShieldCheck, Users } from 'lucide-react';

interface RoomCardProps {
  room: RoomListing;
  onSelect: (room: RoomListing) => void;
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
  const coverImage = room.images && room.images.length > 0 ? room.images[0] : defaultImage;

  // Clean whatsapp number
  const rawWa = room.contact.whatsapp || room.contact.phone;
  const cleanWa = rawWa.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Hello ${room.contact.name}, I am interested in your room listing: "${room.title}" (${room.area}, ${room.city}) listed on RoomFinder for ₹${room.pricePerMonth}/mo. Is it currently vacant?`
  )}`;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer" onClick={() => onSelect(room)}>
        <img
          src={coverImage}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />

        {/* Room Type Tag */}
        <span className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
          {room.roomType}
        </span>

        {/* Suitable for badge */}
        <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{room.suitableFor}</span>
        </span>

        {/* Availability Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
              room.isAvailable
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {room.isAvailable ? '● Vacant / Available' : '● Booked / Occupied'}
          </span>
        </div>

        {/* Multiple Photos Count */}
        {room.images && room.images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            📷 {room.images.length} photos
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Deposit */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{room.pricePerMonth.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/month</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Deposit: ₹{room.securityDeposit.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(room)}
            className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition mb-1"
          >
            {room.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{room.area}, {room.city}</span>
          </div>

          {/* Key Amenities Preview */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {room.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {amenity}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Contact Actions Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Owner details preview */}
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px]">Host</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block max-w-[90px]">
              {room.contact.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Details */}
            <button
              onClick={() => onSelect(room)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="View room details & map"
            >
              Details
            </button>

            {/* Direct WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition shadow-sm"
              title="Chat with owner on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Phone Call */}
            {room.contact.phone && (
              <a
                href={`tel:${room.contact.phone}`}
                className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 hover:bg-teal-600 hover:text-white transition shadow-sm"
                title="Call owner"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
