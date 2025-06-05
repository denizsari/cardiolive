'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface MobileOptimizationProps {
  children: React.ReactNode;
}

export function MobileOptimization({ children }: MobileOptimizationProps) {
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    setMounted(true);
    
    // Prevent zoom on input focus (iOS Safari)
    const handleFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (window.innerWidth < 768) {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
          }
        }
      }
    };

    const handleBlur = () => {
      if (window.innerWidth < 768) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5');
        }
      }
    };

    document.addEventListener('focusin', handleFocus, true);
    document.addEventListener('focusout', handleBlur, true);

    // Add mobile-specific classes
    if (isMobile) {
      document.body.classList.add('mobile');
    } else {
      document.body.classList.remove('mobile');
    }

    if (isTablet) {
      document.body.classList.add('tablet');
    } else {
      document.body.classList.remove('tablet');
    }

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      document.removeEventListener('focusout', handleBlur, true);
    };
  }, [isMobile, isTablet]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div className={`
      ${isMobile ? 'mobile-optimized' : ''}
      ${isTablet ? 'tablet-optimized' : ''}
    `}>
      {children}
    </div>
  );
}

// Touch-friendly button component
export function TouchButton({ 
  children, 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <button 
      className={`
        ${className}
        ${isMobile ? 'min-h-[44px] min-w-[44px] touch-manipulation' : ''}
        active:scale-95 transition-transform duration-100
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// Swipe gesture component for mobile
export function SwipeContainer({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  className = ''
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isVerticalSwipe) return; // Ignore vertical swipes

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      className={`${className} touch-pan-y`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
