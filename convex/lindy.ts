import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Your Lindy webhook URLs - one for each period
const LINDY_URLS: Record<string, string> = {
  "7days": "https://public.lindy.ai/api/v1/webhooks/lindy/f395ecf9-f07b-4005-bd26-31662f9ee4a7",
  "14days": "https://public.lindy.ai/api/v1/webhooks/lindy/1b308af1-e69f-4c3c-a3c0-24ec9f68fbc0",
  "30days": "https://public.lindy.ai/api/v1/webhooks/lindy/56f4e405-c6ac-4538-8e8f-4a679c00215d",
};

// Action to trigger Lindy analysis for a specific period
export const triggerAnalysis = action({
  args: {
    periodType: v.string(), // "7days", "14days", "30days"
  },
  handler: async (ctx, args) => {
    const { periodType } = args;
    
    // Calculate time range
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let startTimestamp: number;

    switch (periodType) {
      case "7days":
        startTimestamp = now - 7 * day;
        break;
      case "14days":
        startTimestamp = now - 14 * day;
        break;
      case "30days":
        startTimestamp = now - 30 * day;
        break;
      default:
        startTimestamp = now - 7 * day;
    }

    // Fetch transactions from Convex
    const transactions = await ctx.runQuery(api.transactions.listByTimeRange, {
      startTimestamp,
      endTimestamp: now,
    });

    // Fetch journal entries from Convex
    const journalEntries = await ctx.runQuery(api.journalEntries.listByTimeRange, {
      startTimestamp,
      endTimestamp: now,
    });

    // Calculate stats
    const totalSpending = transactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    transactions.forEach((t) => {
      const cat = t.category || "Others";
      categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Prepare payload for Lindy
    const payload = {
      periodType,
      periodStart: startTimestamp,
      periodEnd: now,
      totalSpending,
      transactionCount: transactions.length,
      categoryBreakdown,
      transactions: transactions.map((t) => ({
        merchant: t.merchant,
        date: t.date,
        time: t.time,
        category: t.category,
        amount: t.amount,
        emotion: t.emotion,
      })),
      journalEntries: journalEntries.map((j) => ({
        content: j.content,
        mood: j.mood,
        date: j.date,
      })),
    };

    // Get the correct Lindy URL for this period
    const lindyUrl = LINDY_URLS[periodType];
    if (!lindyUrl) {
      throw new Error(`No Lindy URL configured for period: ${periodType}`);
    }

    // Call Lindy AI
    try {
      const response = await fetch(lindyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add your Lindy API key if needed
          // "Authorization": `Bearer ${process.env.LINDY_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Lindy API error: ${response.status}`);
      }

      const result = await response.json();
      
      console.log("Lindy response:", JSON.stringify(result, null, 2));
      
      // Lindy might return in different formats - handle all cases
      const aiAnalysis = result.aiAnalysis || result;
      
      // Check if we got valid AI analysis
      if (aiAnalysis && aiAnalysis.summary && aiAnalysis.topInsight) {
        // Store the insight
        await ctx.runMutation(api.insights.store, {
          periodStart: startTimestamp,
          periodEnd: now,
          periodType,
          totalSpending,
          transactionCount: transactions.length,
          categoryBreakdown,
          aiAnalysis: {
            summary: aiAnalysis.summary,
            topInsight: aiAnalysis.topInsight,
            spendingPatterns: aiAnalysis.spendingPatterns || [],
            emotionalTriggers: aiAnalysis.emotionalTriggers || [],
          },
        });
        
        return { success: true, message: "Analysis complete" };
      }

      // If Lindy hasn't processed yet or returned unexpected format
      console.warn("Unexpected Lindy response format:", result);
      return { success: false, message: "Lindy returned unexpected format" };
      
    } catch (error: any) {
      console.error("Lindy API error:", error);
      console.error("Error details:", error.message);
      throw new Error(`Failed to trigger Lindy analysis: ${error.message}`);
    }
  },
});

// Alternative: Generate analysis locally (without Lindy) for testing
export const generateLocalAnalysis = action({
  args: {
    periodType: v.string(),
  },
  handler: async (ctx, args) => {
    const { periodType } = args;
    
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    let startTimestamp: number;
    let periodLabel: string;

    switch (periodType) {
      case "7days":
        startTimestamp = now - 7 * day;
        periodLabel = "this week";
        break;
      case "14days":
        startTimestamp = now - 14 * day;
        periodLabel = "the past 2 weeks";
        break;
      case "30days":
        startTimestamp = now - 30 * day;
        periodLabel = "this month";
        break;
      default:
        startTimestamp = now - 7 * day;
        periodLabel = "this week";
    }

    // Fetch data
    const transactions = await ctx.runQuery(api.transactions.listByTimeRange, {
      startTimestamp,
      endTimestamp: now,
    });

    const journalEntries = await ctx.runQuery(api.journalEntries.listByTimeRange, {
      startTimestamp,
      endTimestamp: now,
    });

    // Calculate stats
    const totalSpending = transactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    const categoryMap: Record<string, number> = {};
    transactions.forEach((t) => {
      const cat = t.category || "Others";
      categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(t.amount);
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Generate simple analysis (replace with actual Lindy call in production)
    const topCategory = categoryBreakdown[0];
    const journalMoods = journalEntries.map(j => j.mood).join(", ");
    
    const aiAnalysis = {
      summary: `Over ${periodLabel}, you spent RM ${totalSpending.toFixed(2)} across ${transactions.length} transactions. ${topCategory ? `${topCategory.category} was your biggest expense at RM ${topCategory.amount.toFixed(2)} (${topCategory.percentage.toFixed(0)}%).` : ""}\n\n${journalEntries.length > 0 ? `Your journal entries show moods including: ${journalMoods}. ` : ""}Based on your spending patterns, most transactions happen during meal times and evenings.`,
      topInsight: topCategory 
        ? `Your ${topCategory.category.toLowerCase()} spending (RM ${topCategory.amount.toFixed(2)}) makes up ${topCategory.percentage.toFixed(0)}% of your total. Consider setting a weekly budget for this category.`
        : "Start tracking more transactions to get personalized insights.",
      spendingPatterns: [
        `Average daily spending: RM ${(totalSpending / (periodType === "7days" ? 7 : periodType === "14days" ? 14 : 30)).toFixed(2)}`,
        `Most frequent category: ${topCategory?.category || "N/A"}`,
        `Total transactions: ${transactions.length}`,
        "Weekend spending tends to be higher than weekdays",
      ],
      emotionalTriggers: [
        "Evening hours (6-10 PM) show increased spending activity",
        journalEntries.length > 0 ? "Journal reflections indicate awareness of spending habits" : "Consider journaling to track emotional spending triggers",
        "Online shopping platforms may trigger impulse purchases",
      ],
    };

    // Store the insight
    await ctx.runMutation(api.insights.store, {
      periodStart: startTimestamp,
      periodEnd: now,
      periodType,
      totalSpending,
      transactionCount: transactions.length,
      categoryBreakdown,
      aiAnalysis,
    });

    return { success: true, totalSpending, transactionCount: transactions.length };
  },
});

