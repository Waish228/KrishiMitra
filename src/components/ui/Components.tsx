import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'green' | 'earth' | 'sky' | 'purple';
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, gradient }) => {
  const gradientClasses = {
    green: 'bg-card-gradient-green text-white',
    earth: 'bg-card-gradient-earth text-white',
    sky: 'bg-card-gradient-sky text-white',
    purple: 'bg-card-gradient-purple text-white',
  };

  return (
    <div className={cn(
      'rounded-2xl',
      gradient
        ? gradientClasses[gradient]
        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm',
      hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
      className
    )}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  gradient?: 'green' | 'earth' | 'sky' | 'purple';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, trend, gradient, className
}) => {
  const gradientClasses = {
    green: 'bg-card-gradient-green',
    earth: 'bg-card-gradient-earth',
    sky: 'bg-card-gradient-sky',
    purple: 'bg-card-gradient-purple',
  };

  const isGradient = !!gradient;

  return (
    <div className={cn(
      'rounded-2xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
      isGradient
        ? `${gradientClasses[gradient!]} text-white`
        : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-1', isGradient ? 'text-white/80' : 'text-gray-500 dark:text-gray-400')}>
            {title}
          </p>
          <p className={cn('text-2xl font-bold font-display', isGradient ? 'text-white' : 'text-gray-900 dark:text-white')}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-xs mt-1', isGradient ? 'text-white/70' : 'text-gray-400 dark:text-gray-500')}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                trend.positive
                  ? isGradient ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : isGradient ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className={cn('text-xs', isGradient ? 'text-white/60' : 'text-gray-400')}>vs last week</span>
            </div>
          )}
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          isGradient ? 'bg-white/20' : 'bg-primary-50 dark:bg-primary-900/20'
        )}>
          <div className={isGradient ? 'text-white' : 'text-primary-600 dark:text-primary-400'}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'green', className }) => {
  const variants = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary', size = 'md', icon, loading, children, className, ...props
}) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200',
    outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  return (
    <button
      className={cn(
        'font-medium transition-all duration-200 active:scale-95 flex items-center gap-2 justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </button>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 animate-pulse', className)}>
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4" />
      </div>
    </div>
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
