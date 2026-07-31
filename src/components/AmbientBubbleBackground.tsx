import React, { useEffect, useRef } from 'react';

export const AmbientBubbleBackground: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const particleCount = 240;
    
    // Create micro-particles radiating radially like Google Antigravity
    const resetParticle = (p: any) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * Math.min(width, height) * 0.45 + 10;
      p.x = width / 2 + Math.cos(angle) * distance;
      p.y = height / 2 + Math.sin(angle) * distance;
      p.angle = angle;
      p.speed = Math.random() * 0.45 + 0.15;
      p.radius = Math.random() < 0.75 ? Math.random() * 1.5 + 0.8 : Math.random() * 2.8 + 1.8;
      p.length = Math.random() < 0.5 ? Math.random() * 4 + 2 : p.radius;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.alpha = Math.random() * 0.6 + 0.35;
      p.maxLife = Math.random() * 400 + 200;
      p.life = Math.random() * p.maxLife;
      p.isDash = Math.random() < 0.6;
    };

    const particles = Array.from({ length: particleCount }).map(() => {
      const p = {} as any;
      resetParticle(p);
      return p;
    });

    let time = 0;

    const render = () => {
      time += 0.008;

      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + (mouseX - width / 2) * 0.03;
      const centerY = height / 2 + (mouseY - height / 2) * 0.03;

      particles.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          resetParticle(p);
        }

        // Radial outward motion + gentle swirl angle
        p.angle += 0.0012;
        const currentSpeed = p.speed * (1 + (p.life / p.maxLife) * 0.5);
        p.x += Math.cos(p.angle) * currentSpeed;
        p.y += Math.sin(p.angle) * currentSpeed;

        // Wrap or reset if off screen
        if (p.x < -30 || p.x > width + 30 || p.y < -30 || p.y > height + 30) {
          resetParticle(p);
        }

        // Alpha fade in & out
        const fadeIn = Math.min(1, p.life / 40);
        const fadeOut = Math.min(1, (p.maxLife - p.life) / 40);
        const currentAlpha = p.alpha * fadeIn * fadeOut;

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
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden z-[1] select-none transition-opacity duration-1000"
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
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-[0.05] dark:opacity-[0.10]" />

      {/* Center Antigravity Soft Radial Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
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
};

