import { Trophy, Medal, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  showHeader?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function Leaderboard({
  entries,
  showHeader = true,
  maxDisplay = 10,
  className,
}: LeaderboardProps) {
  const displayedEntries = entries.slice(0, maxDisplay);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center font-semibold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Top Creators</h3>
        </div>
      )}

      <div className="space-y-2">
        {displayedEntries.map((entry, index) => (
          <div
            key={entry.user_id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg border transition-all',
              'hover:shadow-md hover:scale-[1.02]',
              getRankStyle(index + 1)
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 flex justify-center">
              {getRankIcon(index + 1)}
            </div>

            {/* Avatar */}
            <Avatar className="w-10 h-10">
              <AvatarImage src={entry.user?.avatar_url || ''} alt={entry.user?.username} />
              <AvatarFallback>{entry.user?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{entry.user?.username}</p>
              <p className="text-xs text-muted-foreground">
                {entry.total_sales} sales
              </p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="font-semibold text-primary">{entry.total_revenue} credits</p>
              <p className="text-xs text-muted-foreground">
                Score: {entry.reputation_score.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
