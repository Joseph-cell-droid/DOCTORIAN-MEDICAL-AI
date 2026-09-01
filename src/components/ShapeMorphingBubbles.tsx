import React, { useEffect, useRef, memo, useState, useCallback } from 'react';

interface ShapeMorphingBubblesProps {
  className?: string;
  bubbleCount?: number;
}

// Optical-grade bioluminescent & clinical jewel palette
interface BeadColorDef {
  name: string;
  r: number;
  g: number;
  b: number;
  highlight: string;
  core: string;
  shadow: string;
  glow: string;
}

const HEALTH_BEAD_PALETTE: BeadColorDef[] = [
  { name: 'Oxygen Cyan', r: 6, g: 182, b: 212, highlight: 'rgba(207, 250, 254, 0.98)', core: '#06b6d4', shadow: '#0e7490', glow: 'rgba(6, 182, 212, 0.65)' },
  { name: 'Cardio Crimson', r: 244, g: 63, b: 94, highlight: 'rgba(255, 228, 230, 0.98)', core: '#f43f5e', shadow: '#be123c', glow: 'rgba(244, 63, 94, 0.65)' },
  { name: 'Vital Emerald', r: 16, g: 185, b: 129, highlight: 'rgba(209, 250, 229, 0.98)', core: '#10b981', shadow: '#047857', glow: 'rgba(16, 185, 129, 0.65)' },
  { name: 'Neural Violet', r: 139, g: 92, b: 246, highlight: 'rgba(243, 232, 255, 0.98)', core: '#8b5cf6', shadow: '#5b21b6', glow: 'rgba(139, 92, 246, 0.65)' },
  { name: 'Clinical Sapphire', r: 59, g: 130, b: 246, highlight: 'rgba(219, 234, 254, 0.98)', core: '#3b82f6', shadow: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.65)' },
  { name: 'Bioluminescent Amber', r: 245, g: 158, b: 11, highlight: 'rgba(254, 243, 199, 0.98)', core: '#f59e0b', shadow: '#b45309', glow: 'rgba(245, 158, 11, 0.65)' },
  { name: 'Plasma Rose', r: 236, g: 72, b: 153, highlight: 'rgba(253, 232, 242, 0.98)', core: '#ec4899', shadow: '#9d174d', glow: 'rgba(236, 72, 153, 0.65)' },
  { name: 'Cellular Turquoise', r: 20, g: 184, b: 166, highlight: 'rgba(204, 251, 241, 0.98)', core: '#14b8a6', shadow: '#0f766e', glow: 'rgba(20, 184, 166, 0.65)' },
];

export type HealthBeadShape = 
  | 'dna_helix' 
  | 'cardiac_heart' 
  | 'ecg_waveform' 
  | 'medical_cross' 
  | 'cellular_shield' 
  | 'neural_synapse' 
  | 'pharma_capsule' 
  | 'stethoscope_array';

interface ShapeMetadata {
  id: HealthBeadShape;
  label: string;
  medicalCategory: string;
  icon: string;
}

const HEALTH_SHAPES: ShapeMetadata[] = [
  { id: 'dna_helix', label: 'DNA Double Helix', medicalCategory: 'Genomics & Molecular Biology', icon: '🧬' },
  { id: 'cardiac_heart', label: 'Cardiac Heart Pulse', medicalCategory: 'Cardiovascular Dynamics', icon: '❤️' },
  { id: 'ecg_waveform', label: 'ECG Cardiac Telemetry', medicalCategory: 'Electrophysiology (P-Q-R-S-T)', icon: '📈' },
  { id: 'medical_cross', label: 'Geneva Medical Cross', medicalCategory: 'Emergency & Clinical First-Aid', icon: '🏥' },
  { id: 'cellular_shield', label: 'Bio-Immune Cell Shield', medicalCategory: 'Immunology & Cellular Defense', icon: '🛡️' },
  { id: 'neural_synapse', label: 'Neural Synaptic Core', medicalCategory: 'Neurobiology & Synaptics', icon: '🧠' },
  { id: 'pharma_capsule', label: 'Pharmaceutical Bio-Capsule', medicalCategory: 'Pharmacology & Therapeutics', icon: '💊' },
  { id: 'stethoscope_array', label: 'Diagnostic Stethoscope', medicalCategory: 'Auscultation & Clinical Bedside', icon: '🩺' },
];

