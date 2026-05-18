'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <main className="relative h-dvh w-full flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110"
        style={{ backgroundImage: 'url(/photos/1.jpg)' }}
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-white/70">每一份祝福，都是一颗时光胶囊</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance">
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              制作属于 Ta 的
            </span>
            <br />
            <span className="text-white/90">时光盲盒</span>
          </h1>

          <p className="text-lg text-white/50 mb-12 max-w-md mx-auto">
            填写祝福、上传回忆，生成专属链接 — 让 Ta 在生日那天，一层层拆开你的心意
          </p>
        </motion.div>

        {/* CTA Button with breathing animation */}
        <motion.button
          onClick={() => router.push('/create')}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl
                     bg-gradient-to-r from-amber-500 to-amber-600
                     text-white font-medium text-lg shadow-2xl shadow-amber-500/30
                     overflow-hidden group"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: hovered
              ? '0 0 40px rgba(245, 158, 11, 0.5), 0 0 80px rgba(245, 158, 11, 0.3)'
              : '0 0 20px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.1)',
          }}
          transition={{ duration: 0.6 }}
        >
          {/* Breathing ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-amber-300/50"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.04, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <Gift className="w-6 h-6 relative z-10" />
          <span className="relative z-10">免费制作</span>
        </motion.button>

        <motion.p
          className="mt-8 text-sm text-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          无需注册 · 完全免费 · 1 分钟完成
        </motion.p>
      </div>
    </main>
  );
}
