'use client';

import React, { useState } from 'react';
import { RoomListing, RoomType, SuitableFor, Coordinates } from '@/types/room';
import MapPicker from './MapPicker';
import {
  X,
  Upload,
  Plus,
  Trash2,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  DollarSign
} from 'lucide-react';

interface PostRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (newRoom: RoomListing) => void;
}

const COMMON_AMENITIES = [
  'WiFi',
  'AC',
  'Attached Washroom',
  'RO Water',
  'Power Backup',
  'Food/Tiffin',
  'Washing Machine',
  'Balcony',
  'Geyser',
  'Cupboard',
  'Parking',
  'Furnished'
];

const SAMPLE_PRESETS = [
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'
];

export default function PostRoomModal({ isOpen, onClose, onRoomCreated }: PostRoomModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form State
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [roomType, setRoomType] = useState<RoomType>('1 BHK');
  const [suitableFor, setSuitableFor] = useState<SuitableFor>('All');
  const [pricePerMonth, setPricePerMonth] = useState<string>('');
  const [securityDeposit, setSecurityDeposit] = useState<string>('');
  const [maintenanceIncluded, setMaintenanceIncluded] = useState<boolean>(true);
  const [availableFrom, setAvailableFrom] = useState<string>('Immediately');

  // Location State
  const [city, setCity] = useState<string>('Delhi');
  const [area, setArea] = useState<string>('');
  const [fullAddress, setFullAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: 28.6139, lng: 77.2090 });

  // Features & Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi',
    'Attached Washroom'
  ]);
  const [furnishedStatus, setFurnishedStatus] = useState<
    'Unfurnished' | 'Semi-Furnished' | 'Fully-Furnished'
  >('Semi-Furnished');

  // Images
  const [imageUrls, setImageUrls] = useState<string[]>([SAMPLE_PRESETS[0]]);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Contact
  const [contactName, setContactName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  if (!isOpen) return null;

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.urls) {
        setImageUrls((prev) => [...prev, ...data.urls]);
      } else {
        // Fallback: convert file to Base64 data URL directly
        const newUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              setImageUrls((prev) => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(files[i]);
        }
      }
    } catch (err) {
      console.warn('File upload fallback triggered:', err);
      // Fallback: Read as data url
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setImageUrls((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(files[i]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (customImageUrl.trim()) {
      setImageUrls((prev) => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a room title');
      return;
    }
    if (!pricePerMonth || isNaN(Number(pricePerMonth))) {
      setErrorMsg('Please enter valid monthly rent');
      return;
    }
    if (!area.trim()) {
      setErrorMsg('Please specify the area/locality');
      return;
    }
    if (!contactName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (!phone.trim() && !whatsapp.trim()) {
      setErrorMsg('Please provide a contact phone or WhatsApp number');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get or create owner identifier
      let ownerId = 'owner-default';
      if (typeof window !== 'undefined') {
        ownerId = localStorage.getItem('kirayepe_owner_id') || `owner-${Date.now()}`;
        localStorage.setItem('kirayepe_owner_id', ownerId);
      }

      const payload = {
        title,
        description,
        roomType,
        suitableFor,
        pricePerMonth: Number(pricePerMonth),
        securityDeposit: Number(securityDeposit || pricePerMonth),
        maintenanceIncluded,
        availableFrom,
        city,
        area,
        fullAddress: fullAddress || `${area}, ${city}`,
        landmark,
        coordinates,
        amenities: selectedAmenities,
        furnishedStatus,
        images: imageUrls.length > 0 ? imageUrls : [SAMPLE_PRESETS[0]],
        contact: {
          name: contactName,
          phone: phone || whatsapp,
          whatsapp: whatsapp || phone,
          email
        },
        ownerId
      };

      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.room) {
        // Save to local listings for management
        if (typeof window !== 'undefined') {
          const myRooms = JSON.parse(localStorage.getItem('kirayepe_my_rooms') || '[]');
          myRooms.unshift(data.room.id);
          localStorage.setItem('kirayepe_my_rooms', JSON.stringify(myRooms));
        }

        onRoomCreated(data.room);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to post room. Please try again.');
      }
    } catch (err) {
      console.error('Post room error:', err);
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Post Vacant Room (Yha Khali H)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                List your room with exact location & photos for potential renters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              step === 1
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            1. Room Details
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              step === 2
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            2. Exact Location (Map Pin)
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 transition ${
              step === 3
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            3. Photos & Contact
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-180px)] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Room Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spacious 1 BHK near Metro Station with Balcony"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomType)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Single Room">Single Private Room</option>
                    <option value="Shared Room">Shared Room / PG</option>
                    <option value="1 RK">1 RK Studio</option>
                    <option value="1 BHK">1 BHK Flat</option>
                    <option value="2 BHK">2 BHK Flat</option>
                    <option value="Flatmate">Flatmate Wanted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Suitable For
                  </label>
                  <select
                    value={suitableFor}
                    onChange={(e) => setSuitableFor(e.target.value as SuitableFor)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">Anyone (Boys, Girls, Family)</option>
                    <option value="Boys">Boys Only</option>
                    <option value="Girls">Girls Only</option>
                    <option value="Family">Family Only</option>
                    <option value="Working Professionals">Working Professionals</option>
                    <option value="Students">Students</option>
                  </select>
                </div>
              </div>

              {/* Price & Deposit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="8500"
                      value={pricePerMonth}
                      onChange={(e) => setPricePerMonth(e.target.value)}
                      className="w-full pl-7 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Security Deposit (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="10000"
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      className="w-full pl-7 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Available From
                  </label>
                  <input
                    type="text"
                    placeholder="Immediately / 1st Nov"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Maintenance & Furnishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Furnishing Status
                  </label>
                  <select
                    value={furnishedStatus}
                    onChange={(e) => setFurnishedStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Fully-Furnished">Fully-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={maintenanceIncluded}
                      onChange={(e) => setMaintenanceIncluded(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Maintenance included in rent</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / House Rules
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe room features, sunlight, ventilation, distance to metro/market, visitor policy..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Amenities & Facilities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_AMENITIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 transition border ${
                        selectedAmenities.includes(item)
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          selectedAmenities.includes(item)
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {selectedAmenities.includes(item) && <Check className="w-3 h-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Next: Pin Exact Location →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Map Picker */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Noida">Noida</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Area / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saket, Block J or Koramangala 4th Block"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Complete Address
                  </label>
                  <input
                    type="text"
                    placeholder="House/Plot #, Street name"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Famous Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Behind Metro Gate 2, Opp. Sony Signal"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Exact Location Interactive Map Picker */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Exact Map Pin (Drag to pin precise house location)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    GPS: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                  </span>
                </div>

                <MapPicker
                  initialCoordinates={coordinates}
                  selectedCity={city}
                  onLocationSelect={(newCoords, addressHint) => {
                    setCoordinates(newCoords);
                    if (addressHint && !fullAddress) {
                      setFullAddress(addressHint);
                    }
                  }}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition"
                >
                  Next: Photos & Contact →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Photos & Host Contact */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Room Photos * (Upload your room photos)
                </label>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center hover:border-emerald-500 transition bg-slate-50/50 dark:bg-slate-800/30">
                  <input
                    type="file"
                    id="room-photos-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="room-photos-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        Click to upload photos from device
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  </label>
                </div>

                {/* Or enter Image URL */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Or paste direct image URL (https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails preview */}
                {imageUrls.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      Selected Photos ({imageUrls.length}):
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {imageUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group"
                        >
                          <img src={url} alt="Room" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Host / Owner Contact Information */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Host / Owner Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Calling Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Same as WhatsApp or alternate"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="owner@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  ← Back to Map
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Posting Room...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Room Listing Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
