import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  ShoppingCart, 
  User, 
  Calendar,
  Copy,
  Check,
  Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { usePrompt, usePurchasePrompt, useHasPurchased, useCurrentUser } from '@/hooks';
import { PromptGrid } from '@/components/prompt';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

export function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: prompt, isLoading } = usePrompt(id || '');
  const { data: hasPurchased } = useHasPurchased(id || '');
  const { data: currentUser } = useCurrentUser();
  const purchaseMutation = usePurchasePrompt();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = currentUser?.id === prompt?.creator_id;

  const handleCopy = async () => {
    if (!prompt?.content) return;
    
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handlePurchase = async () => {
    if (!prompt) return;

    try {
      await purchaseMutation.mutateAsync(prompt.id);
      toast.success('Prompt purchased successfully!');
      setShowPurchaseDialog(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to purchase prompt');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-12 w-2/3 bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Prompt not found</p>
            <Link to="/toko">
              <Button className="mt-4">Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to="/toko">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={categoryColors[prompt.category] || categoryColors.other}
              >
                {prompt.category}
              </Badge>
              {prompt.is_featured && (
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{prompt.title}</h1>
            <p className="text-muted-foreground">{prompt.description}</p>
          </div>

          {/* Creator Info */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={prompt.creator?.avatar_url || ''} alt={prompt.creator?.username} />
              <AvatarFallback>{prompt.creator?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{prompt.creator?.username}</p>
              <p className="text-sm text-muted-foreground">Creator</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({prompt.rating_count})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Prompt Content
                  </CardTitle>
                  {(hasPurchased || isOwner) && (
                    <Button variant="ghost" size="icon" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {hasPurchased || isOwner ? (
                    <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                      {prompt.content}
                    </pre>
                  ) : (
                    <div className="relative">
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg blur-sm select-none">
                        {prompt.content}
                      </pre>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-muted-foreground mb-2">
                            Purchase this prompt to view the full content
                          </p>
                          <Button onClick={() => setShowPurchaseDialog(true)}>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchase for {prompt.price} credits
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium capitalize">{prompt.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">{prompt.price} credits</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sales</p>
                      <p className="font-medium">{prompt.sales_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-medium">
                          {prompt.rating_average > 0
                            ? prompt.rating_average.toFixed(1)
                            : 'No ratings'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Updated</p>
                      <p className="font-medium">
                        {new Date(prompt.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {prompt.rating_count === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet. Be the first to review!
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Reviews will be displayed here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold">{prompt.price} credits</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-medium">
                    {prompt.rating_average > 0
                      ? prompt.rating_average.toFixed(1)
                      : '-'}
                  </span>
                </div>
              </div>

              {hasPurchased ? (
                <Button className="w-full" disabled>
                  <Check className="w-4 h-4 mr-2" />
                  Purchased
                </Button>
              ) : isOwner ? (
                <Button className="w-full" disabled>
                  Your Prompt
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPurchaseDialog(true)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase Now
                </Button>
              )}

              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{prompt.sales_count} sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Published {new Date(prompt.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">About the Creator</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={prompt.creator?.avatar_url || ''} alt={prompt.creator?.username} />
                  <AvatarFallback>{prompt.creator?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{prompt.creator?.username}</p>
                  <p className="text-sm text-muted-foreground">Prompt Creator</p>
                </div>
              </div>
              <Link to={`/profile/${prompt.creator_id}`}>
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Report */}
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
            <Flag className="w-4 h-4 mr-2" />
            Report this prompt
          </Button>
        </div>
      </div>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this prompt?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-semibold">{prompt.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              {prompt.description}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{prompt.category}</Badge>
              <span className="font-semibold text-primary">
                {prompt.price} credits
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>
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
