import { Book, Headphones, Target, Camera, Pen } from "lucide-react";
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
  { id: "assistant", label: "AI Therapist", icon: Headphones, color: "bg-success/10 text-success" },
  { id: "budget", label: "Budget Planner", icon: Target, color: "bg-primary/10 text-primary" },
];

const RytMindDashboard = ({ transactions, onFeatureClick, onReceiptUpload, onManualEntry }: RytMindDashboardProps) => {
  const pendingTransactions = transactions.filter(t => !t.processed).slice(0, 3);

  return (
    <div className="flex-1 px-4 py-6 space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground mb-2">RytMind</h1>
        <p className="text-muted-foreground">Your emotional spending insights</p>
      </div>

      {/* Feature Buttons Grid */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isLastOdd = features.length % 2 === 1 && index === features.length - 1;
          return (
            <button
              key={feature.id}
              onClick={() => onFeatureClick(feature.id)}
              className={cn(
                "bg-card rounded-xl shadow-card p-4 flex flex-col items-center gap-3 hover:shadow-elevated transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                isLastOdd && "col-span-2 w-[calc(50%-0.375rem)] mx-auto"
              )}
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
