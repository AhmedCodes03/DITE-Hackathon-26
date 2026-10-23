import { useEffect } from "react";

export function usePublicReveal(selector = "[data-reveal]") {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return undefined;

    const items = Array.from(document.querySelectorAll(selector));
    if (!items.length) return undefined;

    const hasObserver = typeof window.IntersectionObserver === "function";

    items.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(24px)";
      item.style.transition = `opacity 0.55s ease-out ${index * 90}ms, transform 0.55s ease-out ${index * 90}ms`;
      item.style.willChange = "opacity, transform";
    });

    if (!hasObserver) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      });
      return () => {
        items.forEach((item) => {
          item.style.willChange = "auto";
        });
      };
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          entry.target.style.willChange = "auto";
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.1
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      items.forEach((item) => {
        item.style.willChange = "auto";
      });
    };
  }, [selector]);
}
