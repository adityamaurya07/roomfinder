'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function GlobalThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    let animationFrameId: number;

    // 1. Scene & Camera setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.008); // slate-950 deep atmosphere fog

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 45);

    // 2. Transparent WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0); // fully transparent background
    container.appendChild(renderer.domElement);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // 3. Floating 3D Geometric "Room" Wireframes (Cubes, Octahedrons, Icosahedrons)
    const shapeGroup = new THREE.Group();
    scene.add(shapeGroup);

    const shapeGeometries = [
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.OctahedronGeometry(2.5),
      new THREE.IcosahedronGeometry(2.2),
      new THREE.BoxGeometry(4, 2, 2.5) // room proportions
    ];
    shapeGeometries.forEach((g) => geometriesToDispose.push(g));

    const wireframeMaterials = [
      new THREE.MeshBasicMaterial({
        color: 0x10b981, // emerald-500
        wireframe: true,
        transparent: true,
        opacity: 0.22
      }),
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4, // cyan-500
        wireframe: true,
        transparent: true,
        opacity: 0.18
      }),
      new THREE.MeshBasicMaterial({
        color: 0x34d399, // emerald-400
        wireframe: true,
        transparent: true,
        opacity: 0.28
      })
    ];
    wireframeMaterials.forEach((m) => materialsToDispose.push(m));

    const floatingShapes: Array<{
      mesh: THREE.Mesh;
      rotX: number;
      rotY: number;
      rotZ: number;
      initialY: number;
      driftSpeed: number;
    }> = [];

    const shapeCount = 22;
    for (let i = 0; i < shapeCount; i++) {
      const geom = shapeGeometries[i % shapeGeometries.length];
      const mat = wireframeMaterials[i % wireframeMaterials.length];
      const mesh = new THREE.Mesh(geom, mat);

      const x = (Math.random() - 0.5) * 80;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50 - 10;

      mesh.position.set(x, y, z);
      const scale = 0.6 + Math.random() * 0.9;
      mesh.scale.set(scale, scale, scale);

      shapeGroup.add(mesh);
      floatingShapes.push({
        mesh,
        rotX: (Math.random() - 0.5) * 0.015,
        rotY: (Math.random() - 0.5) * 0.015,
        rotZ: (Math.random() - 0.5) * 0.01,
        initialY: y,
        driftSpeed: 0.5 + Math.random() * 0.8
      });
    }

    // 4. Connected Network Constellation (City Spatial Graph)
    const nodeCount = 55;
    const nodePositions: THREE.Vector3[] = [];
    const maxDistance = 18;

    for (let i = 0; i < nodeCount; i++) {
      nodePositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 90,
          (Math.random() - 0.5) * 110,
          (Math.random() - 0.5) * 45
        )
      );
    }

    // Node Points
    const nodeGeom = new THREE.BufferGeometry().setFromPoints(nodePositions);
    geometriesToDispose.push(nodeGeom);

    const nodeMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 1.2,
      transparent: true,
      opacity: 0.65
    });
    materialsToDispose.push(nodeMat);

    const nodePoints = new THREE.Points(nodeGeom, nodeMat);
    scene.add(nodePoints);

    // Connecting Lines
    const linePositions: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxDistance) {
          linePositions.push(
            nodePositions[i].x,
            nodePositions[i].y,
            nodePositions[i].z,
            nodePositions[j].x,
            nodePositions[j].y,
            nodePositions[j].z
          );
        }
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geometriesToDispose.push(lineGeom);

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.15
    });
    materialsToDispose.push(lineMat);

    const lineSegments = new THREE.LineSegments(lineGeom, lineMat);
    scene.add(lineSegments);

    // 5. Ambient Stardust Field (300 particles)
    const starCount = 350;
    const starGeom = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);

    for (let s = 0; s < starCount * 3; s += 3) {
      starCoords[s] = (Math.random() - 0.5) * 120;
      starCoords[s + 1] = (Math.random() - 0.5) * 140;
      starCoords[s + 2] = (Math.random() - 0.5) * 70;
    }

    starGeom.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    geometriesToDispose.push(starGeom);

    const starMat = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.8,
      transparent: true,
      opacity: 0.45
    });
    materialsToDispose.push(starMat);

    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);

    // 6. Interactive Parallax & Scroll Listeners
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let scrollY = 0;
    let targetScrollOffset = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseX = normX * 6;
      mouseY = normY * 4;
    };

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
      // Map scroll progress to vertical 3D movement
      targetScrollOffset = -(scrollY * 0.035);
    };

    const handleResize = () => {
      if (!container) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Initialize initial scroll position
    handleScroll();

    // 7. Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotate and float geometric room shapes
      floatingShapes.forEach((item) => {
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
        item.mesh.rotation.z += item.rotZ;
        item.mesh.position.y = item.initialY + Math.sin(elapsedTime * item.driftSpeed) * 1.5;
      });

      // Slow majestic rotation of the constellation and star field
      shapeGroup.rotation.y = elapsedTime * 0.02;
      lineSegments.rotation.y = elapsedTime * 0.015;
      nodePoints.rotation.y = elapsedTime * 0.015;
      starField.rotation.y = -elapsedTime * 0.008;

      // Smooth camera interpolation based on scroll and mouse position
      targetCameraX = mouseX;
      targetCameraY = mouseY + targetScrollOffset;

      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, targetScrollOffset, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, rgba(6, 78, 59, 0.22) 0%, rgba(2, 6, 23, 0.95) 70%, #020617 100%)'
      }}
    />
  );
}
