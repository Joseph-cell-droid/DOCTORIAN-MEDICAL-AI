import React from 'react';
import { 
  Users, Target, Heart, Award, ShieldCheck, Globe, Apple, Droplets, 
  Moon, Zap, Brain, Smile, Shield, Activity, Dna, CheckCircle2, 
  HelpCircle, Layers, Lock, Code, Database, Microscope, Milestone,
  Stethoscope, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const About: React.FC = () => {
  const healthTips = [
    {
      icon: <Apple className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Balanced Nutrition",
      description: "Focus on whole foods, lean proteins, and plenty of colorful vegetables to fuel your body effectively.",
      color: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
      icon: <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily to maintain energy levels and support vital organ functions.",
      color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Quality Sleep",
      description: "Aim for 7-9 hours of restful sleep each night to allow your body and mind to recover and recharge.",
      color: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  const techStack = [
    { icon: <Globe size={24} />, name: "Multi-Lingual Core", desc: "Fluent in 56+ Ugandan languages & technical English" },
    { icon: <Brain size={24} />, name: "Doctorian General AI", desc: "Fastest clinical reasoning edge core" },
    { icon: <Layers size={24} />, name: "Doctorian Clinical AI", desc: "Speed cloud diagnostic intelligence" },
    { icon: <Shield size={24} />, name: "Doctorian Uganda AI", desc: "Deep neural expert reasoning engine" },
    { icon: <Database size={24} />, name: "Doctorian Research AI", desc: "Quantum diagnostic multi-modal core" },
  ];

  const milestones = [
    { year: "2023", title: "Inception", desc: "Conceptualization of the Medical Cognis Engine." },
    { year: "2024", title: "Alpha V1", desc: "Initial deployment of symptom cross-referencing logic." },
    { year: "2025", title: "Scale-Up", desc: "Integration with global medical knowledge bases." },
    { year: "2026", title: "Expansion", desc: "Implementing real-time bio-simulation features." }
  ];

  const faqs = [
    { q: "Is Doctorian a replacement for doctors?", a: "No. Doctorian is a supportive intelligence tool designed to provide information and data synthesis. Always consult a qualified physician for clinical diagnosis." },
    { q: "How is my data handled?", a: "We utilize zero-knowledge principles where possible. Sensitive health data is encrypted end-to-end and never used for model re-training without explicit consent." },
    { q: "Where does the medical knowledge come from?", a: "Our AI is grounded in peer-reviewed clinical data, public health datasets, and modern medical journals through verified grounding layers." }
  ];

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20 relative z-10 space-y-24 sm:space-y-32">
      {/* Hero Section with Floating Accents */}
      <section className="text-center relative py-10" aria-labelledby="about-hero-title">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-8"
        >
          <Sparkles size={16} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Neural Intelligence Reimagined</span>
        </motion.div>

        <motion.h1 
          id="about-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9] sm:leading-[0.9]"
        >
          Systems <br />
          <span className="text-blue-600 relative inline-block">
            Information
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-2 left-0 h-2 bg-blue-600/20 rounded-full"
            />
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg sm:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-bold mb-12"
        >
          Doctorian Medical AI is a comprehensive clinical intelligence layer 
          designed to empower every individual with the collective knowledge of modern medicine.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-4">
          {['Doctorian General AI', 'Doctorian Clinical AI', 'Doctorian Triage AI', 'Doctorian Patient Education AI', 'Doctorian Uganda AI', 'Doctorian Research AI'].map((node, i) => (
             <motion.div
               key={`about-node-${node}-${i}`}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (i * 0.1) }}
               className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
             >
               {node} Active
             </motion.div>
          ))}
        </div>
      </section>

      {/* Floating Modern Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Clinical Core",
            desc: "Advanced neural pathways trained on global clinical guidelines and epidemiological datasets.",
            icon: <Microscope className="w-8 h-8" />,
            color: "blue"
          },
          {
            title: "Bio-Security",
            desc: "Zero-knowledge protocols and biometric authentication for total clinical data privacy.",
            icon: <ShieldCheck className="w-8 h-8" />,
            color: "indigo"
          },
          {
            title: "Universal Link",
            desc: "Linguistic matrices supporting 56+ Ugandan languages and global technical documentation.",
            icon: <Globe className="w-8 h-8" />,
            color: "emerald"
          }
        ].map((card, i) => (
          <motion.div
            key={`about-l134-i-${i}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-blue-900/10 hover:-translate-y-2 transition-all duration-500"
          >
            <div className={`w-16 h-16 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/30 flex items-center justify-center mb-8 text-${card.color}-600 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
              {card.icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{card.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{card.desc}</p>
            
            <div className={`mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between`}>
              <span className={`text-[10px] font-black uppercase tracking-widest text-${card.color}-600`}>System Module v3.2</span>
              <div className={`w-2 h-2 rounded-full bg-${card.color}-500 animate-pulse`} />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Philosophy Stats - Enhanced */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-[100%] -z-10" />
        {[
          { label: "Grounding Precision", val: "99.2%" },
          { label: "Synthesized Data", val: "1.2M+" },
          { label: "Neural Nodes", val: "48 Active" },
          { label: "Uptime Sync", val: "99.98%" }
        ].map((stat, i) => (
          <motion.div 
            key={`about-l165-i-${i}`}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 sm:p-12 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white dark:border-slate-800 text-center shadow-xl shadow-slate-200/20 dark:shadow-none"
          >
            <p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{stat.val}</p>
            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-[0.2em] leading-none">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-12" role="region" aria-label="Mission and Vision">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-blue-900/10 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Target size={120} className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px]" />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
            <Target size={24} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Mission</h2>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
            To democratize access to medical information by providing a reliable, intelligent, and accessible AI assistant that empowers individuals to make informed health decisions with confidence.
          </p>
        </motion.section>
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-blue-900/10 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Stethoscope size={120} className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px]" />
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-6 sm:mb-8 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
            <Heart size={24} className="sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Vision</h2>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-bold">
            A world where quality health guidance is instantly available to everyone, reducing medical anxiety and promoting proactive health management through cutting-edge technology.
          </p>
        </motion.section>
      </div>

      {/* Technology Infrastructure */}
      <section className="bg-slate-900 rounded-[4rem] p-12 sm:p-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tighter">Technology Stack</h2>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg font-bold">Built on a foundation of secure, high-performance systems and state-of-the-art LLMs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {techStack.map((tech, i) => (
              <motion.div
                key={`about-l227-i-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 text-blue-400">
                  {tech.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{tech.name}</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Roadmap */}
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Roadmap</h2>
          <p className="text-slate-600 dark:text-slate-400 font-black">The evolution of a new healthcare standard.</p>
        </div>
        <div className="space-y-12 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-px before:bg-slate-100 dark:before:bg-slate-800">
          {milestones.map((milestone, i) => (
            <motion.div
              key={`about-l254-i-${i}`}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="pl-20 relative group"
            >
              <div className="absolute left-6 top-1 w-4 h-4 bg-white dark:bg-slate-950 border-4 border-blue-600 rounded-full group-hover:scale-125 transition-transform"></div>
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{milestone.year}</div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{milestone.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed max-w-2xl">{milestone.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section aria-labelledby="core-values-title">
        <motion.h2 
          id="core-values-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl sm:text-4xl font-black text-center text-slate-900 dark:text-white mb-16 tracking-tight"
        >
          Our Foundational Pillars
        </motion.h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12">
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-6 group"
          >
            <div className="bg-sky-50 dark:bg-sky-900/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform" aria-hidden="true">
              <ShieldCheck size={40} className="text-sky-600" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Clinical Integrity</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">We prioritize medical accuracy and ethical AI practices above all else.</p>
          </motion.article>
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 group"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform" aria-hidden="true">
              <Award size={40} className="text-blue-600" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Model Excellence</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">Continuously improving our models to provide the highest quality health insights.</p>
          </motion.article>
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 group"
          >
            <div className="bg-indigo-50 dark:bg-indigo-900/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform" aria-hidden="true">
              <Globe size={40} className="text-indigo-600" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">Universal Access</h3>
            <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">Breaking down barriers to ensure healthcare knowledge is available to all.</p>
          </motion.article>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 rounded-[3rem] p-8 sm:p-20">
        <div className="text-center mb-16">
           <HelpCircle className="mx-auto text-blue-600 mb-4" size={40} />
           <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Common Inquiries</h2>
           <p className="text-slate-600 dark:text-slate-400 font-bold">Everything you need to know about the Cognis Hub.</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={`about-l332-i-${i}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800"
            >
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                {faq.q}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed pl-4.5">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Developer Spotlight */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden text-white relative"
        aria-labelledby="developer-title"
      >
        <div className="p-10 sm:p-16 md:p-24 lg:flex items-center gap-16 relative z-10">
          <div className="lg:w-1/3 mb-12 lg:mb-0">
             <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[4rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                 <div className="relative bg-slate-800 rounded-[3.5rem] p-8 aspect-square flex flex-col items-center justify-center border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(0,210,255,0.25)]">
                    <img
                      src="/portraits/akora_joseph.jpg"
                      alt="Akora Joseph — Founder & Lead Engineer"
                      className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-cyan-400/70 shadow-xl mb-5"
                    />
                    <div className="text-center">
                       <p className="text-2xl font-black tracking-tight">Akora Joseph</p>
                       <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Founder & Lead Engineer</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="lg:w-2/3">
             <h2 id="developer-title" className="text-3xl sm:text-5xl font-black mb-8 tracking-tighter">The Visionary Behind the Engine</h2>
             <div className="space-y-6 text-slate-300 text-lg md:text-xl font-bold leading-relaxed">
               <p>
                 Doctorian was conceptualized with a single, unyielding focus: to leverage 
                 exponential technology for radical social good. Akora Joseph recognized the 
                 fragmented nature of health resource accessibility and sought to build a bridge.
               </p>
               <p>
                 By combining advanced LLM reasoning with strict privacy-first architecture, 
                 this platform serves as more than just a tool—it&apos;s a clinical companion 
                 available 24/7, anywhere in the world.
               </p>
               <div className="pt-8 flex flex-wrap gap-4">
                 {['Systems Architecture', 'Cognis Networks', 'Clinical UX', 'Bio-Informatics'].map((tag, tIdx) => (
                    <span key={`about-tag-${tag}-${tIdx}`} className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold tracking-widest text-blue-400 border border-white/10 uppercase">
                       {tag}
                    </span>
                 ))}
               </div>
             </div>
           </div>
         </div>
         
         {/* Background Accents */}
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
       </motion.section>

       {/* Platform Multi-Screen Showcase */}
       <section className="doctorian-thick-card p-6 sm:p-10 space-y-5">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
           <div>
             <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
               Doctorian AI Clinical Suite
             </h2>
             <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-cyan-300">
               Smart Healthcare. Better Life. — Complete Unified Mobile &amp; Workstation Architecture
             </p>
           </div>
           <span className="px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-600 dark:text-cyan-300 text-xs font-black self-start">
             9 Core Clinical Modules
           </span>
         </div>
         <div className="rounded-3xl overflow-hidden border-2 border-cyan-500/35 bg-[#03091a] shadow-2xl">
           <img
             src="/assets/aistudio/image_2605a2cb.png"
             alt="Doctorian AI Complete Multi-Screen Architecture"
             className="w-full h-auto object-cover"
           />
         </div>
       </section>

      {/* Final CTA */}
      <section className="text-center py-20">
         <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8">Ready to sync with your health?</h2>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-10 py-5 bg-blue-600 text-white rounded-full font-black text-lg shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all">
               Initialize Session
            </button>
            <button className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
               View Documentation
            </button>
         </div>
      </section>
    </main>
  );
};
