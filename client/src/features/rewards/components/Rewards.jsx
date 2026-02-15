import React, { useEffect, useState } from 'react';
import { useRewards } from '../context/RewardsContext';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Gift, Wallet, Award, Stars, ChevronRight, Zap, Trophy } from 'lucide-react';

export default function Rewards() {
  const { rewards, loading } = useRewards();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NeoVault Rewards</h1>
          <p className="text-muted-foreground mt-1">Earn points on every transaction and redeem for exclusive offers</p>
        </div>
        <div className="flex gap-4 p-1.5 bg-muted rounded-xl">
          <Button variant="ghost" size="sm" className="rounded-lg">My Rewards</Button>
          <Button variant="ghost" size="sm" className="rounded-lg text-muted-foreground">Partner Offers</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <Card key={reward.id} className="group relative overflow-hidden bg-gradient-to-br from-primary to-primary-foreground border-none shadow-2xl shadow-primary/20">
            {/* Decorative Patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 blur-xl" />

            <CardHeader className="text-white relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-2 py-0 text-[10px] uppercase font-bold tracking-widest">
                    Standard Program
                  </Badge>
                  <CardTitle className="text-xl font-bold">{reward.program_name}</CardTitle>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="text-white relative z-10 pb-8">
              <div className="space-y-1 mt-4">
                <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">Balance Available</div>
                <div className="text-5xl font-extrabold tracking-tighter flex items-center gap-2">
                  {reward.points_balance.toLocaleString()}
                  <Stars className="h-6 w-6 text-warning fill-warning animate-pulse" />
                </div>
              </div>
              <p className="text-sm opacity-80 mt-2 font-medium">Valid until Dec 2026</p>
            </CardContent>

            <CardFooter className="bg-black/10 border-t border-white/10 relative z-10 mt-auto">
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold transition-all shadow-xl">
                Redeem now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Static Offer Card */}
        <Card className="border-dashed border-2 border-border/50 bg-transparent flex flex-col items-center justify-center p-8 min-h-[300px] text-center group hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Zap className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
          </div>
          <h3 className="font-bold text-lg">Coming Soon</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">Unlock new tier based rewards by spending more with NeoVault</p>
          <Button variant="link" className="mt-4 text-primary font-bold">Learn More</Button>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Redemption Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Travel & Stays', icon: '✈️' },
            { label: 'Shopping', icon: '🛍️' },
            { label: 'Gift Cards', icon: '🎟️' },
            { label: 'Cashback', icon: '💰' }
          ].map((cat, i) => (
            <button key={i} className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all text-center group">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="font-bold text-sm">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
