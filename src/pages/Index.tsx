import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Navbar from "@/components/layout/Navbar";
import FloatingChatButton from "@/components/layout/FloatingChatButton";
import PaymentsPage from "@/components/features/PaymentsPage";
import TransactionsPage from "@/components/features/TransactionsPage";
import RytMindDashboard from "@/components/features/RytMindDashboard";
import InsightsPage from "@/components/features/InsightsPage";
import ReceiptUploadModal from "@/components/features/ReceiptUploadModal";
import JournalModal from "@/components/features/JournalModal";
import SpendingAnalysisPage from "@/components/features/SpendingAnalysisPage";
import BudgetPlannerPage from "@/components/features/BudgetPlannerPage";
import JournallingPage from "@/components/features/JournallingPage";
import FinancialTherapistPage from "@/components/features/FinancialTherapistPage";
import { useToast } from "@/hooks/use-toast";

// Map Convex transaction to UI Transaction format
interface UITransaction {
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

type ActiveView = "payments" | "transactions" | "rytmind" | "analysis" | "budget" | "journalling" | "therapist" | "insights";
type PeriodType = "7days" | "14days" | "30days";

// Staleness thresholds based on period type (in hours)
const STALE_THRESHOLDS: Record<PeriodType, number> = {
  "7days": 7 * 24,    // 7 days
  "14days": 14 * 24,  // 2 weeks
  "30days": 30 * 24,  // 1 month
};

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"payments" | "transactions" | "rytmind" | "insights">("payments");
  const [activeView, setActiveView] = useState<ActiveView>("payments");
  const [receiptModalId, setReceiptModalId] = useState<string | null>(null);
  const [journalModalId, setJournalModalId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("7days");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track which periods we've already auto-refreshed to avoid loops
  const autoRefreshedPeriods = useRef<Set<string>>(new Set());

  // Convex queries
  const convexTransactions = useQuery(api.transactions.list);
  const insight = useQuery(api.insights.getLatest, { periodType: selectedPeriod });

  // Debug logging
  console.log("Transactions:", convexTransactions?.length || 0);
  console.log("Insight:", insight);
  console.log("Selected Period:", selectedPeriod);
  
  // Convex mutations and actions
  const createTransaction = useMutation(api.transactions.create);
  const updateEmotion = useMutation(api.transactions.updateEmotion);
  const seedData = useMutation(api.seed.seedData);
  
  // Action to generate analysis - calls Lindy AI (Convex is now deployed to cloud!)
  const generateAnalysis = useAction(api.lindy.triggerAnalysis);

  // Refresh/generate analysis for current period (defined first with useCallback)
  const handleRefreshAnalysis = useCallback(async (showToast = true) => {
    setIsRefreshing(true);
    try {
      // This uses local generation for now
      // Replace with api.lindy.triggerAnalysis to use actual Lindy
      await generateAnalysis({ periodType: selectedPeriod });
      if (showToast) {
        toast({
          title: "Analysis Generated",
          description: `Insights for ${selectedPeriod === "7days" ? "last 7 days" : selectedPeriod === "14days" ? "last 2 weeks" : "last month"} updated.`,
        });
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to generate analysis. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [generateAnalysis, selectedPeriod, toast]);

  // Seed data on first load if empty
  useEffect(() => {
    if (convexTransactions && convexTransactions.length === 0) {
      seedData();
    }
  }, [convexTransactions, seedData]);

  // Auto-generate analysis when insight is missing or stale
  useEffect(() => {
    // Only auto-refresh when on insights page
    if (activeView !== "insights") return;
    
    // Don't auto-refresh if already refreshing
    if (isRefreshing) return;
    
    // insight is undefined while loading, wait for query to complete
    if (insight === undefined) return;
    
    // Create a unique key for this period to track auto-refresh
    const periodKey = `${selectedPeriod}-${insight?.generatedAt || 'null'}`;
    
    // Check if we've already auto-refreshed for this exact state
    if (autoRefreshedPeriods.current.has(periodKey)) return;
    
    // Check if insight is missing or stale (threshold matches the period)
    const staleThreshold = STALE_THRESHOLDS[selectedPeriod];
    const isStale = insight && 
      (Date.now() - insight.generatedAt) / (1000 * 60 * 60) > staleThreshold;
    
    if (insight === null || isStale) {
      // Mark this period as auto-refreshed
      autoRefreshedPeriods.current.add(periodKey);
      // Auto-trigger analysis generation (silent - no toast for auto-refresh)
      handleRefreshAnalysis(false);
    }
  }, [activeView, selectedPeriod, insight, isRefreshing, handleRefreshAnalysis]);

  // Clear auto-refresh tracking when period changes
  useEffect(() => {
    autoRefreshedPeriods.current.clear();
  }, [selectedPeriod]);

  // Transform Convex transactions to UI format
  const transactions: UITransaction[] = (convexTransactions || []).map((t) => ({
    id: t._id,
    merchant: t.merchant,
    date: t.date,
    time: t.time,
    category: t.category,
    amount: t.amount,
    processed: t.processed,
    emotion: t.emotion,
    emotionEmoji: t.emotionEmoji,
  }));

  const handleTabChange = (tab: "payments" | "transactions" | "rytmind" | "insights") => {
    setActiveTab(tab);
    setActiveView(tab);
  };

  const handlePaymentSuccess = async (recipient: string, amount: number) => {
    const now = new Date();
    await createTransaction({
      merchant: recipient,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      timestamp: now.getTime(),
      category: "Shopping",
      amount: -amount,
    });
    handleTabChange("transactions");
    toast({
      title: "Payment Complete",
      description: `RM ${amount.toFixed(2)} sent to ${recipient}`,
    });
  };

  const handleReceiptComplete = async (transactionId: string) => {
    try {
      await updateEmotion({
        id: transactionId as Id<"transactions">,
        emotion: "Analyzed",
        emotionEmoji: "🔍",
      });
      toast({
        title: "Receipt Analyzed",
        description: "Your spending insight has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze receipt.",
        variant: "destructive",
      });
    }
  };

  const handleJournalComplete = async (transactionId: string) => {
    try {
      await updateEmotion({
        id: transactionId as Id<"transactions">,
        emotion: "Reflected",
        emotionEmoji: "💭",
      });
      toast({
        title: "Journal Saved",
        description: "Your emotional insight has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal.",
        variant: "destructive",
      });
    }
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
      case "insights":
        setActiveView("insights");
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

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  // Determine if we should show the navbar (hide for sub-pages)
  const showNavbar = ["payments", "transactions", "rytmind", "insights"].includes(activeView);
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

        {activeView === "insights" && (
          <InsightsPage
            insight={insight}
            isLoading={insight === undefined}
            onPeriodChange={handlePeriodChange}
            onRefresh={() => handleRefreshAnalysis(true)}
            isRefreshing={isRefreshing}
            selectedPeriod={selectedPeriod}
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
