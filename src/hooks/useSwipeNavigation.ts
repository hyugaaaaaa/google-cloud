import { useRef } from 'react';

type UseSwipeNavigationOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  enabled?: boolean;
};

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  enabled = true,
}: UseSwipeNavigationOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (!enabled) return;
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (!enabled) return;

    touchEndX.current = event.changedTouches[0]?.clientX ?? null;

    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const delta = touchStartX.current - touchEndX.current;

    if (delta > threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    if (delta < -threshold && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchEnd,
  };
}
