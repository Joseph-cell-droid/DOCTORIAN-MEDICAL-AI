import React from 'react';
import { motion } from 'motion/react';
import { Dna, Microscope, Play, RefreshCw, Layers, Clock, Activity, Fingerprint, ShieldAlert, CheckCircle } from 'lucide-react';

interface DnaMatrixProps {
  dnaStatus: any;
  onStartSequencing: () => void;
}

export const DnaMatrix: React.FC<DnaMatrixProps> = ({ dnaStatus, onStartSequencing }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sequencing Engine */}
        <div className="lg:col-span-8 bg-slate-900 rounded-[3rem] p-8 sm:p-12 text-white relative overflow-hidden group border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Dna size={240} className="text-blue-500" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2.5 rounded-xl">
                    <Microscope size={24} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Quantum Sequencing Engine</span>
                </div>
                <h3 className="text-3xl sm:text-6xl font-[1000] tracking-tighter uppercase leading-none">Genomic <span className="text-blue-500 font-serif italic normal-case">Nexus</span></h3>
              </div>
              
              <button 
                onClick={onStartSequencing}
                disabled={dnaStatus?.sequencing}
                className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${dnaStatus?.sequencing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-blue-50 active:scale-95 transition-all'}`}
              >
                {dnaStatus?.sequencing ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                {dnaStatus?.sequencing ? 'Sequencing...' : 'Start Trace'}
              </button>
            </div>

            {dnaStatus?.sequencing ? (
              <div className="space-y-10">
                <div className="relative pt-1">
                  <div className="flex mb-4 items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black inline-block py-1 px-3 uppercase rounded-full text-blue-400 bg-blue-900/30 border border-blue-500/20">
                        Base Pair Alignment in Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black inline-block text-blue-400 tabular-nums">
                        {Math.round(dnaStatus.progress || 0)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-800 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${dnaStatus.progress || 0}%` }}
                      transition={{ duration: 0.5 }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 relative"
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-pulse" />
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(dnaStatus.markers || []).map((marker: string, mIdx: number) => (
                    <motion.div 
                      key={`dna-marker-${marker}-${mIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
                    >
                      <div className="text-[8px] font-black text-blue-500 uppercase">Detection</div>
                      <div className="text-xs font-black">{marker}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : dnaStatus?.results ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6"
              >
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Haplogroup</span>
                  </div>
                  <p className="text-3xl font-black">{dnaStatus.results.haplogroup}</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={18} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Biological Age</span>
                  </div>
                  <p className="text-3xl font-black">{dnaStatus.results.cellularAge} <span className="text-sm text-slate-500 font-bold uppercase">Years</span></p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity size={18} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Telomere Status</span>
                  </div>
                  <p className="text-2xl font-black uppercase text-emerald-400">{dnaStatus.results.telomereHealth}</p>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Fingerprint size={40} className="text-blue-500 opacity-40" />
                </div>
                <p className="text-slate-500 font-bold max-w-sm">Ready for High-Resolution Genomic Sequencing. Initialize the trace to begin base-pair alignment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Variant Risks */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variant Susceptibility</span>
              <ShieldAlert size={20} className="text-blue-500" />
            </div>
            
            <div className="space-y-4">
              {[
                { gene: 'MTHFR C677T', status: 'Heterozygous Variant', risk: 'Low Risk', color: 'text-emerald-500' },
                { gene: 'APOE e3/e4', status: 'Increased Risk Allele', risk: 'Moderate', color: 'text-amber-500' },
                { gene: 'COMT Val158Met', status: 'Slower Dopamine Clearance', risk: 'Normal', color: 'text-blue-500' },
                { gene: 'BRCA1/2', status: 'No Pathogenic Mutations', risk: 'Negative', color: 'text-emerald-500' }
              ].map((v, mapIdx_135) => (
                <div key={`dnamatrix-l137-${mapIdx_135}`} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{v.gene}</p>
                    <p className="text-[10px] font-bold text-slate-400">{v.status}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase ${v.color}`}>{v.risk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
            <p className="text-[10px] font-bold text-slate-500">Sequencer aligned with Doctorian MoH Genomic Standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
