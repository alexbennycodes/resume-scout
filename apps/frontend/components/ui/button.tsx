import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center gap-2',
      'whitespace-nowrap text-sm font-medium',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0"
    );

    const iconHitArea = "before:absolute before:-inset-1.5 before:content-['']";

    const variants = {
      default: cn(
        'bg-primary text-primary-foreground',
        'shadow-[var(--shadow-glow)]',
        'hover:opacity-90 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      destructive: cn(
        'bg-destructive text-destructive-foreground',
        'shadow-[var(--shadow-glow)]',
        'hover:opacity-90 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      success: cn(
        'bg-green-700 text-white',
        'shadow-[var(--shadow-glow)]',
        'hover:opacity-90 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      warning: cn(
        'bg-orange-500 text-white',
        'shadow-[var(--shadow-glow)]',
        'hover:opacity-90 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      outline: cn(
        'border border-border bg-background',
        'hover:bg-accent hover:text-accent-foreground',
        'hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80 hover:-translate-y-0.5',
        'active:translate-y-0'
      ),
      ghost: cn(
        'hover:bg-accent hover:text-accent-foreground',
        'active:bg-accent'
      ),
      link: cn(
        'text-primary underline-offset-4',
        'hover:underline',
        'p-0 h-auto'
      ),
    };

    const sizes = {
      default: 'h-10 px-6 py-2 rounded-xl',
      sm: 'h-8 px-4 py-1 text-xs rounded-lg',
      lg: 'h-12 px-8 py-3 text-base rounded-2xl',
      icon: cn('h-11 w-11 p-0 rounded-xl', iconHitArea),
    };

    const variantClass = variants[variant];
    const sizeClass = sizes[size];

    return (
      <button ref={ref} className={cn(baseStyles, variantClass, sizeClass, className)} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button };
