import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCw, ZoomIn, ZoomOut, Activity, Atom, Pill } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type ModelType = 'dna' | 'molecule' | 'capsule';

interface ThreeMolecularViewerProps {
  className?: string;
}

export const ThreeMolecularViewer: React.FC<ThreeMolecularViewerProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelType, setModelType] = useState<ModelType>('dna');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const { isClinical } = useTheme();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const prevMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Clean Studio Lighting in Lavender and Violet
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xc084fc, 1.6);
    dirLight1.position.set(10, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa78bfa, 1.2);
    dirLight2.position.set(-10, -10, -8);
    scene.add(dirLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    objectGroupRef.current = rootGroup;

    // Build model
    buildModel(modelType);

    // Mouse Interaction
    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !objectGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevMousePosRef.current.x;
      const deltaY = clientY - prevMousePosRef.current.y;

      objectGroupRef.current.rotation.y += deltaX * 0.01;
      objectGroupRef.current.rotation.x += deltaY * 0.01;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + e.deltaY * 0.01, 8), 24);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('touchstart', handleMouseDown, { passive: true });
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);
    dom.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && objectGroupRef.current && !isDraggingRef.current) {
        objectGroupRef.current.rotation.y += delta * 0.5;
        objectGroupRef.current.rotation.x += delta * 0.15;
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      dom.removeEventListener('mousedown', handleMouseDown);
      dom.removeEventListener('touchstart', handleMouseDown);
      dom.removeEventListener('wheel', handleWheel);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, [modelType]);

  const buildModel = (type: ModelType) => {
    const group = objectGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ('geometry' in obj && obj.geometry instanceof THREE.BufferGeometry) {
        obj.geometry.dispose();
      }
    }

    if (type === 'dna') {
      // 3D Double Helix with Lavender & Violet Strands
      const strandRadius = 0.18;
      const basePairs = 24;
      const heightStep = 0.45;
      const angleStep = Math.PI / 6;
      const radius = 2.4;

      const sphereGeo = new THREE.SphereGeometry(strandRadius * 1.5, 16, 16);
      const matA = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3, metalness: 0.25 }); // Lavender
      const matB = new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.3, metalness: 0.25 }); // Soft Violet
      const rungMat = new THREE.MeshStandardMaterial({ color: 0xe9d5ff, roughness: 0.4 }); // Pale lilac

      for (let i = 0; i < basePairs; i++) {
        const angle = i * angleStep;
        const y = (i - basePairs / 2) * heightStep;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;

        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;

        // Strand Nodes
        const s1 = new THREE.Mesh(sphereGeo, matA);
        s1.position.set(x1, y, z1);
        group.add(s1);

        const s2 = new THREE.Mesh(sphereGeo, matB);
        s2.position.set(x2, y, z2);
        group.add(s2);

        // Connecting Rung
        const p1 = new THREE.Vector3(x1, y, z1);
        const p2 = new THREE.Vector3(x2, y, z2);
        const dist = p1.distanceTo(p2);
        const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, dist, 8);
        const rungMesh = new THREE.Mesh(cylGeo, rungMat);
        rungMesh.position.copy(midpoint);
        rungMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        group.add(rungMesh);
      }
    } else if (type === 'molecule') {
      // Bioactive Flavone Ring Core
      const atomMatC = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3 }); // Rich Lavender-Purple
      const atomMatO = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 }); // Red Oxygen
      const atomMatH = new THREE.MeshStandardMaterial({ color: 0xf3e8ff, roughness: 0.3 }); // Light Lilac
      const bondMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 });

      const ringRadius = 2.2;
      const atoms = 6;
      const positions: THREE.Vector3[] = [];

      for (let i = 0; i < atoms; i++) {
        const theta = (i * Math.PI * 2) / atoms;
        const pos = new THREE.Vector3(Math.cos(theta) * ringRadius, Math.sin(theta) * ringRadius, 0);
        positions.push(pos);

        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 20), i === 1 ? atomMatO : atomMatC);
        sphere.position.copy(pos);
        group.add(sphere);

        // Hydrogens on periphery
        if (i !== 1) {
          const hPos = pos.clone().multiplyScalar(1.55);
          const hSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), atomMatH);
          hSphere.position.copy(hPos);
          group.add(hSphere);

          // Bond to H
          const bondDist = pos.distanceTo(hPos);
          const bondMid = new THREE.Vector3().addVectors(pos, hPos).multiplyScalar(0.5);
          const bondCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, bondDist, 8), bondMat);
          bondCyl.position.copy(bondMid);
          bondCyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hPos.clone().sub(pos).normalize());
          group.add(bondCyl);
        }
      }

      // Ring Bonds
      for (let i = 0; i < atoms; i++) {
        const p1 = positions[i];
        const p2 = positions[(i + 1) % atoms];
        const dist = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        const bondCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, dist, 8), bondMat);
        bondCyl.position.copy(mid);
        bondCyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        group.add(bondCyl);
      }
    } else if (type === 'capsule') {
      // Pharmaceutical Capsule in Lavender & Ivory
      const capRadius = 1.4;
      const capLength = 2.4;

      const topGeo = new THREE.SphereGeometry(capRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const topMat = new THREE.MeshStandardMaterial({
        color: 0xc084fc, // Lavender
        roughness: 0.15,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
      });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.y = capLength / 2;
      group.add(topMesh);

      const topCylGeo = new THREE.CylinderGeometry(capRadius, capRadius, capLength / 2, 24, 1, true);
      const topCylMesh = new THREE.Mesh(topCylGeo, topMat);
      topCylMesh.position.y = capLength / 4;
      group.add(topCylMesh);

      const botGeo = new THREE.SphereGeometry(capRadius, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      const botMat = new THREE.MeshStandardMaterial({
        color: 0xf5f3ff, // Soft Lilac Ivory
        roughness: 0.15,
        metalness: 0.1,
      });
      const botMesh = new THREE.Mesh(botGeo, botMat);
      botMesh.position.y = -capLength / 2;
      group.add(botMesh);

      const botCylGeo = new THREE.CylinderGeometry(capRadius, capRadius, capLength / 2, 24, 1, true);
      const botCylMesh = new THREE.Mesh(botCylGeo, botMat);
      botCylMesh.position.y = -capLength / 4;
      group.add(botCylMesh);

      const ringGeo = new THREE.TorusGeometry(capRadius + 0.02, 0.06, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      group.add(ringMesh);
    }
  };

  const handleZoom = (amount: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(Math.max(cameraRef.current.position.z + amount, 8), 24);
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !objectGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 16);
    objectGroupRef.current.rotation.set(0, 0, 0);
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xl ${
        isClinical
          ? 'bg-white/95 border-purple-200 shadow-slate-200/60'
          : 'bg-slate-900/80 border-purple-500/20 shadow-black/40'
      } ${className}`}
    >
      {/* Top Model Switcher Toolbar - Centered with generous spacing */}
      <div
        className={`flex items-center justify-center p-2.5 sm:p-3 border-b text-xs transition-colors shrink-0 ${
          isClinical
            ? 'bg-slate-50/90 border-purple-100 text-slate-800'
            : 'bg-slate-950/70 border-purple-500/20 text-slate-200'
        }`}
      >
        <div
          className={`flex items-center justify-center gap-1.5 p-1 rounded-xl border w-full max-w-xs sm:max-w-md ${
            isClinical
              ? 'bg-slate-100 border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
        >
          <button
            onClick={() => setModelType('dna')}
            title="DNA Helix"
            className={`flex-1 py-1.5 px-2 sm:px-3 text-xs font-medium rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modelType === 'dna'
                ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
                : isClinical
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">DNA Helix</span>
          </button>
          <button
            onClick={() => setModelType('molecule')}
            title="Molecule"
            className={`flex-1 py-1.5 px-2 sm:px-3 text-xs font-medium rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modelType === 'molecule'
                ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
                : isClinical
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Molecule</span>
          </button>
          <button
            onClick={() => setModelType('capsule')}
            title="Capsule"
            className={`flex-1 py-1.5 px-2 sm:px-3 text-xs font-medium rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              modelType === 'capsule'
                ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
                : isClinical
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">Capsule</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div className="relative flex-1 w-full min-h-[300px] flex items-center justify-center overflow-hidden">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Controls */}
        <div
          className={`absolute bottom-3 right-3 z-20 flex items-center gap-1.5 border rounded-lg p-1 backdrop-blur-md transition-colors ${
            isClinical
              ? 'bg-white/90 border-purple-200 shadow-md shadow-slate-200/50'
              : 'bg-slate-950/85 border-purple-500/20'
          }`}
        >
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              autoRotate
                ? isClinical
                  ? 'text-purple-700 bg-purple-100'
                  : 'text-purple-300 bg-purple-500/20'
                : isClinical
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={autoRotate ? 'Pause' : 'Auto-Rotate'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleZoom(-1.5)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isClinical
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(1.5)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isClinical
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isClinical
                ? 'text-slate-500 hover:text-slate-800'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Reset Angle"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
