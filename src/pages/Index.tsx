import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import PaymentsPage from "@/components/features/PaymentsPage";
import TransactionsPage, { type Transaction } from "@/components/features/TransactionsPage";
import RytMindDashboard from "@/components/features/RytMindDashboard";
import ReceiptUploadModal from "@/components/features/ReceiptUploadModal";
import JournalModal from "@/components/features/JournalModal";
import SpendingAnalysisPage from "@/components/features/SpendingAnalysisPage";
import BudgetPlannerPage from "@/components/features/BudgetPlannerPage";
import JournallingPage from "@/components/features/JournallingPage";
import FinancialTherapistPage from "@/components/features/FinancialTherapistPage";
import { useToast } from "@/hooks/use-toast";

const initialTransactions: Transaction[] = [
  { id: "1", merchant: "Starbucks", date: "Dec 6, 2024", time: "10:30 AM", category: "Food", amount: -18.90, processed: true, emotion: "Impulse", emotionEmoji: "😅" },
  { id: "2", merchant: "Lazada", date: "Dec 5, 2024", time: "8:15 PM", category: "Shopping", amount: -245.00 },
  { id: "3", merchant: "Grab", date: "Dec 5, 2024", time: "6:00 PM", category: "Transport", amount: -25.50, processed: true, emotion: "Necessary", emotionEmoji: "✅" },
  { id: "4", merchant: "Netflix", date: "Dec 4, 2024", time: "12:00 AM", category: "Entertainment", amount: -44.90 },
  { id: "5", merchant: "Tenaga Nasional", date: "Dec 3, 2024", time: "2:00 PM", category: "Bills", amount: -186.00, processed: true, emotion: "Necessary", emotionEmoji: "✅" },
  { id: "6", merchant: "McDonald's", date: "Dec 2, 2024", time: "1:30 PM", category: "Food", amount: -32.40 },
  { id: "7", merchant: "Uniqlo", date: "Dec 1, 2024", time: "4:45 PM", category: "Shopping", amount: -189.00, processed: true, emotion: "Planned", emotionEmoji: "📝" },
];

type ActiveView = "payments" | "transactions" | "rytmind" | "analysis" | "budget" | "journalling" | "therapist";

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"payments" | "transactions" | "rytmind">("payments");
  const [activeView, setActiveView] = useState<ActiveView>("payments");
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [receiptModalId, setReceiptModalId] = useState<string | null>(null);
  const [journalModalId, setJournalModalId] = useState<string | null>(null);

  const handleTabChange = (tab: "payments" | "transactions" | "rytmind") => {
    setActiveTab(tab);
    setActiveView(tab);
  };

  const handlePaymentSuccess = (recipient: string, amount: number) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      merchant: recipient,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      category: "Shopping",
      amount: -amount,
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    handleTabChange("transactions");
    toast({
      title: "Payment Complete",
      description: `RM ${amount.toFixed(2)} sent to ${recipient}`,
    });
  };

  const handleReceiptComplete = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, processed: true, emotion: "Analyzed", emotionEmoji: "🔍" }
          : t
      )
    );
    toast({
      title: "Receipt Analyzed",
      description: "Your spending insight has been recorded.",
    });
  };

  const handleJournalComplete = (transactionId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, processed: true, emotion: "Reflected", emotionEmoji: "💭" }
          : t
      )
    );
    toast({
      title: "Journal Saved",
      description: "Your emotional insight has been recorded.",
    });
  };

  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case "journalling":
        setActiveView("journalling");
        break;
      case "analysis":
        setActiveView("analysis");
        break;
      case "assistant":
        setActiveView("therapist");
        break;
      case "budget":
        setActiveView("budget");
        break;
      default:
        toast({
          title: feature.charAt(0).toUpperCase() + feature.slice(1),
          description: "This feature is coming soon!",
        });
    }
  };

  const handleBackToRytMind = () => {
    setActiveView("rytmind");
  };

  // Determine if we should show the navbar (hide for sub-pages)
  const showNavbar = ["payments", "transactions", "rytmind"].includes(activeView);
  const showFAB = activeView !== "therapist";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavbar && <Navbar activeTab={activeTab} onTabChange={handleTabChange} />}

      <main className="flex-1 max-w-lg mx-auto w-full flex flex-col">
        {activeView === "payments" && (
          <PaymentsPage onPaymentSuccess={handlePaymentSuccess} />
        )}

        {activeView === "transactions" && (
          <TransactionsPage
            transactions={transactions}
            onReceiptUpload={setReceiptModalId}
            onManualEntry={setJournalModalId}
          />
        )}

        {activeView === "rytmind" && (
          <RytMindDashboard
            transactions={transactions}
            onFeatureClick={handleFeatureClick}
            onReceiptUpload={setReceiptModalId}
            onManualEntry={setJournalModalId}
          />
        )}

        {activeView === "analysis" && (
          <SpendingAnalysisPage onBack={handleBackToRytMind} />
        )}

        {activeView === "budget" && (
          <BudgetPlannerPage onBack={handleBackToRytMind} />
        )}

        {activeView === "journalling" && (
          <JournallingPage onBack={handleBackToRytMind} />
        )}

        {activeView === "therapist" && (
          <FinancialTherapistPage onBack={handleBackToRytMind} />
        )}
      </main>

      {showFAB && <FloatingChatButton />}

      {/* Modals */}
      {receiptModalId && (
        <ReceiptUploadModal
          transactionId={receiptModalId}
          onClose={() => setReceiptModalId(null)}
          onComplete={handleReceiptComplete}
        />
      )}

      {journalModalId && (
        <JournalModal
          transactionId={journalModalId}
          onClose={() => setJournalModalId(null)}
          onComplete={handleJournalComplete}
        />
      )}
    </div>
  );
};

export default Index;
