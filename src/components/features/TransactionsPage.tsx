import { Camera, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  merchant: string;
  date: string;
  time: string;
  category: string;
  amount: number;
  processed?: boolean;
  emotion?: string;
  emotionEmoji?: string;
}

interface TransactionsPageProps {
  transactions: Transaction[];
  onReceiptUpload: (transactionId: string) => void;
  onManualEntry: (transactionId: string) => void;
}

const categoryColors: Record<string, string> = {
  Food: "bg-accent/10 text-accent",
  Shopping: "bg-primary/10 text-primary",
  Transport: "bg-secondary/10 text-secondary-foreground",
  Entertainment: "bg-destructive/10 text-destructive",
  Bills: "bg-muted text-muted-foreground",
};

const TransactionsPage = ({ transactions, onReceiptUpload, onManualEntry }: TransactionsPageProps) => {
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
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium shrink-0",
                  categoryColors[transaction.category] || "bg-muted text-muted-foreground"
                )}
              >
                {transaction.category}
              </span>

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
              <div className="flex flex-col gap-1 shrink-0">
                {transaction.processed ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 rounded-lg">
                    <span className="text-sm">{transaction.emotionEmoji}</span>
                    <span className="text-xs font-medium text-secondary-foreground">{transaction.emotion}</span>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => onReceiptUpload(transaction.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Receipt</span>
                    </Button>
                    <Button
                      variant="action"
                      size="sm"
                      onClick={() => onManualEntry(transaction.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Pen className="w-3 h-3" />
                      <span>Manual</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPage;
