import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env variables - support standard Vite (VITE_) and Next.js (NEXT_PUBLIC_) conventions
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const supabaseUrl: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey: string =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Upload an image file or blob to a Supabase Storage bucket.
 * Returns public URL on success or throws error.
 */
export async function uploadToStorage(
  bucket: 'avatars' | 'photos',
  filePath: string,
  file: File | Blob,
  contentType?: string
): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase Storage is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const cleanPath = filePath.replace(/^\/+/, '');
  const { data, error } = await supabase.storage.from(bucket).upload(cleanPath, file, {
    upsert: true,
    contentType: contentType || (file instanceof File ? file.type : 'image/jpeg'),
  });

  if (error) {
    console.error(`[Supabase Storage] Upload error to bucket "${bucket}":`, error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}

/**
 * Remove an item from Supabase Storage
 */
export async function removeFromStorage(bucket: 'avatars' | 'photos', filePaths: string[]): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.storage.from(bucket).remove(filePaths);
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Storage] Delete error:', err);
    return false;
  }
}
