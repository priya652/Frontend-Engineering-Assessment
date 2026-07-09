import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function and exposes { data, loading, error, retry }.
 *
 * Guarantees:
 *  - a superseded request can never overwrite a newer one (stale-response guard);
 *  - unmounting aborts the caller's wait;
 *  - `retry()` re-runs without changing any other state.
 *
 * @param {(signal: AbortSignal) => Promise<any>} asyncFn
 * @param {Array} deps  re-run whenever these change
 * @param {{ enabled?: boolean }} options
 */
export function useAsync(asyncFn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const [attempt, setAttempt] = useState(0);

  // Keep the latest fn in a ref so callers can pass an inline arrow function
  // without it being treated as a changed dependency on every render.
  const fnRef = useRef(asyncFn);
  fnRef.current = asyncFn;

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, error: null, loading: false });
      return undefined;
    }

    const controller = new AbortController();
    let current = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fnRef.current(controller.signal).then(
      (data) => current && setState({ data, error: null, loading: false }),
      (error) => {
        if (!current || error?.name === 'AbortError') return;
        setState({ data: null, error, loading: false });
      },
    );

    return () => {
      current = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt, enabled]);

  return { ...state, retry };
}
