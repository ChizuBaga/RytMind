import { useState } from "react";
import { Send, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentsPageProps {
  onPaymentSuccess: (recipient: string, amount: number) => void;
}

const PaymentsPage = ({ onPaymentSuccess }: PaymentsPageProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!recipient || !amount) return;
    
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowSuccess(true);
    
    // Wait for success animation then redirect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onPaymentSuccess(recipient, parseFloat(amount));
    
    // Reset form
    setRecipient("");
    setAmount("");
    setIsProcessing(false);
    setShowSuccess(false);
  };

  const isValid = recipient.trim() && parseFloat(amount) > 0;

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-4 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center animate-pulse-success">
              <Check className="w-10 h-10 text-success-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground">Payment Successful!</p>
            <p className="text-muted-foreground">RM {parseFloat(amount).toFixed(2)} to {recipient}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Send Money</h1>
        <p className="text-muted-foreground">Transfer funds securely and instantly</p>
      </div>

      {/* Payment Card */}
      <div className="bg-card rounded-2xl shadow-card p-6 space-y-6 animate-slide-up">
        {/* Recipient Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Recipient</label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Merchant/Recipient Name"
            className="h-12 text-base"
          />
        </div>

        {/* Amount Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-muted-foreground">
              RM
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-16 text-3xl font-bold pl-16 text-center"
            />
          </div>
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2">
          {[50, 100, 200, 500].map((quickAmount) => (
            <button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              className="flex-1 py-2 px-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              RM {quickAmount}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Submit Button */}
      <Button
        variant="primary"
        size="xl"
        onClick={handleSubmit}
        disabled={!isValid || isProcessing}
        className="w-full mt-6"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <>
            <span>Confirm Payment</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  );
};

export default PaymentsPage;
