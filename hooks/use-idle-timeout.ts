import { useState, useEffect } from 'react';

export function useIdleTimeout(timeoutMs: number = 60000) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    // Events to reset idle timer
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

    // Initial setup
    handleActivity();

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [timeoutMs]);

  return isIdle;
}
