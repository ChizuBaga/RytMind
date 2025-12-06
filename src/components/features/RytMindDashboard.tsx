import { useState } from "react";
import { Book, BarChart3, Headphones, Target, Camera, Pen, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
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
  { id: "assistant", label: "AI Therapist", icon: Headphones, color: "bg-primary/10 text-primary" },
  { id: "budget", label: "Budget Planner", icon: Target, color: "bg-accent/10 text-accent" },
];

const spendingData = [
  { category: "Necessary", percentage: 45, color: "bg-success" },
  { category: "Impulse", percentage: 30, color: "bg-accent" },
  { category: "Waste", percentage: 25, color: "bg-destructive" },
];

const RytMindDashboard = ({ transactions, onFeatureClick, onReceiptUpload, onManualEntry }: RytMindDashboardProps) => {
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const totalSpending = 1890.50;
  const percentageChange = 2.1;
  const pendingTransactions = transactions.filter(t => !t.processed).slice(0, 3);
  const processedTransactions = transactions.filter(t => t.processed && t.items && t.items.length > 0).slice(0, 5);

  const toggleExpand = (transactionId: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  return (
    <div className="flex-1 px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          RytMind
        </h1>
        <p className="text-muted-foreground">Your AI-powered emotional spending insights</p>
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

      {/* Processed Transactions with Items */}
      {processedTransactions.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-3">Recent Insights</h2>
          <div className="space-y-3">
            {processedTransactions.map((transaction) => {
              const isExpanded = expandedTransactions.has(transaction.id);
              const hasItems = !!(transaction.items && Array.isArray(transaction.items) && transaction.items.length > 0);
              
              // Get unique categories from items, or fall back to transaction category
              const categories = hasItems && transaction.items
                ? Array.from(new Set(transaction.items.map(item => item.category)))
                : transaction.category
                  ? [transaction.category]
                  : [];
              
              const getCategoryStyle = (category: string) => {
                return cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  category === "Food" && "bg-accent/10 text-accent",
                  category === "Shopping" && "bg-primary/10 text-primary",
                  category === "Transport" && "bg-destructive/10 text-secondary-foreground",
                  category === "Entertainment" && "bg-destructive/10 text-destructive",
                  category === "Bills" && "bg-muted text-muted-foreground",
                  (!category || category === "Others") && "bg-muted text-muted-foreground",
                );
              };
              
              return (
                <div
                  key={transaction.id}
                  className="bg-card rounded-xl shadow-card overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">{transaction.merchant}</p>
                          
                        </div>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        {categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {categories.map((category, index) => (
                              <span
                                key={index}
                                className={getCategoryStyle(category)}
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-destructive shrink-0">
                        -RM {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      {hasItems && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onManualEntry(transaction.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Edit items"
                          >
                            <Pen className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => toggleExpand(transaction.id)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View items"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Items List */}
                  {isExpanded && hasItems && (
                    <div className="border-t border-border px-4 py-3 bg-muted/30">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Items Breakdown</p>
                      <div className="space-y-2">
                        {transaction.items && transaction.items.length > 0 ? (
                          transaction.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
                                  item.category === "Food" && "bg-accent/10 text-accent",
                                  item.category === "Shopping" && "bg-primary/10 text-primary",
                                  item.category === "Transport" && "bg-secondary/10 text-secondary-foreground",
                                  item.category === "Entertainment" && "bg-destructive/10 text-destructive",
                                  item.category === "Bills" && "bg-muted text-muted-foreground",
                                  item.category === "Others" && "bg-muted text-muted-foreground",
                                )}>
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-foreground ml-4">
                                RM {item.price.toFixed(2)}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No items found</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RytMindDashboard;
