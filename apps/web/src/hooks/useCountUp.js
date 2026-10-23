import { useEffect, useRef, useState, useMemo } from "react";

export function useCountUp(targetValue, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  const config = useMemo(() => {
    const str = String(targetValue);
    const numericEnd = parseInt(str.replace(/\D/g, ""), 10) || 0;
    const suffix = str.replace(/[\d]/g, "");
    return { numericEnd, suffix };
  }, [targetValue]);

  useEffect(() => {
    if (hasAnimated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const startTime = performance.now();
          const { numericEnd } = config;

          const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(eased * numericEnd);
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [config, duration]);

  return { ref, value: `${count}${config.suffix}` };
}
