import React, { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full transition-colors select-none',
  {
    variants: {
      variant: {
        cyan: 'bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30',
        trust: 'bg-trust-emerald/15 text-trust-emerald border border-trust-emerald/30',
        urgency: 'bg-urgency-orange/15 text-urgency-orange border border-urgency-orange/30',
        danger: 'bg-urgency-red/15 text-urgency-red border border-urgency-red/30',
        neutral: 'bg-white/5 text-text-muted border border-border-subtle',
        plain: 'bg-white/5 text-text-muted',
      },
      size: {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-xs px-3.5 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'cyan',
      size: 'sm',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export default function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}
