import { useRef, useState, useCallback } from "react";

function useIntersection(rootMargin) {
  const [isVisible, setIsVisible] = useState(false);
  const observer = useRef();
  const ref = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting);
        },
        { rootMargin },
      );
      if (node) observer.current.observe(node);
    },
    [rootMargin],
  );

  return { ref, isVisible };
}

export default useIntersection;
