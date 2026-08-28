import React, { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  id?: string;
}

/**
 * Standard layout container for Paroy Store.
 * Centered column capped at a comfortable max-width, with proportional
 * gutter padding — keeps content framed and readable on ultra-wide
 * monitors instead of stretching edge-to-edge (Steam/Tokopedia-style).
 */
export default function Container({
  as: Component = 'div',
  className,
  children,
  id,
  ...props
}: ContainerProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      id={id}
      className={cn(
        'w-full max-w-360 mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
