'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = '正在生成祝福...' }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="relative w-20 h-20 mb-6">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-400/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-amber-300/60"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-2 h-2 bg-amber-400 rounded-full" />
        </motion.div>
      </motion.div>
      <motion.p
        className="text-white/60 text-sm"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </motion.div>
  );
}
