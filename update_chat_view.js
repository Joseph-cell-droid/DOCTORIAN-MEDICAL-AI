const fs = require('fs');

let code = fs.readFileSync('src/components/ModernizedChatView.tsx', 'utf8');

// 1. Remove duplicate closing
code = code.replace(
`    </div>
  );
};
  );
};

export const ModernizedChatView:`,
`    </div>
  );
};

export const ModernizedChatView:`
);

// 2. Replace old isLoading block
const targetStart = '{/* Open-Web AI Thinking State with Alternating Spinning Windows Icon and Milky Way Galaxy Bead */}';
const targetEnd = '{/* DEDICATED SMART ACTION CARD';

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const newThinkingBlock = `{/* Doctorian AI Thinking & Professional Reasoning State with App Logo & Chained Spinning Shapes */}
        {isLoading && (
          <div className="flex items-start gap-3 sm:gap-4 w-full max-w-3xl py-2.5">
            {/* The Doctorian App Logo & Chained Spinning Shapes Visualizer (No shape names) */}
            <DoctorianChainedThinkingVisual size="md" />

            <div className="flex-1 min-w-0 space-y-2.5 py-0.5">
              {/* Professional Status Header: Colorful Badge, Stage Title & Timer (No Shape Names) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Colorful Glowing Professional Badge */}
                <motion.div
                  key={'badge-' + reasoningIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ' + (PROFESSIONAL_REASONING_STAGES[reasoningIndex]?.badgeGradient || 'from-blue-600 to-cyan-500') + ' text-white shadow-md ' + (PROFESSIONAL_REASONING_STAGES[reasoningIndex]?.badgeGlow || 'shadow-cyan-500/30')}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                  <span>{PROFESSIONAL_REASONING_STAGES[reasoningIndex]?.badge || 'Clinical Reasoning'}</span>
                </motion.div>

                {/* Professional Reasoning Headline in Colorful Gradient */}
                <motion.span 
                  key={'stage-' + reasoningIndex}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-cyan-300 dark:text-cyan-200 font-bold text-xs sm:text-sm tracking-tight"
                >
                  {PROFESSIONAL_REASONING_STAGES[reasoningIndex]?.stage || 'Thinking & Reasoning...'}
                </motion.span>

                {/* Live High-Precision Clock */}
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 dark:bg-cyan-950/90 px-2 py-0.5 rounded-full border border-cyan-700/60 shadow-xs ml-auto sm:ml-0">
                  {reasoningElapsed.toFixed(1)}s
                </span>
              </div>
              
              {/* Detailed Professional Reasoning Subtext */}
              <motion.p 
                key={'desc-' + reasoningIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-slate-400 dark:text-slate-400 font-normal pl-0.5 leading-relaxed"
              >
                {PROFESSIONAL_REASONING_STAGES[reasoningIndex]?.detail}
              </motion.p>
              
              {/* Colorful Animated Neural Waveform Spectrum */}
              <div className="flex items-center gap-1.5 pl-0.5 pt-0.5">
                {[
                  'from-rose-500 to-pink-500',
                  'from-pink-500 to-purple-500',
                  'from-purple-500 to-indigo-500',
                  'from-blue-500 to-cyan-400',
                  'from-cyan-400 to-teal-400',
                  'from-teal-400 to-emerald-400',
                  'from-emerald-400 to-amber-400'
                ].map((grad, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      scaleY: [0.25, 1.1, 0.25],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: idx * 0.1,
                      ease: 'easeInOut'
                    }}
                    className={'w-1.5 h-3.5 rounded-full bg-gradient-to-t ' + grad + ' shadow-xs'}
                  />
                ))}
                <span className="text-[9px] font-mono text-cyan-400/90 dark:text-cyan-300/80 ml-2 tracking-wider uppercase font-bold">
                  Clinical Evidence Synthesizer Active
                </span>
              </div>
            </div>
          </div>
        )}

          </div>

          `;

  code = code.substring(0, startIndex) + newThinkingBlock + code.substring(endIndex);
  fs.writeFileSync('src/components/ModernizedChatView.tsx', code, 'utf8');
  console.log('SUCCESS: Updated ModernizedChatView with DoctorianChainedThinkingVisual and professional formats');
} else {
  console.log('ERROR: could not find indices', { startIndex, endIndex });
}
