import React, { useEffect, useRef, memo, useMemo } from 'react';

export type BubbleDensityLevel = 'minimal' | 'low' | 'balanced' | 'dynamic';

export interface BubbleDensityProfile {
  targetCount: number;
  maxAlpha: number;
  speedMultiplier: number;
  level: BubbleDensityLevel;
  category: 'dense_dashboard' | 'clinical_focus' | 'ambient_presentation';
  description: string;
}

/**
 * Dynamically determines the particle bubble density profile based on the active view.
 * Dense data views (telemetry, lab analyzers, clinical monitors) get minimal density
 * to reduce visual noise, while overview and presentation screens receive full dynamic ambiance.
 */
export function getViewBubbleDensity(view?: string, override?: BubbleDensityLevel | number): BubbleDensityProfile {
  if (typeof override === 'number') {
    const clamped = Math.max(20, Math.min(300, override));
    return {
      targetCount: clamped,
      maxAlpha: clamped < 80 ? 0.35 : clamped < 160 ? 0.5 : 0.7,
      speedMultiplier: clamped < 80 ? 0.5 : 0.85,
      level: clamped < 80 ? 'minimal' : clamped < 160 ? 'balanced' : 'dynamic',
      category: clamped < 80 ? 'dense_dashboard' : clamped < 160 ? 'clinical_focus' : 'ambient_presentation',
      description: `Custom density override (${clamped} nodes)`
    };
  }

  if (override === 'minimal') {
    return {
      targetCount: 45,
      maxAlpha: 0.28,
      speedMultiplier: 0.45,
      level: 'minimal',
      category: 'dense_dashboard',
      description: 'Ultra-clean minimal density for dense medical data'
    };
  }

  if (override === 'low') {
    return {
      targetCount: 85,
      maxAlpha: 0.4,
      speedMultiplier: 0.6,
      level: 'low',
      category: 'dense_dashboard',
      description: 'Low density for telemetry and reports'
    };
  }

  if (override === 'balanced') {
    return {
      targetCount: 130,
      maxAlpha: 0.52,
      speedMultiplier: 0.75,
      level: 'balanced',
      category: 'clinical_focus',
      description: 'Balanced ambient density for clinical interaction'
    };
  }

  if (override === 'dynamic') {
    return {
      targetCount: 240,
      maxAlpha: 0.75,
      speedMultiplier: 1.0,
      level: 'dynamic',
      category: 'ambient_presentation',
      description: 'Full dynamic Antigravity particle ambiance'
    };
  }

  const v = (view || '').toLowerCase().trim();

  // 1. High-Density Medical Dashboards, Lab Workstations & Real-Time Telemetry
  const denseDashboardViews = [
    'monitor',
    'vitality',
    'diagnostic_lab',
    'doctors_dashboard',
    'admin',
    'health_matrix',
    'dev_portal',
    'biosecurity',
    'training',
    'records',
    'anomaly_detail',
    'autonomous_sync'
  ];

  if (denseDashboardViews.includes(v)) {
    return {
      targetCount: 48,
      maxAlpha: 0.3,
      speedMultiplier: 0.48,
      level: 'minimal',
      category: 'dense_dashboard',
      description: 'Clean low-noise background for high-density clinical charts'
    };
  }

  // 2. Focused Clinical Chat, Forms & Interactive Workflow Views
  const clinicalFocusViews = [
    'ai_nexus',
    'symptoms',
    'specialist',
    'neuro',
    'clinical_roadmap',
    'tasks',
    'meds',
    'fitness',
    'billing',
    'gsm_sms_gateway',
    'health_trace',
    'profile'
  ];

  if (clinicalFocusViews.includes(v)) {
    return {
      targetCount: 115,
      maxAlpha: 0.48,
      speedMultiplier: 0.72,
      level: 'balanced',
      category: 'clinical_focus',
      description: 'Serene balanced density for interactive clinical tools'
    };
  }

  // 3. Overview, Explorer, Visualizer & Home Presentations (Default Dynamic)
  return {
    targetCount: 230,
    maxAlpha: 0.72,
    speedMultiplier: 0.95,
    level: 'dynamic',
    category: 'ambient_presentation',
    description: 'Dynamic Antigravity particle matrix'
  };
}

interface AmbientBubbleBackgroundProps {
  isDarkMode?: boolean;
  currentView?: string;
  densityOverride?: BubbleDensityLevel | number;
  className?: string;
}

