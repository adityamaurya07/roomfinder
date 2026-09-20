'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Coordinates } from '@/types/room';
import type * as LeafletType from 'leaflet';
import { MapPin, Navigation, Check, AlertCircle, Loader2 } from 'lucide-react';

interface MapPickerProps {
  initialCoordinates?: Coordinates;
  onLocationSelect: (coords: Coordinates, addressHint?: string) => void;
  selectedCity?: string;
}

export default function MapPicker({
  initialCoordinates = { lat: 28.6139, lng: 77.2090 }, // Default Delhi
  onLocationSelect,
  selectedCity
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markerRef = useRef<LeafletType.Marker | null>(null);

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates);
  const [addressInfo, setAddressInfo] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Reverse geocoding helper (OpenStreetMap Nominatim)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const display = data.display_name || '';
        setAddressInfo(display);
        onLocationSelect({ lat, lng }, display);
      } else {
        onLocationSelect({ lat, lng });
      }
    } catch {
      onLocationSelect({ lat, lng });
    }
  }, [onLocationSelect]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');
      if (!isMounted) return;

      // Check if map already initialized
      if (mapInstanceRef.current) return;

      // Fix Leaflet's default icon path issues in React/Webpack
      const DefaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;

      const map = L.map(mapContainerRef.current).setView(
        [initialCoordinates.lat, initialCoordinates.lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Add draggable marker
      const marker = L.marker([initialCoordinates.lat, initialCoordinates.lng], {
        draggable: true
      }).addTo(map);

      marker.bindPopup('<b>Room Location</b><br>Drag to fine-tune').openPopup();

      // Handle marker drag
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        const newCoords = { lat: position.lat, lng: position.lng };
        setCoords(newCoords);
        reverseGeocode(position.lat, position.lng);
      });

      // Handle map click to reposition marker
      map.on('click', (e: LeafletType.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialCoordinates.lat, initialCoordinates.lng, reverseGeocode]);

  // Update center when city changes
  useEffect(() => {
    if (!selectedCity || !mapInstanceRef.current) return;

    const cityCoordinates: Record<string, Coordinates> = {
      Delhi: { lat: 28.6139, lng: 77.2090 },
      Mumbai: { lat: 19.0760, lng: 72.8777 },
      Bengaluru: { lat: 12.9716, lng: 77.5946 },
      Pune: { lat: 18.5204, lng: 73.8567 },
      Hyderabad: { lat: 17.3850, lng: 78.4867 },
      Noida: { lat: 28.5355, lng: 77.3910 },
      Gurugram: { lat: 28.4595, lng: 77.0266 },
      Jaipur: { lat: 26.9124, lng: 75.7873 },
      Kolkata: { lat: 22.5726, lng: 88.3639 },
      Chennai: { lat: 13.0827, lng: 80.2707 },
    };

    const target = cityCoordinates[selectedCity];
    if (target && mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([target.lat, target.lng], 13);
      markerRef.current.setLatLng([target.lat, target.lng]);
      setCoords(target);
      onLocationSelect(target);
    }
  }, [selectedCity, onLocationSelect]);

  // Search Address / Area
  const handleSearchAddress = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const targetLat = parseFloat(data[0].lat);
        const targetLng = parseFloat(data[0].lon);
        const targetCoords = { lat: targetLat, lng: targetLng };

        setCoords(targetCoords);
        setAddressInfo(data[0].display_name);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([targetLat, targetLng], 15);
          markerRef.current.setLatLng([targetLat, targetLng]);
        }
        onLocationSelect(targetCoords, data[0].display_name);
      }
    } catch (err) {
      console.error('Search address error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Detect My Location
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCoords(currentCoords);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 16);
          markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        }

        reverseGeocode(currentCoords.lat, currentCoords.lng);
        setIsLocating(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setIsLocating(false);
        alert('Could not access your location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search and Current Location bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search colony, metro station, landmark (e.g. Laxmi Nagar Delhi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress(e)}
            className="w-full pl-9 pr-24 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="button"
            onClick={() => handleSearchAddress()}
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
          >
            {isSearching ? 'Searching...' : 'Find'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isLocating}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-slate-700 whitespace-nowrap"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-emerald-600" />
              <span>Use My Current GPS</span>
            </>
          )}
        </button>
      </div>

      {/* Map Element */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-72 sm:h-80 z-0" />
        
        {/* Helper overlay tag */}
        <div className="absolute top-3 left-3 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 shadow border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click anywhere or drag marker to set exact location</span>
        </div>
      </div>

      {/* Selected Coordinates & Address Info Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex-1">
          <span className="font-bold text-slate-700 dark:text-slate-300 block">
            📍 Selected Pin Location:
          </span>
          <span className="text-slate-500 dark:text-slate-400 line-clamp-1">
            {addressInfo || 'Fine-tune location marker on map above'}
          </span>
        </div>
        <div className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-semibold text-emerald-600 shrink-0">
          Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  );
}
