import { Award, Star, Zap, Crown, DollarSign, TrendingUp, Flame, Fire, Gem, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Badge, UserBadge } from '@/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BadgesDisplayProps {
  badges: UserBadge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'star': Star,
  'zap': Zap,
  'crown': Crown,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'award': Award,
  'flame': Flame,
  'fire': Fire,
  'flame-kindling': Flame,
  'coins': Coins,
  'gem': Gem,
};

export function BadgesDisplay({
  badges,
  maxDisplay = 5,
  size = 'md',
  showEmpty = true,
  className,
}: BadgesDisplayProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const displayedBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  if (badges.length === 0 && showEmpty) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        No badges earned yet. Start creating and selling prompts!
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {displayedBadges.map((userBadge) => {
          const Icon = iconMap[userBadge.badge?.icon || 'award'] || Award;
          return (
            <Tooltip key={userBadge.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    sizeClasses[size],
                    'rounded-full bg-gradient-to-br from-primary/20 to-primary/5',
                    'border-2 border-primary/30 flex items-center justify-center',
                    'hover:scale-110 transition-transform cursor-help'
                  )}
                >
                  <Icon className={cn(iconSizes[size], 'text-primary')} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-semibold">{userBadge.badge?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {userBadge.badge?.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Earned on {new Date(userBadge.earned_at).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <div
            className={cn(
              sizeClasses[size],
              'rounded-full bg-muted flex items-center justify-center',
              'text-sm font-medium text-muted-foreground'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Component to display a single badge with details
interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: string;
  className?: string;
}

export function BadgeCard({ badge, earned = false, earnedAt, className }: BadgeCardProps) {
  const Icon = iconMap[badge.icon] || Award;

  return (
    <div
      className={cn(
        'p-4 rounded-xl border-2 transition-all',
        earned
          ? 'border-primary/30 bg-primary/5'
          : 'border-muted bg-muted/30 opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            earned ? 'bg-primary/20' : 'bg-muted'
          )}
        >
          <Icon className={cn('w-6 h-6', earned ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div className="flex-1">
          <h4 className={cn('font-semibold', !earned && 'text-muted-foreground')}>
            {badge.name}
          </h4>
          <p className="text-sm text-muted-foreground">{badge.description}</p>
          {earned && earnedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned on {new Date(earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
