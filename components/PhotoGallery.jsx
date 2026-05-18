'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

function EmptyGallery({ senderName, receiverName }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Sender ❤ Receiver */}
      {senderName && receiverName && (
        <motion.p
          className="text-white/60 text-lg tracking-wide mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {senderName}
          {' '}
          <span
            className="inline-block mx-1"
            style={{
              color: '#ff1493',
              animation: 'heartBeat 0.8s ease-in-out infinite',
              textShadow: '0 0 12px rgba(255,20,147,0.5)',
            }}
          >
            &#10084;
          </span>
          {' '}
          {receiverName}
        </motion.p>
      )}
      {/* 3 tilted dashed Polaroid placeholders */}
      <div className="relative w-64 h-80 mb-10">
        {[
          { rotate: -8, x: -8, delay: 0 },
          { rotate: 0, x: 0, delay: 0.15 },
          { rotate: 8, x: 8, delay: 0.3 },
        ].map((cfg, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-md border-2 border-dashed flex items-center justify-center"
            style={{
              borderColor: 'rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              rotate: `${cfg.rotate}deg`,
              x: cfg.x,
              boxShadow: '0 0 30px rgba(255,20,147,0.05)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: cfg.delay, duration: 0.6, ease: 'easeOut' }}
          >
            <Plus className="w-8 h-8 text-white/10" />
          </motion.div>
        ))}
      </div>

      {/* Loading text */}
      <motion.p
        className="text-white/30 text-sm tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        回忆正在加载中...
      </motion.p>
    </div>
  );
}

export default function PhotoGallery({ images, bgImage, senderName, receiverName }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!images || images.length === 0) {
    return <EmptyGallery senderName={senderName} receiverName={receiverName} />;
  }

  const paginate = (dir) => {
    setDirection(dir);
    const next = index + dir;
    if (next >= 0 && next < images.length) {
      setIndex(next);
    }
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, rotate: d > 0 ? 8 : -8 }),
    center: { x: 0, opacity: 1, rotate: 0 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, rotate: d > 0 ? -8 : 8 }),
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {/* Background blur */}
      <div
        className="fixed inset-0 bg-cover bg-center blur-xl opacity-30 scale-110 -z-10"
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}
      />

      {/* Sender ❤ Receiver header */}
      {senderName && receiverName && (
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-white/60 text-lg tracking-wide">
            {senderName}
            {' '}
            <span
              className="inline-block mx-1"
              style={{
                color: '#ff1493',
                animation: 'heartBeat 0.8s ease-in-out infinite',
                textShadow: '0 0 12px rgba(255,20,147,0.5)',
              }}
            >
              &#10084;
            </span>
            {' '}
            {receiverName}
          </p>
        </motion.div>
      )}

      {/* Polaroid card */}
      <div className="relative h-[420px] flex items-center justify-center mb-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) paginate(1);
              if (info.offset.x > 80) paginate(-1);
            }}
            className="absolute bg-white p-3 pb-12 rounded-sm shadow-2xl"
            style={{
              maxWidth: '280px',
              transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
            }}
          >
            <img
              src={images[index]}
              alt={`回忆 ${index + 1}`}
              className="w-64 h-64 object-cover rounded-sm"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" fill="%23333"><rect width="256" height="256"/><text x="50%" y="50%" fill="%23666" text-anchor="middle" dy=".3em" font-size="14">图片加载失败</text></svg>';
              }}
            />
            <p className="text-gray-400 text-xs mt-3 text-center font-medium tracking-wider">
              #{index + 1} / {images.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          onClick={() => paginate(-1)}
          disabled={index === 0}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     disabled:opacity-20 disabled:cursor-not-allowed"
          whileHover={index > 0 ? { scale: 1.1 } : {}}
          whileTap={index > 0 ? { scale: 0.9 } : {}}
        >
          <ChevronLeft className="w-5 h-5 text-white/80" />
        </motion.button>

        {/* Dots */}
        <div className="flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? 'w-8' : 'w-2'
              }`}
              style={{ backgroundColor: i === index ? '#ff1493' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => paginate(1)}
          disabled={index === images.length - 1}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20
                     disabled:opacity-20 disabled:cursor-not-allowed"
          whileHover={index < images.length - 1 ? { scale: 1.1 } : {}}
          whileTap={index < images.length - 1 ? { scale: 0.9 } : {}}
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </motion.button>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-white/20 text-xs mt-6">
        左右滑动浏览照片
      </p>

      {/* Heartbeat keyframes */}
      <style jsx>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.25); }
          30% { transform: scale(1); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
