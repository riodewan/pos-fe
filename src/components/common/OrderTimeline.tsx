'use client';

import React from 'react';

export interface TimelineEvent {
  id?: string | number;
  time: string;
  title: string;
  description?: string;
  metadata?: Array<{ label: string; value: string }>;
  actor?: string;
  author?: string;
  status: 'completed' | 'active' | 'pending';
}

export interface OrderTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function OrderTimeline({ events, className = '' }: OrderTimelineProps) {
  return (
    <div className={`space-y-6 relative ${className}`}>
      {/* Continuous Vertical Track Line */}
      <div className="absolute left-[79px] top-3 bottom-3 w-[2px] bg-blue-100 z-0" />

      {events.map((ev, idx) => {
        const isCompleted = ev.status === 'completed';
        const isActive = ev.status === 'active';
        const isPending = ev.status === 'pending';

        return (
          <div key={idx} className="relative z-10 flex items-start gap-4 text-xs">
            {/* Timestamp on Left */}
            <div className="w-14 text-right shrink-0 pt-0.5 font-medium text-neutral-500 select-none">
              {ev.time}
            </div>

            {/* Circular Timeline Node */}
            <div className="shrink-0 pt-0.5">
              {isCompleted || isActive ? (
                <div className="size-5 rounded-full border-2 border-[#2563EB] bg-white ring-4 ring-blue-50 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-[#2563EB]" />
                </div>
              ) : (
                <div className="size-5 rounded-full border-2 border-neutral-300 bg-white ring-4 ring-neutral-50" />
              )}
            </div>

            {/* Event Body on Right */}
            <div className="flex-1 min-w-0 pt-0.5 space-y-1">
              <h4
                className={`font-bold tracking-tight ${
                  isPending ? 'text-neutral-500 font-semibold' : 'text-neutral-900'
                }`}
              >
                {ev.title}
              </h4>

              {ev.description && (
                <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                  {ev.description}
                </p>
              )}

              {/* Metadata Table (e.g. Payment details in Screenshot 1) */}
              {ev.metadata && ev.metadata.length > 0 && (
                <div className="bg-neutral-50/70 border border-neutral-100 rounded-lg p-2.5 my-2 space-y-1 text-[11px]">
                  {ev.metadata.map((meta, mIdx) => (
                    <div key={mIdx} className="flex">
                      <span className="w-20 text-neutral-500 shrink-0">
                        {meta.label}
                      </span>
                      <span className="text-neutral-400 mr-2">:</span>
                      <span className="font-semibold text-neutral-800">
                        {meta.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actor / Author attribution */}
              {(ev.actor || ev.author) && (
                <p className="text-[11px] text-neutral-400">
                  {ev.actor || ev.author}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
