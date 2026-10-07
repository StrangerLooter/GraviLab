import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { TrajectoryPoint } from '../types';

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
  showGrid?: boolean;
  showAxes?: boolean;
  showTrails?: boolean;
  cameraMode?: 'free' | 'top' | 'side' | 'follow';
  className?: string;
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
  showGrid = true,
  showAxes = false,
  showTrails = true,
  cameraMode = 'free',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Dynamic meshes
  const probeMeshRef = useRef<THREE.Group | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const periapsisMarkerRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const axesHelperRef = useRef<THREE.AxesHelper | null>(null);

  // Vector arrow helpers
  const vScArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const vRelArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const aGravArrowRef = useRef<THREE.ArrowHelper | null>(null);

  // Spherical camera coordinates for mouse/touch orbit
  const sphericalRef = useRef({ radius: 60, theta: Math.PI / 4, phi: Math.PI / 3 });

  // Normalization scale factor: map planetary radius to ~ 2.2 units
  const scale = 2.2 / Math.max(1000.0, planetRadiusKm);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050c);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);
    camera.position.set(0, 40, 50);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Directional Sun Light (Warm White)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    sunLight.position.set(120, 60, 140);
    scene.add(sunLight);

    // Deep space fill light (Cyan tint)
    const fillLight = new THREE.DirectionalLight(0x0ea5e9, 0.45);
    fillLight.position.set(-100, -30, -80);
    scene.add(fillLight);

    // Starfield Background (1200 subtle glowing stars)
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 800;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 1.2,
      transparent: true,
      opacity: 0.75,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // Coordinate Grid (Spacetime Fabric Plane)
    const grid = new THREE.GridHelper(100, 50, 0x0284c7, 0x111827);
    grid.position.y = -0.05;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);
    gridHelperRef.current = grid;

    // Coordinate Axes
    const axes = new THREE.AxesHelper(15);
    axes.visible = showAxes;
    scene.add(axes);
    axesHelperRef.current = axes;

    // Flyby Planet Sphere
    const planetRadius = 2.2;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(planetColor),
      roughness: 0.5,
      metalness: 0.15,
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planetMesh);

    // Atmosphere Glow Shell
    const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.08, 36, 36);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planetColor),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    scene.add(atmoMesh);

    // Planetary Ring / Equator Guide
    const ringGeo = new THREE.RingGeometry(planetRadius * 1.45, planetRadius * 1.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);

    // Spacecraft Probe Representation (Detailed Voyager 1 model)
    const probeGroup = new THREE.Group();
    // Bus body
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.45, 0.65);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25, metalness: 0.85 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    probeGroup.add(bodyMesh);

    // High-Gain Antenna Dish (Gold/Brass dish)
    const dishGeo = new THREE.ConeGeometry(0.42, 0.3, 24);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.75 });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI;
    dishMesh.position.z = 0.45;
    probeGroup.add(dishMesh);

    // Magnetometer & RTG Booms
    const boomGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.8 });
    const boomMesh1 = new THREE.Mesh(boomGeo, boomMat);
    boomMesh1.rotation.z = Math.PI / 3;
    probeGroup.add(boomMesh1);

    const boomMesh2 = new THREE.Mesh(boomGeo, boomMat);
    boomMesh2.rotation.z = -Math.PI / 3;
    probeGroup.add(boomMesh2);

    scene.add(probeGroup);
    probeMeshRef.current = probeGroup;

    // Periapsis Close-Approach Glow Marker
    const periMarkerGeo = new THREE.RingGeometry(0.4, 0.65, 32);
    const periMarkerMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const periMarker = new THREE.Mesh(periMarkerGeo, periMarkerMat);
    periMarker.rotation.x = Math.PI / 2;
    scene.add(periMarker);
    periapsisMarkerRef.current = periMarker;

    // Vector Arrow Helpers
    const vScArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 5, 0x06b6d4, 1.0, 0.45);
    const vRelArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 4.5, 0xa855f7, 0.9, 0.4);
    const aGravArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 0), 3.5, 0xef4444, 0.7, 0.35);

    scene.add(vScArrow);
    scene.add(vRelArrow);
    scene.add(aGravArrow);

    vScArrowRef.current = vScArrow;
    vRelArrowRef.current = vRelArrow;
    aGravArrowRef.current = aGravArrow;

    // Interactive Camera Controls (Mouse Orbit & Scroll Zoom)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const updateCameraPos = () => {
      if (cameraMode === 'free') {
        const s = sphericalRef.current;
        camera.position.x = s.radius * Math.sin(s.phi) * Math.sin(s.theta);
        camera.position.y = s.radius * Math.cos(s.phi);
        camera.position.z = s.radius * Math.sin(s.phi) * Math.cos(s.theta);
        camera.lookAt(0, 0, 0);
      }
    };
    updateCameraPos();

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      sphericalRef.current.theta -= dx * 0.007;
      sphericalRef.current.phi = Math.max(0.08, Math.min(Math.PI - 0.08, sphericalRef.current.phi - dy * 0.007));
      updateCameraPos();
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      sphericalRef.current.radius = Math.max(10, Math.min(200, sphericalRef.current.radius + e.deltaY * 0.06));
      updateCameraPos();
    };

    // Touch Event Handlers for Mobile and Tablets
    let prevTouchDist = 0;

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
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevMousePos.x;
        const dy = e.touches[0].clientY - prevMousePos.y;
        prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        sphericalRef.current.theta -= dx * 0.009;
        sphericalRef.current.phi = Math.max(0.08, Math.min(Math.PI - 0.08, sphericalRef.current.phi - dy * 0.009));
        updateCameraPos();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (prevTouchDist > 0) {
          const delta = prevTouchDist - dist;
          sphericalRef.current.radius = Math.max(10, Math.min(200, sphericalRef.current.radius + delta * 0.12));
          updateCameraPos();
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

    // Animation Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      planetMesh.rotation.y += 0.001;
      atmoMesh.rotation.y += 0.0012;
      renderer.render(scene, camera);
    };
    animate();

    // ResizeObserver for dynamic full-viewport resizing
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
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

  // Toggle Visibility Props
  useEffect(() => {
    if (gridHelperRef.current) gridHelperRef.current.visible = showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (axesHelperRef.current) axesHelperRef.current.visible = showAxes;
  }, [showAxes]);

  useEffect(() => {
    if (trajectoryLineRef.current) trajectoryLineRef.current.visible = showTrails;
  }, [showTrails]);

  // Update Trajectory Geometry when trajectory data changes
  useEffect(() => {
    if (!sceneRef.current || trajectory.length === 0) return;

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
      const p = new THREE.Vector3(pt.x_km * scale, pt.z_km * scale, pt.y_km * scale);
      points.push(p);

      if (pt.distance_to_planet_km < minR) {
        minR = pt.distance_to_planet_km;
        minRPos = p;
      }

      // Dynamic color gradient: Cyan far away -> Amber/Rose near periapsis
      const distRatio = Math.min(1.0, (pt.distance_to_planet_km - planetRadiusKm) / (planetRadiusKm * 15.0));
      const col = new THREE.Color().lerpColors(new THREE.Color(0xf43f5e), new THREE.Color(0x38bdf8), distRatio);
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
    line.visible = showTrails;
    sceneRef.current.add(line);
    trajectoryLineRef.current = line;

    if (periapsisMarkerRef.current) {
      periapsisMarkerRef.current.position.copy(minRPos);
    }
  }, [trajectory, scale, planetRadiusKm, showTrails]);

  // Update Probe Position, Orientation, and Vector Arrows on animation progress
  useEffect(() => {
    if (trajectory.length === 0 || !probeMeshRef.current || !cameraRef.current) return;

    const idx = Math.min(
      trajectory.length - 1,
      Math.max(0, Math.floor(playbackProgress * (trajectory.length - 1)))
    );
    const pt = trajectory[idx];

    const currentPos = new THREE.Vector3(pt.x_km * scale, pt.z_km * scale, pt.y_km * scale);
    probeMeshRef.current.position.copy(currentPos);

    // Orient along velocity vector
    const velVec = new THREE.Vector3(pt.vx_km_s, pt.vz_km_s, pt.vy_km_s);
    if (velVec.lengthSq() > 0.001) {
      const normVel = velVec.clone().normalize();
      probeMeshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normVel);

      // Spacecraft velocity arrow (Cyan)
      if (vScArrowRef.current) {
        vScArrowRef.current.visible = showVectors;
        vScArrowRef.current.position.copy(currentPos);
        vScArrowRef.current.setDirection(normVel);
        vScArrowRef.current.setLength(Math.min(14, Math.max(2.5, pt.speed_km_s * 0.28)));
      }

      // Relative excess velocity arrow (Purple)
      if (vRelArrowRef.current) {
        vRelArrowRef.current.visible = showVectors && showRelativeVector;
        vRelArrowRef.current.position.copy(currentPos);
        vRelArrowRef.current.setDirection(normVel);
        vRelArrowRef.current.setLength(Math.min(11, Math.max(2, pt.speed_km_s * 0.22)));
      }

      // Gravitational acceleration arrow (Red, pointing toward planet center [0,0,0])
      if (aGravArrowRef.current) {
        aGravArrowRef.current.visible = showVectors && showGravityVector;
        aGravArrowRef.current.position.copy(currentPos);
        const toCenter = currentPos.clone().negate().normalize();
        aGravArrowRef.current.setDirection(toCenter);
        const accelLen = Math.min(9, Math.max(1.8, 45.0 / Math.max(1.0, currentPos.lengthSq())));
        aGravArrowRef.current.setLength(accelLen);
      }
    }

    // Follow camera mode
    if (cameraMode === 'follow' && cameraRef.current) {
      cameraRef.current.position.set(currentPos.x + 10, currentPos.y + 7, currentPos.z + 14);
      cameraRef.current.lookAt(currentPos);
    }
  }, [playbackProgress, trajectory, scale, showVectors, showRelativeVector, showGravityVector, cameraMode]);

  // Camera Mode Handling
  useEffect(() => {
    if (!cameraRef.current) return;
    if (cameraMode === 'top') {
      cameraRef.current.position.set(0, 85, 0.001);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (cameraMode === 'side') {
      cameraRef.current.position.set(80, 0, 0);
      cameraRef.current.lookAt(0, 0, 0);
    } else if (cameraMode === 'free') {
      const s = sphericalRef.current;
      cameraRef.current.position.set(
        s.radius * Math.sin(s.phi) * Math.sin(s.theta),
        s.radius * Math.cos(s.phi),
        s.radius * Math.sin(s.phi) * Math.cos(s.theta)
      );
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [cameraMode]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
