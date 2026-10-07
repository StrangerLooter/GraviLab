import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TrajectoryPoint } from '../types';
import { Eye, RotateCcw, Maximize2, Compass } from 'lucide-react';

interface SimulationCanvas3DProps {
  trajectory: TrajectoryPoint[];
  playbackProgress: number; // 0.0 to 1.0
  planetName: string;
  planetRadiusKm: number;
  planetColor?: string;
  periapsisKm?: number;
  turningAngleDeg?: number;
  showVectors?: boolean;
  showRelativeVector?: boolean;
  showGravityVector?: boolean;
}

export const SimulationCanvas3D: React.FC<SimulationCanvas3DProps> = ({
  trajectory,
  playbackProgress,
  planetName,
  planetRadiusKm,
  planetColor = '#F59E0B',
  periapsisKm,
  turningAngleDeg,
  showVectors = true,
  showRelativeVector = true,
  showGravityVector = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic elements
  const probeMeshRef = useRef<THREE.Group | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const periapsisMarkerRef = useRef<THREE.Mesh | null>(null);

  // Arrow helpers
  const vScArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const vRelArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const aGravArrowRef = useRef<THREE.ArrowHelper | null>(null);

  const [cameraMode, setCameraMode] = useState<'free' | 'top' | 'side' | 'follow'>('free');

  // Normalization scale factor: map planetary radius to ~ 2.0 units
  const scale = 2.0 / Math.max(1000.0, planetRadiusKm);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 35, 45);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    sunLight.position.set(80, 40, 100);
    scene.add(sunLight);

    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-60, -20, -50);
    scene.add(fillLight);

    // Starfield Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 600;
      starPositions[i + 1] = (Math.random() - 0.5) * 600;
      starPositions[i + 2] = (Math.random() - 0.5) * 600;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 1.2, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Coordinate Grid (Equatorial Plane)
    const grid = new THREE.GridHelper(80, 40, 0x1f2937, 0x111827);
    grid.position.y = -0.05;
    scene.add(grid);

    // Flyby Planet Sphere
    const planetRadius = 2.0; // Scaled
    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(planetColor),
      roughness: 0.6,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planetMesh);

    // Atmosphere Glow Ring
    const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.06, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planetColor),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // Planetary Equator Ring
    const equatorGeo = new THREE.RingGeometry(planetRadius * 1.4, planetRadius * 1.45, 64);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0x475569,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    scene.add(equatorMesh);

    // Spacecraft Probe Representation
    const probeGroup = new THREE.Group();
    // Core body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.4, 0.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    probeGroup.add(bodyMesh);

    // Antenna dish
    const dishGeo = new THREE.ConeGeometry(0.35, 0.25, 16);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI;
    dishMesh.position.z = 0.4;
    probeGroup.add(dishMesh);

    // Solar panels
    const panelGeo = new THREE.BoxGeometry(1.6, 0.05, 0.4);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.2, metalness: 0.7 });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    probeGroup.add(panelMesh);

    scene.add(probeGroup);
    probeMeshRef.current = probeGroup;

    // Periapsis marker ring
    const periMarkerGeo = new THREE.RingGeometry(0.3, 0.5, 32);
    const periMarkerMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, side: THREE.DoubleSide });
    const periMarker = new THREE.Mesh(periMarkerGeo, periMarkerMat);
    periMarker.rotation.x = Math.PI / 2;
    scene.add(periMarker);
    periapsisMarkerRef.current = periMarker;

    // Vectors (Arrow Helpers)
    const vScArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 4, 0x06b6d4, 0.8, 0.4);
    const vRelArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 4, 0x8b5cf6, 0.8, 0.4);
    const aGravArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 3, 0xef4444, 0.6, 0.3);

    scene.add(vScArrow);
    scene.add(vRelArrow);
    scene.add(aGravArrow);

    vScArrowRef.current = vScArrow;
    vRelArrowRef.current = vRelArrow;
    aGravArrowRef.current = aGravArrow;

    // Mouse Interaction (OrbitControls emulation)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 55, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCameraPosition = () => {
      if (cameraMode === 'free') {
        camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        camera.position.y = spherical.radius * Math.cos(spherical.phi);
        camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.lookAt(0, 0, 0);
      }
    };

    // Mouse & Touch Controls
    let prevTouchDist = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.008));
      updateCameraPosition();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(8, Math.min(150, spherical.radius + e.deltaY * 0.05));
      updateCameraPosition();
    };

    // Mobile Touch Handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        prevTouchDist = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevMousePos.x;
        const dy = e.touches[0].clientY - prevMousePos.y;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        spherical.theta -= dx * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.01));
        updateCameraPosition();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (prevTouchDist > 0) {
          const delta = prevTouchDist - dist;
          spherical.radius = Math.max(8, Math.min(150, spherical.radius + delta * 0.1));
          updateCameraPosition();
        }
        prevTouchDist = dist;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
      prevTouchDist = 0;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });
    dom.addEventListener('touchstart', handleTouchStart, { passive: false });
    dom.addEventListener('touchmove', handleTouchMove, { passive: false });
    dom.addEventListener('touchend', handleTouchEnd);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      planetMesh.rotation.y += 0.001;
      atmoMesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver for dynamic responsiveness (mobile, desktop, TV, split screen)
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [planetColor]);

  // Update Trajectory Line Geometry when trajectory changes
  useEffect(() => {
    if (!sceneRef.current || trajectory.length === 0) return;

    // Remove existing trajectory line
    if (trajectoryLineRef.current) {
      sceneRef.current.remove(trajectoryLineRef.current);
      trajectoryLineRef.current.geometry.dispose();
      (trajectoryLineRef.current.material as THREE.Material).dispose();
      trajectoryLineRef.current = null;
    }

    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    let minR = Infinity;
    let minRPos = new THREE.Vector3();

    trajectory.forEach((pt) => {
      // In 3D: X -> x, Z -> z, Y -> y
      const p = new THREE.Vector3(pt.x_km * scale, pt.z_km * scale, pt.y_km * scale);
      points.push(p);

      if (pt.distance_to_planet_km < minR) {
        minR = pt.distance_to_planet_km;
        minRPos = p;
      }

      // Color mapping: Cyan far away, amber/rose near periapsis
      const distRatio = Math.min(1.0, (pt.distance_to_planet_km - planetRadiusKm) / (planetRadiusKm * 15.0));
      const col = new THREE.Color().lerpColors(new THREE.Color(0xf43f5e), new THREE.Color(0x06b6d4), distRatio);
      colors.push(col.r, col.g, col.b);
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });

    const line = new THREE.Line(geometry, material);
    sceneRef.current.add(line);
    trajectoryLineRef.current = line;

    // Update periapsis marker
    if (periapsisMarkerRef.current) {
      periapsisMarkerRef.current.position.copy(minRPos);
    }
  }, [trajectory, scale, planetRadiusKm]);

  // Update Probe Position and Vectors on playback progress
  useEffect(() => {
    if (trajectory.length === 0 || !probeMeshRef.current || !cameraRef.current) return;

    const idx = Math.min(
      trajectory.length - 1,
      Math.max(0, Math.floor(playbackProgress * (trajectory.length - 1)))
    );
    const pt = trajectory[idx];

    const currentPos = new THREE.Vector3(pt.x_km * scale, pt.z_km * scale, pt.y_km * scale);
    probeMeshRef.current.position.copy(currentPos);

    // Orientation along velocity vector
    const velVec = new THREE.Vector3(pt.vx_km_s, pt.vz_km_s, pt.vy_km_s);
    if (velVec.lengthSq() > 0.001) {
      const normVel = velVec.clone().normalize();
      probeMeshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normVel);

      // Spacecraft velocity arrow
      if (vScArrowRef.current) {
        vScArrowRef.current.visible = showVectors;
        vScArrowRef.current.position.copy(currentPos);
        vScArrowRef.current.setDirection(normVel);
        vScArrowRef.current.setLength(Math.min(12, Math.max(2, pt.speed_km_s * 0.25)));
      }

      // Relative velocity vector (S')
      if (vRelArrowRef.current) {
        vRelArrowRef.current.visible = showVectors && showRelativeVector;
        vRelArrowRef.current.position.copy(currentPos);
        vRelArrowRef.current.setDirection(normVel);
        vRelArrowRef.current.setLength(Math.min(10, Math.max(2, pt.speed_km_s * 0.2)));
      }

      // Gravitational acceleration arrow (pointing towards planet origin [0,0,0])
      if (aGravArrowRef.current) {
        aGravArrowRef.current.visible = showVectors && showGravityVector;
        aGravArrowRef.current.position.copy(currentPos);
        const toCenter = currentPos.clone().negate().normalize();
        aGravArrowRef.current.setDirection(toCenter);
        // Accel scales with 1 / r^2
        const accelLen = Math.min(8, Math.max(1.5, 40.0 / Math.max(1.0, currentPos.lengthSq())));
        aGravArrowRef.current.setLength(accelLen);
      }
    }

    // Follow camera mode
    if (cameraMode === 'follow' && cameraRef.current) {
      cameraRef.current.position.set(currentPos.x + 8, currentPos.y + 6, currentPos.z + 12);
      cameraRef.current.lookAt(currentPos);
    }
  }, [playbackProgress, trajectory, scale, showVectors, showRelativeVector, showGravityVector, cameraMode]);

  const handleCameraPreset = (mode: 'free' | 'top' | 'side' | 'follow') => {
    setCameraMode(mode);
    if (!cameraRef.current) return;

    if (mode === 'top') {
      cameraRef.current.position.set(0, 75, 0.001);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (mode === 'side') {
      cameraRef.current.position.set(70, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (mode === 'free') {
      cameraRef.current.position.set(0, 35, 45);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-space-800 bg-space-950 shadow-2xl">
      {/* Three.js viewport container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Camera Presets HUD */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 p-1 rounded-lg bg-space-900/80 backdrop-blur-md border border-space-700/60 text-xs">
        <button
          onClick={() => handleCameraPreset('free')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            cameraMode === 'free' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Perspective
        </button>
        <button
          onClick={() => handleCameraPreset('top')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            cameraMode === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Top View
        </button>
        <button
          onClick={() => handleCameraPreset('side')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            cameraMode === 'side' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Side View
        </button>
        <button
          onClick={() => handleCameraPreset('follow')}
          className={`px-2.5 py-1 rounded font-medium transition-colors ${
            cameraMode === 'follow' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
          }`}
        >
          Follow Probe
        </button>
        <button
          onClick={() => handleCameraPreset('free')}
          title="Reset Camera"
          className="p-1 text-slate-400 hover:text-white rounded ml-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Vector Legend HUD */}
      <div className="absolute top-3 right-3 p-2.5 rounded-lg bg-space-900/80 backdrop-blur-md border border-space-700/60 text-[11px] font-mono space-y-1.5 shadow-lg">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-sans font-semibold mb-1">
          Vector Overlays
        </div>
        <div className="flex items-center gap-2 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
          <span>v_sc (Velocity)</span>
        </div>
        <div className="flex items-center gap-2 text-purple-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-400" />
          <span>v_∞ (Relative Excess)</span>
        </div>
        <div className="flex items-center gap-2 text-rose-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
          <span>a_grav (Gravity Vector)</span>
        </div>
      </div>

      {/* Bottom Information Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-lg bg-space-900/80 backdrop-blur-md border border-space-700/60 text-xs">
        <div className="flex items-center gap-4 text-slate-300">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: planetColor }} />
            <strong className="text-white">{planetName}</strong> (R = {planetRadiusKm.toLocaleString()} km)
          </span>
          {periapsisKm && (
            <span className="font-mono text-slate-400">
              Periapsis: <span className="text-rose-400 font-semibold">{periapsisKm.toLocaleString()} km</span>
            </span>
          )}
          {turningAngleDeg && (
            <span className="font-mono text-slate-400">
              Turning Angle δ: <span className="text-cyan-300 font-semibold">{turningAngleDeg.toFixed(2)}°</span>
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Interactive: Drag to Orbit • Scroll to Zoom
        </div>
      </div>
    </div>
  );
};
