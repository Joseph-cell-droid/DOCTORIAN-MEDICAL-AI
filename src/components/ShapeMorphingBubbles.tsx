import React, { useEffect, useRef, memo, useState } from 'react';

interface ShapeMorphingBubblesProps {
  className?: string;
  bubbleCount?: number;
}

// Crisp Antigravity Material Symbols / Cyber Node definitions matching the video
interface AntigravityBubbleData {
  icon: string;      // Material icon or clean cyber symbol
  label: string;     // e.g. refresh, file_copy, spark, etc.
  symbolType: 'material' | 'emoji';
  color: {
    r: number;
    g: number;
    b: number;
    border: string;
    bgGrad: string;
    glow: string;
  };
}

const ANTIGRAVITY_ICONS: AntigravityBubbleData[] = [
  { icon: 'refresh', label: 'refresh', symbolType: 'material', color: { r: 56, g: 189, b: 248, border: 'rgba(56, 189, 248, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(56, 189, 248, 0.4)' } },
  { icon: 'file_copy', label: 'file_copy', symbolType: 'material', color: { r: 129, g: 140, b: 248, border: 'rgba(129, 140, 248, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(129, 140, 248, 0.4)' } },
  { icon: 'spark', label: 'spark', symbolType: 'material', color: { r: 52, g: 211, b: 153, border: 'rgba(52, 211, 153, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(52, 211, 153, 0.4)' } },
  { icon: 'keyboard_return', label: 'return', symbolType: 'material', color: { r: 244, g: 63, b: 94, border: 'rgba(244, 63, 94, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(244, 63, 94, 0.4)' } },
  { icon: 'airplay', label: 'mode_tv', symbolType: 'material', color: { r: 251, g: 191, b: 36, border: 'rgba(251, 191, 36, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(251, 191, 36, 0.4)' } },
  { icon: 'play_arrow', label: 'play_arrow', symbolType: 'material', color: { r: 167, g: 139, b: 250, border: 'rgba(167, 139, 250, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(167, 139, 250, 0.4)' } },
  { icon: 'dashboard', label: 'dash_pen', symbolType: 'material', color: { r: 34, g: 211, b: 238, border: 'rgba(34, 211, 238, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(34, 211, 238, 0.4)' } },
  { icon: 'crop_free', label: 'scanner', symbolType: 'material', color: { r: 232, g: 121, b: 249, border: 'rgba(232, 121, 249, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(232, 121, 249, 0.4)' } },
  { icon: 'arrow_back', label: 'nav_back', symbolType: 'material', color: { r: 74, g: 222, b: 128, border: 'rgba(74, 222, 128, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(74, 222, 128, 0.4)' } },
  { icon: 'radio_button_checked', label: 'target', symbolType: 'material', color: { r: 251, g: 113, b: 133, border: 'rgba(251, 113, 133, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(251, 113, 133, 0.4)' } },
  { icon: 'memory', label: 'ai_core', symbolType: 'material', color: { r: 96, g: 165, b: 250, border: 'rgba(96, 165, 250, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(96, 165, 250, 0.4)' } },
  { icon: 'hub', label: 'network', symbolType: 'material', color: { r: 45, g: 212, b: 191, border: 'rgba(45, 212, 191, 0.75)', bgGrad: 'rgba(255, 255, 255, 0.92)', glow: 'rgba(45, 212, 191, 0.4)' } },
];

type CyberShape = 'free_antigravity' | 'infinity' | 'dna_helix' | 'heart' | 'star' | 'circle' | 'hex_shield';
const CYBER_SHAPES: CyberShape[] = ['free_antigravity', 'infinity', 'dna_helix', 'heart', 'star', 'hex_shield', 'circle'];

