import { useEffect, useState } from "react";

/**
 * Checks if the given element is currently visible on the screen using
 * Intersection Observer.
 */
export const useOnScreen = (
  ref: React.RefObject<HTMLDivElement | undefined>,
  options?: undefined | IntersectionObserverInit
) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIntersecting(entry.isIntersecting);
        }
      },
      { threshold: 1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref.current]);

  return isIntersecting;
};
