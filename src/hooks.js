import { useState, useEffect } from "react";

export function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : defaultVal;
    } catch {
      return defaultVal;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }, [key, val]);
  return [val, setVal];
}

export function useAnimatedNumber(target, duration = 800) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (target - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return display;
}