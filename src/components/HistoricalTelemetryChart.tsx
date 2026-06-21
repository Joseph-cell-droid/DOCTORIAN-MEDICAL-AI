import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { SafeResponsiveContainer } from './SafeResponsiveContainer';
import { Heart, Activity, Sliders, Eye, EyeOff, LayoutGrid } from 'lucide-react';

interface HistoricalTelemetryChartProps {
  vitals: any;
  selectedPatientId: string;
  preset: 'healthy' | 'warning' | 'critical';
}

export const HistoricalTelemetryChart: React.FC<HistoricalTelemetryChartProps> = ({ 
  vitals, 
  selectedPatientId, 
  preset 
}) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [timeInterval, setTimeInterval] = useState<'24h' | '7d' | '30d'>('24h');
  const [showHR, setShowHR] = useState(true);
  const [showSpO2, setShowSpO2] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Generate a stable and realistic trend based on active interval and patient preset
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    // Set baseline numbers based on the clinical status (preset)
    let hBaseline = 72;
    let sBaseline = 98;
    let hVariation = 5;
    let sVariation = 1.2;

    if (preset === 'critical') {
      hBaseline = 108;
      sBaseline = 89;
      hVariation = 14;
      sVariation = 3.5;
    } else if (preset === 'warning') {
      hBaseline = 88;
      sBaseline = 94;
      hVariation = 9;
      sVariation = 2;
    }

    if (timeInterval === '24h') {
      // Generate 24 hourly points
      for (let i = 23; i >= 0; i--) {
        const timeLabel = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourString = timeLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // We use mathematical waves to simulate realistic biometric homeostasis shift over 24 hours
        const waveValue = Math.sin((24 - i) * 0.35) * hVariation;
        const waveValueSpo2 = Math.cos((24 - i) * 0.35) * sVariation;

        // Ensure the very last hour merges with the real-time active telemetry of the simulator/arduino!
        const isCurrentHour = i === 0;
        
        const hrVal = isCurrentHour && vitals
          ? Math.round(vitals.heartRate)
          : Math.round(hBaseline + waveValue + (Math.sin(i * 1.5) * 1.5));
        
        const spo2Val = isCurrentHour && vitals
          ? Math.round(vitals.spo2)
          : Math.min(100, Math.round(sBaseline + waveValueSpo2 + (Math.cos(i * 1.5) * 0.5)));

        data.push({
          time: hourString,
          heartRate: hrVal,
          spo2: spo2Val,
          timestamp: timeLabel.getTime(),
          isCurrent: isCurrentHour
        });
      }
    } else if (timeInterval === '7d') {
      // Generate 7 daily points
      for (let i = 6; i >= 0; i--) {
        const timeLabel = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = timeLabel.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        const waveValue = Math.sin((7 - i) * 1.2) * hVariation;
        const waveValueSpo2 = Math.cos((7 - i) * 1.2) * sVariation;
        const isToday = i === 0;

        const hrVal = isToday && vitals
          ? Math.round(vitals.heartRate)
          : Math.round(hBaseline + waveValue + (Math.sin(i * 2.5) * 2));
        
        const spo2Val = isToday && vitals
          ? Math.round(vitals.spo2)
          : Math.min(100, Math.round(sBaseline + waveValueSpo2 + (Math.cos(i * 2.5) * 0.7)));

        data.push({
          time: dateString,
          heartRate: hrVal,
          spo2: spo2Val,
          timestamp: timeLabel.getTime(),
          isCurrent: isToday
        });
      }
    } else {
      // Generate 30 daily points
      for (let i = 29; i >= 0; i--) {
        const timeLabel = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = timeLabel.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        const waveValue = Math.sin((30 - i) * 0.5) * hVariation;
        const waveValueSpo2 = Math.cos((30 - i) * 0.5) * sVariation;
        const isToday = i === 0;

        const hrVal = isToday && vitals
          ? Math.round(vitals.heartRate)
          : Math.round(hBaseline + waveValue + (Math.sin(i * 3.5) * 3));
        
        const spo2Val = isToday && vitals
          ? Math.round(vitals.spo2)
          : Math.min(100, Math.round(sBaseline + waveValueSpo2 + (Math.cos(i * 3.5) * 0.8)));

        data.push({
          time: dateString,
          heartRate: hrVal,
          spo2: spo2Val,
          timestamp: timeLabel.getTime(),
          isCurrent: isToday
        });
      }
    }
    return data;
  }, [vitals, selectedPatientId, preset, timeInterval]);

  // Compute stats summaries for both metrics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const hrs = chartData.map(d => d.heartRate);
    const spos = chartData.map(d => d.spo2);

    return {
      hr: {
        avg: Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length),
        max: Math.max(...hrs),
        min: Math.min(...hrs)
      },
      spo2: {
        avg: Math.round(spos.reduce((a, b) => a + b, 0) / spos.length * 10) / 10,
        max: Math.max(...spos),
        min: Math.min(...spos)
      }
    };
  }, [chartData]);

  // Design a clinical-styled custom interactive tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-905 bg-slate-900 border border-slate-700/80 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2.5">
            Timestamp: {label}
          </p>
          <div className="space-y-2">
            {payload.map((item: any) => {
              const isHR = item.name === 'Heart Rate';
              return (
                <div key={item.name} className="flex items-center gap-2.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-xs font-bold text-slate-350">{item.name}:</span>
                  <span className="text-sm font-black text-white">
                    {item.value} {isHR ? 'BPM' : '%'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="historical-telemetry-panel" className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl p-6 sm:p-8 mb-8 transition-colors">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-slate-50 dark:border-slate-800/60 pb-6">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-3 text-lg sm:text-xl uppercase tracking-tight">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <Activity className="w-5.5 h-5.5" />
            </div>
            Interactive {timeInterval === '24h' ? '24-Hour' : timeInterval === '7d' ? '7-Day' : '30-Day'} Biometric Trends
          </h3>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 ml-1">
            Correlation: Cardiac Rhythm vs Metabolic O2 Saturation
          </p>
        </div>

        {/* Control Interface Panel */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          
          {/* Time Interval Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-205 dark:bg-slate-800 dark:border-slate-750">
            <button
              onClick={() => setTimeInterval('24h')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                timeInterval === '24h' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              24h View
            </button>
            <button
              onClick={() => setTimeInterval('7d')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                timeInterval === '7d' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              7-Day
            </button>
            <button
              onClick={() => setTimeInterval('30d')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                timeInterval === '30d' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              30-Day
            </button>
          </div>

          {/* Vitals Selection Visibility */}
          <div className="flex bg-slate-55 bg-slate-100 p-1 rounded-xl border border-slate-205 dark:bg-slate-800 dark:border-slate-750">
            <button
              onClick={() => setShowHR(!showHR)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showHR 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {showHR ? <Eye size={12} /> : <EyeOff size={12} />}
              Heart Rate (HR)
            </button>
            <button
              onClick={() => setShowSpO2(!showSpO2)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                showSpO2 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {showSpO2 ? <Eye size={12} /> : <EyeOff size={12} />}
              O2 Sat (SpO2)
            </button>
          </div>

          {/* Chart Representation View Toggles */}
          <div className="flex bg-slate-55 bg-slate-100 p-1 rounded-xl border border-slate-205 dark:bg-slate-800 dark:border-slate-750">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                chartType === 'area' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                chartType === 'line' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                chartType === 'bar' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Grid Toggle Icon */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Cartesian Grid"
            className={`p-2 rounded-xl border transition-all ${
              showGrid 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 border-slate-200 dark:border-slate-700' 
                : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Heart Rate Stats Capsule */}
          <div className="bg-blue-50/40 dark:bg-slate-800/20 rounded-3xl p-5 border border-blue-50/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-blue-600 dark:text-blue-400">
              <Heart size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {timeInterval === '24h' ? '24h' : timeInterval === '7d' ? '7-Day' : '30-Day'} Heart Rate Analysis
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Average</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">{stats.hr.avg} <span className="text-[9px] font-medium text-slate-400">BPM</span></span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Max Surge</span>
                <span className="text-lg font-extrabold text-rose-600 dark:text-rose-405 tabular-nums">{stats.hr.max} <span className="text-[9px] font-medium text-slate-400">BPM</span></span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Min Valley</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-405 tabular-nums">{stats.hr.min} <span className="text-[9px] font-medium text-slate-400">BPM</span></span>
              </div>
            </div>
          </div>

          {/* SpO2 Stats Capsule */}
          <div className="bg-emerald-50/40 dark:bg-slate-800/20 rounded-3xl p-5 border border-emerald-50/60 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
              <Eye size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {timeInterval === '24h' ? '24h' : timeInterval === '7d' ? '7-Day' : '30-Day'} SpO2 Saturation Analysis
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Average</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">{stats.spo2.avg}%</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Max Sat</span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-405 tabular-nums">{stats.spo2.max}%</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 py-2.5 px-2 rounded-xl">
                <span className="block text-[8px] font-black uppercase text-slate-450 tracking-wider">Min Sat</span>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-405 tabular-nums">{stats.spo2.min}%</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Main Recharts Area Container */}
      <div className="h-80 w-full">
        {(!showHR && !showSpO2) ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-550 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
            <Sliders className="w-8 h-8 mb-2 animate-bounce opacity-40" />
            <p className="text-xs font-black uppercase tracking-wider">Select HR or SpO2 telemetry above to render</p>
          </div>
        ) : (
          <SafeResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />}
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#94a3b8" 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#10b981"
                />
                <YAxis 
                  yAxisId="left"
                  domain={[50, 150]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#3b82f6" 
                />
                <Tooltip content={<CustomTooltip />} />
                {showHR && (
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorHR)"
                  />
                )}
                {showSpO2 && (
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="spo2"
                    name="Oxygen Level"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSpO2)"
                  />
                )}
              </AreaChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />}
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#10b981"
                />
                <YAxis 
                  yAxisId="left"
                  domain={[50, 150]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#3b82f6"
                />
                <Tooltip content={<CustomTooltip />} />
                {showHR && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                {showSpO2 && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="spo2"
                    name="Oxygen Level"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />}
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />}
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={[80, 100]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#10b981"
                />
                <YAxis 
                  yAxisId="left"
                  domain={[50, 150]}
                  tick={{ fontSize: 9, fontWeight: 700 }}
                  stroke="#3b82f6"
                />
                <Tooltip content={<CustomTooltip />} />
                {showHR && (
                  <Bar
                    yAxisId="left"
                    dataKey="heartRate"
                    name="Heart Rate"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                )}
                {showSpO2 && (
                  <Bar
                    yAxisId="right"
                    dataKey="spo2"
                    name="Oxygen Level"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                )}
              </BarChart>
            )}
          </SafeResponsiveContainer>
        )}
      </div>

      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-6 px-1">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Heart Rate Wave (Dual-Axis)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> SpO2 Oxygen Sync
          </span>
        </div>
        <span className="text-blue-500 animate-pulse">● {timeInterval === '24h' ? '24h' : timeInterval === '7d' ? '7-Day' : '30-Day'} Sync Stream Active</span>
      </div>

    </div>
  );
};
