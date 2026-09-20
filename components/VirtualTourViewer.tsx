'use client';

import React, { useState, useRef } from 'react';
import {
  Video,
  Compass,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import Three360Viewer from './Three360Viewer';

interface VirtualTourViewerProps {
  videoUrl?: string;
  virtualTour360Url?: string;
  roomTitle: string;
}

export default function VirtualTourViewer({
  videoUrl,
  virtualTour360Url,
  roomTitle
}: VirtualTourViewerProps) {
  const has360 = Boolean(virtualTour360Url);
  const hasVideo = Boolean(videoUrl);

  const [activeTab, setActiveTab] = useState<'360' | 'video'>(has360 ? '360' : 'video');

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!has360 && !hasVideo) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white overflow-hidden shadow-xl">
      {/* Header Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Three.js Digital Inspection
          </span>
        </div>

        {/* Tab switchers if both available */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
          {has360 && (
            <button
              type="button"
              onClick={() => setActiveTab('360')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === '360'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Three.js 360° Panorama</span>
            </button>
          )}

          {hasVideo && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Walkthrough</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Viewport: Three.js 3D WebGL Sphere */}
      {activeTab === '360' && virtualTour360Url && (
        <Three360Viewer imageUrl={virtualTour360Url} roomTitle={roomTitle} />
      )}

      {/* Video Walkthrough */}
      {activeTab === 'video' && videoUrl && (
        <div className="relative w-full h-80 sm:h-96 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted={isMuted}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-cover sm:object-contain"
          />

          {/* Video Control Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

          <button
            type="button"
            onClick={togglePlay}
            className="absolute z-10 w-14 h-14 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg transition transform hover:scale-110"
            title={isPlaying ? 'Pause Walkthrough' : 'Play Walkthrough'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition backdrop-blur-md"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="absolute bottom-3 left-3 z-10 text-xs text-white/90 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl">
            🎥 Direct Room Walkthrough • {roomTitle}
          </div>
        </div>
      )}
    </div>
  );
}
