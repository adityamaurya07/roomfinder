import { NextResponse } from 'next/server';

export async function GET() {
  const isGoogleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes('your-client-id')
  );

  return NextResponse.json({
    isGoogleConfigured,
    hasClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
    hasClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET)
  });
}
