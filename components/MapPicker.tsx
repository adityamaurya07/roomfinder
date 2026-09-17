'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Coordinates } from '@/types/room';
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
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [coords, setCoords] = useState<Coordinates>(initialCoordinates);
  const [addressInfo, setAddressInfo] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = await import('leaflet');

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
      map.on('click', (e: any) => {
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
  }, []);

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
  }, [selectedCity]);

  // Reverse geocoding helper (OpenStreetMap Nominatim)
  const reverseGeocode = async (lat: number, lng: number) => {
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
  };

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
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const targetCoords = { lat: userLat, lng: userLng };

        setCoords(targetCoords);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 16);
          markerRef.current.setLatLng([userLat, userLng]);
        }
        reverseGeocode(userLat, userLng);
        setIsLocating(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        alert('Could not access current location. Please allow GPS access or pick manually on the map.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Search & GPS tools */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search colony, landmark, or street name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchAddress();
              }
            }}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSearchAddress()}
            disabled={isSearching}
            className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition flex items-center gap-1.5"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleDetectCurrentLocation}
          disabled={isLocating}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>Detect GPS</span>
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner">
        <div
          ref={mapContainerRef}
          className="w-full h-64 sm:h-72 z-0"
          style={{ minHeight: '260px' }}
        />
        <div className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>Click on map or drag pin to set exact room spot</span>
        </div>
      </div>

      {/* Selected Coordinate Details */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs flex items-start gap-2.5">
        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-0.5">
          <p className="font-semibold text-emerald-900 dark:text-emerald-300">
            Selected Pin Coordinates: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
          {addressInfo && (
            <p className="text-emerald-700 dark:text-emerald-400 line-clamp-2">
              Detected: {addressInfo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
