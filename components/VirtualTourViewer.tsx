'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Compass,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';

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

  // 360 Viewer State (Mouse / Touch Pan Simulation)
  const [posX, setPosX] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Auto rotation effect for 360 panorama
  useEffect(() => {
    if (!isAutoRotating || activeTab !== '360') return;
    const interval = setInterval(() => {
      setPosX((prev) => (prev + 0.3) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, activeTab]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsAutoRotating(false);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = (e.clientX - startX) * 0.15;
    setPosX((prev) => (prev - diff + 100) % 100);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsAutoRotating(false);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const diff = (e.touches[0].clientX - startX) * 0.2;
    setPosX((prev) => (prev - diff + 100) % 100);
    setStartX(e.touches[0].clientX);
  };

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
            Virtual Digital Inspection
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
              <span>360° Panorama View</span>
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

      {/* Main Viewport */}
      {activeTab === '360' && virtualTour360Url && (
        <div className="relative w-full h-80 sm:h-96 overflow-hidden bg-slate-950 select-none">
          {/* Panoramic Image container with continuous horizontal drag */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform ease-out"
            style={{
              backgroundImage: `url(${virtualTour360Url})`,
              backgroundRepeat: 'repeat-x',
              backgroundPosition: `${posX}% 50%`,
              backgroundSize: `${220 * zoom}% auto`
            }}
          />

          {/* Overlay controls */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Click & Drag to explore 360°</span>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.0))}
              className="p-1.5 hover:bg-white/20 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 hover:bg-white/20 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`p-1.5 rounded-lg transition ${
                isAutoRotating ? 'bg-emerald-600 text-white' : 'hover:bg-white/20'
              }`}
              title="Toggle Auto Rotation"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
