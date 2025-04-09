'use client';

import { Button } from '@heroui/button';
import { cn } from '@heroui/theme';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ScrollButtonProps = {
  scrollRef: React.RefObject<HTMLElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
  threshold?: number;
  variant?: 'solid' | 'ghost' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  size?: 'sm' | 'md' | 'lg';
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

function ScrollButton({
  scrollRef,
  containerRef,
  className,
  threshold = 100,
  variant = 'bordered',
  size = 'sm',
  ...props
}: ScrollButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        setIsVisible(scrollTop + clientHeight < scrollHeight - threshold);
      }
    };

    const container = containerRef.current;

    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef, threshold]);

  const handleScroll = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        'rounded-full',
        isVisible
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-4 scale-95 opacity-0',
        className
      )}
      isIconOnly
      onPress={handleScroll}
    >
      <ChevronDown className="h-4 w-4" />
    </Button>
  );
}

export { ScrollButton };
