const BASE_URL = 'https://dummyjson.com';
const REQUEST_TIMEOUT_MS = 12000;

/** Thrown for any non-2xx response or transport failure. */
export class ApiError extends Error {
  constructor(message, { status = 0, url = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
  }
}

/**
 * In-flight + settled response cache, keyed by full URL.
 * DummyJSON's catalogue is static for the life of a session, so re-fetching it
 * every time a brand checkbox is toggled would be pure waste. Caching the
 * promise (not just the value) also collapses duplicate concurrent requests.
 */
const cache = new Map();

function buildUrl(path, params = {}) {
  const url = new URL(path, BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * The caller's AbortSignal cancels *their* wait, not the shared request — so a
 * component unmounting mid-flight never poisons the cache for everyone else.
 */
function raceWithSignal(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

async function fetchJson(url) {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: timeout.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new ApiError(
        response.status === 404
          ? 'We could not find what you were looking for.'
          : `The server responded with ${response.status}. Please try again.`,
        { status: response.status, url },
      );
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'AbortError') {
      throw new ApiError('The request took too long. Check your connection and retry.', { url });
    }
    throw new ApiError('Could not reach the server. Check your connection and retry.', { url });
  } finally {
    clearTimeout(timer);
  }
}

/** GET a JSON resource, with caching, timeout and normalised errors. */
export function apiGet(path, { params, signal } = {}) {
  const url = buildUrl(path, params);
  if (!cache.has(url)) {
    // Evict failures so a transient network error does not become permanent.
    cache.set(
      url,
      fetchJson(url).catch((error) => {
        cache.delete(url);
        throw error;
      }),
    );
  }
  return raceWithSignal(cache.get(url), signal);
}
