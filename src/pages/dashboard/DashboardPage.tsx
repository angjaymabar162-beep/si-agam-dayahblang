import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StreakBadge, BadgesDisplay } from '@/components/gamification';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import {
  useCurrentUser,
  useUserProfile,
  useUserPrompts,
  usePurchases,
  useUserBadges,
  useActivities,
} from '@/hooks';
import { useAuthStore } from '@/lib/store';

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    prompt_generated: Zap,
    prompt_published: Sparkles,
    prompt_purchased: ShoppingBag,
    prompt_sold: TrendingUp,
    badge_earned: Award,
    streak_milestone: Flame,
    review_received: Sparkles,
  };

  const Icon = icons[activity.type] || Sparkles;
  const messages: Record<string, string> = {
    prompt_generated: 'Generated a new prompt',
    prompt_published: 'Published a new prompt',
    prompt_purchased: 'Purchased a prompt',
    prompt_sold: 'Sold a prompt',
    badge_earned: 'Earned a new badge',
    streak_milestone: 'Reached a streak milestone',
    review_received: 'Received a review',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{messages[activity.type] || activity.type}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(activity.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user: authUser } = useAuthStore();
  const { data: user } = useCurrentUser();
  const { data: profile } = useUserProfile(user?.id);
  const { data: userPrompts = [] } = useUserPrompts(user?.id);
  const { data: purchases = [] } = usePurchases();
  const { data: badges = [] } = useUserBadges(user?.id);
  const { data: activities = [] } = useActivities(5);

  const stats = [
    {
      title: 'Credits',
      value: user?.credits || 0,
      description: 'Available balance',
      icon: Sparkles,
    },
    {
      title: 'Prompts Created',
      value: profile?.total_prompts_generated || 0,
      description: 'Total prompts',
      icon: Zap,
    },
    {
      title: 'Prompts Sold',
      value: profile?.total_prompts_sold || 0,
      description: 'Total sales',
      icon: TrendingUp,
      trend: '+12% this week',
    },
    {
      title: 'Purchases',
      value: purchases.length,
      description: 'Prompts bought',
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge streak={profile?.streak_count || 0} />
          <Link to="/generator">
            <Button className="gap-2">
              <Zap className="w-4 h-4" />
              Generate
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Prompts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Prompts</CardTitle>
              <Link to="/creator/dashboard">
                <Button variant="ghost" size="sm" className="gap-1">
                  Manage
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {userPrompts.length > 0 ? (
                <PromptGrid
                  prompts={userPrompts.slice(0, 4)}
                  showActions={false}
                  emptyMessage="No prompts yet. Create your first prompt!"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t created any prompts yet.
                  </p>
                  <Link to="/creator/dashboard">
                    <Button>Create Your First Prompt</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Purchases */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Purchases</CardTitle>
              <Link to="/toko">
                <Button variant="ghost" size="sm" className="gap-1">
                  Browse
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.slice(0, 3).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{purchase.prompt?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Purchased on{' '}
                          {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{purchase.price_paid} cr</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No purchases yet. Explore the marketplace!
                  </p>
                  <Link to="/toko">
                    <Button>Browse Marketplace</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgesDisplay badges={badges} maxDisplay={6} />
              {badges.length > 0 && (
                <Link to="/dashboard/achievements">
                  <Button variant="ghost" size="sm" className="w-full mt-4">
                    View All Badges
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-1">
                  {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/generator">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Zap className="w-4 h-4" />
                  Generate Prompt
                </Button>
              </Link>
              <Link to="/creator/dashboard">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create Prompt
                </Button>
              </Link>
              <Link to="/toko">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
