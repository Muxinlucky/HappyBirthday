'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TypewriterText({ text, onComplete }) {
  const [lines, setLines] = useState([]);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [activeCharIdx, setActiveCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const paragraphsRef = useRef([]);
  const audioRef = useRef(null);

  // Init typewriter audio
  useEffect(() => {
    const audio = new Audio('/music/打字机.MP3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { audio.pause(); audio.currentTime = 0; };
  }, []);

  useEffect(() => {
    if (!text) return;
    const paragraphs = text.split('\n').filter(Boolean);
    paragraphsRef.current = paragraphs;
    if (paragraphs.length === 0) return;

    let lineIdx = 0;
    let charIdx = 0;
    let cancelled = false;

    // Start typewriter audio
    const audio = audioRef.current;
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

    const interval = setInterval(() => {
      if (lineIdx >= paragraphs.length) {
        clearInterval(interval);
        if (audio) { audio.pause(); audio.currentTime = 0; }
        if (!cancelled) setDone(true);
        return;
      }

      if (charIdx < paragraphs[lineIdx].length) {
        charIdx++;
        setActiveLineIdx(lineIdx);
        setActiveCharIdx(charIdx);
        setLines((prev) => {
          const updated = [...prev];
          if (updated.length <= lineIdx) updated.push('');
          updated[lineIdx] = paragraphs[lineIdx].slice(0, charIdx);
          return updated;
        });
      } else {
        lineIdx++;
        charIdx = 0;
        if (lineIdx >= paragraphs.length) {
          clearInterval(interval);
          if (audio) { audio.pause(); audio.currentTime = 0; }
          if (!cancelled) setDone(true);
        }
      }
    }, 50);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (audio) { audio.pause(); audio.currentTime = 0; }
    };
  }, [text]);

  const handleContinue = () => {
    onComplete?.();
  };

  if (!text) {
    return (
      <div className="flex justify-center py-20">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-10 py-16 max-w-sm w-full text-center">
          <p className="text-white/20 text-sm tracking-wider">暂无留言</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-6 py-8">
      {/* Letter card */}
      <div
        className="relative w-full max-w-md rounded-3xl px-8 py-12 overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(255,180,50,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4), 0 0 80px rgba(255,180,50,0.03), inset 0 1px 0 rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Top decorative line */}
        <div
          className="absolute top-0 left-12 right-12 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,180,50,0.2), rgba(255,180,50,0.5), rgba(255,180,50,0.2), transparent)',
          }}
        />

        {/* Corner decorations */}
        <div className="absolute top-3 left-4 w-3 h-3 border-l border-t border-amber-500/20 rounded-tl-sm" />
        <div className="absolute top-3 right-4 w-3 h-3 border-r border-t border-amber-500/20 rounded-tr-sm" />
        <div className="absolute bottom-3 left-4 w-3 h-3 border-l border-b border-amber-500/20 rounded-bl-sm" />
        <div className="absolute bottom-3 right-4 w-3 h-3 border-r border-b border-amber-500/20 rounded-br-sm" />

        <AnimatePresence mode="wait">
          <motion.div
            key="typewriter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {lines.map((line, i) => {
              const isActive = i === activeLineIdx && !done;
              const isNew = i === lines.length - 1 && activeCharIdx < 10;
              return (
                <motion.p
                  key={i}
                  initial={{
                    opacity: 0,
                    filter: 'blur(8px)',
                    transform: 'translateY(8px)',
                  }}
                  animate={{
                    opacity: 1,
                    filter: isNew ? 'blur(3px)' : 'blur(0px)',
                    transform: 'translateY(0px)',
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    filter: { duration: 0.8, ease: 'easeOut' },
                    transform: { duration: 0.6, ease: 'easeOut' },
                  }}
                  className="text-white/75 text-lg leading-relaxed tracking-wide font-light"
                >
                  {line}
                  {isActive && (
                    <span
                      className="inline-block w-0.5 h-5 ml-0.5 align-middle"
                      style={{
                        backgroundColor: '#ffb432',
                        boxShadow: '0 0 6px rgba(255,180,50,0.7), 0 0 14px rgba(255,150,0,0.3)',
                        animation: 'cursorBlink 1s step-end infinite',
                      }}
                    />
                  )}
                </motion.p>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom decorative line */}
        <div
          className="absolute bottom-0 left-12 right-12 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,180,50,0.15), rgba(255,180,50,0.35), rgba(255,180,50,0.15), transparent)',
          }}
        />
      </div>

      {/* Click to continue */}
      <AnimatePresence>
        {done && (
          <motion.div
            className="fixed bottom-12 inset-x-0 flex justify-center z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={handleContinue}
              className="px-8 py-3 rounded-full text-sm tracking-wider transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
              whileHover={{
                scale: 1.03,
                color: 'rgba(255,255,255,0.8)',
                borderColor: 'rgba(255,255,255,0.25)',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  '0 0 0px rgba(255,180,50,0)',
                  '0 0 24px rgba(255,180,50,0.12)',
                  '0 0 0px rgba(255,180,50,0)',
                ],
              }}
              transition={{
                boxShadow: { duration: 2.5, repeat: Infinity },
              }}
            >
              点击继续
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
