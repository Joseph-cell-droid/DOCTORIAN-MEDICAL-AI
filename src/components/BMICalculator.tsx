import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Scale, 
  ArrowRight, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface BMICalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ isOpen, onClose }) => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    color: string;
    description: string;
  } | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (!w || !h) return;

    let bmi: number;
    if (unit === 'metric') {
      // Weight in kg, height in cm
      bmi = w / ((h / 100) * (h / 100));
    } else {
      // Weight in lb, height in inches
      bmi = (w * 703) / (h * h);
    }

    let category = '';
    let color = '';
    let description = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-blue-500';
      description = 'You are below the typical weight range for your height. Consult a nutritional specialist for a balanced strategy.';
    } else if (bmi < 25) {
      category = 'Optimal';
      color = 'text-emerald-500';
      description = 'Your metabolic weight-to-height ratio is in the optimal clinical range.';
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 'text-amber-500';
      description = 'You are slightly above the typical weight range. Consider adjusting your activity and nutritional baseline.';
    } else {
      category = 'Clinical Obesity';
      color = 'text-rose-500';
      description = 'High metabolic load detected. We recommend a proactive clinical review of your cardiovascular and metabolic markers.';
    }

    setResult({
      bmi: parseFloat(bmi.toFixed(1)),
      category,
      color,
      description
    });
  };

  const reset = () => {
    setWeight('');
    setHeight('');
    setResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8 sm:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-xl shadow-blue-500/20">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">BMI Analyzer</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Diagnostic Weight-to-Height Synthesis</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {!result ? (
                <div className="space-y-8">
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <button 
                      onClick={() => setUnit('metric')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unit === 'metric' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Metric (kg/cm)
                    </button>
                    <button 
                      onClick={() => setUnit('imperial')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${unit === 'imperial' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Imperial (lb/in)
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight ({unit === 'metric' ? 'kg' : 'lb'})</label>
                      <input 
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder={unit === 'metric' ? "00.0" : "000"}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height ({unit === 'metric' ? 'cm' : 'in'})</label>
                      <input 
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder={unit === 'metric' ? "000" : "00"}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={calculateBMI}
                    disabled={!weight || !height}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    Run Bio-Analysis <ArrowRight size={18} />
                  </button>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                    <Info size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      "Body Mass Index (BMI) is a standardized screening protocol for categorizing biological weight groups based on height."
                    </p>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Activity size={120} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2 block">Cognis Synthesis</span>
                      <div className="flex flex-col items-center gap-2 mb-4">
                         <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{result.bmi}</span>
                         <span className={`text-sm font-black uppercase tracking-widest ${result.color} bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm`}>
                            {result.category}
                         </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-4">
                        {result.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={reset}
                      className="py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      New Analysis
                    </button>
                    <button 
                      onClick={onClose}
                      className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                    >
                      Acknowledge
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 opacity-50">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Confirmed • Encrypted Link</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BMICalculator;
