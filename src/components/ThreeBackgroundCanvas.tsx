import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

interface MolecularParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  life: number;
  maxLife: number;
  delay: number;
  active: boolean;
  curlPhase: number;
  curlSpeed: number;
  twinkleSpeed: number;
  size: number;
}

interface CapsuleItem {
  id: number;
  group: THREE.Group;
  capGroup: THREE.Group;
  bodyGroup: THREE.Group;
  hitMesh: THREE.Mesh;
  capMaterial: THREE.MeshPhysicalMaterial;
  bodyMaterial: THREE.MeshPhysicalMaterial;
  
  // Natural floating physics & collision
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  floatPhase: number;
  floatSpeed: number;
  scale: number;
  colRadius: number;
  
  // Hover & glow interaction
  isHovered: boolean;
  hoverFactor: number; // smoothly interpolates 0 -> 1
  glowColor: number;
  hoverTriggerTimer: number;
  
  // Interaction & split state
  state: 'idle' | 'splitting' | 'open' | 'reassembling';
  splitProgress: number; // 0 to 1
  openTimer: number;
  streamTimer: number;
  
  // Active ingredient molecular stream
  particles: MolecularParticle[];
  particlePoints: THREE.Points;
  particlePosAttr: THREE.BufferAttribute;
  particleColAttr: THREE.BufferAttribute;
  particleMaterial: THREE.PointsMaterial;
}

