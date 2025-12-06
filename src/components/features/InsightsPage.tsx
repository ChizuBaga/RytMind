import { useState } from "react";
import {
  TrendingUp,
  Target,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Calendar,
  ChevronDown,
  Brain,
  ShoppingCart,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types matching Convex schema
interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

interface AIAnalysis {
  summary: string;
  topInsight: string;
  spendingPatterns: string[];
  emotionalTriggers: string[];
}

interface Insight {
  _id: string;
  periodStart: number;
  periodEnd: number;
  periodType: string;
  totalSpending: number;
  transactionCount: number;
  categoryBreakdown: CategoryBreakdown[];
  aiAnalysis: AIAnalysis;
  generatedAt: number;
}

interface InsightsPageProps {
  insight?: Insight | null;
  isLoading?: boolean;
  onPeriodChange?: (period: "7days" | "14days" | "30days") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedPeriod?: "7days" | "14days" | "30days";
}

const periodLabels = {
  "7days": "Last 7 Days",
  "14days": "Last 2 Weeks",
  "30days": "Last Month",
};

const categoryColors: Record<string, string> = {
  Shopping: "hsl(12, 100%, 50%)",
  Food: "hsl(45, 90%, 50%)",
  Bills: "hsl(270, 60%, 55%)",
  Transport: "hsl(200, 70%, 50%)",
  Entertainment: "hsl(145, 60%, 42%)",
  Groceries: "hsl(180, 60%, 45%)",
  Healthcare: "hsl(340, 70%, 50%)",
  Others: "hsl(0, 0%, 60%)",
};

const InsightsPage = ({
  insight,
  isLoading = false,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
  selectedPeriod = "7days",
}: InsightsPageProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>("patterns");

  if (isLoading || isRefreshing) {
    return (
      <div className="flex-1 px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground">AI-powered spending analysis</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Sparkles className={cn("w-8 h-8 text-primary", isRefreshing && "animate-spin")} />
            <p className="text-muted-foreground">
              {isRefreshing ? "Generating AI analysis..." : "Loading insights..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="flex-1 px-4 py-6 space-y-6 pb-24">
        {/* Header with Period Selector */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground">AI-powered spending analysis</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {periodLabels[selectedPeriod]}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPeriodChange?.("7days")}>
                  Last 7 Days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPeriodChange?.("14days")}>
                  Last 2 Weeks
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPeriodChange?.("30days")}>
                  Last Month
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <Brain className="w-12 h-12 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">No Insights for {periodLabels[selectedPeriod]}</h3>
            <p className="text-muted-foreground text-sm">
              Generate AI analysis based on your transactions and journal entries
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate Analysis
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { aiAnalysis, totalSpending, transactionCount, categoryBreakdown } = insight;

  return (
    <div className="flex-1 px-4 py-6 space-y-5 pb-24">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">AI-powered spending analysis</p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="w-4 h-4" />
                {periodLabels[selectedPeriod]}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPeriodChange?.("7days")}>
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.("14days")}>
                Last 2 Weeks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPeriodChange?.("30days")}>
                Last Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Total Spending Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl shadow-card p-5 animate-slide-up border border-primary/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Spending</p>
            <p className="text-2xl font-bold text-foreground">
              RM {totalSpending.toFixed(2)}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {transactionCount} transactions in {periodLabels[selectedPeriod].toLowerCase()}
        </p>
      </div>

      {/* AI Summary Card - Main output from Lindy */}
      <div
        className="bg-card rounded-2xl shadow-card p-5 animate-slide-up border-l-4 border-primary"
        style={{ animationDelay: "50ms" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Analysis</h2>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {aiAnalysis.summary}
        </p>
      </div>

      {/* Key Insight Card */}
      <div
        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl shadow-card p-5 animate-slide-up border border-amber-500/20"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-foreground">Key Insight</h2>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{aiAnalysis.topInsight}</p>
      </div>

      {/* Spending by Category */}
      <div
        className="bg-card rounded-2xl shadow-card p-5 animate-slide-up"
        style={{ animationDelay: "150ms" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Spending by Category</h2>
        </div>
        <div className="space-y-3">
          {categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{cat.category}</span>
                <span className="font-medium text-foreground">
                  RM {cat.amount.toFixed(2)} ({cat.percentage.toFixed(0)}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: categoryColors[cat.category] || categoryColors.Others,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending Patterns */}
      <div
        className="bg-card rounded-2xl shadow-card p-5 animate-slide-up"
        style={{ animationDelay: "200ms" }}
      >
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "patterns" ? null : "patterns")
          }
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Spending Patterns</h2>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              expandedSection === "patterns" && "rotate-180"
            )}
          />
        </button>
        {expandedSection === "patterns" && (
          <div className="mt-4 space-y-2">
            {aiAnalysis.spendingPatterns.map((pattern, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-foreground">{pattern}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emotional Triggers */}
      <div
        className="bg-card rounded-2xl shadow-card p-5 animate-slide-up"
        style={{ animationDelay: "250ms" }}
      >
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "triggers" ? null : "triggers")
          }
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-foreground">Emotional Triggers</h2>
          </div>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              expandedSection === "triggers" && "rotate-180"
            )}
          />
        </button>
        {expandedSection === "triggers" && (
          <div className="mt-4 space-y-2">
            {aiAnalysis.emotionalTriggers.map((trigger, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-foreground">{trigger}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Last Updated */}
      {(() => {
        const hoursAgo = (Date.now() - insight.generatedAt) / (1000 * 60 * 60);
        const staleThresholds = { "7days": 7 * 24, "14days": 14 * 24, "30days": 30 * 24 };
        const threshold = staleThresholds[selectedPeriod];
        const isStale = hoursAgo > threshold;
        
        const timeAgo = hoursAgo < 1 
          ? "just now" 
          : hoursAgo < 24 
            ? `${Math.floor(hoursAgo)} hours ago`
            : `${Math.floor(hoursAgo / 24)} days ago`;
        
        return (
          <div className="text-center pt-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              Last analyzed: {timeAgo}
            </p>
            {isStale && onRefresh && (
              <p className="text-xs text-amber-500">
                Analysis is older than {selectedPeriod === "7days" ? "7 days" : selectedPeriod === "14days" ? "2 weeks" : "1 month"}. Consider refreshing.
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default InsightsPage;
