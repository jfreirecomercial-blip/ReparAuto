import { useRef, useCallback, type RefObject } from 'react';

interface SwipeHandlers {
  onLeft?: () => void;
  onRight?: () => void;
}

interface SwipeBindings {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const THRESHOLD = 50;

export default function useSwipe(
  handlers: SwipeHandlers,
  ref?: RefObject<HTMLElement | null>,
): SwipeBindings {
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      if (Math.abs(dx) < THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
      if (dx > 0) handlers.onRight?.();
      else handlers.onLeft?.();
    },
    [handlers],
  );

  return { onTouchStart, onTouchEnd };
}
