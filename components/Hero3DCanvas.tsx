'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x022c22, 0.015); // match deep emerald hero background

    // 2. Camera Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 360;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 3, 0);

    // 3. Renderer Setup with WebGL
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x064e3b, 1.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x34d399, 2.5);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 3, 50);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0x6ee7b7, 2, 40);
    purpleLight.position.set(-10, 10, -5);
    scene.add(purpleLight);

    // 5. City Grid & Architectural Buildings
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingMaterials = [
      new THREE.MeshStandardMaterial({
        color: 0x064e3b,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false
      }),
      new THREE.MeshStandardMaterial({
        color: 0x047857,
        roughness: 0.3,
        metalness: 0.7
      }),
      new THREE.MeshStandardMaterial({
        color: 0x0f766e,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85
      })
    ];

    const windowMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.75
    });

    const buildingCount = 28;
    const geometriesToDispose: THREE.BufferGeometry[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const bWidth = 1.4 + Math.random() * 1.6;
      const bDepth = 1.4 + Math.random() * 1.6;
      const bHeight = 2.5 + Math.random() * 7;

      const geom = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      geometriesToDispose.push(geom);

      const mat = buildingMaterials[i % buildingMaterials.length];
      const building = new THREE.Mesh(geom, mat);

      // Arrange around a stylized circular city block
      const angle = (i / buildingCount) * Math.PI * 2;
      const radius = 6.5 + (i % 3) * 4.2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.5;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.5;

      building.position.set(x, bHeight / 2, z);
      cityGroup.add(building);

      // Add Glowing Roof / Window Elements
      const roofGeom = new THREE.BoxGeometry(bWidth * 0.9, 0.2, bDepth * 0.9);
      geometriesToDispose.push(roofGeom);
      const roof = new THREE.Mesh(roofGeom, windowMaterial);
      roof.position.set(x, bHeight + 0.1, z);
      cityGroup.add(roof);
    }

    // 6. Floating GPS Location Pins (Key Room Markers)
    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);

    const pinPoints = [
      { x: -5, y: 7, z: 2 },
      { x: 4, y: 8, z: -3 },
      { x: -1, y: 9, z: -6 },
      { x: 6, y: 6.5, z: 4 }
    ];

    const pinMeshes: THREE.Group[] = [];

    const materialsToDispose: THREE.Material[] = [...buildingMaterials, windowMaterial];

    pinPoints.forEach((pt) => {
      const pinSubGroup = new THREE.Group();

      // Pin head sphere
      const sphereGeom = new THREE.SphereGeometry(0.55, 16, 16);
      geometriesToDispose.push(sphereGeom);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      materialsToDispose.push(sphereMat);
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.y = 0.8;
      pinSubGroup.add(sphere);

      // Pin cone pointer
      const coneGeom = new THREE.ConeGeometry(0.5, 1.2, 16);
      geometriesToDispose.push(coneGeom);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x34d399,
        metalness: 0.5,
        roughness: 0.3
      });
      materialsToDispose.push(coneMat);
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.rotation.x = Math.PI;
      cone.position.y = 0.2;
      pinSubGroup.add(cone);

      // Ground pulsing ripple ring
      const ringGeom = new THREE.RingGeometry(0.4, 0.9, 32);
      geometriesToDispose.push(ringGeom);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      materialsToDispose.push(ringMat);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.4;
      pinSubGroup.add(ring);

      pinSubGroup.position.set(pt.x, pt.y, pt.z);
      pinsGroup.add(pinSubGroup);
      pinMeshes.push(pinSubGroup);
    });

    // 7. Ambient City Particle Grid
    const particleCount = 180;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      particlePositions[p] = (Math.random() - 0.5) * 45;
      particlePositions[p + 1] = Math.random() * 20;
      particlePositions[p + 2] = (Math.random() - 0.5) * 45;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometriesToDispose.push(particleGeom);

    const particleMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.2,
      transparent: true,
      opacity: 0.6
    });
    materialsToDispose.push(particleMat);

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // 8. Ground Glowing Grid
    const gridHelper = new THREE.GridHelper(50, 25, 0x059669, 0x047857);
    gridHelper.position.y = -0.1;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.35;
    materialsToDispose.push(gridMat);
    scene.add(gridHelper);

    // 9. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 15;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 8;
      mouseY = normY * 4;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow majestic rotation of city scene
      cityGroup.rotation.y = elapsedTime * 0.04;
      pinsGroup.rotation.y = elapsedTime * 0.04;
      gridHelper.rotation.y = elapsedTime * 0.01;

      // Floating pins bounce with sine wave
      pinMeshes.forEach((pin, idx) => {
        pin.position.y = pinPoints[idx].y + Math.sin(elapsedTime * 2.5 + idx) * 0.35;
      });

      // Camera smooth damping towards mouse position
      targetCameraX = mouseX;
      targetCameraY = 15 + mouseY;
      camera.position.x += (targetCameraX - camera.position.x) * 0.03;
      camera.position.y += (targetCameraY - camera.position.y) * 0.03;
      camera.lookAt(0, 3, 0);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-65 z-0"
      aria-hidden="true"
    />
  );
}
