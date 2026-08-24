import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/**
 * Friends-Hub is Supabase-first in production.
 *
 * Older versions also called a local Express `/api/*` backend. Netlify serves
 * the Vite SPA and does not run that Express server, so those legacy calls
 * produced 404/405 errors even when Supabase was working correctly.
 *
 * Install the compatibility shim BEFORE loading App.tsx. App.tsx imports the
 * DataStore, whose constructor starts the old sync loop immediately.
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
    // All production reads/writes/realtime updates go through Supabase.
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

// Dynamic import is intentional: it guarantees the legacy API shim above is
// installed before App.tsx/DataStore module initialization.
void import('./App.tsx').then(({ default: App }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
