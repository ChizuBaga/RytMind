import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get the latest insight for a specific period type
export const getLatest = query({
  args: {
    periodType: v.string(), // "7days", "14days", "30days"
  },
  handler: async (ctx, args) => {
    const insights = await ctx.db
      .query("insights")
      .withIndex("by_period_type")
      .filter((q) => q.eq(q.field("periodType"), args.periodType))
      .order("desc")
      .first();
    return insights;
  },
});

// Get all insights for display
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("insights")
      .withIndex("by_generated_at")
      .order("desc")
      .take(10);
  },
});

// Store a new AI-generated insight (called when Lindy provides analysis)
export const store = mutation({
  args: {
    periodStart: v.number(),
    periodEnd: v.number(),
    periodType: v.string(),
    totalSpending: v.number(),
    transactionCount: v.number(),
    categoryBreakdown: v.array(
      v.object({
        category: v.string(),
        amount: v.number(),
        percentage: v.number(),
      })
    ),
    aiAnalysis: v.object({
      summary: v.string(),
      topInsight: v.string(),
      spendingPatterns: v.array(v.string()),
      emotionalTriggers: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("insights", {
      ...args,
      generatedAt: Date.now(),
    });
  },
});

// Update an existing insight with new AI analysis
export const updateAnalysis = mutation({
  args: {
    id: v.id("insights"),
    aiAnalysis: v.object({
      summary: v.string(),
      topInsight: v.string(),
      spendingPatterns: v.array(v.string()),
      emotionalTriggers: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { id, aiAnalysis } = args;
    await ctx.db.patch(id, { aiAnalysis, generatedAt: Date.now() });
  },
});

// Delete old insights (cleanup)
export const removeOld = mutation({
  args: {
    olderThanTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const oldInsights = await ctx.db
      .query("insights")
      .filter((q) => q.lt(q.field("generatedAt"), args.olderThanTimestamp))
      .collect();

    for (const insight of oldInsights) {
      await ctx.db.delete(insight._id);
    }

    return { deleted: oldInsights.length };
  },
});
