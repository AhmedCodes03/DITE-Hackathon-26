import { useEffect, useRef } from "react";

export function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;

    const intervalId = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [enabled, intervalMs]);
}
