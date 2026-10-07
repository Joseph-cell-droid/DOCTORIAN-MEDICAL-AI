import React, { useId, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { BioTelemetryRangeTooltip } from './BioTelemetryRangeTooltip';

export interface VitalThresholdConfig {
  lowCritical?: number;
  lowWarning?: number;
  highWarning?: number;
  highCritical?: number;
  normalMin: number;
  normalMax: number;
  unit: string;
  minScale: number;
  maxScale: number;
}

export interface VitalRadialMetric {
  id: string;
  label: string;
  sublabel?: string;
  displayValue: string;
  unit: string;
  numericValue: number;
  thresholds: VitalThresholdConfig;
  trendText?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  details?: string;
  isAiPowered?: boolean;
  aiEncouragement?: string;
  onRefreshAi?: () => void;
  isAiLoading?: boolean;
}

interface VitalRadialProgressRingProps {
  metric: VitalRadialMetric;
  onClick?: () => void;
  size?: number; // default 124
}

export const VitalRadialProgressRing: React.FC<VitalRadialProgressRingProps> = ({
  metric,
  onClick,
  size = 128
}) => {
  const uniqueId = useId().replace(/[:]/g, '_');
  const gradientId = `vital-grad-${metric.id}-${uniqueId}`;
  const trackId = `vital-track-${metric.id}-${uniqueId}`;
  const glowId = `vital-glow-${metric.id}-${uniqueId}`;

  // Evaluate threshold status
  const { status, statusBadge, statusColor, percentage } = useMemo(() => {
    const { numericValue, thresholds } = metric;
    const { minScale, maxScale, normalMin, normalMax, lowCritical, lowWarning, highWarning, highCritical } = thresholds;

    // Normalized progress percentage for the ring (clamped 0 to 100)
    const span = Math.max(0.1, maxScale - minScale);
    const clampedVal = Math.max(minScale, Math.min(maxScale, numericValue));
    const pct = Math.round(((clampedVal - minScale) / span) * 100);

    // Determine clinical zone
    let s: 'optimal' | 'warning' | 'critical' = 'optimal';
    let badge = `Normal: ${normalMin}–${normalMax} ${thresholds.unit}`;
    let color: 'emerald' | 'amber' | 'rose' | 'cyan' | 'blue' = 'emerald';

    if (
      (lowCritical !== undefined && numericValue <= lowCritical) ||
      (highCritical !== undefined && numericValue >= highCritical)
    ) {
      s = 'critical';
      badge = numericValue >= (highCritical || 999) ? `Critical High > ${highCritical}` : `Critical Low < ${lowCritical}`;
      color = 'rose';
    } else if (
      (lowWarning !== undefined && numericValue < normalMin) ||
      (highWarning !== undefined && numericValue > normalMax)
    ) {
      s = 'warning';
      badge = numericValue > normalMax ? `Elevated > ${normalMax}` : `Sub-optimal < ${normalMin}`;
      color = 'amber';
    } else {
      s = 'optimal';
      badge = `In Range (${normalMin}–${normalMax})`;
      color = metric.id === 'spo2' ? 'cyan' : metric.id === 'ai_core' ? 'blue' : 'emerald';
    }

    return {
      status: s,
      statusBadge: badge,
      statusColor: color,
      percentage: Math.max(4, Math.min(100, pct))
    };
  }, [metric]);

  // SVG Geometry
  const strokeWidth = 8.5;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Safe Threshold Range Arc markers
  const { safeZoneOffset, safeZoneLength } = useMemo(() => {
    const { minScale, maxScale, normalMin, normalMax } = metric.thresholds;
    const span = Math.max(0.1, maxScale - minScale);
    const startPct = Math.max(0, Math.min(1, (normalMin - minScale) / span));
    const endPct = Math.max(0, Math.min(1, (normalMax - minScale) / span));
    const rangeFraction = endPct - startPct;
    
    return {
      safeZoneLength: circumference * rangeFraction,
      safeZoneOffset: -circumference * startPct
    };
  }, [metric.thresholds, circumference]);

  // Color schemes
  const colorMap = {
    emerald: {
      from: '#10b981',
      to: '#059669',
      glow: 'rgba(16, 185, 129, 0.45)',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      pillBg: 'bg-emerald-500/10 text-emerald-400',
      ambientBg: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
      textAccent: 'text-emerald-500'
    },
    cyan: {
      from: '#06b6d4',
      to: '#0284c7',
      glow: 'rgba(6, 182, 212, 0.45)',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      pillBg: 'bg-cyan-500/10 text-cyan-400',
      ambientBg: 'bg-cyan-500/5 group-hover:bg-cyan-500/10',
      textAccent: 'text-cyan-400'
    },
    blue: {
      from: '#38bdf8',
      to: '#2563eb',
      glow: 'rgba(56, 189, 248, 0.45)',
      badgeBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      pillBg: 'bg-blue-500/10 text-blue-400',
      ambientBg: 'bg-blue-500/5 group-hover:bg-blue-500/10',
      textAccent: 'text-blue-400'
    },
    amber: {
      from: '#f59e0b',
      to: '#ea580c',
      glow: 'rgba(245, 158, 11, 0.45)',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      pillBg: 'bg-amber-500/10 text-amber-400',
      ambientBg: 'bg-amber-500/5 group-hover:bg-amber-500/10',
      textAccent: 'text-amber-500'
    },
    rose: {
      from: '#f43f5e',
      to: '#e11d48',
      glow: 'rgba(244, 63, 94, 0.55)',
      badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      pillBg: 'bg-rose-500/15 text-rose-400',
      ambientBg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
      textAccent: 'text-rose-500'
    }
  };

  const activeColors = colorMap[statusColor];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) onClick();
        }
      }}
      className="bg-white dark:bg-slate-900/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden text-left w-full cursor-pointer select-none flex flex-col justify-between"
    >
      {/* Ambient background glow */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${activeColors.ambientBg}`} />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs border ${activeColors.badgeBg}`}>
            {React.cloneElement(metric.icon as any, { size: 18 })}
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider leading-none">
              {metric.label}
            </h4>
            {metric.sublabel && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {metric.sublabel}
              </p>
            )}
          </div>
        </div>

        {/* AI Sync Button if AI metric */}
        {metric.isAiPowered ? (
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Sparkles size={10} className="animate-pulse" />
              Gemini
            </span>
            {metric.onRefreshAi && (
              <button
                type="button"
                title="Sync with Gemini Neural Model"
                onClick={metric.onRefreshAi}
                disabled={metric.isAiLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
              >
                <RefreshCw size={12} className={metric.isAiLoading ? "animate-spin text-blue-600" : ""} />
              </button>
            )}
          </div>
        ) : (
          <BioTelemetryRangeTooltip position="top" align="end">
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold font-mono uppercase tracking-wider border cursor-help ${activeColors.badgeBg}`}>
              {status === 'optimal' ? 'OPTIMAL' : status === 'warning' ? 'BORDERLINE' : 'CRITICAL'}
            </span>
          </BioTelemetryRangeTooltip>
        )}
      </div>

      {/* Centerpiece: SVG-based Animated Radial Progress Ring */}
      <div className="flex items-center justify-center my-2 relative z-10">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 filter"
          >
            <defs>
              {/* Linear Gradient for Ring */}
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={activeColors.from} />
                <stop offset="100%" stopColor={activeColors.to} />
              </linearGradient>

              {/* Glowing Aura Filter */}
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor={activeColors.glow} />
              </filter>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-slate-100 dark:text-slate-800/80"
            />

            {/* Acceptable Threshold Safe Zone Arc Marker */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth + 1}
              strokeDasharray={`${safeZoneLength} ${circumference - safeZoneLength}`}
              strokeDashoffset={safeZoneOffset}
              className="text-emerald-500/25 dark:text-emerald-400/20"
              strokeLinecap="butt"
            />

            {/* Dynamic Animated Foreground Progress Ring */}
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ filter: `url(#${glowId})` }}
            />
          </svg>

          {/* Center Numerical Value & Status Sub-Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            <span className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
              {metric.displayValue}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
              {metric.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Strip: Threshold Guide & Trend Direction */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] relative z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          {status === 'optimal' ? (
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          ) : status === 'warning' ? (
            <AlertTriangle size={13} className="text-amber-500 shrink-0" />
          ) : (
            <AlertCircle size={13} className="text-rose-500 shrink-0 animate-pulse" />
          )}
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate">
            {statusBadge}
          </span>
        </div>

        {metric.trendText && (
          <div className="flex items-center gap-1 shrink-0 font-black text-[10px]">
            {metric.trendDirection === 'up' ? (
              <TrendingUp size={12} className={statusColor === 'rose' ? 'text-rose-500' : 'text-emerald-500'} />
            ) : metric.trendDirection === 'down' ? (
              <TrendingDown size={12} className={statusColor === 'rose' ? 'text-rose-500' : 'text-blue-500'} />
            ) : (
              <Minus size={12} className="text-slate-400" />
            )}
            <span className={
              metric.trendText.startsWith('+') 
                ? 'text-emerald-500 dark:text-emerald-400' 
                : metric.trendText === 'Stable' || metric.trendText === 'Optimal' 
                ? 'text-blue-500 dark:text-cyan-400' 
                : 'text-slate-500'
            }>
              {metric.trendText}
            </span>
          </div>
        )}
      </div>

      {/* Encouraging Tip snippet if available on card */}
      {metric.aiEncouragement && (
        <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-snug font-medium relative z-10">
          {metric.aiEncouragement}
        </p>
      )}
    </div>
  );
};

export default VitalRadialProgressRing;
