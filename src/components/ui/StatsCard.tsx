import React from 'react';
import { cn } from '../../lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-[#101522] border border-[#232D42] hover:border-orange-500/40 rounded-xl p-5 shadow-sm transition-all duration-200 group',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-orange-500/20 transition-all">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h4 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h4>
        {change && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
              trend === 'up' && 'text-emerald-400 bg-emerald-500/10',
              trend === 'down' && 'text-rose-400 bg-rose-500/10',
              trend === 'neutral' && 'text-slate-400 bg-slate-800'
            )}
          >
            {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
        )}
      </div>

      {description && <p className="text-xs text-slate-500 mt-2">{description}</p>}
    </div>
  );
};
