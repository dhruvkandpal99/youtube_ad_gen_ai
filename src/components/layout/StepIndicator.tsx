'use client';

import React from 'react';
import { useAppState } from '../providers/AppStateProvider';

const steps = [
  { num: 1, label: 'Select' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'API Keys' },
  { num: 4, label: 'Discover' },
  { num: 5, label: 'Prompts' },
  { num: 6, label: 'Generate' },
  { num: 7, label: 'Summary' },
];

export default function StepIndicator() {
  const { state } = useAppState();
  const currentStep = state.step;

  return (
    <div className="bg-ytSurface border-b border-ytBorder py-3.5 px-6 select-none">
      {/* Mobile view: "Step N of 7" text */}
      <div className="md:hidden flex justify-between items-center text-[14px]">
        <span className="text-ytTextSecondary">
          Step <span className="text-white font-medium">{currentStep}</span> of 7
        </span>
        <span className="text-ytRed font-medium">
          {steps[currentStep - 1]?.label}
        </span>
      </div>

      {/* Desktop view: 7 dots with arrows */}
      <div className="hidden md:flex justify-between items-center max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isCurrent = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <React.Fragment key={step.num}>
              <div className="flex items-center space-x-2">
                {/* Visual Dot indicator */}
                <div
                  className={`w-2.5 h-2.5 rounded-full border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-ytRed border-ytRed scale-110 shadow-[0_0_8px_rgba(255,0,0,0.5)]'
                      : isCompleted
                      ? 'bg-[#888888] border-[#888888]'
                      : 'bg-transparent border-ytBorder'
                  }`}
                />
                
                {/* Step Label */}
                <span
                  className={`text-[13px] tracking-wide transition-colors duration-200 ${
                    isCurrent
                      ? 'text-ytRed font-medium'
                      : isCompleted
                      ? 'text-ytTextSecondary'
                      : 'text-ytTextSecondary/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Arrow Connector */}
              {index < steps.length - 1 && (
                <span className="text-ytBorder text-sm select-none">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
