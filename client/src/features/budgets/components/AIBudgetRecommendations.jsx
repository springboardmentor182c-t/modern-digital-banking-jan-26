import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, cn } from '../../../lib/utils';
import {
  Sparkles, TrendingUp, TrendingDown, Minus, Check, X,
  Info, Shield, ShoppingBag, Loader2, Brain, ArrowRight,
  AlertTriangle, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { generateAIBudget, acceptAIRecommendation } from '../services/AIBudgetAPI';

/**
 * AIBudgetRecommendations
 * -----------------------
 * Renders AI-generated budget recommendations with:
 * - Summary card (total recommended vs income, overall confidence)
 * - Per-category recommendation cards with comparison, confidence, trend, reasoning
 * - Accept/Reject workflow for individual recommendations
 * - Loading and empty states
 */
export default function AIBudgetRecommendations({ refreshBudgets }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [accepting, setAccepting] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(null);

  // Generate AI budget recommendations
  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setDismissed(new Set());
    try {
      const result = await generateAIBudget(false);
      setData(result);
    } catch (err) {
      console.error('Failed to generate AI budget:', err);
      setError('Failed to analyze transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Accept a single recommendation
  const handleAccept = useCallback(async (recommendation) => {
    setAccepting(recommendation.category);
    setError(null);
    try {
      await acceptAIRecommendation(recommendation);
      setDismissed(prev => new Set([...prev, recommendation.category]));
      if (refreshBudgets) await refreshBudgets();
    } catch (err) {
      console.error('Failed to accept recommendation:', err);
      setError('Failed to add this recommendation to budgets. Please try again.');
    } finally {
      setAccepting(null);
    }
  }, [refreshBudgets]);

  // Accept all recommendations at once
  const handleAcceptAll = useCallback(async () => {
    setLoading(true);
    try {
      const result = await generateAIBudget(true);
      if (result && result.recommendations) {
        setDismissed(new Set(result.recommendations.map(r => r.category)));
      }
      if (refreshBudgets) refreshBudgets();
    } catch (err) {
      console.error('Failed to accept all:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshBudgets]);

  // Dismiss a single recommendation
  const handleDismiss = useCallback((category) => {
    setDismissed(prev => new Set([...prev, category]));
  }, []);

  // Trend icon helper
  const TrendIcon = ({ trend }) => {
    if (trend === 'increasing') return <TrendingUp className="h-3.5 w-3.5 text-rose-400" />;
    if (trend === 'decreasing') return <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  // Confidence ring helper — renders a small circular gauge
  const ConfidenceRing = ({ value }) => {
    const percentage = Math.round(value * 100);
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (value * circumference);
    const color = value >= 0.7 ? 'text-emerald-400' : value >= 0.4 ? 'text-amber-400' : 'text-rose-400';

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor"
            className="text-muted/20" strokeWidth="3" />
          <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor"
            className={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <span className="absolute text-[10px] font-bold text-foreground">{percentage}%</span>
      </div>
    );
  };

  // Filter out dismissed recommendations
  const activeRecommendations = data?.recommendations?.filter(r => !dismissed.has(r.category)) || [];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
              AI Budget Recommendations
              <Sparkles className="h-4 w-4 text-violet-400" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Smart budgets based on your spending patterns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {data && activeRecommendations.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5 mr-1" /> : <ChevronDown className="h-3.5 w-3.5 mr-1" />}
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
          )}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {data ? 'Regenerate' : 'Generate AI Budget'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted/50 rounded w-2/3" />
                <div className="h-3 bg-muted/30 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-8 bg-muted/40 rounded" />
                <div className="h-2 bg-muted/30 rounded" />
                <div className="h-2 bg-muted/20 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <>
          {/* Summary card */}
          <Card className="bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 border border-violet-500/20">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Recommended</div>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(data.total_recommended)}</div>
                  </div>
                  {data.estimated_income > 0 && (
                    <>
                      <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimated Income</div>
                        <div className="text-2xl font-bold text-emerald-400">{formatCurrency(data.estimated_income)}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {data.alerts?.length > 0 && (
                    <Badge variant="outline" className="text-amber-400 border-amber-400/30 bg-amber-400/5">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {data.alerts.length} alert{data.alerts.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-violet-400 border-violet-400/30 bg-violet-400/5">
                    {activeRecommendations.length} categor{activeRecommendations.length === 1 ? 'y' : 'ies'}
                  </Badge>
                  {activeRecommendations.length > 0 && (
                    <Button size="sm" variant="outline" onClick={handleAcceptAll}
                      className="text-xs border-violet-400/30 text-violet-400 hover:bg-violet-400/10">
                      <Check className="h-3 w-3 mr-1" /> Accept All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts banner */}
          {activeRecommendations.length > 0 && data.alerts?.length > 0 && (
            <div className="space-y-2">
              {data.alerts.map((alert, idx) => (
                <Card key={idx} className="border-amber-400/20 bg-amber-400/5">
                  <CardContent className="flex items-center gap-3 py-3">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-200">{alert.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recommendation cards */}
          {expanded && activeRecommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRecommendations.map((rec) => {
                const hasExisting = rec.current_budget !== null && rec.current_budget !== undefined;
                const diff = hasExisting ? rec.recommended_limit - rec.current_budget : 0;
                const diffPercent = hasExisting && rec.current_budget > 0
                  ? ((diff / rec.current_budget) * 100).toFixed(0)
                  : 0;

                return (
                  <Card key={rec.category} className={cn(
                    "group transition-all duration-300 hover:shadow-xl relative overflow-hidden",
                    "border-violet-500/10 hover:border-violet-500/30"
                  )}>
                    {/* AI badge overlay */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-2 right-[-20px] w-[80px] text-center transform rotate-45 bg-gradient-to-r from-violet-600 to-purple-600 text-[9px] text-white font-bold py-0.5 shadow-sm">
                        AI
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            rec.is_essential
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-purple-500/10 text-purple-400"
                          )}>
                            {rec.is_essential ? <Shield className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold capitalize">{rec.category}</CardTitle>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className={cn(
                                "text-[9px] px-1.5 py-0",
                                rec.is_essential
                                  ? "text-blue-400 border-blue-400/20"
                                  : "text-purple-400 border-purple-400/20"
                              )}>
                                {rec.is_essential ? 'Essential' : 'Discretionary'}
                              </Badge>
                              <div className="flex items-center gap-0.5">
                                <TrendIcon trend={rec.trend} />
                                <span className="text-[9px] text-muted-foreground capitalize">{rec.trend}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <ConfidenceRing value={rec.confidence} />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Recommended limit */}
                      <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended Limit</div>
                        <div className="text-xl font-bold text-foreground">{formatCurrency(rec.recommended_limit)}</div>
                      </div>

                      {/* Comparison bar */}
                      {hasExisting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Current: {formatCurrency(rec.current_budget)}</span>
                            <span className={cn(
                              "font-medium",
                              diff > 0 ? "text-rose-400" : diff < 0 ? "text-emerald-400" : "text-muted-foreground"
                            )}>
                              {diff > 0 ? '+' : ''}{diffPercent}%
                            </span>
                          </div>
                          <div className="flex gap-1 h-2">
                            <div className="bg-muted/30 rounded-l-full relative flex-1">
                              <div
                                className="absolute inset-y-0 left-0 bg-muted/60 rounded-l-full"
                                style={{ width: `${Math.min((rec.current_budget / Math.max(rec.current_budget, rec.recommended_limit)) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="bg-violet-500/20 rounded-r-full relative flex-1">
                              <div
                                className="absolute inset-y-0 left-0 bg-violet-500/50 rounded-r-full"
                                style={{ width: `${Math.min((rec.recommended_limit / Math.max(rec.current_budget, rec.recommended_limit)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Current</span>
                            <span className="text-violet-400">AI Recommended</span>
                          </div>
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">Avg Monthly</div>
                          <div className="text-xs font-medium text-foreground">{formatCurrency(rec.avg_monthly_spend)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">Predicted</div>
                          <div className="text-xs font-medium text-foreground">{formatCurrency(rec.predicted_spend)}</div>
                        </div>
                      </div>

                      {/* Reasoning tooltip */}
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/20">
                        <Info className="h-3.5 w-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.reasoning}</p>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-3 pb-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(rec)}
                        disabled={accepting === rec.category}
                        className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 text-xs h-8"
                      >
                        {accepting === rec.category ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" /> Accept
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(rec.category)}
                        className="text-muted-foreground hover:text-destructive text-xs h-8 px-3"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty state — all dismissed */}
          {activeRecommendations.length === 0 && data.recommendations?.length > 0 && (
            <Card className="border-dashed border-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Check className="h-8 w-8 text-emerald-400 mb-3" />
                <p className="text-sm font-medium text-foreground">All recommendations reviewed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Regenerate" to get fresh recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Initial empty state — no data generated yet */}
      {!data && !loading && !error && (
        <Card className="border-dashed border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
              <Brain className="h-7 w-7 text-violet-400" />
            </div>
            <p className="text-sm font-medium text-foreground">AI Budget Analysis</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Analyze your spending patterns from the last 6 months and get intelligent budget recommendations for each category
            </p>
            <Button
              onClick={handleGenerate}
              className="mt-4 shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate AI Budget
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