export const ShapeMorphingBubbles: React.FC<ShapeMorphingBubblesProps> = memo(({
  className = '',
  bubbleCount = 44
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeShapeMeta, setActiveShapeMeta] = useState<ShapeMetadata>(HEALTH_SHAPES[0]);
  const currentShapeIndexRef = useRef<number>(0);
  const triggerNextShapeRef = useRef<() => void>(() => {});

  const handleManualShapeCycle = useCallback(() => {
    if (triggerNextShapeRef.current) {
      triggerNextShapeRef.current();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Pointer physics
    const mouse = {
      x: -1000,
      y: -1000,
      isHovering: false,
      radius: 95,
      vx: 0,
      vy: 0,
      prevX: -1000,
      prevY: -1000,
    };

    const updateDimensions = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width || 600;
      height = rect.height || 260;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // Mouse & Touch interaction
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      mouse.vx = newX - mouse.prevX;
      mouse.vy = newY - mouse.prevY;
      mouse.prevX = mouse.x = newX;
      mouse.prevY = mouse.y = newY;
      mouse.isHovering = true;
    };

    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isHovering = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const newX = touch.clientX - rect.left;
        const newY = touch.clientY - rect.top;
        mouse.vx = newX - mouse.prevX;
        mouse.vy = newY - mouse.prevY;
        mouse.prevX = mouse.x = newX;
        mouse.prevY = mouse.y = newY;
        mouse.isHovering = true;
      }
    };

    const onTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isHovering = false;
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    // Initialize 44-50 high-precision beads
    const count = Math.min(Math.max(bubbleCount, 36), 56);
    const beads = Array.from({ length: count }).map((_, i) => {
      const palette = HEALTH_BEAD_PALETTE[i % HEALTH_BEAD_PALETTE.length];
      const radius = 5.0 + (i % 6) * 0.45;
      return {
        x: Math.random() * (width || 600),
        y: Math.random() * (height || 260),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius,
        mass: radius * 0.28,
        color: palette,
        phaseOffset: i / count,
        orbitAngle: (i / count) * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        glowIntensity: 0.7,
      };
    });

    let currentShapeIndex = 0;
    let nextShapeIndex = 1;
    let shapeProgress = 0;
    let isMorphing = false;
    let shapeTimer = 0;
    let globalTime = 0;
    let seriesProgress = 0;

    const SHAPE_DURATION = 360; // ~6 seconds per shape display
    const MORPH_DURATION = 90;  // ~1.5 seconds smooth transition

    const triggerNextFormation = () => {
      if (isMorphing) return;
      isMorphing = true;
      shapeProgress = 0;
      nextShapeIndex = (currentShapeIndex + 1) % HEALTH_SHAPES.length;
    };

    triggerNextShapeRef.current = triggerNextFormation;

    // Mathematical Health-Only Vector Formations
    const getHealthShapePoint = (shape: HealthBeadShape, u: number, tTime: number): { x: number; y: number } => {
      const theta = u * Math.PI * 2;

      switch (shape) {
        // 1. DNA Double Helix: Intertwined strands with 3D projection & depth
        case 'dna_helix': {
          const isSecondStrand = u >= 0.5;
          const localU = isSecondStrand ? (u - 0.5) * 2 : u * 2;
          const x = (localU - 0.5) * 1.8;
          const phase = isSecondStrand ? Math.PI : 0;
          const wave = Math.sin(localU * Math.PI * 3.5 + tTime * 1.8 + phase);
          const zDepth = Math.cos(localU * Math.PI * 3.5 + tTime * 1.8 + phase);
          const y = wave * 0.45 * (0.85 + 0.15 * zDepth);
          return { x, y };
        }

        // 2. Cardiac Heart Pulse: True medical cardio-curve with rhythmic systolic beat
        case 'cardiac_heart': {
          const t = theta - Math.PI / 2;
          const heartPulse = 1 + 0.08 * Math.sin(tTime * 3.8);
          const x = (16 * Math.pow(Math.sin(t), 3)) / 17;
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17;
          return {
            x: x * 0.76 * heartPulse,
            y: (y * 0.72 - 0.05) * heartPulse,
          };
        }

        // 3. ECG Waveform: P-Q-R-S-T Clinical Telemetry Wave
        case 'ecg_waveform': {
          const scanU = (u + tTime * 0.05) % 1;
          const x = (scanU - 0.5) * 1.9;
          let y = 0;

          // Standard cardiac rhythm cycle
          if (scanU >= 0.15 && scanU < 0.25) {
            // P-Wave (Atrial Depolarization)
            y = -0.16 * Math.sin(((scanU - 0.15) / 0.10) * Math.PI);
          } else if (scanU >= 0.32 && scanU < 0.35) {
            // Q-Wave (Septal Depolarization)
            y = 0.12 * Math.sin(((scanU - 0.32) / 0.03) * Math.PI);
          } else if (scanU >= 0.35 && scanU < 0.42) {
            // R-Wave Spike (Ventricular Depolarization)
            const rPhase = (scanU - 0.35) / 0.07;
            y = -0.85 * Math.sin(rPhase * Math.PI);
          } else if (scanU >= 0.42 && scanU < 0.46) {
            // S-Wave
            y = 0.22 * Math.sin(((scanU - 0.42) / 0.04) * Math.PI);
          } else if (scanU >= 0.58 && scanU < 0.72) {
            // T-Wave (Ventricular Repolarization)
            y = -0.28 * Math.sin(((scanU - 0.58) / 0.14) * Math.PI);
          } else {
            // Isoelectric baseline with gentle respiratory baseline fluctuation
            y = 0.02 * Math.sin(scanU * Math.PI * 6 + tTime);
          }
          return { x, y };
        }

        // 4. Geneva Medical Cross / Emergency First Aid Cross
        case 'medical_cross': {
          const segments = 12;
          const seg = (u * segments) % segments;
          const frac = seg % 1;
          const idx = Math.floor(seg);

          // 12 vertices of symmetrical clinical cross
          const crossVertices = [
            { x: -0.25, y: -0.75 }, { x: 0.25, y: -0.75 },
            { x: 0.25, y: -0.25 }, { x: 0.75, y: -0.25 },
            { x: 0.75, y: 0.25 },  { x: 0.25, y: 0.25 },
            { x: 0.25, y: 0.75 },  { x: -0.25, y: 0.75 },
            { x: -0.25, y: 0.25 }, { x: -0.75, y: 0.25 },
            { x: -0.75, y: -0.25 }, { x: -0.25, y: -0.25 },
          ];

          const p1 = crossVertices[idx];
          const p2 = crossVertices[(idx + 1) % segments];
          return {
            x: (p1.x + (p2.x - p1.x) * frac) * 0.85,
            y: (p1.y + (p2.y - p1.y) * frac) * 0.75,
          };
        }

        // 5. Bio-Immune Cellular Shield / Macrophage Envelope
        case 'cellular_shield': {
          const hexSides = 6;
          const seg = (u * hexSides) % hexSides;
          const frac = seg % 1;
          const idx = Math.floor(seg);

          const membraneCorners = Array.from({ length: hexSides }).map((_, ci) => {
            const a = (ci / hexSides) * Math.PI * 2 - Math.PI / 6;
            const receptorPulse = 1 + 0.05 * Math.sin(tTime * 2 + ci);
            return {
              x: Math.cos(a) * 0.78 * receptorPulse,
              y: Math.sin(a) * 0.68 * receptorPulse
            };
          });

          const p1 = membraneCorners[idx];
          const p2 = membraneCorners[(idx + 1) % hexSides];
          return {
            x: p1.x + (p2.x - p1.x) * frac,
            y: p1.y + (p2.y - p1.y) * frac,
          };
        }

        // 6. Neural Synaptic Core: Soma with radiating synaptic axons
        case 'neural_synapse': {
          const arms = 5;
          const armIndex = Math.floor(u * arms);
          const armU = (u * arms) % 1;
          const baseAngle = (armIndex / arms) * Math.PI * 2 + tTime * 0.25;

          if (armU < 0.35) {
            // Central neuronal soma core
            const coreAngle = theta + tTime * 0.5;
            return {
              x: Math.cos(coreAngle) * 0.22,
              y: Math.sin(coreAngle) * 0.22,
            };
          } else {
            // Radiating dendritic axon branches
            const dist = 0.22 + (armU - 0.35) * 0.95;
            const branchWave = 0.12 * Math.sin(dist * 12 + tTime * 3);
            const finalAngle = baseAngle + branchWave;
            return {
              x: Math.cos(finalAngle) * dist * 0.78,
              y: Math.sin(finalAngle) * dist * 0.65,
            };
          }
        }

        // 7. Pharmaceutical Bio-Capsule
        case 'pharma_capsule': {
          const half = u < 0.5 ? 0 : 1;
          const localU = (u % 0.5) * 2;
          const tAngle = localU * Math.PI * 2;

          if (half === 0) {
            // Left hemispherical cap & body
            const cx = -0.38 + Math.min(0, Math.cos(tAngle)) * 0.32;
            const cy = Math.sin(tAngle) * 0.38;
            return { x: cx, y: cy };
          } else {
            // Right hemispherical cap & body
            const cx = 0.38 + Math.max(0, Math.cos(tAngle)) * 0.32;
            const cy = Math.sin(tAngle) * 0.38;
            return { x: cx, y: cy };
          }
        }

        // 8. Diagnostic Stethoscope & Auscultation Array
        case 'stethoscope_array':
        default: {
          if (u < 0.4) {
            // Binaural ear-tube loop
            const tubeU = u / 0.4;
            const angle = Math.PI * (0.15 + tubeU * 0.7);
            const x = Math.cos(angle) * 0.65;
            const y = -0.55 + Math.sin(angle) * 0.45;
            return { x, y };
          } else if (u < 0.7) {
            // Flowing acoustic stem
            const stemU = (u - 0.4) / 0.3;
            const x = Math.sin(stemU * Math.PI * 2 + tTime) * 0.12;
            const y = -0.15 + stemU * 0.55;
            return { x, y };
          } else {
            // Chestpiece diaphragm circle
            const circleU = (u - 0.7) / 0.3;
            const circleAngle = circleU * Math.PI * 2;
            const r = 0.28;
            return {
              x: Math.cos(circleAngle) * r,
              y: 0.42 + Math.sin(circleAngle) * r,
            };
          }
        }
      }
    };

    const render = () => {
      globalTime += 0.019;
      seriesProgress += 0.0022;
      shapeTimer++;

      // Continuous automatic morphing cycle
      if (shapeTimer > SHAPE_DURATION && !isMorphing) {
        isMorphing = true;
        shapeProgress = 0;
        nextShapeIndex = (currentShapeIndex + 1) % HEALTH_SHAPES.length;
      }

      if (isMorphing) {
        shapeProgress += 1 / MORPH_DURATION;
        if (shapeProgress >= 1) {
          shapeProgress = 1;
          currentShapeIndex = nextShapeIndex;
          currentShapeIndexRef.current = currentShapeIndex;
          isMorphing = false;
          shapeTimer = 0;
          setActiveShapeMeta(HEALTH_SHAPES[currentShapeIndex]);
        }
      }

      ctx.clearRect(0, 0, width, height);

      const currentShape = HEALTH_SHAPES[currentShapeIndex].id;
      const nextShape = HEALTH_SHAPES[nextShapeIndex].id;

      // Smooth cubic ease for pristine shape morphing
      const easeT = shapeProgress < 0.5
        ? 4 * shapeProgress * shapeProgress * shapeProgress
        : 1 - Math.pow(-2 * shapeProgress + 2, 3) / 2;

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const rx = Math.min(width * 0.45, 320);
      const ry = Math.min(height * 0.45, 140);

      // --- 1. Compute Physics & Path Forces ---
      beads.forEach((b) => {
        const u = (seriesProgress + b.phaseOffset) % 1;
        const ptA = getHealthShapePoint(currentShape, u, globalTime);
        const ptB = getHealthShapePoint(nextShape, u, globalTime);

        const normX = ptA.x * (1 - easeT) + ptB.x * easeT;
        const normY = ptA.y * (1 - easeT) + ptB.y * easeT;

        const targetX = centerX + normX * rx;
        const targetY = centerY + normY * ry;

        const forceWeight = isMorphing ? 0.095 : 0.07;
        b.vx += (targetX - b.x) * forceWeight;
        b.vy += (targetY - b.y) * forceWeight;

        // Pointer scatter / repulsion wave
        if (mouse.isHovering) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius + b.radius && dist > 1) {
            const force = (1 - dist / (mouse.radius + b.radius)) * 3.2;
            const nx = dx / dist;
            const ny = dy / dist;
            b.vx += nx * force + mouse.vx * 0.25;
            b.vy += ny * force + mouse.vy * 0.25;
            b.glowIntensity = 1.5;
          }
        }

        // Kinetic damping
        b.vx *= 0.90;
        b.vy *= 0.90;

        // Apply velocity
        b.x += b.vx;
        b.y += b.vy;

        // Containment padding
        const pad = b.radius + 6;
        if (b.x < pad) { b.x = pad; b.vx *= -0.75; }
        else if (b.x > width - pad) { b.x = width - pad; b.vx *= -0.75; }

        if (b.y < pad) { b.y = pad; b.vy *= -0.75; }
        else if (b.y > height - pad) { b.y = height - pad; b.vy *= -0.75; }

        b.pulsePhase += 0.055;
        b.glowIntensity = Math.max(0.45, b.glowIntensity * 0.98);
      });

      // --- 2. Elastic Collisions Between Beads ---
      for (let i = 0; i < beads.length; i++) {
        for (let j = i + 1; j < beads.length; j++) {
          const b1 = beads[i];
          const b2 = beads[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius + 1.2;

          if (dist < minDist && dist > 0.05) {
            const overlap = (minDist - dist) * 0.5;
            const nx = dx / dist;
            const ny = dy / dist;

            b1.x -= nx * overlap;
            b1.y -= ny * overlap;
            b2.x += nx * overlap;
            b2.y += ny * overlap;

            const kx = b1.vx - b2.vx;
            const ky = b1.vy - b2.vy;
            const p = 2 * (nx * kx + ny * ky) / (b1.mass + b2.mass);

            b1.vx -= p * b2.mass * nx * 0.65;
            b1.vy -= p * b2.mass * ny * 0.65;
            b2.vx += p * b1.mass * nx * 0.65;
            b2.vy += p * b1.mass * ny * 0.65;
          }
        }
      }

      // --- 3. Draw Medical Synaptic Filaments / Telemetry Connectors ---
      ctx.save();
      for (let i = 0; i < beads.length; i++) {
        const p1 = beads[i];
        const p2 = beads[(i + 1) % beads.length];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (dist < Math.min(width, height) * 0.38) {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, 0.42)`);
          grad.addColorStop(1, `rgba(${p2.color.r}, ${p2.color.g}, ${p2.color.b}, 0.42)`);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Traveling action potential / bio-photon
          const pulseT = (globalTime * 2.2 + i * 0.25) % 1;
          const px = p1.x + (p2.x - p1.x) * pulseT;
          const py = p1.y + (p2.y - p1.y) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 4;
          ctx.fill();
        }
      }
      ctx.restore();

      // --- 4. Render 3D Optical Glass / Jewel Health Beads ---
      beads.forEach((b) => {
        const pulse = 1 + 0.035 * Math.sin(b.pulsePhase);
        const r = b.radius * pulse;

        ctx.save();
        ctx.translate(b.x, b.y);

        // A. Soft bioluminescent halo
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = b.color.glow;
        ctx.fill();

        // B. 3D Spherical Radial Gradient
        const lightOffsetX = -r * 0.38;
        const lightOffsetY = -r * 0.38;
        const grad = ctx.createRadialGradient(
          lightOffsetX,
          lightOffsetY,
          r * 0.1,
          0,
          0,
          r
        );
        grad.addColorStop(0, b.color.highlight);
        grad.addColorStop(0.35, b.color.core);
        grad.addColorStop(0.85, b.color.shadow);
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.7)');

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // C. Microscopic Medical Cross (+) Accent on larger beads
        if (r > 6.0) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.35, 0);
          ctx.lineTo(r * 0.35, 0);
          ctx.moveTo(0, -r * 0.35);
          ctx.lineTo(0, r * 0.35);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // D. 3D Glass Rim
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // E. Secondary Bottom-Right Internal Refraction
        ctx.beginPath();
        ctx.arc(r * 0.28, r * 0.28, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${b.color.r}, ${b.color.g}, ${b.color.b}, 0.35)`;
        ctx.fill();

        // F. Pinpoint White Specular Glint (Top-Left Light Source)
        ctx.beginPath();
        ctx.arc(lightOffsetX, lightOffsetY, r * 0.26, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [bubbleCount]);

  return (
    <div 
      ref={containerRef} 
      onClick={handleManualShapeCycle}
      className={`absolute inset-0 pointer-events-auto overflow-hidden select-none z-0 cursor-pointer ${className}`}
      title="Continuous Health Morphing Matrix • Click or Tap to Cycle Health Formation"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Modern Medical HUD Badge */}
      <div 
        id="health-shape-hud-badge"
        className="absolute top-3 right-4 z-10 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 dark:bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[10px] font-bold text-cyan-200 shadow-lg transition-all duration-300 hover:border-cyan-400"
      >
        <span className="text-xs">{activeShapeMeta.icon}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-wide uppercase font-mono">{activeShapeMeta.label}</span>
        <span className="hidden md:inline-block text-slate-400 text-[9px] border-l border-cyan-500/30 pl-2">
          {activeShapeMeta.medicalCategory}
        </span>
      </div>
    </div>
  );
});
