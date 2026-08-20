const fs = require('fs');
const filePath = 'src/components/ChatInterface.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Find the start anchor of the stream status badge and the corrupted layout
const startAnchor = `                        {/* Top-Right Telehealth Stream Status Badge */}
                        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">`;

const oldCorruptedSection = `                          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center                        {/* Left Side: Real-Time Patient Vitals HUD & Scenario Simulation Controllers (Toggleable) */}`;

// Let's locate the corrupted block and replace it up to the trailing duplication:
// we can find the indices and reconstruct the block perfectly.

const startIdx = content.indexOf(startAnchor);
if (startIdx === -1) {
  console.error("Start anchor not found");
  process.exit(1);
}

// We want to find the bottom right container start index: "Bottom Right: Patient Self View (PiP Inset Camera Box)"
const endAnchor = `                        {/* Bottom Right: Patient Self View (PiP Inset Camera Box) */}`;
const endIdx = content.indexOf(endAnchor);
if (endIdx === -1) {
  console.error("End anchor not found");
  process.exit(1);
}

// Reconstruct the block cleanly
const cleanReplacement = `                        {/* Top-Right Telehealth Stream Status Badge */}
                        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                          <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-mono font-bold text-slate-300">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span>{videoQuality} • 60FPS</span>
                            <span className="text-slate-600">|</span>
                            <span className="text-emerald-400">14ms Latency</span>
                          </div>
                        </div>

                        {/* Left Side: Real-Time Patient Vitals HUD & Scenario Simulation Controllers (Toggleable) */}
                        <AnimatePresence>
                          {showVitalsOverlay && (
                            <motion.div
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -30 }}
                              className="absolute top-24 left-6 z-20 hidden lg:flex flex-col gap-3 bg-slate-950/85 backdrop-blur-2xl border border-slate-800 p-5 rounded-3xl text-xs w-64 shadow-2xl overflow-y-auto max-h-[75%]"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                <span>PATIENT VITALS SIMULATOR</span>
                                <span className={\`w-2 h-2 rounded-full \${vitalsHR > 100 || vitalsSPO2 < 90 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}\`} />
                              </div>

                              {/* Interactive Vitals Scenario Selector */}
                              <div className="space-y-1.5 bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800/60 font-sans w-full">
                                <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Simulation Scenario</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {(['normal', 'tachycardia', 'hypoxia', 'fever']).map((scen) => (
                                    <button
                                      key={\`scen-\${scen}\`}
                                      type="button"
                                      onClick={() => setVitalsScenario(scen)}
                                      className={\`py-1 rounded-lg text-[9px] font-bold uppercase transition-all cursor-pointer border \${
                                        vitalsScenario === scen
                                          ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
                                      }\`}
                                    >
                                      {scen}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Vitals Telemetry */}
                              <div className="space-y-2.5">
                                {/* Heart Rate */}
                                <div className="flex items-center justify-between bg-slate-900/20 p-2 rounded-xl">
                                  <span className="text-slate-400 text-[11px]">Heart Rate:</span>
                                  <span className={\`font-mono font-black text-[12px] flex items-center gap-1 \${vitalsHR > 100 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}\`}>
                                    <Heart size={12} className={vitalsHR > 100 ? 'animate-ping' : 'animate-pulse'} /> {vitalsHR} BPM
                                  </span>
                                </div>

                                {/* Blood Oxygen */}
                                <div className="flex items-center justify-between bg-slate-900/20 p-2 rounded-xl">
                                  <span className="text-slate-400 text-[11px]">Blood Oxygen:</span>
                                  <span className={\`font-mono font-black text-[12px] \${vitalsSPO2 < 90 ? 'text-rose-400 animate-bounce' : 'text-cyan-400'}\`}>
                                    {vitalsSPO2}% SpO2 {vitalsSPO2 < 90 && '⚠️ LOW'}
                                  </span>
                                </div>

                                {/* Temperature */}
                                <div className="flex items-center justify-between bg-slate-900/20 p-2 rounded-xl">
                                  <span className="text-slate-400 text-[11px]">Temperature:</span>
                                  <span className={\`font-mono font-black text-[12px] \${vitalsTemp > 38 ? 'text-rose-400' : 'text-amber-400'}\`}>
                                    {vitalsTemp} °C
                                  </span>
                                </div>

                                {/* Stress Level */}
                                <div className="flex items-center justify-between bg-slate-900/20 p-2 rounded-xl">
                                  <span className="text-slate-400 text-[11px]">Stress Level:</span>
                                  <span className={\`font-mono font-black text-[12px] \${vitalsStress > 50 ? 'text-amber-400' : 'text-emerald-400'}\`}>
                                    {vitalsStress > 50 ? 'High' : 'Normal'} ({vitalsStress}%)
                                  </span>
                                </div>
                              </div>

                              {/* Dynamic Medical Scribe & Diagnostic Copilot Notes */}
                              <div className="border-t border-slate-800/80 pt-3 mt-1.5 space-y-2">
                                <div className="flex items-center justify-between text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                  <span>AI TELE-SCRIBE NOTES</span>
                                  <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">ACTIVE</span>
                                </div>
                                <div className="space-y-1.5 bg-slate-900/40 p-2.5 rounded-2xl border border-slate-800/40 max-h-[160px] overflow-y-auto custom-scrollbar text-[10px] leading-relaxed text-slate-300 font-medium font-sans">
                                  {copilotNotes.map((note, noteIdx) => (
                                    <p key={\`note-\${noteIdx}\`} className="border-b border-slate-850 pb-1 last:border-0 last:pb-0">
                                      ✨ {note}
                                    </p>
                                  ))}
                                </div>
                              </div>

                              {/* Multi-Language Accent Selector */}
                              <div className="border-t border-slate-800/80 pt-3 space-y-2 font-sans">
                                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest block">AI AUDIO TRANSLATOR</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {([
                                    { id: 'English', label: '🇬🇧 English' },
                                    { id: 'Swahili', label: '🇰🇪 Swahili' },
                                    { id: 'Luganda', label: '🇺🇬 Luganda' },
                                    { id: 'French', label: '🇫🇷 French' }
                                  ]).map((accent) => (
                                    <button
                                      key={\`accent-\${accent.id}\`}
                                      type="button"
                                      onClick={() => {
                                        setMedicalTranslationAccent(accent.id);
                                        setVoiceCallLogs(prev => [...prev, \`[TRANSLATOR] Switched language core to \${accent.id}\`]);
                                      }}
                                      className={\`py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer border \${
                                        medicalTranslationAccent === accent.id
                                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
                                      }\`}
                                    >
                                      {accent.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
`;

const output = content.slice(0, startIdx) + cleanReplacement + content.slice(endIdx);
fs.writeFileSync(filePath, output, 'utf8');
console.log("Cleanup applied successfully!");
