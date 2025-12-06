import { useState } from "react";
import { ArrowLeft, Target, Plus, Trash2, TrendingDown, Sparkles, PiggyBank, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BudgetPlannerPageProps {
  onBack: () => void;
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

const BudgetPlannerPage = ({ onBack }: BudgetPlannerPageProps) => {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [savingsGoal, setSavingsGoal] = useState(500);
  const [currentSavings, setCurrentSavings] = useState(310);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

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

      {/* Savings Goal Card */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl shadow-elevated p-5 text-primary-foreground animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">Monthly Savings Goal</p>
            <p className="text-2xl font-bold">RM {savingsGoal}</p>
          </div>
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
        <div className="grid grid-cols-3 gap-4 text-center">
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
    </div>
  );
};

export default BudgetPlannerPage;
