import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  ShoppingBag, 
  Trophy, 
  ArrowRight,
  Check,
  Star,
  Flame,
  Gem,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { useFeaturedPrompts, useLeaderboard } from '@/hooks';
import { useAuthStore } from '@/lib/store';

function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Prompt Marketplace
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Generate, Share &{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Monetize
            </span>{' '}
            AI Prompts
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The ultimate platform for AI prompt creators. Generate powerful prompts, 
            share with the community, and earn credits from your creations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/generator">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Zap className="w-5 h-5" />
                  Start Generating
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=signup">
                  <Button size="lg" className="gap-2 text-lg px-8">
                    <Sparkles className="w-5 h-5" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/toko">
                  <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                    <ShoppingBag className="w-5 h-5" />
                    Browse Marketplace
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50K+', label: 'Prompts Generated' },
              { value: '5K+', label: 'Marketplace Items' },
              { value: '100K+', label: 'Credits Earned' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: 'AI Prompt Generator',
      description: 'Generate powerful prompts with multiple AI models including GPT-4, Claude, and more.',
    },
    {
      icon: ShoppingBag,
      title: 'Prompt Marketplace',
      description: 'Buy and sell high-quality prompts. Monetize your creativity and build your reputation.',
    },
    {
      icon: Trophy,
      title: 'Gamification',
      description: 'Earn badges, maintain streaks, and climb the leaderboard as you create and sell.',
    },
    {
      icon: Flame,
      title: 'Daily Streaks',
      description: 'Stay consistent with daily streaks. The longer your streak, the more rewards you earn.',
    },
    {
      icon: Gem,
      title: 'Earn Credits',
      description: 'Sell your prompts and earn credits. Use them to purchase premium prompts or withdraw.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your prompts are protected. Only buyers can see the full content of purchased prompts.',
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground">
            A complete platform for AI prompt generation, sharing, and monetization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedPromptsSection() {
  const { data: prompts = [], isLoading } = useFeaturedPrompts();

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="outline" className="mb-4">Featured</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Top Prompts</h2>
          </div>
          <Link to="/toko">
            <Button variant="ghost" className="gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <PromptGrid prompts={prompts} isLoading={isLoading} />
      </div>
    </section>
  );
}

function LeaderboardSection() {
  const { data: entries = [] } = useLeaderboard(5);

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="outline" className="mb-4">Competition</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Climb the Leaderboard
            </h2>
            <p className="text-muted-foreground mb-8">
              Compete with other creators, earn reputation, and become a top prompt engineer. 
              The more you create and sell, the higher you climb.
            </p>

            <div className="space-y-4">
              {[
                { icon: Star, text: 'Earn reputation with every sale' },
                { icon: Trophy, text: 'Unlock exclusive badges and rewards' },
                { icon: Flame, text: 'Maintain streaks for bonus multipliers' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Leaderboard entries={entries} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for getting started',
      features: [
        '100 free credits on signup',
        '50 generations per day',
        'Browse marketplace',
        'Basic streak tracking',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '9.99',
      description: 'For serious prompt engineers',
      features: [
        '500 credits per month',
        'Unlimited generations',
        'Priority support',
        'Advanced analytics',
        'Early access to features',
      ],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Creator',
      price: '29.99',
      description: 'For professional creators',
      features: [
        '2000 credits per month',
        'Everything in Pro',
        'Featured profile badge',
        'Lower marketplace fees',
        'Direct support channel',
      ],
      cta: 'Become a Creator',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground">
            Start free and upgrade as you grow. All plans include core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Start Creating?
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
          Join thousands of prompt engineers and start monetizing your creativity today.
        </p>
        <Link to={isAuthenticated ? '/generator' : '/auth?mode=signup'}>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 text-lg px-8"
          >
            <Sparkles className="w-5 h-5" />
            {isAuthenticated ? 'Start Generating' : 'Create Free Account'}
          </Button>
        </Link>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FeaturedPromptsSection />
      <LeaderboardSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