export const AmbientBubbleBackground: React.FC<AmbientBubbleBackgroundProps> = memo(({ 
  isDarkMode = true,
  currentView = 'home',
  densityOverride,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute profile based on view
  const densityProfile = useMemo(() => {
    return getViewBubbleDensity(currentView, densityOverride);
  }, [currentView, densityOverride]);

  // Keep a ref to the latest profile to allow seamless live transitions inside requestAnimationFrame
  const densityProfileRef = useRef(densityProfile);
  useEffect(() => {
    densityProfileRef.current = densityProfile;
  }, [densityProfile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Google Antigravity & High-Tech Medical Palette
    const colors = isDarkMode
      ? [
          { r: 59, g: 130, b: 246 },  // Blue
          { r: 6, g: 182, b: 212 },   // Cyan
          { r: 168, g: 85, b: 247 },  // Purple
          { r: 236, g: 72, b: 153 },  // Pink/Magenta
          { r: 245, g: 158, b: 11 },  // Amber
          { r: 234, g: 179, b: 8 },   // Gold Yellow
          { r: 16, g: 185, b: 129 }   // Emerald
        ]
      : [
          { r: 37, g: 99, b: 235 },   // Electric Blue
          { r: 8, g: 145, b: 178 },   // Vivid Cyan
          { r: 147, g: 51, b: 234 },  // Deep Purple
          { r: 219, g: 39, b: 119 },  // Vibrant Magenta
          { r: 217, g: 119, b: 6 },   // Warm Amber
          { r: 202, g: 138, b: 4 },   // Warm Gold
          { r: 5, g: 150, b: 105 }    // Emerald
        ];

    const MAX_PARTICLES = 300;
    
    // Create micro-particles radiating radially like Google Antigravity
    const resetParticle = (p: any) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(width, height) * 0.45 + 10;
      p.x = width / 2 + Math.cos(angle) * distance;
      p.y = height / 2 + Math.sin(angle) * distance;
      p.angle = angle;
      p.baseSpeed = Math.random() * 0.42 + 0.14;
      p.radius = Math.random() < 0.75 ? Math.random() * 1.5 + 0.8 : Math.random() * 2.6 + 1.6;
      p.length = Math.random() < 0.5 ? Math.random() * 4 + 2 : p.radius;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.baseAlpha = Math.random() * 0.55 + 0.3;
      p.maxLife = Math.random() * 400 + 200;
      p.life = Math.random() * p.maxLife;
      p.isDash = Math.random() < 0.6;
      p.fadeFactor = 1;
    };

    const particles = Array.from({ length: MAX_PARTICLES }).map(() => {
      const p = {} as any;
      resetParticle(p);
      return p;
    });

    // Smoothly interpolated active density properties
    let currentParticleCount = densityProfileRef.current.targetCount;
    let currentAlphaMultiplier = densityProfileRef.current.maxAlpha;
    let currentSpeedMultiplier = densityProfileRef.current.speedMultiplier;

    const render = () => {
      const targetProfile = densityProfileRef.current;

      // Smoothly interpolate towards target density settings without sudden jumps
      currentParticleCount += (targetProfile.targetCount - currentParticleCount) * 0.04;
      currentAlphaMultiplier += (targetProfile.maxAlpha - currentAlphaMultiplier) * 0.04;
      currentSpeedMultiplier += (targetProfile.speedMultiplier - currentSpeedMultiplier) * 0.04;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const activeCount = Math.floor(currentParticleCount);

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i];
        const isActive = i < activeCount;

        // Transition individual particle fade factor smoothly
        if (isActive) {
          p.fadeFactor = Math.min(1, p.fadeFactor + 0.03);
        } else {
          p.fadeFactor = Math.max(0, p.fadeFactor - 0.04);
        }

        // If completely faded out and inactive, skip rendering
        if (p.fadeFactor <= 0.01) {
          continue;
        }

        p.life += 1;
        if (p.life > p.maxLife) {
          resetParticle(p);
        }

        // Radial outward motion + gentle swirl angle modulated by current speed
        p.angle += 0.001 * currentSpeedMultiplier;
        const currentSpeed = p.baseSpeed * currentSpeedMultiplier * (1 + (p.life / p.maxLife) * 0.5);
        p.x += Math.cos(p.angle) * currentSpeed;
        p.y += Math.sin(p.angle) * currentSpeed;

        // Wrap or reset if off screen
        if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) {
          resetParticle(p);
        }

        // Alpha fade in & out scaled by density alpha multiplier and transition fadeFactor
        const fadeIn = Math.min(1, p.life / 40);
        const fadeOut = Math.min(1, (p.maxLife - p.life) / 40);
        const currentAlpha = p.baseAlpha * currentAlphaMultiplier * fadeIn * fadeOut * p.fadeFactor;

        if (currentAlpha <= 0.01) continue;

        ctx.save();
        ctx.beginPath();

        if (p.isDash) {
          // Elongated Antigravity micro particle dash oriented outwards
          const dashX = p.x + Math.cos(p.angle) * p.length;
          const dashY = p.y + Math.sin(p.angle) * p.length;
          
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(dashX, dashY);
          ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
          ctx.lineWidth = p.radius;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Micro glowing bubble dot
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  // Adjust center radial glow opacity and size based on active density
  const isMinimal = densityProfile.level === 'minimal';

  return (
    <div 
      aria-hidden="true" 
      data-view-density={densityProfile.level}
      data-view-category={densityProfile.category}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-[1] select-none transition-opacity duration-1000 ${className}`}
    >
      {/* Premium Modern Backdrop */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950' 
            : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/20'
        }`}
      />

      {/* Subtle Radial Mesh */}
      <div className={`absolute inset-0 bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] [background-size:32px_32px] transition-opacity duration-700 ${
        isMinimal 
          ? 'opacity-[0.02] dark:opacity-[0.05]' 
          : 'opacity-[0.05] dark:opacity-[0.10]'
      }`} />

      {/* Center Antigravity Soft Radial Glow with Adaptive View Intensity */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
        isMinimal
          ? 'w-[500px] h-[500px] opacity-40'
          : 'w-[700px] h-[700px] opacity-100'
      } ${
        isDarkMode 
          ? 'bg-radial from-blue-600/15 via-purple-600/10 to-transparent' 
          : 'bg-radial from-blue-400/20 via-indigo-300/15 to-transparent'
      }`} />

      {/* Google Antigravity Particle Field Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Vignette frame overlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-950/5 dark:to-slate-950/40 pointer-events-none" />
    </div>
  );
});
