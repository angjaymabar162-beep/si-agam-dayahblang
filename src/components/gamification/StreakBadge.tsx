import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakBadge({ 
  streak, 
  size = 'md', 
  showLabel = true,
  className 
}: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs gap-1',
    md: 'h-8 px-3 text-sm gap-1.5',
    lg: 'h-10 px-4 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-orange-500 to-red-600';
    if (streak >= 7) return 'from-orange-400 to-orange-600';
    if (streak >= 3) return 'from-yellow-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium text-white',
        'bg-gradient-to-r shadow-lg',
        getStreakColor(streak),
        sizeClasses[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], streak > 0 && 'animate-pulse')} />
      <span>{streak}</span>
      {showLabel && <span className="hidden sm:inline">day streak</span>}
    </div>
  );
}
