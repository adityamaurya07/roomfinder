'use client';

import React, { useEffect, useRef } from 'react';
import { RoomListing } from '@/types/room';

interface RoomsMapProps {
  rooms: RoomListing[];
  onSelectRoom: (room: RoomListing) => void;
  selectedRoomId?: string;
}

export default function RoomsMap({ rooms, onSelectRoom, selectedRoomId }: RoomsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');

      if (mapInstanceRef.current) return;

      // Default center: India or first room
      const firstRoom = rooms[0];
      const defaultCenter: [number, number] = firstRoom
        ? [firstRoom.coordinates.lat, firstRoom.coordinates.lng]
        : [28.6139, 77.2090];

      const map = L.map(mapContainerRef.current).setView(defaultCenter, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = markersGroup;

      renderMarkers(L);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Re-render markers when rooms or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    import('leaflet').then((L) => {
      renderMarkers(L);
    });
  }, [rooms, selectedRoomId]);

  const renderMarkers = (L: any) => {
    if (!markersGroupRef.current || !mapInstanceRef.current) return;

    markersGroupRef.current.clearLayers();

    if (rooms.length === 0) return;

    rooms.forEach((room) => {
      const isSelected = room.id === selectedRoomId;
      const isAvailable = room.isAvailable;

      // Custom HTML badge marker with rent price
      const customHtml = `
        <div style="
          background-color: ${isAvailable ? (isSelected ? '#059669' : '#0f766e') : '#64748b'};
          color: white;
          padding: 4px 8px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
          white-space: nowrap;
          cursor: pointer;
          transform: scale(${isSelected ? 1.15 : 1});
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          <span>₹${room.pricePerMonth.toLocaleString()}</span>
          ${!isAvailable ? '<span style="font-size:9px; background:rgba(0,0,0,0.3); padding:1px 4px; border-radius:4px;">Booked</span>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-room-marker',
        html: customHtml,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });

      const marker = L.marker([room.coordinates.lat, room.coordinates.lng], {
        icon: customIcon
      });

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans';
      popupContent.style.width = '220px';
      popupContent.innerHTML = `
        <div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; position: relative;">
          <img src="${room.images[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'}" style="width: 100%; height: 100%; object-fit: cover;" />
          <span style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.75); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">
            ${room.roomType}
          </span>
        </div>
        <h4 style="font-weight: 700; font-size: 13px; line-height: 1.2; margin: 0 0 4px 0; color: #0f172a;">${room.title}</h4>
        <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">📍 ${room.area}, ${room.city}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <span style="font-weight: 800; font-size: 14px; color: #0f766e;">₹${room.pricePerMonth.toLocaleString()}<span style="font-size: 10px; font-weight: 400; color: #64748b;">/mo</span></span>
          <button id="view-room-${room.id}" style="background: #0f766e; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
            View
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-room-${room.id}`);
        if (btn) {
          btn.onclick = () => onSelectRoom(room);
        }
      });

      marker.on('click', () => {
        onSelectRoom(room);
      });

      markersGroupRef.current.addLayer(marker);
    });

    // Auto-fit bounds
    try {
      const bounds = markersGroupRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />
      <div className="absolute top-3 right-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700">
        📍 {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} pinned on map
      </div>
    </div>
  );
}
