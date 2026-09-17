import { NextRequest, NextResponse } from 'next/server';
import { getRoomById, updateRoom, deleteRoom } from '@/lib/rooms-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = getRoomById(id);
    if (!room) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error('API /rooms/[id] GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = updateRoom(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, room: updated });
  } catch (error) {
    console.error('API /rooms/[id] PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteRoom(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('API /rooms/[id] DELETE error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete room' }, { status: 500 });
  }
}
