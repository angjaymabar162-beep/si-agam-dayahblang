import { PromptCard } from './PromptCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Prompt } from '@/types';

interface PromptGridProps {
  prompts: Prompt[];
  isLoading?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  showActions?: boolean;
  onPurchase?: (prompt: Prompt) => void;
  emptyMessage?: string;
}

export function PromptGrid({
  prompts,
  isLoading = false,
  variant = 'default',
  showActions = true,
  onPurchase,
  emptyMessage = 'No prompts found',
}: PromptGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          variant={variant}
          showActions={showActions}
          onPurchase={onPurchase ? () => onPurchase(prompt) : undefined}
        />
      ))}
    </div>
  );
}
