'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2 } from 'lucide-react';

export default function GoogleSuccessPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            account: {
              name: session.user.name || 'Google User',
              email: session.user.email || '',
              avatar: session.user.image || ''
            }
          },
          window.location.origin
        );
      }
      setTimeout(() => {
        window.close();
      }, 500);
    }
  }, [session, status]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Signed In with Google</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to RoomFinder, please wait...</p>
      </div>
    </div>
  );
}
