import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Friends-Hub is now Supabase-first in production.
 *
 * Older versions of the app also called a local Express `/api/*` backend.
 * Netlify serves the Vite SPA and does not run that Express server, so those
 * legacy calls produced 404/405 errors even though the corresponding
 * Supabase operations were succeeding.
 *
 * Keep a tiny compatibility shim so old store methods cannot generate noisy
 * network errors. Real reads/writes/realtime are handled by Supabase directly.
 */
if (typeof window !== 'undefined') {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : input.toString();

    let pathname = '';
    try {
      pathname = new URL(requestUrl, window.location.origin).pathname;
    } catch {
      pathname = requestUrl;
    }

    // Netlify has no Express /api server. Do not send legacy API requests.
    // Supabase is the authoritative production backend.
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ success: true, source: 'supabase', legacyApi: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    return nativeFetch(input, init);
  }) as typeof window.fetch;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
