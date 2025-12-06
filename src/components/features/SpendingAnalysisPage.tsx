import { ArrowLeft, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";

interface SpendingAnalysisPageProps {
  onBack: () => void;
}

const categoryData = [
  { name: "Food & Dining", value: 450, color: "hsl(12, 100%, 50%)" },
  { name: "Shopping", value: 380, color: "hsl(145, 60%, 42%)" },
  { name: "Transport", value: 220, color: "hsl(45, 90%, 50%)" },
  { name: "Entertainment", value: 180, color: "hsl(200, 70%, 50%)" },
  { name: "Bills & Utilities", value: 350, color: "hsl(270, 60%, 55%)" },
  { name: "Others", value: 120, color: "hsl(0, 0%, 60%)" },
];

const emotionData = [
  { name: "Necessary", value: 45, color: "hsl(145, 60%, 42%)" },
  { name: "Planned", value: 25, color: "hsl(200, 70%, 50%)" },
  { name: "Impulse", value: 20, color: "hsl(45, 90%, 50%)" },
  { name: "Waste", value: 10, color: "hsl(0, 65%, 55%)" },
];

const weeklyTrend = [
  { day: "Mon", amount: 85, emotion: 65 },
  { day: "Tue", amount: 120, emotion: 45 },
  { day: "Wed", amount: 45, emotion: 80 },
  { day: "Thu", amount: 200, emotion: 30 },
  { day: "Fri", amount: 150, emotion: 55 },
  { day: "Sat", amount: 280, emotion: 25 },
  { day: "Sun", amount: 95, emotion: 70 },
];

const monthlyComparison = [
  { month: "Oct", spending: 1650, saving: 350 },
  { month: "Nov", spending: 1820, saving: 280 },
  { month: "Dec", spending: 1890, saving: 310 },
];

const SpendingAnalysisPage = ({ onBack }: SpendingAnalysisPageProps) => {
  const totalSpending = categoryData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex-1 px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Spending Analysis</h1>
          <p className="text-sm text-muted-foreground">Where your money goes</p>
        </div>
      </div>

      {/* Total Overview */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Total This Month</p>
            <p className="text-3xl font-bold text-foreground">RM {totalSpending.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+3.8%</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "50ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">By Category</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">RM {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Emotion Breakdown */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">By Emotion</h2>
        </div>
        <div className="space-y-3">
          {emotionData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.value}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Weekly Trend</h2>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyTrend}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="amount" fill="hsl(12, 100%, 50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <h2 className="font-semibold text-foreground mb-4">Monthly Comparison</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyComparison}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="spending" stroke="hsl(12, 100%, 50%)" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="saving" stroke="hsl(145, 60%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SpendingAnalysisPage;
