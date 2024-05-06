import React, {useEffect, useState} from 'react';

/**
 * Use the built-in ResizeObserver to listen for changes to the dimensions of an element
 * @param ref - React ref
 * @returns {object} - { width, height, top, left }
 */
const useResize = (
  ref: React.RefObject<HTMLElement>,
): {
  width: number;
  height: number;
  top: number;
  left: number;
} => {
  const [dimensions, setDimensions] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [ref]);

  return (
    dimensions || {
      width: 0,
      height: 0,
      top: 0,
      left: 0,
    }
  );
};

export default useResize;
