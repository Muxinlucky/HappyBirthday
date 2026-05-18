'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit3 } from 'lucide-react';
import CreateForm from '../../components/CreateForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareModal from '../../components/ShareModal';
import { createGift } from '../../lib/supabase';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [giftId, setGiftId] = useState(null);
  const [recentId, setRecentId] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('createdGiftIds') || '[]');
      if (stored.length > 0) {
        setRecentId(stored[stored.length - 1]); // most recent
      }
    } catch {}
  }, []);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const id = await createGift(data);
      setGiftId(id);
      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('createdGiftIds') || '[]');
        if (!stored.includes(id)) {
          stored.push(id);
          localStorage.setItem('createdGiftIds', JSON.stringify(stored));
        }
        setRecentId(id);
      } catch {}
    } catch (err) {
      console.error('Failed to create gift:', err);
      const msg = err?.message || err?.details || JSON.stringify(err);
      alert(`生成失败：${msg}\n\n请确认已在 Supabase 中创建 gifts 表（参考下方 DDL）`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setGiftId(null);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingSpinner text="正在封装时光盲盒..." />}
      </AnimatePresence>

      <AnimatePresence>
        {giftId && !loading && (
          <ShareModal giftId={giftId} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* Recent gift edit banner */}
      {recentId && !giftId && (
        <motion.div
          className="relative z-20 max-w-lg mx-auto px-6 pt-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400/70 text-xs">你最近创建过一个时光盲盒</span>
            <Link
              href={`/edit/${recentId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium
                         hover:bg-amber-500/30 transition-colors flex-shrink-0"
            >
              <Edit3 className="w-3 h-3" />
              编辑
            </Link>
          </div>
        </motion.div>
      )}

      <CreateForm onSubmit={handleCreate} loading={loading} />
    </>
  );
}
