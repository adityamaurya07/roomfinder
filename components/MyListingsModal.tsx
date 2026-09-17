'use client';

import React, { useState } from 'react';
import { RoomListing } from '@/types/room';
import { X, Trash2, CheckCircle2, XCircle, MapPin, Eye, AlertCircle, Plus } from 'lucide-react';

interface MyListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: RoomListing[];
  onToggleStatus: (roomId: string, currentStatus: boolean) => void;
  onDeleteRoom: (roomId: string) => void;
  onSelectRoom: (room: RoomListing) => void;
  onOpenPostModal: () => void;
}

export default function MyListingsModal({
  isOpen,
  onClose,
  rooms,
  onToggleStatus,
  onDeleteRoom,
  onSelectRoom,
  onOpenPostModal
}: MyListingsModalProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              My Posted Rooms (Owner Dashboard)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your room availability status or remove listings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {rooms.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
                🏠
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                You haven&apos;t posted any rooms yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Got a vacant room or flat? Post it in 2 minutes with exact map location and pictures to get inquiries directly on WhatsApp.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenPostModal();
                }}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Post Your First Room</span>
              </button>
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Room Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={room.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'}
                    alt={room.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {room.roomType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          room.isAvailable
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {room.isAvailable ? 'Vacant / Available' : 'Occupied / Booked'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {room.title}
                    </h4>

                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{room.area}, {room.city}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">
                        ₹{room.pricePerMonth.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Toggle availability */}
                  <button
                    onClick={() => onToggleStatus(room.id, room.isAvailable)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                      room.isAvailable
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                    }`}
                  >
                    {room.isAvailable ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mark Occupied</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Vacant</span>
                      </>
                    )}
                  </button>

                  {/* View Details */}
                  <button
                    onClick={() => {
                      onClose();
                      onSelectRoom(room);
                    }}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    title="View preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  {confirmDeleteId === room.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onDeleteRoom(room.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(room.id)}
                      className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 transition"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
