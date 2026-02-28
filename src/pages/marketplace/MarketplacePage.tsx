import { useState } from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptGrid, PromptFilters } from '@/components/prompt';
import { Leaderboard } from '@/components/gamification';
import { usePrompts, usePurchasePrompt, useLeaderboard } from '@/hooks';
import { useMarketplaceStore } from '@/lib/store';
import { toast } from 'sonner';
import type { Prompt } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function MarketplacePage() {
  const { filters } = useMarketplaceStore();
  const { data: prompts = [], isLoading } = usePrompts(filters);
  const { data: leaderboardEntries = [] } = useLeaderboard(5);
  const purchaseMutation = usePurchasePrompt();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const handlePurchase = async () => {
    if (!selectedPrompt) return;

    try {
      await purchaseMutation.mutateAsync(selectedPrompt.id);
      toast.success('Prompt purchased successfully!');
      setSelectedPrompt(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase prompt');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Prompt Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and purchase high-quality prompts from top creators
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <PromptFilters />

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {prompts.length} prompts
            </p>
            <Badge variant="outline">
              <Sparkles className="w-3 h-3 mr-1" />
              New prompts daily
            </Badge>
          </div>

          {/* Prompts Grid */}
          <PromptGrid
            prompts={prompts}
            isLoading={isLoading}
            onPurchase={setSelectedPrompt}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardContent className="p-6">
              <Leaderboard entries={leaderboardEntries} showHeader={true} maxDisplay={5} />
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['Writing', 'Coding', 'Marketing', 'Design', 'Business'].map((cat) => (
                  <Badge
                    key={cat}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Become a Creator</h3>
              <p className="text-sm text-primary-foreground/80 mb-4">
                Create and sell your own prompts to earn credits.
              </p>
              <Button variant="secondary" className="w-full">
                Start Creating
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this prompt?
            </DialogDescription>
          </DialogHeader>
          {selectedPrompt && (
            <div className="py-4">
              <h4 className="font-semibold">{selectedPrompt.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedPrompt.description}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedPrompt.category}</Badge>
                <span className="font-semibold text-primary">
                  {selectedPrompt.price} credits
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPrompt(null)}>
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
