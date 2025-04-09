'use client';

import { Button, ButtonProps } from '@heroui/button';
import { cn, VariantProps } from '@heroui/theme';

export type PromptSuggestionProps = {
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  highlight?: string;
} & Omit<ButtonProps, 'variant' | 'size'>;

function PromptSuggestion({
  children,
  variant,
  size,
  className,
  highlight,
  ...props
}: PromptSuggestionProps) {
  const isHighlightMode = highlight !== undefined && highlight.trim() !== '';
  const content = typeof children === 'string' ? children : '';

  if (!isHighlightMode) {
    return (
      <Button
        variant={variant || 'bordered'}
        size={size || 'lg'}
        className={cn('rounded-full', className)}
        {...props}
      >
        {children}
      </Button>
    );
  }

  if (!content) {
    return (
      <Button
        variant={variant || 'ghost'}
        size={size || 'sm'}
        className={cn('w-full justify-start rounded-xl py-2', className)}
        {...props}
      >
        {children}
      </Button>
    );
  }

  const trimmedHighlight = highlight.trim();
  const contentLower = content.toLowerCase();
  const highlightLower = trimmedHighlight.toLowerCase();
  const shouldHighlight = contentLower.includes(highlightLower);

  return (
    <Button
      variant={variant || 'ghost'}
      size={size || 'sm'}
      className={cn(
        'w-full cursor-pointer justify-start gap-0 rounded-xl py-2',
        'hover:bg-accent',
        className
      )}
      {...props}
    >
      {shouldHighlight ? (
        (() => {
          const index = contentLower.indexOf(highlightLower);
          if (index === -1)
            return <span className="text-default-500 whitespace-pre-wrap">{content}</span>;

          const actualHighlightedText = content.substring(index, index + highlightLower.length);

          const before = content.substring(0, index);
          const after = content.substring(index + actualHighlightedText.length);

          return (
            <>
              {before && <span className="text-default-500 whitespace-pre-wrap">{before}</span>}
              <span className="text-primary font-medium whitespace-pre-wrap">
                {actualHighlightedText}
              </span>
              {after && <span className="text-default-500 whitespace-pre-wrap">{after}</span>}
            </>
          );
        })()
      ) : (
        <span className="text-default-500 whitespace-pre-wrap">{content}</span>
      )}
    </Button>
  );
}

export { PromptSuggestion };
