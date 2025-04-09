'use client';

import { Button, ButtonProps } from '@heroui/button';
import { cn, VariantProps } from '@heroui/theme';

export type PromptSuggestionProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function PromptSuggestion({ children, className, ...props }: PromptSuggestionProps) {
  return (
    <button
      className={cn(
        'w-full active:scale-95 transition-all duration-250 border-divider rounded-full leading-tight border-[1.5px] px-4 py-3',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { PromptSuggestion };
