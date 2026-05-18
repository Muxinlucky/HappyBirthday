'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Image, Link, Plus, Trash2, ArrowLeft, Upload, Cake } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { uploadPhoto } from '../lib/supabase';

const PRESET_BGS = [
  { path: '/photos/1.jpg', label: '暖光' },
  { path: '/photos/2.jpg', label: '花海' },
  { path: '/photos/3pexels.jpg', label: '星空' },
  { path: '/photos/4leaves.jpg', label: '秋叶' },
];

export default function CreateForm({ onSubmit, loading, editMode = false, initialData = null }) {
  const router = useRouter();

  const getInitialBg = () => {
    if (!initialData?.bgImage) return { preset: PRESET_BGS[0].path, custom: '', useCustom: false };
    const preset = PRESET_BGS.find((p) => p.path === initialData.bgImage);
    if (preset) return { preset: preset.path, custom: '', useCustom: false };
    return { preset: PRESET_BGS[0].path, custom: initialData.bgImage, useCustom: true };
  };

  const init = getInitialBg();

  const [senderName, setSenderName] = useState(initialData?.senderName || '');
  const [receiverName, setReceiverName] = useState(initialData?.receiverName || '');
  const [age, setAge] = useState(initialData?.age || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [bgImage, setBgImage] = useState(init.preset);
  const [customBgUrl, setCustomBgUrl] = useState(init.custom);
  const [useCustomBg, setUseCustomBg] = useState(init.useCustom);
  const [galleryInput, setGalleryInput] = useState('');
  const [galleryUrls, setGalleryUrls] = useState(initialData?.galleryUrls || []);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const addGalleryUrl = () => {
    const trimmed = galleryInput.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setErrors((prev) => ({ ...prev, gallery: '请输入有效的图片 URL (以 http:// 或 https:// 开头)' }));
      return;
    }
    if (galleryUrls.includes(trimmed)) {
      setErrors((prev) => ({ ...prev, gallery: '该 URL 已添加' }));
      return;
    }
    setGalleryUrls((prev) => [...prev, trimmed]);
    setGalleryInput('');
    setErrors((prev) => ({ ...prev, gallery: null }));
  };

  const removeGalleryUrl = (index) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/')) return false;
      if (f.size > MAX_SIZE) { setErrors((p) => ({ ...p, gallery: `"${f.name}" 超过 5MB 限制` })); return false; }
      return true;
    });

    if (!valid.length) return;

    setUploading(true);
    setErrors((p) => ({ ...p, gallery: null }));
    try {
      const urls = await Promise.all(valid.map((f) => uploadPhoto(f)));
      setGalleryUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      const msg = err.message === 'Failed to fetch'
        ? '上传失败: 无法连接到服务器，请检查 Supabase 项目是否已暂停（需在 Supabase Dashboard 唤醒），以及存储桶 "HappyBirthday" 是否已创建'
        : `上传失败: ${err.message}`;
      setErrors((p) => ({ ...p, gallery: msg }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!senderName.trim()) newErrors.senderName = '请填写你的名字';
    if (!receiverName.trim()) newErrors.receiverName = '请填写收礼人的名字';
    if (!message.trim()) newErrors.message = '请写下你想对 Ta 说的话';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalBg = useCustomBg && customBgUrl.trim() ? customBgUrl.trim() : bgImage;

    onSubmit({
      senderName: senderName.trim(),
      receiverName: receiverName.trim(),
      message: message.trim(),
      bgImage: finalBg,
      galleryUrls,
      age: age ? Number(age) : null,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGalleryUrl();
    }
  };

  const inputBase = 'w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/90 placeholder:text-white/25 outline-none transition-all duration-300 focus:border-amber-500/40 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(245,158,11,0.08)]';

  return (
    <div className="min-h-dvh bg-gray-950 relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.04),transparent_50%)] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-8 pt-8 pb-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回首页</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-light tracking-wide mb-2 text-white/90">
            {editMode ? '编辑时光盲盒' : '制作时光盲盒'}
          </h1>
          <p className="text-white/50 text-sm">
            {editMode ? '修改下方信息，保存后链接不变' : '填写下方信息，为 Ta 打造专属的生日惊喜'}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 max-w-6xl mx-auto px-8 pb-24">
        {/* Glassmorphism Card */}
        <motion.div
          className="rounded-3xl border border-white/[0.08] p-8 md:p-10"
          style={{
            background: 'linear-gradient(145deg, rgba(30,30,40,0.65), rgba(15,15,20,0.85))',
            backdropFilter: 'blur(24px)',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Two-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">

            {/* ── Left Column: Names + Photo Upload ── */}
            <div className="flex flex-col gap-5">
              {/* Sender Name */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-2.5 tracking-wide uppercase">
                  <User className="w-3.5 h-3.5" /> 你的名字
                </label>
                <input
                  type="text" value={senderName}
                  onChange={(e) => { setSenderName(e.target.value); setErrors((p) => ({ ...p, senderName: null })); }}
                  placeholder="例：小明"
                  className={`${inputBase} ${errors.senderName ? 'border-red-500/50' : ''}`}
                />
                {errors.senderName && <p className="text-red-400 text-xs mt-1.5">{errors.senderName}</p>}
              </motion.div>

              {/* Receiver Name */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-2.5 tracking-wide uppercase">
                  <Heart className="w-3.5 h-3.5 text-rose-400" /> Ta 的名字
                </label>
                <input
                  type="text" value={receiverName}
                  onChange={(e) => { setReceiverName(e.target.value); setErrors((p) => ({ ...p, receiverName: null })); }}
                  placeholder="例：小红"
                  className={`${inputBase} ${errors.receiverName ? 'border-red-500/50' : ''}`}
                />
                {errors.receiverName && <p className="text-red-400 text-xs mt-1.5">{errors.receiverName}</p>}
              </motion.div>

              {/* Age */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-2.5 tracking-wide uppercase">
                  <Cake className="w-3.5 h-3.5 text-amber-400" /> 过多少岁生日（数字）
                </label>
                <input
                  type="number" value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="例：18"
                  min="1"
                  max="150"
                  className={inputBase}
                />
              </motion.div>

              {/* Gallery URLs — takes remaining space */}
              <motion.div className="flex flex-col flex-1 min-h-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-2.5 tracking-wide uppercase">
                  照片回忆
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <motion.button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full mb-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.12] hover:border-amber-500/40 bg-white/[0.02] hover:bg-amber-500/[0.04] text-white/50 hover:text-amber-400 transition-all duration-300 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? '正在上传...' : '从本地选择图片上传'}
                </motion.button>

                <p className="text-white/30 text-xs mb-2">或粘贴外部图片链接：</p>
                <div className="flex gap-2">
                  <input
                    type="text" value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://example.com/photo.jpg"
                    className={`flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border text-white/80 placeholder:text-white/25 text-sm outline-none transition-all duration-300 focus:border-amber-500/40 focus:bg-white/[0.06] ${errors.gallery ? 'border-red-500/50' : 'border-white/[0.08]'}`}
                  />
                  <motion.button
                    type="button" onClick={addGalleryUrl}
                    className="px-4 py-3 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">添加</span>
                  </motion.button>
                </div>
                {errors.gallery && <p className="text-red-400 text-xs mt-1.5">{errors.gallery}</p>}
                {galleryUrls.length > 0 && (
                  <ul className="mt-3 space-y-2 overflow-y-auto max-h-[220px] pr-1 scrollbar-thin">
                    {galleryUrls.map((url, i) => (
                      <motion.li
                        key={url} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-sm"
                      >
                        <div className="w-8 h-8 rounded-md bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${url})` }} />
                        <span className="flex-1 text-white/50 truncate text-xs">{url}</span>
                        <button type="button" onClick={() => removeGalleryUrl(i)}
                          className="p-1 rounded hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>

            {/* ── Right Column: Message + Background + Submit ── */}
            <div className="flex flex-col gap-5">
              {/* Message — large, top-right */}
              <motion.div className="flex flex-col flex-1 min-h-0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-2.5 tracking-wide uppercase">
                  祝福语
                </label>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setErrors((p) => ({ ...p, message: null })); }}
                  placeholder="写下你想对 Ta 说的话...&#10;&#10;可以多行书写，每一段都会用打字机效果逐句展现"
                  className={`flex-1 min-h-[320px] w-full px-5 py-4 rounded-2xl text-white/90 placeholder:text-white/25 outline-none resize-none transition-all duration-300 overflow-y-auto ${errors.message ? 'border-red-500/50' : ''}`}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(245,158,11,0.35)';
                    e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.35), 0 0 24px rgba(245,158,11,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.message ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.07)';
                    e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.35)';
                  }}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1.5">{errors.message}</p>}
              </motion.div>

              {/* Background Image */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="flex items-center gap-2 text-xs text-[#b8b8c8] mb-3 tracking-wide uppercase">
                  <Image className="w-3.5 h-3.5" /> 背景图片
                </label>
                <div className="grid grid-cols-4 gap-2.5 mb-3">
                  {PRESET_BGS.map((bg) => (
                    <button
                      key={bg.path} type="button"
                      onClick={() => { setUseCustomBg(false); setBgImage(bg.path); }}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300
                                 ${!useCustomBg && bgImage === bg.path ? 'border-amber-400 shadow-lg shadow-amber-500/20' : 'border-white/[0.1] hover:border-white/25'}`}
                      style={{ backgroundImage: `url(${bg.path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    >
                      <div className="absolute inset-0 bg-black/20" />
                      <span className="absolute bottom-1.5 left-1.5 text-white/90 text-[10px] font-medium drop-shadow">{bg.label}</span>
                      {!useCustomBg && bgImage === bg.path && (
                        <motion.div layoutId="bgCheck" className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setUseCustomBg(!useCustomBg)}
                  className={`flex items-center gap-2 text-xs transition-colors ${useCustomBg ? 'text-amber-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Link className="w-3 h-3" /> 使用自定义图片 URL
                </button>
                {useCustomBg && (
                  <motion.input
                    type="text" value={customBgUrl}
                    onChange={(e) => setCustomBgUrl(e.target.value)}
                    placeholder="https://example.com/background.jpg"
                    className={`w-full mt-2.5 ${inputBase} text-sm`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  />
                )}
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl text-white font-medium text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.2)',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.2)'; }}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                {loading ? '正在保存...' : editMode ? '保存修改' : '生成时光盲盒'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}

export { PRESET_BGS };
