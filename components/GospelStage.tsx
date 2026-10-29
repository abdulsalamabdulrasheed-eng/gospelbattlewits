'use client';

import { motion } from 'framer-motion';

export function GospelStage({ type }: { type: 'vote' | 'registration' }) {
  const isVote = type === 'vote';

  return (
    <div className={`relative w-full h-48 flex items-center justify-center overflow-hidden ${isVote ? 'bg-[#0A0A0A]' : 'bg-gray-900'}`}>
      
      {/* Background Spotlight */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl ${isVote ? 'bg-yellow-500/40' : 'bg-white/10'}`}
      ></motion.div>

      {/* Sound Waves (Voting Only) */}
      {isVote && (
        <>
          <motion.div animate={{ scale: [1, 1.5], opacity: [0.3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} className="absolute w-32 h-32 border-2 border-yellow-500/50 rounded-full"></motion.div>
          <motion.div animate={{ scale: [1, 2], opacity: [0.2, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: "easeOut" }} className="absolute w-32 h-32 border-2 border-yellow-500/30 rounded-full"></motion.div>
        </>
      )}

      {/* Neutral Silhouette */}
      <motion.svg 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewBox="0 0 100 100" 
        className={`w-32 h-32 relative z-10 ${isVote ? 'text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]' : 'text-gray-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]'}`}
        fill="currentColor"
      >
        {/* Head */}
        <circle cx="50" cy="30" r="12" />
        {/* Body */}
        <path d="M 35 45 Q 50 55 65 45 L 70 80 L 60 80 L 55 60 L 45 60 L 40 80 L 30 80 Z" />
        {/* Arm holding Mic */}
        <path d="M 35 50 Q 20 60 30 70 L 40 65 Q 30 60 45 55 Z" />
        {/* Microphone */}
        <rect x="25" y="65" width="6" height="12" rx="3" transform="rotate(-30 28 71)" />
        <path d="M 22 75 L 28 78 L 26 82 Z" />
      </motion.svg>

      {/* Text Overlay */}
      <div className="absolute bottom-4 left-0 w-full text-center z-20">
        <h2 className={`font-black tracking-widest uppercase text-sm ${isVote ? 'text-yellow-500' : 'text-gray-300'}`}>
          {isVote ? 'Voice Heard' : 'Registration Confirmed'}
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">TFTC Live Show 2027</p>
      </div>
    </div>
  );
}
