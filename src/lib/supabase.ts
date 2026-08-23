import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env variables - support standard Vite (VITE_) and Next.js (NEXT_PUBLIC_) conventions
const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

function getStoredOrEnvUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('fh_supabase_url');
    if (custom && custom.startsWith('http')) return custom.trim();
  }
  return (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  );
}

function getStoredOrEnvKey(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('fh_supabase_anon_key');
    if (custom && custom.length > 20) return custom.trim();
  }
  return (
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  );
}

let activeUrl = getStoredOrEnvUrl();
let activeKey = getStoredOrEnvKey();

export function checkIsConfigured(url: string, key: string): boolean {
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    url !== 'https://your-project.supabase.co' &&
    !url.includes('your-project') &&
    key.length > 20
  );
}

export let isSupabaseConfigured: boolean = checkIsConfigured(activeUrl, activeKey);

function buildClient(url: string, key: string): SupabaseClient | null {
  if (!checkIsConfigured(url, key)) return null;
  try {
    return createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 15,
        },
      },
    });
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

export let supabase: SupabaseClient | null = buildClient(activeUrl, activeKey);

/**
 * Configure Supabase credentials dynamically at runtime (e.g. from Settings UI)
 */
export function saveSupabaseConfig(url: string, anonKey: string): { success: boolean; isConfigured: boolean } {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (typeof window !== 'undefined') {
    if (cleanUrl && cleanKey) {
      localStorage.setItem('fh_supabase_url', cleanUrl);
      localStorage.setItem('fh_supabase_anon_key', cleanKey);
    } else {
      localStorage.removeItem('fh_supabase_url');
      localStorage.removeItem('fh_supabase_anon_key');
    }
  }

  activeUrl = cleanUrl || getStoredOrEnvUrl();
  activeKey = cleanKey || getStoredOrEnvKey();
  isSupabaseConfigured = checkIsConfigured(activeUrl, activeKey);
  supabase = buildClient(activeUrl, activeKey);

  // Notify components and trigger storage sync
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('fh-supabase-config-changed', { detail: { isConfigured: isSupabaseConfigured } }));
  }

  return { success: true, isConfigured: isSupabaseConfigured };
}

export function getActiveSupabaseCredentials(): { url: string; key: string; isConfigured: boolean } {
  return {
    url: activeUrl,
    key: activeKey ? `${activeKey.slice(0, 10)}...${activeKey.slice(-6)}` : '',
    isConfigured: isSupabaseConfigured,
  };
}

/**
 * Test connectivity with user's Supabase instance
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  tablesFound?: string[];
  error?: string;
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase is not configured. Please supply a valid Project URL and Anon Public Key.',
    };
  }

  try {
    // 1. Test profiles table
    const { data: profileCheck, error: profErr } = await supabase
      .from('profiles')
      .select('id, username')
      .limit(1);

    if (profErr) {
      // If table doesn't exist yet, give friendly instructions
      if (profErr.code === '42P01' || profErr.message.includes('relation "public.profiles" does not exist')) {
        return {
          success: false,
          message: 'Connected to Supabase project, but tables are missing! Please run the supabase_schema.sql script in your Supabase SQL Editor.',
          error: profErr.message,
        };
      }
      return {
        success: false,
        message: `Supabase Error: ${profErr.message}`,
        error: profErr.message,
      };
    }

    return {
      success: true,
      message: `Successfully connected to Supabase! PostgreSQL tables, Auth, and Realtime channels are active.`,
      tablesFound: ['profiles', 'locations', 'posts', 'photos', 'events'],
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Connection test failed. Please verify your Project URL and Anon Key.',
      error: String(err),
    };
  }
}

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
    throw new Error('Supabase Storage is not configured. Please add your Supabase URL and Anon Key.');
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
