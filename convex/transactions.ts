import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all transactions, sorted by most recent
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
  },
});

// Get transactions within a time range
export const listByTimeRange = query({
  args: {
    startTimestamp: v.number(),
    endTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTimestamp),
          q.lte(q.field("timestamp"), args.endTimestamp)
        )
      )
      .order("desc")
      .collect();
    return transactions;
  },
});

// Get a single transaction
export const get = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new transaction
export const create = mutation({
  args: {
    merchant: v.string(),
    date: v.string(),
    time: v.string(),
    timestamp: v.number(),
    category: v.string(),
    amount: v.number(),
    processed: v.optional(v.boolean()),
    emotion: v.optional(v.string()),
    emotionEmoji: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transactions", args);
  },
});

// Update transaction with emotion/insight data
export const updateEmotion = mutation({
  args: {
    id: v.id("transactions"),
    emotion: v.string(),
    emotionEmoji: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      processed: true,
    });
  },
});

// Update transaction with receipt
export const updateReceipt = mutation({
  args: {
    id: v.id("transactions"),
    receiptUrl: v.string(),
    emotion: v.optional(v.string()),
    emotionEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      processed: true,
    });
  },
});

// Delete a transaction
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get spending statistics for a time range
export const getStats = query({
  args: {
    startTimestamp: v.number(),
    endTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTimestamp),
          q.lte(q.field("timestamp"), args.endTimestamp)
        )
      )
      .collect();

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

    // Emotion breakdown
    const emotionMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach((t) => {
      if (t.emotion) {
        if (!emotionMap[t.emotion]) {
          emotionMap[t.emotion] = { count: 0, amount: 0 };
        }
        emotionMap[t.emotion].count++;
        emotionMap[t.emotion].amount += Math.abs(t.amount);
      }
    });

    const processedCount = transactions.filter((t) => t.processed).length;
    const emotionBreakdown = Object.entries(emotionMap)
      .map(([emotion, data]) => ({
        emotion,
        count: data.count,
        amount: data.amount,
        percentage: processedCount > 0 ? (data.count / processedCount) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSpending,
      transactionCount: transactions.length,
      processedCount,
      categoryBreakdown,
      emotionBreakdown,
    };
  },
});

