'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass,
  Sparkles
} from 'lucide-react';

interface Three360ViewerProps {
  imageUrl: string;
  roomTitle: string;
}

export default function Three360Viewer({ imageUrl, roomTitle }: Three360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(75); // camera FOV (lower is more zoomed in)

  // Camera & Interaction refs
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const autoRotateRef = useRef<boolean>(true);

  // Interaction coordinates (yaw = lon, pitch = lat)
  const isInteractingRef = useRef<boolean>(false);
  const onPointerDownPointerXRef = useRef<number>(0);
  const onPointerDownPointerYRef = useRef<number>(0);
  const onPointerDownLonRef = useRef<number>(0);
  const onPointerDownLatRef = useRef<number>(0);
  const lonRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const targetLonRef = useRef<number>(0);
  const targetLatRef = useRef<number>(0);

  // Keep auto-rotate ref synchronized
  useEffect(() => {
    autoRotateRef.current = isAutoRotating;
  }, [isAutoRotating]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let animationFrameId: number;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup inside sphere
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100);
    cameraRef.current = camera;

    // 3. Inverted Sphere geometry for 360 panorama
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert faces so texture is on inside

    // 4. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    let material: THREE.MeshBasicMaterial | null = null;
    let sphereMesh: THREE.Mesh | null = null;
    let texture: THREE.Texture | null = null;

    // 5. Texture loading
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (tex) => {
        texture = tex;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        material = new THREE.MeshBasicMaterial({ map: texture });
        sphereMesh = new THREE.Mesh(geometry, material);
        scene.add(sphereMesh);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.warn('Three360Viewer: Texture load failed, using fallback gradient canvas', err);
        // Fallback procedural room texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const grad = ctx.createLinearGradient(0, 0, 0, 512);
          grad.addColorStop(0, '#022c22');
          grad.addColorStop(0.5, '#064e3b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 512);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText(`360° Panorama - ${roomTitle}`, 50, 250);
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        material = new THREE.MeshBasicMaterial({ map: fallbackTex });
        sphereMesh = new THREE.Mesh(geometry, material);
        scene.add(sphereMesh);
        setIsLoading(false);
        setHasError(true);
      }
    );

    // 6. Interaction handlers
    const onPointerDown = (event: PointerEvent) => {
      if (event.isPrimary === false) return;
      isInteractingRef.current = true;
      onPointerDownPointerXRef.current = event.clientX;
      onPointerDownPointerYRef.current = event.clientY;
      onPointerDownLonRef.current = lonRef.current;
      onPointerDownLatRef.current = latRef.current;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!isInteractingRef.current) return;
      const factor = 0.15;
      targetLonRef.current = (onPointerDownPointerXRef.current - event.clientX) * factor + onPointerDownLonRef.current;
      targetLatRef.current = (event.clientY - onPointerDownPointerYRef.current) * factor + onPointerDownLatRef.current;
    };

    const onPointerUp = () => {
      isInteractingRef.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const newFov = Math.max(35, Math.min(95, camera.fov + event.deltaY * 0.05));
      camera.fov = newFov;
      camera.updateProjectionMatrix();
      setZoomLevel(Math.round(newFov));
    };

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);

    // 7. Animation Loop with smooth inertia damping
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation when user is not dragging
      if (autoRotateRef.current && !isInteractingRef.current) {
        targetLonRef.current += 0.08;
      }

      // Smooth damping
      lonRef.current += (targetLonRef.current - lonRef.current) * 0.1;
      latRef.current += (targetLatRef.current - latRef.current) * 0.1;

      // Clamp pitch to avoid gimbal flipping
      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      targetLatRef.current = Math.max(-85, Math.min(85, targetLatRef.current));

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);

      geometry.dispose();
      if (material) material.dispose();
      if (texture) texture.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [imageUrl, roomTitle]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -12 : 12;
    const newFov = Math.max(35, Math.min(95, cameraRef.current.fov + delta));
    cameraRef.current.fov = newFov;
    cameraRef.current.updateProjectionMatrix();
    setZoomLevel(Math.round(newFov));
  }, []);

  const handleResetView = useCallback(() => {
    targetLonRef.current = 0;
    targetLatRef.current = 0;
    lonRef.current = 0;
    latRef.current = 0;
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
      setZoomLevel(75);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-950 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-80 sm:h-96'
      }`}
    >
      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        title="Click and drag to rotate, scroll to zoom"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 text-white">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-emerald-400">Loading 360° Three.js Panorama...</span>
        </div>
      )}

      {/* Helper Info Badge */}
      <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 text-xs text-white shadow-lg pointer-events-none">
        <Compass
          className="w-4 h-4 text-emerald-400 animate-spin"
          style={{ animationDuration: '10s' }}
        />
        <span>Three.js 360° Sphere • Drag to inspect</span>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1.5 rounded-xl border border-white/15 text-white shadow-2xl z-10">
        <button
          type="button"
          onClick={() => handleZoom('in')}
          className="p-1.5 hover:bg-white/20 rounded-lg transition"
          title="Zoom In (or scroll wheel)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleZoom('out')}
          className="p-1.5 hover:bg-white/20 rounded-lg transition"
          title="Zoom Out (or scroll wheel)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 rounded-lg transition ${
            isAutoRotating ? 'bg-emerald-600 text-white' : 'hover:bg-white/20 text-slate-300'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetView}
          className="p-1.5 hover:bg-white/20 text-slate-300 rounded-lg transition"
          title="Reset Camera View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-white/20 text-slate-300 rounded-lg transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Left indicator */}
      <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 border border-white/10 pointer-events-none">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>FOV: {zoomLevel}°</span>
      </div>
    </div>
  );
}
