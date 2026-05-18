'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';

export default function ShareModal({ giftId, onClose }) {
  const [copied, setCopied] = useState(false);

  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/gift/${giftId}`
    : `/gift/${giftId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full
                   shadow-2xl shadow-amber-500/5 relative"
        initial={{ scale: 0.9, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/40" />
        </button>

        {/* Success icon */}
        <motion.div
          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600
                     flex items-center justify-center shadow-lg shadow-amber-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>

        <h3 className="text-xl font-semibold text-white text-center mb-2">
          时光盲盒已生成！
        </h3>
        <p className="text-white/40 text-sm text-center mb-6">
          将链接分享给你的朋友，让 Ta 拆开这份心意
        </p>

        {/* Link display */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
          <input
            type="text"
            readOnly
            value={link}
            className="flex-1 bg-transparent text-white/70 text-sm outline-none truncate"
          />
          <motion.button
            onClick={handleCopy}
            className={`p-2.5 rounded-lg flex-shrink-0 transition-colors ${
              copied ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
        </div>

        {copied && (
          <motion.p
            className="text-green-400/80 text-xs text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            已复制到剪贴板
          </motion.p>
        )}

        <p className="text-white/20 text-xs text-center mt-4">
          点击链接即可预览祝福页面
        </p>
      </motion.div>
    </motion.div>
  );
}
