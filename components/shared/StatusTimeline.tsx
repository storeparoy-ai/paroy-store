import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineStep {
  label: string;
  description?: string;
}

export default function StatusTimeline({
  steps,
  currentStep,
}: {
  steps: TimelineStep[];
  /** 0-indexed step that is currently active/in-progress */
  currentStep: number;
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, idx) => {
        const isDone = idx < currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <li key={step.label} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors',
                  isDone && 'bg-trust-emerald border-trust-emerald text-bg-deep',
                  isActive && 'border-brand-cyan text-brand-cyan bg-brand-cyan/10 animate-pulse',
                  !isDone && !isActive && 'border-border-subtle text-text-dim bg-bg-card-alt'
                )}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 flex-1 min-h-8',
                    isDone ? 'bg-trust-emerald' : 'bg-border-subtle'
                  )}
                />
              )}
            </div>
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-bold',
                  isDone && 'text-text-main',
                  isActive && 'text-brand-cyan',
                  !isDone && !isActive && 'text-text-dim'
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{step.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