export const ShapeMorphingBubbles: React.FC<ShapeMorphingBubblesProps> = memo(({
  className = '',
  bubbleCount = 20
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState<string>('Antigravity Physics');

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

    // Pointer coordinates for Antigravity interactive force field & flinging
    const mouse = {
      x: -1000,
      y: -1000,
      isHovering: false,
      radius: 90,
      vx: 0,
      vy: 0,
      prevX: -1000,
      prevY: -1000,
    };

    const updateDimensions = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width || 600;
      height = rect.height || 300;
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

    // Track user mouse / touch interaction for antigravity particle flinging
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

    // Initialise smaller, sleek Antigravity bubbles (12px to 17px radius = 24-34px diameter)
    const count = Math.min(Math.max(bubbleCount, 16), 26);
    const bubbles = Array.from({ length: count }).map((_, i) => {
      const data = ANTIGRAVITY_ICONS[i % ANTIGRAVITY_ICONS.length];
      // Sleek, smaller size as requested (radius between 12px and 16.5px)
      const radius = 12 + (i % 4) * 1.5;
      return {
        x: Math.random() * (width || 600),
        y: Math.random() * (height || 300),
        vx: (Math.random() - 0.5) * 1.4,
        vy: -0.3 - Math.random() * 0.7, // Upward buoyant float
        radius,
        mass: radius * 0.15,
        data,
        phaseOffset: i / count,
        orbitAngle: (i / count) * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        glowIntensity: 0.6,
        rotation: (Math.random() - 0.5) * 0.2,
      };
    });

    let currentShapeIndex = 0;
    let nextShapeIndex = 1;
    let shapeProgress = 0;
    let isMorphing = false;
    let shapeTimer = 0;
    let globalTime = 0;
    let seriesProgress = 0;

    const SHAPE_DURATION = 360;
    const MORPH_DURATION = 90;

    // Helper: draw clean vector icons matching Google Antigravity
    const drawAntigravityIcon = (context: CanvasRenderingContext2D, iconName: string, size: number) => {
      context.save();
      context.lineWidth = 1.5;
      context.strokeStyle = '#1e293b';
      context.fillStyle = '#1e293b';
      context.lineCap = 'round';
      context.lineJoin = 'round';

      const s = size * 0.52;

      switch (iconName) {
        case 'refresh': {
          context.beginPath();
          context.arc(0, 0, s * 0.75, 0.4, Math.PI * 1.7);
          context.stroke();
          // Arrow head
          context.beginPath();
          context.moveTo(s * 0.45, -s * 0.75);
          context.lineTo(s * 0.75, -s * 0.55);
          context.lineTo(s * 0.85, -s * 0.95);
          context.stroke();
          break;
        }
        case 'file_copy': {
          // Front and back cards
          context.strokeRect(-s * 0.35, -s * 0.35, s * 0.8, s * 0.9);
          context.beginPath();
          context.moveTo(-s * 0.65, s * 0.2);
          context.lineTo(-s * 0.65, -s * 0.65);
          context.lineTo(s * 0.15, -s * 0.65);
          context.stroke();
          break;
        }
        case 'spark': {
          // 4-point sparkle star
          context.beginPath();
          context.moveTo(0, -s * 0.9);
          context.quadraticCurveTo(0, 0, s * 0.9, 0);
          context.quadraticCurveTo(0, 0, 0, s * 0.9);
          context.quadraticCurveTo(0, 0, -s * 0.9, 0);
          context.quadraticCurveTo(0, 0, 0, -s * 0.9);
          context.fill();
          break;
        }
        case 'keyboard_return': {
          context.beginPath();
          context.moveTo(s * 0.6, -s * 0.5);
          context.lineTo(s * 0.6, s * 0.2);
          context.lineTo(-s * 0.5, s * 0.2);
          context.stroke();
          // Arrow head
          context.beginPath();
          context.moveTo(-s * 0.2, -s * 0.1);
          context.lineTo(-s * 0.6, s * 0.2);
          context.lineTo(-s * 0.2, s * 0.5);
          context.stroke();
          break;
        }
        case 'airplay': {
          context.strokeRect(-s * 0.7, -s * 0.6, s * 1.4, s * 0.85);
          context.beginPath();
          context.moveTo(-s * 0.3, s * 0.6);
          context.lineTo(0, s * 0.25);
          context.lineTo(s * 0.3, s * 0.6);
          context.closePath();
          context.fill();
          break;
        }
        case 'play_arrow': {
          context.beginPath();
          context.moveTo(-s * 0.4, -s * 0.65);
          context.lineTo(s * 0.65, 0);
          context.lineTo(-s * 0.4, s * 0.65);
          context.closePath();
          context.fill();
          break;
        }
        case 'dashboard': {
          context.strokeRect(-s * 0.7, -s * 0.7, s * 0.6, s * 0.6);
          context.strokeRect(s * 0.1, -s * 0.7, s * 0.6, s * 0.4);
          context.strokeRect(-s * 0.7, s * 0.1, s * 0.6, s * 0.6);
          context.strokeRect(s * 0.1, -s * 0.1, s * 0.6, s * 0.8);
          break;
        }
        case 'crop_free': {
          const c = s * 0.7;
          context.beginPath();
          // 4 corner brackets
          context.moveTo(-c, -c + 4); context.lineTo(-c, -c); context.lineTo(-c + 4, -c);
          context.moveTo(c - 4, -c); context.lineTo(c, -c); context.lineTo(c, -c + 4);
          context.moveTo(c, c - 4); context.lineTo(c, c); context.lineTo(c - 4, c);
          context.moveTo(-c + 4, c); context.lineTo(-c, c); context.lineTo(-c, c - 4);
          context.stroke();
          break;
        }
        case 'arrow_back': {
          context.beginPath();
          context.moveTo(s * 0.6, 0);
          context.lineTo(-s * 0.6, 0);
          context.stroke();
          context.beginPath();
          context.moveTo(-s * 0.2, -s * 0.4);
          context.lineTo(-s * 0.6, 0);
          context.lineTo(-s * 0.2, s * 0.4);
          context.stroke();
          break;
        }
        case 'memory': {
          context.strokeRect(-s * 0.45, -s * 0.45, s * 0.9, s * 0.9);
          context.fillRect(-s * 0.2, -s * 0.2, s * 0.4, s * 0.4);
          context.beginPath();
          // pins
          context.moveTo(-s * 0.7, -s * 0.2); context.lineTo(-s * 0.45, -s * 0.2);
          context.moveTo(-s * 0.7, s * 0.2); context.lineTo(-s * 0.45, s * 0.2);
          context.moveTo(s * 0.7, -s * 0.2); context.lineTo(s * 0.45, -s * 0.2);
          context.moveTo(s * 0.7, s * 0.2); context.lineTo(s * 0.45, s * 0.2);
          context.stroke();
          break;
        }
        default: {
          context.beginPath();
          context.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          context.fill();
          break;
        }
      }
      context.restore();
    };

    // Parametric Formations
    const getShapePoint = (shape: CyberShape, u: number, tTime: number): { x: number; y: number } => {
      const theta = u * Math.PI * 2;

      switch (shape) {
        case 'infinity': {
          const scale = 0.84;
          const denom = 1 + Math.sin(theta) * Math.sin(theta);
          const x = (scale * Math.cos(theta)) / (denom || 1);
          const y = ((scale * Math.sin(theta) * Math.cos(theta)) / (denom || 1)) * 1.35;
          return { x, y };
        }
        case 'heart': {
          const t = theta - Math.PI / 2;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          return {
            x: (x / 18) * 0.72,
            y: (y / 18) * 0.62 - 0.05,
          };
        }
        case 'dna_helix': {
          const strand = u < 0.5 ? 1 : -1;
          const strandU = (u % 0.5) * 2;
          const x = (strandU - 0.5) * 1.65;
          const y = Math.sin(strandU * Math.PI * 4 + tTime * 1.8) * 0.45 * strand;
          return { x, y };
        }
        case 'star': {
          const points = 5;
          const r1 = 0.72;
          const r2 = 0.35;
          const starAngle = theta;
          const step = Math.PI / points;
          const k = Math.floor(starAngle / step);
          const f = (starAngle - k * step) / step;
          const r = (k % 2 === 0) ? r1 * (1 - f) + r2 * f : r2 * (1 - f) + r1 * f;
          return {
            x: Math.cos(starAngle - Math.PI / 2) * r * 0.82,
            y: Math.sin(starAngle - Math.PI / 2) * r * 0.82,
          };
        }
        case 'hex_shield': {
          const seg = (u * 6) % 6;
          const frac = seg % 1;
          const idx = Math.floor(seg);
          const corners = Array.from({ length: 6 }).map((_, ci) => {
            const a = (ci / 6) * Math.PI * 2 - Math.PI / 6;
            return { x: Math.cos(a) * 0.78, y: Math.sin(a) * 0.68 };
          });
          const p1 = corners[idx];
          const p2 = corners[(idx + 1) % 6];
          return {
            x: p1.x + (p2.x - p1.x) * frac,
            y: p1.y + (p2.y - p1.y) * frac,
          };
        }
        case 'circle': {
          const r = 0.68 + 0.03 * Math.sin(theta * 4 + tTime * 2);
          return {
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r * 0.75,
          };
        }
        case 'free_antigravity':
        default:
          return {
            x: Math.cos(theta + tTime * 0.5) * 0.5,
            y: Math.sin(theta + tTime * 0.5) * 0.5,
          };
      }
    };

    const render = () => {
      globalTime += 0.016;
      seriesProgress += 0.0022;
      shapeTimer++;

      if (shapeTimer > SHAPE_DURATION) {
        if (!isMorphing) {
          isMorphing = true;
          shapeProgress = 0;
          let next;
          do {
            next = Math.floor(Math.random() * CYBER_SHAPES.length);
          } while (next === currentShapeIndex && CYBER_SHAPES.length > 1);
          nextShapeIndex = next;
        }
      }

      if (isMorphing) {
        shapeProgress += 1 / MORPH_DURATION;
        if (shapeProgress >= 1) {
          shapeProgress = 1;
          currentShapeIndex = nextShapeIndex;
          isMorphing = false;
          shapeTimer = 0;
          const currentShapeName = CYBER_SHAPES[currentShapeIndex].replace('_', ' ').toUpperCase();
          setActiveMode(currentShapeName);
        }
      }

      ctx.clearRect(0, 0, width, height);

      const currentShape = CYBER_SHAPES[currentShapeIndex];
      const nextShape = CYBER_SHAPES[nextShapeIndex];

      const easeT = shapeProgress < 0.5
        ? 4 * shapeProgress * shapeProgress * shapeProgress
        : 1 - Math.pow(-2 * shapeProgress + 2, 3) / 2;

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const rx = Math.min(width * 0.42, 280);
      const ry = Math.min(height * 0.42, 130);

      // --- 1. Compute Physics & Antigravity Forces ---
      bubbles.forEach((b) => {
        if (currentShape !== 'free_antigravity' || isMorphing) {
          const u = (seriesProgress + b.phaseOffset) % 1;
          const ptA = getShapePoint(currentShape, u, globalTime);
          const ptB = getShapePoint(nextShape, u, globalTime);

          const normX = ptA.x * (1 - easeT) + ptB.x * easeT;
          const normY = ptA.y * (1 - easeT) + ptB.y * easeT;

          const targetX = centerX + normX * rx;
          const targetY = centerY + normY * ry;

          const forceWeight = isMorphing ? 0.08 : 0.055;
          b.vx += (targetX - b.x) * forceWeight;
          b.vy += (targetY - b.y) * forceWeight;
        } else {
          // Antigravity buoyant upward lift
          b.vy -= 0.04;
          b.vx += Math.sin(globalTime + b.phaseOffset * 8) * 0.07;
        }

        // Antigravity cursor repulsion / flinging
        if (mouse.isHovering) {
          const dx = b.x - mouse.x;
          const dy = b.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius + b.radius && dist > 1) {
            const force = (1 - dist / (mouse.radius + b.radius)) * 2.5;
            const nx = dx / dist;
            const ny = dy / dist;
            b.vx += nx * force + mouse.vx * 0.18;
            b.vy += ny * force + mouse.vy * 0.18;
            b.glowIntensity = 1.2;
          }
        }

        // Physics Damping
        b.vx *= 0.90;
        b.vy *= 0.90;

        // Apply velocity
        b.x += b.vx;
        b.y += b.vy;

        // Boundary Containment
        const pad = b.radius + 2;
        if (b.x < pad) {
          b.x = pad;
          b.vx *= -0.7;
        } else if (b.x > width - pad) {
          b.x = width - pad;
          b.vx *= -0.7;
        }

        if (b.y < pad) {
          b.y = pad;
          b.vy *= -0.7;
        } else if (b.y > height - pad) {
          b.y = height - pad;
          b.vy *= -0.7;
        }

        b.pulsePhase += 0.04;
        b.glowIntensity = Math.max(0.4, b.glowIntensity * 0.96);
      });

      // --- 2. Elastic Collisions Between Bubbles (Antigravity Soft Bouncing) ---
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const b1 = bubbles[i];
          const b2 = bubbles[j];
          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b1.radius + b2.radius + 3;

          if (dist < minDist && dist > 0.1) {
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

            b1.vx -= p * b2.mass * nx * 0.5;
            b1.vy -= p * b2.mass * ny * 0.5;
            b2.vx += p * b1.mass * nx * 0.5;
            b2.vy += p * b1.mass * ny * 0.5;
          }
        }
      }

      // --- 3. Draw Connecting Cyber Data Filaments ---
      ctx.save();
      for (let i = 0; i < bubbles.length; i++) {
        const p1 = bubbles[i];
        const p2 = bubbles[(i + 1) % bubbles.length];
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        if (dist < Math.min(width, height) * 0.42) {
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          grad.addColorStop(0, `rgba(${p1.data.color.r}, ${p1.data.color.g}, ${p1.data.color.b}, 0.25)`);
          grad.addColorStop(1, `rgba(${p2.data.color.r}, ${p2.data.color.g}, ${p2.data.color.b}, 0.25)`);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Traveling data photon
          const pulseT = (globalTime * 1.6 + i * 0.25) % 1;
          const px = p1.x + (p2.x - p1.x) * pulseT;
          const py = p1.y + (p2.y - p1.y) * pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
      ctx.restore();

      // --- 4. Render Google Antigravity Clean Round Floating Nodes ---
      bubbles.forEach((b) => {
        const pulse = 1 + 0.04 * Math.sin(b.pulsePhase);
        const r = b.radius * pulse;

        ctx.save();
        ctx.translate(b.x, b.y);

        // A. Soft Ambient Shadow (Matching white/light floating buttons in Antigravity)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.14)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;

        // B. Pure Crisp Round Antigravity Pill Capsule
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Reset shadow for clean crisp strokes
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // C. Minimalist 1px Outline Border
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.85)'; // slate-300 clean rim
        ctx.lineWidth = 1;
        ctx.stroke();

        // D. Centered Crisp Antigravity Vector Icon
        drawAntigravityIcon(ctx, b.data.icon, r);

        // E. Antigravity Monospace Label (matching text below circles in the video)
        ctx.font = '700 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'rgba(30, 41, 59, 0.88)'; // dark legible text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(b.data.label, 0, r + 3.5);

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
      className={`absolute inset-0 pointer-events-auto overflow-hidden select-none z-0 cursor-crosshair ${className}`}
      title="Google Antigravity Physics • Drag or Hover to Fling"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Subtle Antigravity HUD Telemetry Badge */}
      <div className="absolute top-3 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 shadow-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
        <span>Antigravity: {activeMode}</span>
      </div>
    </div>
  );
});
