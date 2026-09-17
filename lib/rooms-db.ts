import fs from 'fs';
import path from 'path';
import { RoomListing } from '@/types/room';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'rooms.json');

const INITIAL_ROOMS: RoomListing[] = [
  {
    id: 'room-1',
    title: 'Spacious 1 BHK with Balcony near Metro Station',
    description: 'Beautiful ventilated 1 BHK room on 3rd floor. Very close to metro station and market. 24x7 water and power backup available. Ideal for working professionals or couples.',
    roomType: '1 BHK',
    suitableFor: 'Working Professionals',
    pricePerMonth: 14500,
    securityDeposit: 20000,
    maintenanceIncluded: true,
    availableFrom: 'Immediately',
    isAvailable: true,
    city: 'Delhi',
    area: 'Saket, South Delhi',
    fullAddress: 'H-14, Block J, Near Saket Metro Station Gate 2, New Delhi',
    landmark: 'Behind DLF Avenue Mall',
    coordinates: { lat: 28.5245, lng: 77.2066 },
    amenities: ['WiFi', 'AC', 'Attached Washroom', 'Power Backup', 'Balcony', 'RO Water', 'Geyser', 'Cupboard'],
    furnishedStatus: 'Semi-Furnished',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    contact: {
      name: 'Rajesh Sharma',
      phone: '+91 98765 43210',
      whatsapp: '919876543210',
      email: 'rajesh.sharma@example.com'
    },
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'room-2',
    title: 'Single Private Room in Fully Furnished 3BHK Flat',
    description: 'Private single room with attached bathroom in a luxury gated society. High-speed 300 Mbps WiFi, daily maid service, washing machine, and equipped kitchen.',
    roomType: 'Single Room',
    suitableFor: 'Boys',
    pricePerMonth: 9500,
    securityDeposit: 9500,
    maintenanceIncluded: true,
    availableFrom: '1st of Next Month',
    isAvailable: true,
    city: 'Bengaluru',
    area: 'Koramangala 4th Block',
    fullAddress: 'Flat 302, Green Glen Residency, 80 Feet Road, Koramangala, Bengaluru',
    landmark: 'Opposite Sony Signal',
    coordinates: { lat: 12.9352, lng: 77.6245 },
    amenities: ['WiFi', 'AC', 'Attached Washroom', 'Washing Machine', 'Food/Tiffin', 'Parking', 'Power Backup', 'Furnished'],
    furnishedStatus: 'Fully-Furnished',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    contact: {
      name: 'Amit Patel',
      phone: '+91 91234 56789',
      whatsapp: '919123456789',
      email: 'amit.patel@example.com'
    },
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'room-3',
    title: 'Cozy 1 RK Studio Room for Girls / Working Women',
    description: 'Safe and peaceful 1 RK unit with dedicated kitchen corner, attached bath, and separate entry. CCTV secured building with female warden/supervisor on ground floor.',
    roomType: '1 RK',
    suitableFor: 'Girls',
    pricePerMonth: 7500,
    securityDeposit: 10000,
    maintenanceIncluded: false,
    availableFrom: 'Immediately',
    isAvailable: true,
    city: 'Pune',
    area: 'Viman Nagar',
    fullAddress: 'Plot 45, Lane 2, Clover Park, Viman Nagar, Pune',
    landmark: 'Near Symbiosis Campus',
    coordinates: { lat: 18.5679, lng: 73.9143 },
    amenities: ['WiFi', 'RO Water', 'Attached Washroom', 'Cupboard', 'Geyser', 'Parking'],
    furnishedStatus: 'Semi-Furnished',
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    contact: {
      name: 'Sunita Deshmukh',
      phone: '+91 99887 76655',
      whatsapp: '919988776655',
      email: 'sunita.d@example.com'
    },
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'room-4',
    title: 'Shared 2-Bed Room in PG with 3 Times Meals',
    description: 'Twin sharing room with comfortable box beds, mattresses, individual study tables, and wardrobes. North Indian hygienic breakfast, lunch, and dinner included in rent.',
    roomType: 'Shared Room',
    suitableFor: 'Students',
    pricePerMonth: 6000,
    securityDeposit: 6000,
    maintenanceIncluded: true,
    availableFrom: 'Immediately',
    isAvailable: true,
    city: 'Noida',
    area: 'Sector 62',
    fullAddress: 'B-Block 22, Sector 62, Near Electronic City Metro, Noida',
    landmark: 'Behind JSS College',
    coordinates: { lat: 28.6279, lng: 77.3653 },
    amenities: ['WiFi', 'Food/Tiffin', 'RO Water', 'Washing Machine', 'Power Backup', 'AC'],
    furnishedStatus: 'Fully-Furnished',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    contact: {
      name: 'Vikram Singh',
      phone: '+91 98111 22334',
      whatsapp: '919811122334',
      email: 'vikram.pg@example.com'
    },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'room-5',
    title: 'Independent 2 BHK Flat with Modular Kitchen',
    description: 'Prime location 2 BHK flat with wooden flooring in master bedroom, modular kitchen with chimney, 2 attached western washrooms, and reserved stilt car parking.',
    roomType: '2 BHK',
    suitableFor: 'Family',
    pricePerMonth: 22000,
    securityDeposit: 30000,
    maintenanceIncluded: false,
    availableFrom: '15th of This Month',
    isAvailable: true,
    city: 'Hyderabad',
    area: 'Gachibowli',
    fullAddress: 'Flat 501, Sunshine Heights, Telecom Nagar, Gachibowli, Hyderabad',
    landmark: 'Near Bio-Diversity Park',
    coordinates: { lat: 17.4401, lng: 78.3489 },
    amenities: ['AC', 'Attached Washroom', 'Parking', 'Balcony', 'Power Backup', 'RO Water', 'Geyser'],
    furnishedStatus: 'Semi-Furnished',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'
    ],
    contact: {
      name: 'Kavitha Reddy',
      phone: '+91 97000 11223',
      whatsapp: '919700011223',
      email: 'kavitha.reddy@example.com'
    },
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_ROOMS, null, 2), 'utf-8');
  }
}

export function getAllRooms(): RoomListing[] {
  ensureDataFile();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const rooms = JSON.parse(content) as RoomListing[];
    return rooms;
  } catch (err) {
    console.error('Error reading rooms file:', err);
    return INITIAL_ROOMS;
  }
}

export function getRoomById(id: string): RoomListing | null {
  const rooms = getAllRooms();
  return rooms.find((r) => r.id === id) || null;
}

export function saveRooms(rooms: RoomListing[]): void {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
}

export function createRoom(roomData: Omit<RoomListing, 'id' | 'createdAt' | 'updatedAt'>): RoomListing {
  const rooms = getAllRooms();
  const newRoom: RoomListing = {
    ...roomData,
    id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  rooms.unshift(newRoom);
  saveRooms(rooms);
  return newRoom;
}

export function updateRoom(id: string, updates: Partial<RoomListing>): RoomListing | null {
  const rooms = getAllRooms();
  const index = rooms.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedRoom = {
    ...rooms[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  rooms[index] = updatedRoom;
  saveRooms(rooms);
  return updatedRoom;
}

export function deleteRoom(id: string): boolean {
  const rooms = getAllRooms();
  const filtered = rooms.filter((r) => r.id !== id);
  if (filtered.length === rooms.length) return false;
  saveRooms(filtered);
  return true;
}
