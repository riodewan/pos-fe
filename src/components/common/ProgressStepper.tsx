'use client';

import React from 'react';

export interface StepItem {
  num: number;
  label: string;
}

export interface ProgressStepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepNum: number) => void;
  className?: string;
  activeColor?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className = '',
  activeColor = '#FF5C38',
}: ProgressStepperProps) {
  const totalSteps = steps.length;
  // Calculate percentage width of the active connecting line:
  // Starts at center of step 1 (0% of the track) and ends at center of step N (100% of the track)
  const activePercentage =
    totalSteps > 1
      ? ((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 100
      : 100;

  // Fraction for left/right inset of the track line: half of one column's width
  // E.g. for 5 steps, column is 20%, half is 10%.
  const trackInsetPercent = 100 / (totalSteps * 2);

  return (
    <div className={`relative mb-7 px-1 select-none ${className}`}>
      {/* Continuous Connecting Track Line spanning exactly from center of step 1 to center of step N */}
      <div
        className="absolute top-[14px] h-[2.5px] -translate-y-1/2 z-0"
        style={{
          left: `${trackInsetPercent}%`,
          right: `${trackInsetPercent}%`,
        }}
      >
        {/* Background inactive track */}
        <div className="w-full h-full bg-neutral-200 rounded-full" />
        {/* Active filled track */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{
            width: `${activePercentage}%`,
            backgroundColor: activeColor,
          }}
        />
      </div>

      {/* Stepper Columns */}
      <div className="relative z-10 flex items-start justify-between">
        {steps.map((s) => {
          const isPast = s.num < currentStep;
          const isCurrent = s.num === currentStep;
          const isDoneOrActive = isCurrent || isPast;

          return (
            <div key={s.num} className="flex-1 flex flex-col items-center">
              {/* Step Circle with solid white ring to cleanly mask the line underneath */}
              <button
                type="button"
                onClick={() => {
                  if (onStepClick && s.num <= currentStep) {
                    onStepClick(s.num);
                  }
                }}
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ring-4 ring-white shrink-0 ${
                  onStepClick && s.num <= currentStep
                    ? 'cursor-pointer'
                    : 'cursor-default'
                } ${
                  isDoneOrActive
                    ? 'text-white shadow-xs'
                    : 'bg-neutral-200 text-neutral-500'
                }`}
                style={{
                  backgroundColor: isDoneOrActive ? activeColor : undefined,
                }}
              >
                {s.num}
              </button>

              {/* Step Label */}
              <span
                className={`text-[10.5px] mt-2 text-center font-medium leading-tight max-w-[68px] ${
                  isDoneOrActive ? 'font-semibold' : 'text-neutral-400'
                }`}
                style={{
                  color: isDoneOrActive ? activeColor : undefined,
                }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
