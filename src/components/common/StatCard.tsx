import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  /** Kept for backwards compatibility; the monochrome design ignores per-card tints. */
  iconClassName?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">{title}</span>
        {Icon && <Icon className="size-4 text-muted-foreground/70 shrink-0" strokeWidth={1.75} />}
      </div>
      <div className="text-[26px] leading-none font-semibold tracking-tight text-foreground tnum">
        {value}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
    </Card>
  );
}