export const ThreeBackgroundCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { isClinical } = useTheme();
  const themeRef = useRef<boolean>(isClinical);

  useEffect(() => {
    themeRef.current = isClinical;
  }, [isClinical]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(54, width / height, 1, 1200);
    camera.position.z = 215;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Dreamy soft studio illumination tailored for glossy translucent pastels
    const ambientLight = new THREE.AmbientLight(0xfff7fa, themeRef.current ? 1.45 : 1.05);
    scene.add(ambientLight);

    // Warm blush key light for soft strawberry highlights
    const keyLight = new THREE.DirectionalLight(0xffdbe8, themeRef.current ? 1.25 : 1.75);
    keyLight.position.set(150, 190, 140);
    scene.add(keyLight);

    // Delicate fairy lavender fill light for dreamy iridescence
    const fillLight = new THREE.DirectionalLight(0xedd8ff, themeRef.current ? 0.95 : 1.4);
    fillLight.position.set(-140, -120, 100);
    scene.add(fillLight);

    // Crisp pure-white rim light for glossy edges and clearcoat highlights
    const rimLight = new THREE.DirectionalLight(0xffffff, themeRef.current ? 0.6 : 0.9);
    rimLight.position.set(0, 160, -110);
    scene.add(rimLight);

    // Refined Sparkling Molecular Stardust Sprite Texture with 4-Point Micro Starburst
    const createSparkleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 64, 64);
        
        // Soft outer ambient halo
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.15, 'rgba(255, 245, 252, 0.98)');
        grad.addColorStop(0.42, 'rgba(254, 215, 242, 0.65)');
        grad.addColorStop(0.72, 'rgba(240, 205, 250, 0.22)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 30, 0, Math.PI * 2);
        ctx.fill();

        // Delicate 4-point micro cross sparkle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(32, 10);
        ctx.lineTo(32, 54);
        ctx.moveTo(10, 32);
        ctx.lineTo(54, 32);
        ctx.stroke();

        // Intense glowing center core
        const coreGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 6);
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(32, 32, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const sparkleTexture = createSparkleTexture();

    // Dainty, Petite & Modern Capsule Geometry (compact, sleek & chic)
    const radius = 1.15;
    const cylHalfHeight = 1.45;

    // Top Cap Geometry: cylinder [0 -> cylHalfHeight] + top hemisphere dome
    const capCylGeo = new THREE.CylinderGeometry(radius, radius, cylHalfHeight, 22, 1, false);
    capCylGeo.translate(0, cylHalfHeight / 2, 0);

    const capDomeGeo = new THREE.SphereGeometry(radius, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    capDomeGeo.translate(0, cylHalfHeight, 0);

    // Bottom Body Geometry: slightly narrower radius for realistic interlocking fit
    const bodyRadius = radius * 0.96;
    const bodyCylGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, cylHalfHeight * 1.05, 22, 1, false);
    bodyCylGeo.translate(0, (-cylHalfHeight * 1.05) / 2, 0);

    const bodyDomeGeo = new THREE.SphereGeometry(bodyRadius, 22, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    bodyDomeGeo.translate(0, -cylHalfHeight * 1.05, 0);

    // Central sleek glossy division seam band
    const ringGeo = new THREE.CylinderGeometry(radius * 1.018, radius * 1.018, 0.15, 22, 1, true);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.42,
    });

    // Invisible hit sphere for responsive pointer hover/clicks
    const hitSphereGeo = new THREE.SphereGeometry(4.8, 8, 8);
    const hitMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    // Two-Tone Pastel Palettes: Baby Pink, Ocean Blue, Blush & Lavender paired with Pure White
    const pookiePalettes = [
      // 1. Baby Pink & White Two-Tone
      {
        name: 'Baby Pink & White',
        capDark: 0xf472b6,     // Baby Pink
        bodyDark: 0xffffff,    // Pure White
        capLight: 0xf9a8d4,    // Soft Blush Pink
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0xf472b6,
        molecularColors: [0xf472b6, 0xffffff, 0xfbcfe8, 0xbae6fd, 0xfef08a],
      },
      // 2. Ocean Blue & White Two-Tone
      {
        name: 'Ocean Blue & White',
        capDark: 0x38bdf8,     // Ocean Blue
        bodyDark: 0xffffff,    // Pure White
        capLight: 0x7dd3fc,    // Light Ocean Blue
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0x38bdf8,
        molecularColors: [0x38bdf8, 0xffffff, 0x93c5fd, 0xe0f2fe, 0xfef08a],
      },
      // 3. Blush & White Two-Tone
      {
        name: 'Blush & White',
        capDark: 0xfb7185,     // Blush Pink
        bodyDark: 0xffffff,    // Pure White
        capLight: 0xfda4af,    // Light Blush
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0xfb7185,
        molecularColors: [0xfb7185, 0xffffff, 0xfecdd3, 0xfbcfe8, 0xfef08a],
      },
      // 4. Lavender & White Two-Tone
      {
        name: 'Lavender & White',
        capDark: 0xc084fc,     // Lavender
        bodyDark: 0xffffff,    // Pure White
        capLight: 0xd8b4fe,    // Pastel Lilac
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0xc084fc,
        molecularColors: [0xc084fc, 0xffffff, 0xe9d5ff, 0xf5d0fe, 0xfef9c3],
      },
      // 5. Sky Blue & White Two-Tone
      {
        name: 'Sky Blue & White',
        capDark: 0x60a5fa,     // Sky Blue
        bodyDark: 0xffffff,    // Pure White
        capLight: 0x93c5fd,    // Light Blue
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0x60a5fa,
        molecularColors: [0x60a5fa, 0xffffff, 0xbfdbfe, 0xfbcfe8, 0xfef08a],
      },
      // 6. Orchid Lilac & White Two-Tone
      {
        name: 'Orchid Lilac & White',
        capDark: 0xa855f7,     // Orchid Lilac
        bodyDark: 0xffffff,    // Pure White
        capLight: 0xc4b5fd,    // Light Orchid
        bodyLight: 0xf8fafc,   // Alabaster White
        glowColor: 0xa855f7,
        molecularColors: [0xa855f7, 0xffffff, 0xd8b4fe, 0xf472b6, 0xfef08a],
      },
    ];

    // Richer capsule count distributed across the entire website
    const isMobile = width < 768;
    const capsuleCount = isMobile ? 70 : 140;
    const capsules: CapsuleItem[] = [];
    const hitMeshes: THREE.Mesh[] = [];

    // Dense molecular particles for an ethereal, sparkling burst and stream
    const PARTICLES_PER_CAPSULE = isMobile ? 150 : 250;

    // Wider natural distribution covering the entire viewable page with margins
    const xSpread = isMobile ? 280 : 580;
    const ySpread = isMobile ? 240 : 410;
    const zSpread = 230;

    for (let i = 0; i < capsuleCount; i++) {
      const paletteIdx = i % pookiePalettes.length;
      const palette = pookiePalettes[paletteIdx];
      const isClinicalCurrent = themeRef.current;

      // Ultra-glossy translucent gelatin finish with clearcoat sheen & subtle refraction
      const capMat = new THREE.MeshPhysicalMaterial({
        color: isClinicalCurrent ? palette.capLight : palette.capDark,
        emissive: new THREE.Color(palette.glowColor),
        emissiveIntensity: 0,
        roughness: isClinicalCurrent ? 0.12 : 0.07,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        transmission: isClinicalCurrent ? 0.22 : 0.28,
        ior: 1.48,
        transparent: true,
        opacity: isClinicalCurrent ? 0.62 : 0.84,
        depthWrite: true,
      });

      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: isClinicalCurrent ? palette.bodyLight : palette.bodyDark,
        emissive: new THREE.Color(palette.glowColor),
        emissiveIntensity: 0,
        roughness: isClinicalCurrent ? 0.14 : 0.08,
        metalness: 0.02,
        clearcoat: 0.95,
        clearcoatRoughness: 0.04,
        transmission: isClinicalCurrent ? 0.20 : 0.25,
        ior: 1.48,
        transparent: true,
        opacity: isClinicalCurrent ? 0.58 : 0.80,
        depthWrite: true,
      });

      const capsuleGroup = new THREE.Group();
      const capGroup = new THREE.Group();
      const bodyGroup = new THREE.Group();

      // Build Cap (Top)
      const capCyl = new THREE.Mesh(capCylGeo, capMat);
      const capDome = new THREE.Mesh(capDomeGeo, capMat);
      capGroup.add(capCyl);
      capGroup.add(capDome);

      // Build Body (Bottom)
      const bodyCyl = new THREE.Mesh(bodyCylGeo, bodyMat);
      const bodyDome = new THREE.Mesh(bodyDomeGeo, bodyMat);
      bodyGroup.add(bodyCyl);
      bodyGroup.add(bodyDome);

      // Add central sleek division band
      const seamRing = new THREE.Mesh(ringGeo, ringMat);
      capGroup.add(seamRing);

      capsuleGroup.add(capGroup);
      capsuleGroup.add(bodyGroup);

      // Add Hit Mesh for Raycasting
      const hitMesh = new THREE.Mesh(hitSphereGeo, hitMaterial);
      hitMesh.userData = { capsuleIndex: i };
      capsuleGroup.add(hitMesh);
      hitMeshes.push(hitMesh);

      // Spawn with non-overlapping initial position check
      let posX = 0;
      let posY = 0;
      let posZ = 0;
      let attempts = 0;
      let hasOverlap = true;
      const minSpawnDist = 12.0;

      while (hasOverlap && attempts < 15) {
        posX = (Math.random() - 0.5) * xSpread;
        posY = (Math.random() - 0.5) * ySpread;
        posZ = (Math.random() - 0.5) * zSpread - 30;

        hasOverlap = false;
        for (let k = 0; k < capsules.length; k++) {
          const dx = posX - capsules[k].pos.x;
          const dy = posY - capsules[k].pos.y;
          const dz = posZ - capsules[k].pos.z;
          if (dx * dx + dy * dy + dz * dz < minSpawnDist * minSpawnDist) {
            hasOverlap = true;
            break;
          }
        }
        attempts++;
      }

      capsuleGroup.position.set(posX, posY, posZ);

      // Petite, modern, and delicate scale
      const scale = 0.62 + Math.random() * 0.28;
      capsuleGroup.scale.set(scale, scale, scale);

      capsuleGroup.rotation.x = Math.random() * Math.PI * 2;
      capsuleGroup.rotation.y = Math.random() * Math.PI * 2;
      capsuleGroup.rotation.z = Math.random() * Math.PI * 2;

      scene.add(capsuleGroup);

      // Build Active Ingredients Sparkling Molecular Particle System
      const pPositions = new Float32Array(PARTICLES_PER_CAPSULE * 3);
      const pColors = new Float32Array(PARTICLES_PER_CAPSULE * 3);
      const pGeometry = new THREE.BufferGeometry();
      pGeometry.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      pGeometry.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

      // Extremely tiny, delicate sparkling points
      const pMaterial = new THREE.PointsMaterial({
        map: sparkleTexture,
        vertexColors: true,
        size: (isClinicalCurrent ? 1.6 : 1.45) * scale,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: isClinicalCurrent ? THREE.NormalBlending : THREE.AdditiveBlending,
      });

      const particlePoints = new THREE.Points(pGeometry, pMaterial);
      scene.add(particlePoints);

      const particles: MolecularParticle[] = [];
      for (let p = 0; p < PARTICLES_PER_CAPSULE; p++) {
        const hex = palette.molecularColors[p % palette.molecularColors.length];
        const color = new THREE.Color(hex);
        particles.push({
          pos: new THREE.Vector3(),
          vel: new THREE.Vector3(),
          color,
          alpha: 0,
          life: 0,
          maxLife: 2.4 + Math.random() * 1.8,
          delay: (p / PARTICLES_PER_CAPSULE) * 0.40, // Progressive stream release
          active: false,
          curlPhase: Math.random() * Math.PI * 2,
          curlSpeed: 1.8 + Math.random() * 2.2,
          twinkleSpeed: 6.0 + Math.random() * 8.0,
          size: 0.75 + Math.random() * 0.85,
        });
      }

      capsules.push({
        id: i,
        group: capsuleGroup,
        capGroup,
        bodyGroup,
        hitMesh,
        capMaterial: capMat,
        bodyMaterial: bodyMat,
        pos: new THREE.Vector3(posX, posY, posZ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.08
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.008
        ),
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.85 + Math.random() * 0.8,
        scale,
        colRadius: 3.0 * scale, // Effective smooth collision sphere boundary
        isHovered: false,
        hoverFactor: 0,
        glowColor: palette.glowColor,
        hoverTriggerTimer: 0,
        state: 'idle',
        splitProgress: 0,
        openTimer: 0,
        streamTimer: 0,
        particles,
        particlePoints,
        particlePosAttr: pGeometry.getAttribute('position') as THREE.BufferAttribute,
        particleColAttr: pGeometry.getAttribute('color') as THREE.BufferAttribute,
        particleMaterial: pMaterial,
      });
    }

    // Function to trigger realistic capsule splitting and sparkling molecular stream
    const triggerCapsuleSplit = (capsule: CapsuleItem, boostVelocity = false) => {
      if (capsule.state === 'splitting' || capsule.state === 'open') {
        if (boostVelocity) {
          capsule.rotSpeed.x += (Math.random() - 0.5) * 0.03;
          capsule.rotSpeed.y += (Math.random() - 0.5) * 0.03;
        }
        return;
      }

      capsule.state = 'splitting';
      capsule.splitProgress = 0;
      capsule.streamTimer = 0;

      // Base seam position in world space
      const worldSeamPos = new THREE.Vector3();
      capsule.group.getWorldPosition(worldSeamPos);

      // Capsule local axes for orienting the directional stream
      const capsuleUp = new THREE.Vector3(0, 1, 0).applyQuaternion(capsule.group.quaternion).normalize();
      const randomPerp = new THREE.Vector3(1, 0, 0).applyQuaternion(capsule.group.quaternion).normalize();

      // Configure the progressive pouring stream
      const partCount = capsule.particles.length;
      for (let pIdx = 0; pIdx < partCount; pIdx++) {
        const pt = capsule.particles[pIdx];
        pt.active = false;
        pt.life = 0;
        pt.alpha = 0;

        // Progressive stream emission
        pt.delay = (pIdx / partCount) * 0.38;

        const jitter = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.5
        );
        pt.pos.copy(worldSeamPos).add(jitter);

        // Fluid molecular velocity: burst stream with swirling curvature
        const angle = (pIdx / partCount) * Math.PI * 4 + (Math.random() - 0.5) * 0.6;
        const radialDir = randomPerp.clone()
          .applyAxisAngle(capsuleUp, angle)
          .normalize();

        const speed = 0.38 + Math.random() * 0.75;
        pt.vel.copy(radialDir).multiplyScalar(speed);
        pt.vel.addScaledVector(capsuleUp, (Math.random() - 0.5) * 0.35);
        pt.vel.addScaledVector(capsule.vel, 1.6);
      }

      // Gentle recoil impulse to capsule
      capsule.vel.x += (Math.random() - 0.5) * 0.06;
      capsule.vel.y += (Math.random() - 0.5) * 0.06;
    };

    // Pointer Interaction: Raycasting, Hover Glow & Molecular Burst on Hover or Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-9999, -9999);
    let hoveredCapsuleIdx: number | null = null;
    let targetCameraX = 0;
    let targetCameraY = 0;
    let lastAutoTriggerTime = 0;

    const checkRaycast = (isClick = false) => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hitMeshes, false);

      if (intersects.length > 0) {
        const hitIdx = intersects[0].object.userData.capsuleIndex;
        if (hitIdx !== undefined && capsules[hitIdx]) {
          hoveredCapsuleIdx = hitIdx;
          const targetCapsule = capsules[hitIdx];
          
          // Open on hover OR click!
          if (isClick) {
            triggerCapsuleSplit(targetCapsule, true);
          } else if (targetCapsule.state === 'idle') {
            // Hover trigger
            triggerCapsuleSplit(targetCapsule, false);
          }
        }
      } else {
        hoveredCapsuleIdx = null;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / width) * 2 - 1;
      mouse.y = -(e.clientY / height) * 2 + 1;

      checkRaycast(false);
    };

    const handlePointerDown = (e: PointerEvent) => {
      mouse.x = (e.clientX / width) * 2 - 1;
      mouse.y = -(e.clientY / height) * 2 + 1;
      checkRaycast(true);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Easing helpers
    const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
    const easeInOutQuad = (x: number): number => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    // Track dynamic theme transition
    let currentThemeClinical = themeRef.current;
    let lastTime = performance.now();
    let animId: number;

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      // Dynamic Theme Switch
      if (currentThemeClinical !== themeRef.current) {
        currentThemeClinical = themeRef.current;

        ambientLight.intensity = currentThemeClinical ? 1.45 : 1.05;
        keyLight.intensity = currentThemeClinical ? 1.25 : 1.75;
        fillLight.intensity = currentThemeClinical ? 0.95 : 1.4;
        rimLight.intensity = currentThemeClinical ? 0.6 : 0.9;

        capsules.forEach(capsule => {
          const pIdx = capsule.id % pookiePalettes.length;
          const palette = pookiePalettes[pIdx];

          capsule.capMaterial.color.setHex(currentThemeClinical ? palette.capLight : palette.capDark);
          capsule.capMaterial.opacity = currentThemeClinical ? 0.62 : 0.84;
          capsule.capMaterial.roughness = currentThemeClinical ? 0.12 : 0.07;
          capsule.capMaterial.needsUpdate = true;

          capsule.bodyMaterial.color.setHex(currentThemeClinical ? palette.bodyLight : palette.bodyDark);
          capsule.bodyMaterial.opacity = currentThemeClinical ? 0.58 : 0.80;
          capsule.bodyMaterial.roughness = currentThemeClinical ? 0.14 : 0.08;
          capsule.bodyMaterial.needsUpdate = true;

          capsule.particleMaterial.blending = currentThemeClinical ? THREE.NormalBlending : THREE.AdditiveBlending;
          capsule.particleMaterial.size = (currentThemeClinical ? 1.6 : 1.45) * capsule.scale;
          capsule.particleMaterial.needsUpdate = true;
        });
      }

      // Camera remains statically centered
      camera.position.set(0, 0, 215);
      camera.lookAt(0, 0, 0);

      // Autonomous gentle ambient activation: occasionally release a delicate stream
      if (currentTime - lastAutoTriggerTime > 6500) {
        lastAutoTriggerTime = currentTime;
        const idleCapsules = capsules.filter(c => c.state === 'idle');
        if (idleCapsules.length > 0) {
          const randomIdle = idleCapsules[Math.floor(Math.random() * idleCapsules.length)];
          triggerCapsuleSplit(randomIdle);
        }
      }

      const timeSec = currentTime * 0.001;

      // ==========================================
      // 1. Natural Organic Floating Forces (Smooth & Jitter-Free)
      // ==========================================
      capsules.forEach(c => {
        // Apply smooth harmonic floating forces directly to velocity for natural drift
        const floatAccelY = Math.sin(timeSec * c.floatSpeed + c.floatPhase) * 0.0065;
        const floatAccelX = Math.cos(timeSec * (c.floatSpeed * 0.75) + c.floatPhase) * 0.0055;
        
        c.vel.y += floatAccelY;
        c.vel.x += floatAccelX;

        // Viscous fluid drag keeps speed gentle, elegant and stable
        c.vel.multiplyScalar(0.995);

        // Clamp maximum floating speed to prevent velocity accumulation
        const currentSpeed = c.vel.length();
        if (currentSpeed > 0.36) {
          c.vel.multiplyScalar(0.36 / currentSpeed);
        }

        // Integrate position
        c.pos.x += c.vel.x;
        c.pos.y += c.vel.y;
        c.pos.z += c.vel.z;
      });

      // ==========================================
      // 2. Physics-Based Smooth Non-Jittering Elastic Collisions
      // ==========================================
      const numCaps = capsules.length;
      for (let i = 0; i < numCaps; i++) {
        const c1 = capsules[i];
        for (let j = i + 1; j < numCaps; j++) {
          const c2 = capsules[j];

          // Quick spatial pruning on X, Y, Z to maximize 60fps performance
          const dx = c2.pos.x - c1.pos.x;
          const minDist = c1.colRadius + c2.colRadius;
          if (Math.abs(dx) > minDist) continue;

          const dy = c2.pos.y - c1.pos.y;
          if (Math.abs(dy) > minDist) continue;

          const dz = c2.pos.z - c1.pos.z;
          if (Math.abs(dz) > minDist) continue;

          const distSq = dx * dx + dy * dy + dz * dz;

          if (distSq < minDist * minDist && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const overlap = minDist - dist;

            // Collision unit normal
            const nx = dx / dist;
            const ny = dy / dist;
            const nz = dz / dist;

            // Smooth position relaxation: clamp separation to prevent sudden teleportation or vibration
            const separation = Math.min(overlap * 0.42, 0.32);
            c1.pos.x -= nx * separation;
            c1.pos.y -= ny * separation;
            c1.pos.z -= nz * separation;

            c2.pos.x += nx * separation;
            c2.pos.y += ny * separation;
            c2.pos.z += nz * separation;

            // Relative velocity along collision normal
            const relVx = c2.vel.x - c1.vel.x;
            const relVy = c2.vel.y - c1.vel.y;
            const relVz = c2.vel.z - c1.vel.z;
            const normalVel = relVx * nx + relVy * ny + relVz * nz;

            // Elastic bounce impulse applied only when approaching
            if (normalVel < -0.004) {
              const restitution = 0.75; // lively, smooth gelatin bounce
              const impulse = -(1 + restitution) * normalVel * 0.5;

              c1.vel.x -= nx * impulse;
              c1.vel.y -= ny * impulse;
              c1.vel.z -= nz * impulse;

              c2.vel.x += nx * impulse;
              c2.vel.y += ny * impulse;
              c2.vel.z += nz * impulse;

              // Subtle organic rotational nudge upon collision
              c1.rotSpeed.x += (Math.random() - 0.5) * 0.002;
              c1.rotSpeed.y += (Math.random() - 0.5) * 0.002;
              c2.rotSpeed.x += (Math.random() - 0.5) * 0.002;
              c2.rotSpeed.y += (Math.random() - 0.5) * 0.002;
            } else if (overlap > 0.05) {
              // Soft spring repulsion if still overlapping
              const spring = (overlap / minDist) * 0.005;
              c1.vel.x -= nx * spring;
              c1.vel.y -= ny * spring;
              c1.vel.z -= nz * spring;
              c2.vel.x += nx * spring;
              c2.vel.y += ny * spring;
              c2.vel.z += nz * spring;
            }
          }
        }
      }

      // ==========================================
      // 3. Render Positions, Hover Animation & Particles
      // ==========================================
      const xLimit = Math.max((width / 2) * 0.98, 310);
      const yLimit = Math.max((height / 2) * 0.94, 230);

      capsules.forEach(capsule => {
        // Assign final smooth collision-resolved position to Three.js Object3D
        capsule.group.position.x = capsule.pos.x;
        capsule.group.position.y = capsule.pos.y;
        capsule.group.position.z = capsule.pos.z;

        // Elegant 3D Tumbling
        capsule.group.rotation.x += capsule.rotSpeed.x;
        capsule.group.rotation.y += capsule.rotSpeed.y;
        capsule.group.rotation.z += capsule.rotSpeed.z;

        // ==========================================
        // Subtle Hover Animation: Rotation & Glow Intensity
        // ==========================================
        const isHovered = hoveredCapsuleIdx === capsule.id;
        const targetHover = isHovered ? 1.0 : 0.0;
        capsule.hoverFactor += (targetHover - capsule.hoverFactor) * 0.16;

        if (capsule.hoverFactor > 0.005) {
          // Additional gentle rotation spin when hovered
          capsule.group.rotation.y += capsule.hoverFactor * 0.024;
          capsule.group.rotation.x += capsule.hoverFactor * 0.014;

          // Increase glow intensity smoothly
          const maxGlow = currentThemeClinical ? 0.38 : 0.65;
          const currentGlow = capsule.hoverFactor * maxGlow;
          capsule.capMaterial.emissiveIntensity = currentGlow;
          capsule.bodyMaterial.emissiveIntensity = currentGlow * 0.75;

          // Subtle gentle scale expansion for tactile feedback
          const hoverScale = capsule.scale * (1.0 + capsule.hoverFactor * 0.07);
          capsule.group.scale.set(hoverScale, hoverScale, hoverScale);
        } else {
          capsule.capMaterial.emissiveIntensity = 0;
          capsule.bodyMaterial.emissiveIntensity = 0;
          capsule.group.scale.set(capsule.scale, capsule.scale, capsule.scale);
        }

        // Broad Screen boundaries wrap-around covering the entire website background
        if (capsule.pos.x > xLimit) capsule.pos.x = -xLimit;
        if (capsule.pos.x < -xLimit) capsule.pos.x = xLimit;
        if (capsule.pos.y > yLimit) capsule.pos.y = -yLimit;
        if (capsule.pos.y < -yLimit) capsule.pos.y = yLimit;
        if (capsule.pos.z > 65) capsule.pos.z = -145;
        if (capsule.pos.z < -145) capsule.pos.z = 65;

        // State Machine for Realistic Splitting & Reassembly
        const maxSplitDist = 3.6;

        if (capsule.state === 'splitting') {
          capsule.streamTimer += dt;
          capsule.splitProgress += dt * 2.0;

          if (capsule.splitProgress >= 1) {
            capsule.splitProgress = 1;
            capsule.state = 'open';
            capsule.openTimer = 1.25;
          }

          const eased = easeOutCubic(capsule.splitProgress);
          capsule.capGroup.position.y = eased * maxSplitDist;
          capsule.bodyGroup.position.y = -eased * maxSplitDist;

          // Organic tilt as halves separate
          capsule.capGroup.rotation.z = Math.sin(capsule.splitProgress * Math.PI) * 0.16;
          capsule.bodyGroup.rotation.z = -Math.sin(capsule.splitProgress * Math.PI) * 0.12;
        } else if (capsule.state === 'open') {
          capsule.streamTimer += dt;
          capsule.openTimer -= dt;
          capsule.capGroup.position.y = maxSplitDist;
          capsule.bodyGroup.position.y = -maxSplitDist;

          if (capsule.openTimer <= 0) {
            capsule.state = 'reassembling';
          }
        } else if (capsule.state === 'reassembling') {
          capsule.splitProgress -= dt * 1.5;
          if (capsule.splitProgress <= 0) {
            capsule.splitProgress = 0;
            capsule.state = 'idle';
            capsule.capGroup.position.y = 0;
            capsule.bodyGroup.position.y = 0;
            capsule.capGroup.rotation.z = 0;
            capsule.bodyGroup.rotation.z = 0;
          } else {
            const eased = easeInOutQuad(capsule.splitProgress);
            capsule.capGroup.position.y = eased * maxSplitDist;
            capsule.bodyGroup.position.y = -eased * maxSplitDist;
            capsule.capGroup.rotation.z = eased * 0.08;
            capsule.bodyGroup.rotation.z = -eased * 0.08;
          }
        }

        // Active Ingredients Sparkling Molecular Particle Stream Simulation
        // Only run particle computations if capsule is open/splitting or has lingering particles
        if (capsule.state !== 'idle' || capsule.particleMaterial.opacity > 0) {
          let hasActiveParticles = false;
          const posArray = capsule.particlePosAttr.array as Float32Array;
          const colArray = capsule.particleColAttr.array as Float32Array;

          const currentSeamPos = new THREE.Vector3();
          capsule.group.getWorldPosition(currentSeamPos);

          const pCount = capsule.particles.length;
          for (let p = 0; p < pCount; p++) {
            const pt = capsule.particles[p];

            // Progressive cascade release
            if (!pt.active && (capsule.state === 'splitting' || capsule.state === 'open')) {
              if (capsule.streamTimer >= pt.delay) {
                pt.active = true;
                pt.pos.copy(currentSeamPos).add(new THREE.Vector3(
                  (Math.random() - 0.5) * 0.45,
                  (Math.random() - 0.5) * 0.35,
                  (Math.random() - 0.5) * 0.45
                ));
                pt.alpha = 0.05;
              }
            }

            if (pt.active && pt.life < pt.maxLife) {
              hasActiveParticles = true;
              pt.life += dt;

              // Fluid viscosity drag & gentle upward buoyancy
              pt.pos.addScaledVector(pt.vel, dt * 55);
              pt.vel.multiplyScalar(0.966);

              // Graceful swirling curl force (molecular stream effect)
              const curlAngle = pt.life * pt.curlSpeed + pt.curlPhase;
              pt.pos.x += Math.sin(curlAngle) * 0.018;
              pt.pos.z += Math.cos(curlAngle) * 0.018;
              pt.pos.y += 0.016; // gentle buoyant effervescence

              // Delicate alpha envelope
              const normLife = pt.life / pt.maxLife;
              if (normLife < 0.12) {
                pt.alpha = normLife / 0.12;
              } else {
                pt.alpha = Math.max(0, 1 - (normLife - 0.12) / 0.88);
              }

              posArray[p * 3] = pt.pos.x;
              posArray[p * 3 + 1] = pt.pos.y;
              posArray[p * 3 + 2] = pt.pos.z;

              // Sparkling twinkle effect: subtle shimmer in particle brightness
              const twinkle = Math.sin(timeSec * pt.twinkleSpeed + pt.curlPhase * 4.0) * 0.35 + 0.65;
              const brightness = pt.alpha * twinkle * 0.98;

              colArray[p * 3] = pt.color.r * brightness;
              colArray[p * 3 + 1] = pt.color.g * brightness;
              colArray[p * 3 + 2] = pt.color.b * brightness;
            } else {
              posArray[p * 3] = 0;
              posArray[p * 3 + 1] = 0;
              posArray[p * 3 + 2] = 0;
              colArray[p * 3] = 0;
              colArray[p * 3 + 1] = 0;
              colArray[p * 3 + 2] = 0;
            }
          }

          if (hasActiveParticles) {
            capsule.particleMaterial.opacity = 1;
            capsule.particlePosAttr.needsUpdate = true;
            capsule.particleColAttr.needsUpdate = true;
          } else {
            capsule.particleMaterial.opacity = 0;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // Thorough Resource Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();

      capCylGeo.dispose();
      capDomeGeo.dispose();
      bodyCylGeo.dispose();
      bodyDomeGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      hitSphereGeo.dispose();
      sparkleTexture.dispose();

      capsules.forEach(c => {
        c.capMaterial.dispose();
        c.bodyMaterial.dispose();
        c.particlePoints.geometry.dispose();
        c.particleMaterial.dispose();
      });
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden" />;
};

