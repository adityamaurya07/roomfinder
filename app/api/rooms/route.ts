import { NextRequest, NextResponse } from 'next/server';
import { getAllRooms, createRoom } from '@/lib/rooms-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.toLowerCase().trim();
    const city = searchParams.get('city');
    const roomType = searchParams.get('roomType');
    const suitableFor = searchParams.get('suitableFor');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean);
    const onlyAvailable = searchParams.get('onlyAvailable') === 'true';
    const sortBy = searchParams.get('sortBy') || 'newest';

    let rooms = getAllRooms();

    // Filter by availability
    if (onlyAvailable) {
      rooms = rooms.filter((r) => r.isAvailable);
    }

    // Filter by city
    if (city && city !== 'All') {
      rooms = rooms.filter((r) => r.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by room type
    if (roomType && roomType !== 'All') {
      rooms = rooms.filter((r) => r.roomType.toLowerCase() === roomType.toLowerCase());
    }

    // Filter by suitable for
    if (suitableFor && suitableFor !== 'All') {
      rooms = rooms.filter((r) => r.suitableFor.toLowerCase() === suitableFor.toLowerCase());
    }

    // Filter by price range
    if (minPrice !== null && !isNaN(minPrice)) {
      rooms = rooms.filter((r) => r.pricePerMonth >= minPrice);
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      rooms = rooms.filter((r) => r.pricePerMonth <= maxPrice);
    }

    // Filter by amenities
    if (amenities && amenities.length > 0) {
      rooms = rooms.filter((r) =>
        amenities.every((amenity) =>
          r.amenities.some((a) => a.toLowerCase() === amenity.toLowerCase())
        )
      );
    }

    // Filter by search query (title, description, area, city, landmark)
    if (q) {
      rooms = rooms.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.area.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          (r.landmark && r.landmark.toLowerCase().includes(q))
      );
    }

    // Sort rooms
    if (sortBy === 'price_asc') {
      rooms.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
    } else if (sortBy === 'price_desc') {
      rooms.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
    } else {
      // Newest first
      rooms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    console.error('API /rooms GET error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validations
    if (!body.title || !body.pricePerMonth || !body.city || !body.area) {
      return NextResponse.json(
        { success: false, message: 'Please fill all required fields: Title, Rent, City, and Area' },
        { status: 400 }
      );
    }

    if (!body.contact?.phone && !body.contact?.whatsapp) {
      return NextResponse.json(
        { success: false, message: 'Please provide at least one contact phone or WhatsApp number' },
        { status: 400 }
      );
    }

    // Coordinates fallback if not provided
    const coordinates = body.coordinates || {
      lat: 28.6139,
      lng: 77.2090
    };

    const newRoom = createRoom({
      title: body.title.trim(),
      description: body.description?.trim() || '',
      roomType: body.roomType || 'Single Room',
      suitableFor: body.suitableFor || 'All',
      pricePerMonth: Number(body.pricePerMonth),
      securityDeposit: Number(body.securityDeposit || body.pricePerMonth),
      maintenanceIncluded: Boolean(body.maintenanceIncluded),
      availableFrom: body.availableFrom?.trim() || 'Immediately',
      isAvailable: true,
      city: body.city.trim(),
      area: body.area.trim(),
      fullAddress: body.fullAddress?.trim() || `${body.area}, ${body.city}`,
      landmark: body.landmark?.trim() || '',
      coordinates: {
        lat: Number(coordinates.lat) || 28.6139,
        lng: Number(coordinates.lng) || 77.2090
      },
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      furnishedStatus: body.furnishedStatus || 'Semi-Furnished',
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images
        : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'],
      contact: {
        name: body.contact.name?.trim() || 'Owner',
        phone: body.contact.phone?.trim() || '',
        whatsapp: body.contact.whatsapp?.trim() || body.contact.phone?.trim() || '',
        email: body.contact.email?.trim() || ''
      },
      ownerId: body.ownerId || 'default-owner'
    });

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (error) {
    console.error('API /rooms POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create room listing' }, { status: 500 });
  }
}
