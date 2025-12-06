import { Book, BarChart3, Headphones, Target, Camera, Pen, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Transaction } from "./TransactionsPage";

interface RytMindDashboardProps {
  transactions: Transaction[];
  onFeatureClick: (feature: string) => void;
  onReceiptUpload: (transactionId: string) => void;
  onManualEntry: (transactionId: string) => void;
}

const features = [
  { id: "journalling", label: "Journalling", icon: Book, color: "bg-primary/10 text-primary" },
  { id: "analysis", label: "Spending Analysis", icon: BarChart3, color: "bg-success/10 text-success" },
  { id: "assistant", label: "AI Therapist", icon: Headphones, color: "bg-primary/10 text-primary" },
  { id: "budget", label: "Budget Planner", icon: Target, color: "bg-success/10 text-success" },
];

const spendingData = [
  { category: "Necessary", percentage: 45, color: "bg-success" },
  { category: "Impulse", percentage: 30, color: "bg-accent" },
  { category: "Waste", percentage: 25, color: "bg-destructive" },
];

const RytMindDashboard = ({ transactions, onFeatureClick, onReceiptUpload, onManualEntry }: RytMindDashboardProps) => {
  const totalSpending = 1890.50;
  const percentageChange = 2.1;
  const pendingTransactions = transactions.filter(t => !t.processed).slice(0, 3);

  return (
    <div className="flex-1 px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground mb-2">RytMind</h1>
        <p className="text-muted-foreground">Your emotional spending insights</p>
      </div>

      {/* Spending Overview Card */}
      <div className="bg-card rounded-2xl shadow-card p-6 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Spending (This Month)</p>
            <p className="text-3xl font-bold text-foreground">RM {totalSpending.toFixed(2)}</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
            percentageChange > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
          )}>
            {percentageChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{percentageChange > 0 ? "+" : ""}{percentageChange}%</span>
          </div>
        </div>

        {/* Spending Distribution */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Emotional Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden">
            {spendingData.map((item, index) => (
              <div
                key={item.category}
                className={cn("h-full", item.color)}
                style={{ width: `${item.percentage}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs">
            {spendingData.map((item) => (
              <div key={item.category} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", item.color)} />
                <span className="text-muted-foreground">{item.category} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => onFeatureClick(feature.id)}
              className="bg-card rounded-xl shadow-card p-4 flex flex-col items-center gap-3 hover:shadow-elevated transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", feature.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pending Insights Section */}
      {pendingTransactions.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Pending RytMind Insights</h2>
          <div className="space-y-3">
            {pendingTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-card rounded-xl shadow-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{transaction.merchant}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                  <p className="font-semibold text-destructive shrink-0">
                    -RM {Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => onReceiptUpload(transaction.id)}
                      className="h-8"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Receipt</span>
                    </Button>
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => onManualEntry(transaction.id)}
                      className="h-8"
                    >
                      <Pen className="w-4 h-4" />
                      <span>Manual</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RytMindDashboard;
