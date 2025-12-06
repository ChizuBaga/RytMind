import { Camera, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  merchant: string;
  date: string;
  time: string;
  category?: string;
  amount: number;
  processed?: boolean;
  emotion?: string;
  emotionEmoji?: string;
  items?: Array<{ name: string; price: number; category: string }>;
}





const TransactionsPage = ({ transactions }: { transactions: Transaction[] }) => {
  return (
    <div className="flex-1 px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Transaction History</h1>
        <p className="text-muted-foreground">Your recent spending activity</p>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="bg-card rounded-xl shadow-card p-4 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              {/* Left: Merchant Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{transaction.merchant}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.date} • {transaction.time}
                </p>
              </div>

              {/* Center: Category Tag */}
              

              {/* Right: Amount */}
              <div className="text-right shrink-0">
                <p className={cn(
                  "font-semibold",
                  transaction.amount < 0 ? "text-destructive" : "text-success"
                )}>
                  {transaction.amount < 0 ? "-" : "+"}RM {Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>

              {/* RytMind Actions */}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPage;