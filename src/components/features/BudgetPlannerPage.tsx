import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Target, Plus, Trash2, TrendingDown, Sparkles, PiggyBank, AlertCircle, Calendar, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetPlannerPageProps {
  onBack: () => void;
}

interface BudgetSetup {
  income: number;
  savingsGoal: number;
  years: number;
  months: number;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  icon: string;
}

const initialBudgets: Budget[] = [
  { id: "1", category: "Food & Dining", limit: 600, spent: 450, icon: "🍽️" },
  { id: "2", category: "Shopping", limit: 400, spent: 380, icon: "🛍️" },
  { id: "3", category: "Transport", limit: 300, spent: 220, icon: "🚗" },
  { id: "4", category: "Entertainment", limit: 200, spent: 180, icon: "🎬" },
];

const savingTips = [
  { tip: "Pack lunch 3x/week", savings: "RM 150/month", icon: "🥗" },
  { tip: "Cancel unused subscriptions", savings: "RM 45/month", icon: "📺" },
  { tip: "Use public transport", savings: "RM 80/month", icon: "🚌" },
];

// Scrolling Picker Component
const ScrollingPicker = ({ 
  values, 
  selectedIndex, 
  onSelect, 
  label 
}: { 
  values: number[]; 
  selectedIndex: number; 
  onSelect: (index: number) => void;
  label: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const itemHeight = 50;
  const visibleItems = 3;
  const containerHeight = itemHeight * visibleItems;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = selectedIndex * itemHeight;
    }
  }, [selectedIndex, itemHeight]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    onSelect(clampedIndex);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const deltaY = e.clientY - startY;
    scrollRef.current.scrollTop = scrollTop - deltaY;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    snapToNearest();
  };

  const snapToNearest = () => {
    if (!scrollRef.current) return;
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
    scrollRef.current.scrollTo({
      top: clampedIndex * itemHeight,
      behavior: 'smooth'
    });
    onSelect(clampedIndex);
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    const deltaY = e.touches[0].clientY - startY;
    scrollRef.current.scrollTop = scrollTop - deltaY;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    snapToNearest();
  };

  return (
    <div className="flex-1">
      <p className="text-xs text-muted-foreground mb-2 text-center">{label}</p>
      <div className="relative h-[150px] overflow-hidden">
        {/* Selection Indicator */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[50px] border-y-2 border-primary/30 pointer-events-none z-10" />
        
        {/* Scrollable List */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          style={{
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Top Spacer */}
          <div style={{ height: `${itemHeight}px` }} />
          
          {/* Items */}
          {values.map((value, index) => (
            <div
              key={index}
              className={cn(
                "h-[50px] flex items-center justify-center text-lg font-medium transition-colors snap-center",
                index === selectedIndex
                  ? "text-foreground scale-110"
                  : "text-muted-foreground"
              )}
              style={{ height: `${itemHeight}px` }}
            >
              {value}
            </div>
          ))}
          
          {/* Bottom Spacer */}
          <div style={{ height: `${itemHeight}px` }} />
        </div>
      </div>
    </div>
  );
};

const BudgetPlannerPage = ({ onBack }: BudgetPlannerPageProps) => {
  const [setupComplete, setSetupComplete] = useState(false);
  const [setup, setSetup] = useState<BudgetSetup>({
    income: 0,
    savingsGoal: 0,
    years: 0,
    months: 1,
  });
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [savingsGoal, setSavingsGoal] = useState(500);
  const [currentSavings, setCurrentSavings] = useState(310);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

  // Generate arrays for picker
  const years = Array.from({ length: 11 }, (_, i) => i); // 0-10 years
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12 months

  // Calculate monthly savings needed based on duration
  const getMonthlySavingsNeeded = () => {
    const totalMonths = setup.years * 12 + setup.months;
    if (totalMonths === 0) return 0;
    return setup.savingsGoal / totalMonths;
  };

  const getDurationDisplay = () => {
    const parts: string[] = [];
    if (setup.years > 0) {
      parts.push(`${setup.years} year${setup.years !== 1 ? "s" : ""}`);
    }
    if (setup.months > 0) {
      parts.push(`${setup.months} month${setup.months !== 1 ? "s" : ""}`);
    }
    return parts.length > 0 ? parts.join(", ") : "1 month";
  };

  const availableForBudget = setup.income - getMonthlySavingsNeeded();

  const handleSetupSubmit = () => {
    if (!setup.income || !setup.savingsGoal || setup.months === 0) {
      alert("Please fill in all fields and select a duration.");
      return;
    }
    if (availableForBudget < 0) {
      alert("Your savings goal exceeds your income. Please adjust your goals.");
      return;
    }
    setSavingsGoal(setup.savingsGoal);
    setSetupComplete(true);
  };

  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleAddBudget = () => {
    if (!newCategory || !newLimit) return;
    const newBudget: Budget = {
      id: Date.now().toString(),
      category: newCategory,
      limit: parseFloat(newLimit),
      spent: 0,
      icon: "📊",
    };
    setBudgets([...budgets, newBudget]);
    setNewCategory("");
    setNewLimit("");
    setShowAddBudget(false);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  return (
    <div className="flex-1 px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Budget Planner</h1>
          <p className="text-sm text-muted-foreground">Control spending, grow savings</p>
        </div>
      </div>

      {/* Setup Step */}
      {!setupComplete && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Budget Setup</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Let's set up your budget by understanding your income and savings goals.
            </p>

            {/* Income Input */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Income (RM)
              </label>
              <Input
                type="number"
                placeholder="Enter your monthly income"
                value={setup.income || ""}
                onChange={(e) => setSetup({ ...setup, income: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>

            {/* Savings Goal Input */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Savings Goal (RM)
              </label>
              <Input
                type="number"
                placeholder="How much do you want to save?"
                value={setup.savingsGoal || ""}
                onChange={(e) => setSetup({ ...setup, savingsGoal: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>

            {/* Duration Selection - Scrolling Picker */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Duration for Saving
              </label>
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex gap-4 items-end">
                  <ScrollingPicker
                    values={years}
                    selectedIndex={setup.years}
                    onSelect={(index) => setSetup({ ...setup, years: index })}
                    label="Years"
                  />
                  <ScrollingPicker
                    values={months}
                    selectedIndex={setup.months - 1}
                    onSelect={(index) => setSetup({ ...setup, months: index + 1 })} 
                    label="Months"
                  />
                </div>
                <div className="mt-4 pt-4 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">Selected Duration</p>
                  <p className="text-lg font-semibold text-foreground mt-1">
                    {getDurationDisplay()}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            {setup.income > 0 && setup.savingsGoal > 0 && setup.months > 0 && (
              <div className="mb-6 p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Budget Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Income:</span>
                    <span className="font-semibold text-foreground">RM {setup.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Savings Needed:</span>
                    <span className="font-semibold text-success">RM {getMonthlySavingsNeeded().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">Available for Budget:</span>
                    <span className="font-semibold text-foreground">RM {availableForBudget.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              onClick={handleSetupSubmit}
              className="w-full"
              disabled={!setup.income || !setup.savingsGoal || setup.months === 0}
            >
              Start Planning
            </Button>
          </div>
        </div>
      )}

      {/* Budget Planner Content */}
      {setupComplete && (
        <>

      {/* Savings Goal Card */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl shadow-elevated p-5 text-primary-foreground animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-90">Savings Goal</p>
            <p className="text-2xl font-bold">RM {setup.savingsGoal.toFixed(2)}</p>
            <p className="text-xs opacity-80 mt-1">Target: {getDurationDisplay()}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSetupComplete(false)}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            Edit
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="opacity-90">Progress</span>
            <span className="font-medium">RM {currentSavings} / RM {savingsGoal}</span>
          </div>
          <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-foreground rounded-full transition-all duration-500"
              style={{ width: `${(currentSavings / savingsGoal) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-80 text-center mt-2">
            {Math.round((currentSavings / savingsGoal) * 100)}% achieved • RM {savingsGoal - currentSavings} to go
          </p>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Budget Overview</h2>
          <div className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">RM {totalRemaining}</span> left
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
            <p className="text-lg font-bold text-foreground">RM {setup.income.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-success/10 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
            <p className="text-lg font-bold text-success">RM {getMonthlySavingsNeeded().toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-border">
          <div className="p-3 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
            <p className="text-lg font-bold text-foreground">RM {totalBudget}</p>
          </div>
          <div className="p-3 bg-destructive/10 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Spent</p>
            <p className="text-lg font-bold text-destructive">RM {totalSpent}</p>
          </div>
          <div className="p-3 bg-success/10 rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className="text-lg font-bold text-success">RM {totalRemaining}</p>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Category Budgets</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAddBudget(!showAddBudget)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {showAddBudget && (
          <div className="bg-card rounded-xl shadow-card p-4 space-y-3 animate-scale-in">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Budget limit (RM)"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAddBudget} className="flex-1">
                Add Budget
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAddBudget(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.limit) * 100;
          const isOverBudget = percentage >= 90;
          return (
            <div key={budget.id} className="bg-card rounded-xl shadow-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{budget.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{budget.category}</p>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      RM {budget.spent} / RM {budget.limit}
                    </span>
                    {isOverBudget && (
                      <span className="flex items-center gap-1 text-destructive text-xs">
                        <AlertCircle className="w-3 h-3" />
                        Near limit
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Progress
                value={Math.min(percentage, 100)}
                className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
              />
            </div>
          );
        })}
      </div>

      {/* Smart Saving Tips */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Smart Saving Tips</h2>
        </div>
        <div className="space-y-3">
          {savingTips.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-success/5 rounded-xl border border-success/20"
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.tip}</p>
                <p className="text-xs text-success">Save {item.savings}</p>
              </div>
              <TrendingDown className="w-4 h-4 text-success" />
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default BudgetPlannerPage;
