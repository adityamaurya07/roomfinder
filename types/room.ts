export interface Coordinates {
  lat: number;
  lng: number;
}

export type RoomType = 'Single Room' | 'Shared Room' | '1 RK' | '1 BHK' | '2 BHK' | 'Flatmate';

export type SuitableFor = 'All' | 'Boys' | 'Girls' | 'Family' | 'Working Professionals' | 'Students';

export interface RoomContact {
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
}

export interface RoomListing {
  id: string;
  title: string;
  description: string;
  roomType: RoomType;
  suitableFor: SuitableFor;
  pricePerMonth: number;
  securityDeposit: number;
  maintenanceIncluded: boolean;
  availableFrom: string;
  isAvailable: boolean; // true = vacant/available, false = occupied/booked
  
  // Location
  city: string;
  area: string;
  fullAddress: string;
  landmark?: string;
  coordinates: Coordinates;

  // Features
  amenities: string[]; // e.g. ['WiFi', 'AC', 'Attached Washroom', 'Food/Tiffin', 'Power Backup', 'RO Water', 'Parking', 'Washing Machine', 'Balcony', 'Geyser', 'Cupboard', 'Furnished']
  furnishedStatus: 'Unfurnished' | 'Semi-Furnished' | 'Fully-Furnished';
  
  // Media
  images: string[];
  videoUrl?: string;
  virtualTour360Url?: string;

  // Verification & Lister Type
  isVerified?: boolean;
  verificationBadge?: 'Govt ID Verified' | 'Aadhaar Verified' | 'Owner Verified' | 'Broker Verified';
  listerType?: 'Owner' | 'Broker' | 'Flatmate';

  // Pricing Negotiation
  pricingType?: 'Negotiable' | 'Fixed Price';

  // Hyper-Local Nearby Amenities
  nearbyPlaces?: {
    metro?: { name: string; distanceKm: number };
    grocery?: { name: string; distanceKm: number };
    gym?: { name: string; distanceKm: number };
    collegeOrOffice?: { name: string; distanceKm: number };
  };

  // Roommate / Flatmate Lifestyle Preferences
  roommatePreferences?: {
    foodPreference: 'Veg' | 'Non-Veg' | 'Any';
    smoking: 'Non-Smoker' | 'Smoker' | 'No Preference';
    drinking: 'Non-Drinker' | 'Social' | 'No Preference';
    professionPreference: string[];
    genderPreference: 'Boys' | 'Girls' | 'Any';
  };

  // Owner / Contact
  contact: RoomContact;
  ownerId?: string; // used for local management (saved in localStorage)

  createdAt: string;
  updatedAt: string;
}

export interface RoomFilterState {
  searchQuery: string;
  city: string;
  roomType: string;
  suitableFor: string;
  minPrice: number;
  maxPrice: number;
  amenities: string[];
  onlyAvailable: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  pricingType?: 'All' | 'Negotiable' | 'Fixed Price';
  verifiedOnly?: boolean;
  roommateFood?: 'All' | 'Veg' | 'Non-Veg';
  roommateSmoking?: 'All' | 'Non-Smoker' | 'Smoker';
  roommateProfession?: string;
  hasVirtualTour?: boolean;
}
