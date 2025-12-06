import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all journal entries, sorted by most recent
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("journalEntries")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();
  },
});

// Get journal entries within a time range
export const listByTimeRange = query({
  args: {
    startTimestamp: v.number(),
    endTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("journalEntries")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startTimestamp),
          q.lte(q.field("timestamp"), args.endTimestamp)
        )
      )
      .order("desc")
      .collect();
    return entries;
  },
});

// Get a single journal entry
export const get = query({
  args: { id: v.id("journalEntries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new journal entry
export const create = mutation({
  args: {
    content: v.string(),
    mood: v.string(),
    moodEmoji: v.string(),
    timestamp: v.number(),
    date: v.string(),
    relatedTransactionId: v.optional(v.id("transactions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("journalEntries", args);
  },
});

// Update a journal entry
export const update = mutation({
  args: {
    id: v.id("journalEntries"),
    content: v.optional(v.string()),
    mood: v.optional(v.string()),
    moodEmoji: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete a journal entry
export const remove = mutation({
  args: { id: v.id("journalEntries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get journal entries related to a specific transaction
export const getByTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("journalEntries")
      .filter((q) => q.eq(q.field("relatedTransactionId"), args.transactionId))
      .collect();
  },
});

