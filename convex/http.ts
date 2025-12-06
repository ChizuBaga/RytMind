import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Webhook endpoint for Lindy AI to send analysis results
// Lindy receives: transactions data + journal entries from Convex
// Lindy sends back: AI analysis based on that data
http.route({
  path: "/lindy-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Validate the payload from Lindy
      const {
        periodType,
        totalSpending,
        transactionCount,
        categoryBreakdown,
        aiAnalysis,
      } = body;

      if (!periodType || !aiAnalysis) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: periodType and aiAnalysis" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Calculate period timestamps
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      let periodStart: number;

      switch (periodType) {
        case "7days":
          periodStart = now - 7 * day;
          break;
        case "14days":
          periodStart = now - 14 * day;
          break;
        case "30days":
          periodStart = now - 30 * day;
          break;
        default:
          periodStart = now - 7 * day;
      }

      // Store the insight
      await ctx.runMutation(api.insights.store, {
        periodStart,
        periodEnd: now,
        periodType,
        totalSpending: totalSpending || 0,
        transactionCount: transactionCount || 0,
        categoryBreakdown: categoryBreakdown || [],
        aiAnalysis: {
          summary: aiAnalysis.summary || "",
          topInsight: aiAnalysis.topInsight || "",
          spendingPatterns: aiAnalysis.spendingPatterns || [],
          emotionalTriggers: aiAnalysis.emotionalTriggers || [],
        },
      });

      return new Response(
        JSON.stringify({ success: true, message: "Insight stored successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Lindy webhook error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to process insight" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Endpoint for Lindy to fetch data for analysis
http.route({
  path: "/data-for-analysis",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const periodType = url.searchParams.get("period") || "7days";
      
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

      // Fetch transactions
      const transactions = await ctx.runQuery(api.transactions.listByTimeRange, {
        startTimestamp,
        endTimestamp: now,
      });

      // Fetch journal entries
      const journalEntries = await ctx.runQuery(api.journalEntries.listByTimeRange, {
        startTimestamp,
        endTimestamp: now,
      });

      // Calculate summary stats
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

      return new Response(
        JSON.stringify({
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
        }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          } 
        }
      );
    } catch (error) {
      console.error("Data fetch error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch data" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;
