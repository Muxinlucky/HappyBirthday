'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Edit3, Gift } from 'lucide-react';
import Link from 'next/link';
import ParticleScene from './ParticleScene';

// ── Burst particle generator ──
function generateBurst(count = 24) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 60 + Math.random() * 100;
    particles.push({
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 3 + Math.random() * 5,
      color: ['#ff1493', '#ff69b4', '#ffb6c1', '#ffd700', '#ff8c00'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.1,
    });
  }
  return particles;
}

// ── CSS confetti generator ──
const CONFETTI_COLORS = ['#ff1493', '#ff69b4', '#ffb6c1', '#ffd700', '#ff8c00', '#ff4500', '#ff6347', '#ffa500'];
function generateConfetti(count = 60) {
  const pieces = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      rotation: Math.random() * 360,
      sway: (Math.random() - 0.5) * 120,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    });
  }
  return pieces;
}

const HOLD_DURATION = 1800; // ms to fill the ring

export default function ConfettiSurprise({ onFire, gift, giftId }) {
  const [phase, setPhase] = useState('idle'); // idle | burst | birthday | darken | particles
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [burstParticles, setBurstParticles] = useState([]);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const timerRef = useRef(null);
  const burstTimerRef = useRef(null);

  // Pre-generate confetti when entering birthday phase
  useEffect(() => {
    if (phase === 'birthday') {
      setConfettiPieces(generateConfetti());
    }
  }, [phase]);

  // Show CTA after particles settle
  useEffect(() => {
    if (phase === 'particles') {
      const t = setTimeout(() => setShowCta(true), 14000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // ── Long press logic ──
  const startPress = useCallback(() => {
    if (triggered) return;
    setPressing(true);
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= HOLD_DURATION) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        setPressing(false);
        setTriggered(true);
        triggerBurst();
      }
    }, 30);
  }, [triggered]);

  const endPress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPressing(false);
    // Progress retracts
    if (!triggered) {
      const decay = setInterval(() => {
        setProgress((prev) => {
          const next = prev - 3;
          if (next <= 0) { clearInterval(decay); return 0; }
          return next;
        });
      }, 16);
    }
  }, [triggered]);

  // ── Burst → Birthday ──
  const triggerBurst = useCallback(() => {
    onFire?.();
    setBurstParticles(generateBurst());
    setPhase('burst');

    burstTimerRef.current = setTimeout(() => {
      setBurstParticles([]);
      setPhase('birthday');
      setCountdown(5);
    }, 800);
  }, [onFire]);

  // ── Birthday countdown → Darken → Particles ──
  useEffect(() => {
    if (phase !== 'birthday') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('darken');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Darken → particles
  useEffect(() => {
    if (phase !== 'darken') return;
    const t = setTimeout(() => setPhase('particles'), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    };
  }, []);

  // ── Ring progress circle helpers ──
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative min-h-dvh">
      {/* 3D Particle iframe */}
      <ParticleScene active={phase === 'particles'} galleryUrls={gift?.galleryUrls || []} age={gift?.age} />

      {/* ── Darken overlay ── */}
      <AnimatePresence>
        {phase === 'darken' && (
          <motion.div
            className="fixed inset-0 z-25 pointer-events-none"
            style={{ backgroundColor: '#000' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 1.2, ease: 'easeIn' }}
          />
        )}
      </AnimatePresence>

      {/* ── Idle / Pressing: Long-press button with ring ── */}
      <AnimatePresence>
        {!triggered && (
          <motion.div
            key="ritual"
            className="flex flex-col items-center justify-center min-h-dvh relative z-30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative select-none"
              onMouseDown={startPress}
              onMouseUp={endPress}
              onMouseLeave={endPress}
              onTouchStart={startPress}
              onTouchEnd={endPress}
            >
              {/* Ring progress SVG */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                style={{ width: 120, height: 120, left: -12, top: -12 }}
              >
                {/* Background ring */}
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                {/* Progress ring — pink fill */}
                <motion.circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke="#ff1493"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(255,20,147,0.7)) drop-shadow(0 0 14px rgba(255,20,147,0.3))',
                    transition: 'stroke-dashoffset 0.05s linear',
                  }}
                />
              </svg>

              {/* Cake button */}
              <motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center relative"
                style={{
                  background: pressing
                    ? 'radial-gradient(circle, rgba(255,20,147,0.2), rgba(255,20,147,0.05))'
                    : 'radial-gradient(circle, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                  border: pressing
                    ? '2px solid rgba(255,20,147,0.5)'
                    : '2px solid rgba(255,255,255,0.08)',
                  boxShadow: pressing
                    ? '0 0 24px rgba(255,20,147,0.3), 0 0 48px rgba(255,20,147,0.1)'
                    : '0 0 0px rgba(255,20,147,0)',
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Breathing glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '1px solid rgba(255,20,147,0.25)',
                  }}
                  animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                />

                <Cake
                  className="w-8 h-8 relative z-10"
                  style={{
                    color: pressing ? '#ff69b4' : '#ffb432',
                    filter: pressing
                      ? 'drop-shadow(0 0 8px rgba(255,20,147,0.6))'
                      : 'drop-shadow(0 0 3px rgba(255,180,50,0.3))',
                    transition: 'all 0.3s ease',
                  }}
                />
              </motion.div>
            </motion.div>

            {/* Hint text */}
            <motion.p
              className="mt-8 text-white/40 text-sm tracking-[0.3em]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {pressing ? '继续按住...' : '长按许愿'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Burst particles ── */}
      <AnimatePresence>
        {phase === 'burst' && burstParticles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed z-30 rounded-full pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: '50%',
              top: '50%',
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.7, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* ── Birthday phase ── */}
      <AnimatePresence>
        {phase === 'birthday' && (
          <motion.div
            key="birthday"
            className="fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #030308 70%)',
              }}
            />

            {/* CSS Confetti */}
            {confettiPieces.map((c) => (
              <div
                key={c.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${c.left}%`,
                  top: -20,
                  width: c.shape === 'rect' ? c.size * 0.4 : c.size,
                  height: c.size,
                  backgroundColor: c.shape === 'rect' ? c.color : 'transparent',
                  borderRadius: c.shape === 'circle' ? '50%' : '2px',
                  boxShadow: c.shape === 'circle' ? `0 0 ${c.size}px ${c.color}` : 'none',
                  animation: `confettiFall ${c.duration}s ${c.delay}s ease-in infinite`,
                  transform: `rotate(${c.rotation}deg)`,
                  '--sway': `${c.sway}px`,
                }}
              />
            ))}

            {/* Neon "Happy Birthday!" */}
            <motion.div
              className="relative z-10 text-center px-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <h1
                className="text-5xl md:text-7xl font-bold tracking-wide"
                style={{
                  color: '#fff',
                  textShadow: `
                    0 0 7px #fff,
                    0 0 10px #fff,
                    0 0 21px #fff,
                    0 0 42px #ff1493,
                    0 0 82px #ff1493,
                    0 0 92px #ff1493,
                    0 0 102px #ff1493,
                    0 0 151px #ff1493
                  `,
                }}
              >
                {gift?.receiverName ? 'Happy Birthday!' : '生日快乐！'}
              </h1>

              {gift?.receiverName && (
                <motion.p
                  className="mt-4 text-white/50 text-xl tracking-wider"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  To: {gift.receiverName}
                </motion.p>
              )}
            </motion.div>

            {/* Countdown */}
            <motion.div
              className="relative z-10 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3 text-white/25 text-sm tracking-widest">
                <span>即将进入回忆空间</span>
                <motion.span
                  key={countdown}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-lg font-bold"
                  style={{
                    backgroundColor: 'rgba(255,20,147,0.15)',
                    color: '#ff69b4',
                    border: '1px solid rgba(255,20,147,0.3)',
                  }}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {countdown}
                </motion.span>
              </div>
            </motion.div>

            {/* From label */}
            <motion.p
              className="relative z-10 mt-8 text-white/15 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              From: {gift?.senderName || '神秘人'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Text overlays during particles ── */}
      <AnimatePresence>
        {phase === 'particles' && (
          <>
            {/* Happy Birthday — neon pink glow (subdued), upper area */}
            <motion.div
              className="fixed top-[18%] inset-x-0 text-center z-30 pointer-events-none"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.8, duration: 1.2, ease: 'easeOut' }}
            >
              <h1
                className="text-5xl md:text-7xl font-bold tracking-wide"
                style={{
                  color: '#fff',
                  textShadow: `
                    0 0 7px #fff,
                    0 0 10px #fff,
                    0 0 21px #fff,
                    0 0 42px #ff1493,
                    0 0 82px #ff1493,
                    0 0 92px #ff1493,
                    0 0 102px #ff1493,
                    0 0 151px #ff1493
                  `,
                }}
              >
                Happy Birthday!
              </h1>
              {/* From xxx */}
              <motion.p
                className="mt-6 text-sm tracking-[0.3em]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.0 }}
              >
                From {gift?.senderName || '神秘人'}
              </motion.p>
            </motion.div>

            {/* 生日快乐 — bottom area */}
            <motion.div
              className="fixed bottom-24 inset-x-0 text-center z-30 pointer-events-none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, type: 'spring', stiffness: 200 }}
            >
              <p
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #ffd700, #ffb432, #ffd700)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 15px rgba(255,180,50,0.4))',
                }}
              >
                生日快乐！
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CTA Buttons (bottom-right, after particle scene settles) ── */}
      <AnimatePresence>
        {showCta && (
          <motion.div
            className="fixed bottom-6 right-6 flex flex-col gap-3 z-40"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.5 }}
          >
            {giftId && (
              <Link
                href={`/edit/${giftId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(255,20,147,0.12)',
                  border: '1px solid rgba(255,20,147,0.25)',
                  color: '#ff69b4',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,20,147,0.22)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,20,147,0.12)'; }}
              >
                <Edit3 className="w-4 h-4" />
                编辑此盲盒
              </Link>
            )}
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <Gift className="w-4 h-4" />
              也制作一个时光盲盒
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CSS Keyframes ── */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) translateX(var(--sway, 40px)) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
