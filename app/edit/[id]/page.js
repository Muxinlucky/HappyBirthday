'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import CreateForm from '../../../components/CreateForm';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ShareModal from '../../../components/ShareModal';
import { getGift, updateGift } from '../../../lib/supabase';

export default function EditPage() {
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gift, setGift] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getGift(id);
        if (data) {
          setGift(data);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to fetch gift:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateGift(id, data);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to update gift:', err);
      const msg = err?.message || err?.details || JSON.stringify(err);
      alert(`保存失败：${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="正在加载..." />;

  if (notFound) {
    return (
      <div className="h-dvh flex flex-col items-center justify-center bg-gray-950 px-6 text-center">
        <h1 className="text-2xl font-bold text-white/80 mb-2">盲盒未找到</h1>
        <p className="text-white/30 text-sm">这个链接可能已经失效</p>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>{saving && <LoadingSpinner text="正在保存修改..." />}</AnimatePresence>
      <AnimatePresence>
        {showModal && <ShareModal giftId={id} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
      <CreateForm
        onSubmit={handleUpdate}
        loading={saving}
        editMode={true}
        initialData={gift}
      />
    </>
  );
}
