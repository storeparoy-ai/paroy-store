import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium tracking-tight rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-cyan text-bg-deep font-bold hover:bg-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.4)] border border-cyan-300/40',
        outline:
          'bg-transparent text-brand-cyan border border-brand-cyan/40 hover:bg-brand-cyan/10 hover:border-brand-cyan',
        secondary:
          'bg-bg-card-alt text-text-main border border-border-subtle hover:border-white/20 hover:bg-white/5',
        urgency:
          'bg-urgency-orange text-bg-deep font-bold hover:bg-orange-400 hover:shadow-[0_0_16px_rgba(249,115,22,0.4)] border border-orange-400/40',
        ghost:
          'bg-transparent text-text-muted hover:text-text-main hover:bg-white/5',
        danger:
          'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:border-red-500/50',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-xs sm:text-sm rounded-xl',
        lg: 'h-12 px-6 text-sm sm:text-base font-bold rounded-xl',
        icon: 'h-10 w-10 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
