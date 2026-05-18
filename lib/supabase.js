import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createGift(data) {
  const { data: result, error } = await supabase
    .from('gifts')
    .insert([data])
    .select('id')
    .single();

  if (error) throw error;
  return result.id;
}

export async function getGift(id) {
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function uploadPhoto(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `photos/${crypto.randomUUID()}.${ext}`;

  try {
    const { error } = await supabase.storage
      .from('HappyBirthday')
      .upload(path, file, { contentType: file.type });

    if (error) throw new Error(`存储桶上传失败: ${error.message}`);

    const { data } = supabase.storage
      .from('HappyBirthday')
      .getPublicUrl(path);

    // Track upload time for 7-day auto-delete
    await supabase.from('photo_expiry').insert([{
      url: data.publicUrl,
      storage_path: path,
      uploaded_at: new Date().toISOString(),
    }]);

    return data.publicUrl;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Failed to fetch');
    }
    throw err;
  }
}

// Clean up expired photos (older than 7 days)
export async function cleanupExpiredPhotos() {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: expired } = await supabase
    .from('photo_expiry')
    .select('storage_path, url')
    .lt('uploaded_at', cutoff);

  if (!expired?.length) return;

  const paths = expired.map((r) => r.storage_path);
  await supabase.storage.from('HappyBirthday').remove(paths);
  await supabase.from('photo_expiry').delete().lt('uploaded_at', cutoff);
}

export async function updateGift(id, data) {
  const { data: result, error } = await supabase
    .from('gifts')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw error;
  if (!result || result.length === 0) throw new Error('更新失败：未找到该盲盒，可能已被删除');
  return id;
}
