import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightElement, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-text-muted">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-text-dim pointer-events-none flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'w-full h-11 bg-bg-card text-text-main placeholder:text-text-dim text-xs sm:text-sm rounded-xl border border-border-subtle transition-all duration-200 focus:outline-none focus:border-brand-cyan/60 focus:ring-1 focus:ring-brand-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-4',
              rightElement ? 'pr-10' : 'pr-4',
              error && 'border-urgency-red/50 focus:border-urgency-red focus:ring-urgency-red/30',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center justify-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <span className="text-[11px] text-urgency-red font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
