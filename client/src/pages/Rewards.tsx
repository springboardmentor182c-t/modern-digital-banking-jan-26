import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Star, TrendingUp, Award, Sparkles } from 'lucide-react';

export function Rewards() {
  const [rewards, setRewards] = useState({
    totalPoints: 0,
    programName: 'SmartBank Rewards',
    tier: 'Bronze',
    pointsToNextTier: 0,
    recentEarnings: [] as Array<{ date: string; points: number; description: string }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const data = await api.getUserDashboard();
        if (data.rewards) {
          setRewards(data.rewards);
        }
      } catch (error) {
        console.error('Failed to load rewards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const pointsProgress = rewards.totalPoints + rewards.pointsToNextTier > 0
    ? (rewards.totalPoints / (rewards.totalPoints + rewards.pointsToNextTier)) * 100
    : 0;

  // These are UI config for redemption tiers, not user-specific mock data
  const rewardCategories = [
    { name: 'Travel', points: 5000, icon: '✈️' },
    { name: 'Shopping', points: 2500, icon: '🛍️' },
    { name: 'Dining', points: 1500, icon: '🍽️' },
    { name: 'Gift Cards', points: 1000, icon: '🎁' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Rewards Program</h2>
          <p className="text-muted-foreground mt-1">Earn and redeem your rewards points</p>
        </div>
      </div>

      {/* Points Overview */}
      <Card className="p-8 bg-gradient-to-br from-purple-500 to-blue-500 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/80 mb-2">Total Points Balance</p>
            <p className="text-5xl font-bold">{rewards.totalPoints.toLocaleString()}</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Current Tier</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0">
                  {rewards.tier} Member
                </Badge>
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Next Tier</p>
              <p className="font-semibold">
                {rewards.tier === 'Bronze' ? 'Silver' : rewards.tier === 'Silver' ? 'Gold' : rewards.tier === 'Gold' ? 'Platinum' : 'Max'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{rewards.pointsToNextTier > 0 ? `${rewards.pointsToNextTier} points to next tier` : 'Top tier reached!'}</span>
              <span>{pointsProgress.toFixed(0)}%</span>
            </div>
            <Progress value={pointsProgress} className="h-2 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>
      </Card>

      {/* Recent Earnings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Earnings</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-4">
          {rewards.recentEarnings.length > 0 ? (
            rewards.recentEarnings.map((earning, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{earning.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {earning.date ? new Date(earning.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">+{earning.points}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent earnings. Start spending to earn points!</p>
          )}
        </div>
      </Card>

      {/* Redeem Points */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Redeem Your Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewardCategories.map((category) => (
            <Card key={category.name} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center space-y-4">
                <div className="text-5xl">{category.icon}</div>
                <div>
                  <h4 className="font-semibold mb-1">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    From {category.points.toLocaleString()} pts
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Redeem
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Ways to Earn */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Ways to Earn More Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold">Daily Bonus</h4>
            <p className="text-sm text-muted-foreground">
              Log in daily to earn 10 bonus points
            </p>
            <Button variant="outline" size="sm">Claim</Button>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold">Refer a Friend</h4>
            <p className="text-sm text-muted-foreground">
              Earn 500 points for each referral
            </p>
            <Button variant="outline" size="sm">Share</Button>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold">Spend & Earn</h4>
            <p className="text-sm text-muted-foreground">
              1 point for every ₹1 spent
            </p>
            <Button variant="outline" size="sm">Learn More</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}