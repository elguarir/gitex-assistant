import { cn } from '@heroui/theme';
import { Markdown } from './markdown';
import { Avatar } from '@heroui/avatar';
import { Tooltip, TooltipProps } from '@heroui/tooltip';

export type MessageProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn('flex gap-3', className)} {...props}>
    {children}
  </div>
);

export type MessageAvatarProps = {
  src: string;
  alt: string;
  fallback?: string;
  delayMs?: number;
  className?: string;
};

const MessageAvatar = ({ src, alt, fallback, className }: MessageAvatarProps) => {
  return (
    <Avatar
      className={cn('h-8 w-8 shrink-0', className)}
      color="default"
      src={src}
      alt={alt}
      fallback={fallback}
    />
  );
};

export type MessageContentProps = {
  children: React.ReactNode;
  markdown?: boolean;
  className?: string;
} & React.ComponentProps<typeof Markdown> &
  React.HTMLProps<HTMLDivElement>;

const MessageContent = ({
  children,
  markdown = false,
  className,
  ...props
}: MessageContentProps) => {
  return markdown ? (
    <Markdown
      className={cn(
        'rounded-lg py-2 px-3 bg-content3 text-content3-foreground prose break-words whitespace-normal',
        className
      )}
      {...props}
    >
      {children as string}
    </Markdown>
  ) : (
    <div
      className={cn(
        'rounded-lg py-2 px-3 bg-content3 text-content3-foreground prose break-words whitespace-normal',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type MessageActionsProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLProps<HTMLDivElement>;

const MessageActions = ({ children, className, ...props }: MessageActionsProps) => (
  <div className={cn('text-default-500 flex items-center gap-2', className)} {...props}>
    {children}
  </div>
);

export type MessageActionProps = {
  className?: string;
  tooltip: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
} & React.ComponentProps<typeof Tooltip>;

const MessageAction = ({
  content,
  children,
  className,
  placement = 'top',
  color = 'default',
  showArrow = true,
  ...props
}: TooltipProps) => {
  return (
    <>
      <Tooltip content={content} color={color} showArrow={showArrow} {...props}>
        {children}
      </Tooltip>
    </>
  );
};

export { Message, MessageAvatar, MessageContent, MessageActions, MessageAction };
