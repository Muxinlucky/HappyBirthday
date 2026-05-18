'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function Envelope({ onOpen }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-dvh relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0f 0%, #020205 70%)' }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambient glow behind envelope */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,20,147,0.08) 0%, transparent 70%)',
            animation: 'envelopeGlow 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Envelope */}
      <motion.div
        className="relative cursor-pointer select-none"
        onClick={onOpen}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative" style={{ perspective: '800px' }}>
          <motion.div
            className="w-72 h-48 relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Envelope body with neon glow */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
                boxShadow: `
                  0 0 15px rgba(255,20,147,0.3),
                  0 0 40px rgba(255,20,147,0.1),
                  0 0 80px rgba(255,20,147,0.05),
                  inset 0 1px 0 rgba(255,255,255,0.03)
                `,
              }}
            />

            {/* Front flap (bottom) */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-2xl"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,20,147,0.15), rgba(255,20,147,0.05))',
                borderTop: '1px solid rgba(255,20,147,0.2)',
              }}
            />

            {/* Triangle flap */}
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top"
              style={{
                borderLeft: '144px solid transparent',
                borderRight: '144px solid transparent',
                borderTop: '100px solid #1a1a2e',
                filter: 'drop-shadow(0 0 8px rgba(255,20,147,0.4)) drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
              }}
              animate={{ rotateX: [0, 4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Inner glow line on flap edge */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,20,147,0.5), rgba(255,105,180,0.7), rgba(255,20,147,0.5), transparent)',
                boxShadow: '0 0 10px rgba(255,20,147,0.6), 0 0 20px rgba(255,20,147,0.3)',
              }}
            />

            {/* Wax Seal */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                className="w-14 h-14 rounded-full flex items-center justify-center relative"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, #ff4088, #c2185b)',
                  boxShadow: '0 0 15px rgba(255,20,147,0.5), 0 0 30px rgba(255,20,147,0.2), 0 4px 12px rgba(0,0,0,0.4)',
                }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Mail className="w-6 h-6 text-pink-200" style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* CTA text with typewriter cursor + neon glow */}
      <motion.div
        className="mt-14 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        <p
          className="text-amber-300/90 text-lg font-medium tracking-[0.3em] relative"
          style={{
            textShadow: '0 0 10px rgba(255,180,50,0.6), 0 0 30px rgba(255,150,0,0.3), 0 0 60px rgba(255,120,0,0.15)',
          }}
        >
          点击开启
          <span
            className="inline-block w-0.5 h-5 ml-1 align-middle"
            style={{
              backgroundColor: '#ffb432',
              boxShadow: '0 0 6px rgba(255,180,50,0.8), 0 0 14px rgba(255,150,0,0.4)',
              animation: 'cursorBlink 1s step-end infinite',
            }}
          />
        </p>
        <span className="text-white/15 text-xs tracking-widest">Click to Open</span>
      </motion.div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes envelopeGlow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
