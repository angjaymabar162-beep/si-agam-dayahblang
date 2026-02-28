import { Link } from 'react-router-dom';
import { Star, ShoppingCart, User, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onPurchase?: () => void;
  className?: string;
}

const categoryColors: Record<string, string> = {
  writing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  coding: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  marketing: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  design: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  business: 'bg-green-500/10 text-green-600 border-green-500/20',
  education: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  creative: 'bg-red-500/10 text-red-600 border-red-500/20',
  productivity: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  research: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export function PromptCard({
  prompt,
  variant = 'default',
  showActions = true,
  onPurchase,
  className,
}: PromptCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
        isFeatured && 'border-primary/30 shadow-primary/10',
        className
      )}
    >
      <CardHeader className={cn('pb-3', isCompact && 'p-4 pb-2')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs font-medium capitalize',
                  categoryColors[prompt.category] || categoryColors.other
                )}
              >
                {prompt.category}
              </Badge>
              {prompt.is_featured && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <Link to={`/prompt/${prompt.id}`}>
              <h3
                className={cn(
                  'font-semibold line-clamp-2 group-hover:text-primary transition-colors',
                  isFeatured ? 'text-lg' : 'text-base'
                )}
              >
                {prompt.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">
              {prompt.rating_average > 0 ? prompt.rating_average.toFixed(1) : '-'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('pb-4', isCompact && 'p-4 pt-0 pb-3')}>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {prompt.description}
        </p>

        {!isCompact && (
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter
          className={cn(
            'pt-0 flex items-center justify-between',
            isCompact && 'p-4 pt-0'
          )}
        >
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={prompt.creator?.avatar_url || ''}
                alt={prompt.creator?.username}
              />
              <AvatarFallback className="text-xs">
                {prompt.creator?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {prompt.creator?.username}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ShoppingCart className="w-4 h-4" />
              {prompt.sales_count}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">{prompt.price} cr</span>
              {onPurchase && (
                <Button size="sm" onClick={onPurchase}>
                  Buy
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
