'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getGift, cleanupExpiredPhotos } from '../../../lib/supabase';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Envelope from '../../../components/Envelope';
import WordHeart from '../../../components/WordHeart';
import TypewriterText from '../../../components/TypewriterText';
import ConfettiSurprise from '../../../components/ConfettiSurprise';
import AudioController from '../../../components/AudioController';

const STAGES = {
  LOADING: 'loading',
  ENVELOPE: 'envelope',
  GALLERY: 'gallery',
  MESSAGE: 'message',
  CONFETTI: 'confetti',
};

export default function GiftPage() {
  const params = useParams();
  const id = params?.id;

  const [stage, setStage] = useState(STAGES.LOADING);
  const [gift, setGift] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const audio = AudioController();

  useEffect(() => {
    if (!id) return;
    // Fire-and-forget: clean up expired photos in background
    cleanupExpiredPhotos().catch(() => {});
    let cancelled = false;
    const fetchGift = async () => {
      try {
        const data = await getGift(id);
        if (cancelled) return;
        if (data) {
          setGift(data);
          setStage(STAGES.ENVELOPE);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to fetch gift:', err);
        setNotFound(true);
      }
    };
    fetchGift();

    // Re-fetch when user returns to this tab (e.g. after editing)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        getGift(id).then((data) => {
          if (data) setGift(data);
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id]);

  const handleEnvelopeOpen = useCallback(async () => {
    await audio.playSfx('/music/rustling-paper.wav');
    setTimeout(async () => {
      setStage(STAGES.GALLERY);
      await audio.playBgm();
    }, 600);
  }, [audio]);

  const handleGalleryComplete = useCallback(() => {
    setStage(STAGES.MESSAGE);
  }, []);

  const handleMessageComplete = useCallback(() => {
    setStage(STAGES.CONFETTI);
  }, []);

  const handleConfettiFire = useCallback(async () => {
    await audio.playSfx('/music/pop-confetti.wav');
  }, [audio]);

  // Store gift ID in localStorage so creator can find & edit later
  useEffect(() => {
    if (!id || !gift) return;
    try {
      const stored = JSON.parse(localStorage.getItem('createdGiftIds') || '[]');
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('createdGiftIds', JSON.stringify(stored));
      }
    } catch {}
  }, [id, gift]);

  // Loading state
  if (stage === STAGES.LOADING && !notFound) {
    return <LoadingSpinner text="正在拆开时光盲盒..." />;
  }

  // 404 state
  if (notFound) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gray-950 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
            animate={{ rotate: [0, -10, 10, -5, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-5xl">&#128148;</span>
          </motion.div>
          <h1 className="text-2xl font-bold text-white/80 mb-2">时光盲盒未找到</h1>
          <p className="text-white/30 text-sm mb-8">这个链接可能已经失效，或者从未存在过</p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/20 border border-amber-500/30
                       text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            制作一个新的时光盲盒
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-dvh bg-gray-950 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {stage === STAGES.ENVELOPE && (
          <motion.div key="envelope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Envelope onOpen={handleEnvelopeOpen} />
          </motion.div>
        )}

        {stage === STAGES.GALLERY && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh"
          >
            <div
              className="fixed inset-0"
              style={{
                background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
              }}
            />
            <div className="relative z-10 w-full h-dvh">
              <WordHeart
                senderName={gift?.senderName}
                receiverName={gift?.receiverName}
                onComplete={handleGalleryComplete}
              />
            </div>
          </motion.div>
        )}

        {stage === STAGES.MESSAGE && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-dvh flex flex-col items-center justify-center"
          >
            <div
              className="fixed inset-0 bg-cover bg-center blur-xl opacity-15 scale-110"
              style={{ backgroundImage: gift?.bgImage ? `url(${gift.bgImage})` : 'none' }}
            />

            <motion.div
              className="relative z-10 text-center mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-white/30 text-sm tracking-widest uppercase">祝福语</p>
            </motion.div>

            <div className="relative z-10 w-full">
              <TypewriterText text={gift?.message || ''} onComplete={handleMessageComplete} />
            </div>
          </motion.div>
        )}

        {stage === STAGES.CONFETTI && (
          <motion.div
            key="confetti"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-dvh"
          >
            <ConfettiSurprise onFire={handleConfettiFire} gift={gift} giftId={id} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
