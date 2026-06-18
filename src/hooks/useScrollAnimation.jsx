import { useRef, useEffect, useState } from 'react';

/**
 * Hook that returns a ref to attach to an element and a CSS class name
 * that will be added when the element enters the viewport.
 *
 * @param {string} animationClass - The CSS animation class to apply.
 * @returns {[React.RefObject<HTMLElement>, string]}
 */
export function useScrollAnimation(animationClass = 'animate-fade-in-up') {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: 0.15,
      },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  const className = isVisible ? animationClass : '';
  return [ref, className];
}
