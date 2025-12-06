import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Transactions with emotional tracking
  transactions: defineTable({
    merchant: v.string(),
    date: v.string(), // "Dec 6, 2024" format for display
    time: v.string(), // "10:30 AM" format
    timestamp: v.number(), // Unix timestamp for querying/sorting
    category: v.string(),
    amount: v.number(), // Negative for expenses, positive for income
    processed: v.optional(v.boolean()),
    emotion: v.optional(v.string()), // "Impulse", "Necessary", "Planned", "Waste"
    emotionEmoji: v.optional(v.string()),
    notes: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"]),

  // Journal entries for spending reflection
  journalEntries: defineTable({
    content: v.string(),
    mood: v.string(),
    moodEmoji: v.string(),
    timestamp: v.number(),
    date: v.string(), // Display format
    relatedTransactionId: v.optional(v.id("transactions")),
  }).index("by_timestamp", ["timestamp"]),

  // AI-generated spending insights (from Lindy)
  insights: defineTable({
    // Time range this insight covers
    periodStart: v.number(), // Unix timestamp
    periodEnd: v.number(),
    periodType: v.string(), // "7days", "14days", "30days"
    
    // Summary stats
    totalSpending: v.number(),
    transactionCount: v.number(),
    
    // Spending by category breakdown
    categoryBreakdown: v.array(v.object({
      category: v.string(),
      amount: v.number(),
      percentage: v.number(),
    })),
    
    // Emotion breakdown (optional, for future use)
    emotionBreakdown: v.optional(v.array(v.object({
      emotion: v.string(),
      count: v.number(),
      amount: v.number(),
      percentage: v.number(),
    }))),
    
    // AI Analysis from Lindy - based on transactions + journal entries
    aiAnalysis: v.object({
      summary: v.string(), // Main analysis output from Lindy
      topInsight: v.string(), // Most important finding
      spendingPatterns: v.array(v.string()), // List of patterns identified
      emotionalTriggers: v.array(v.string()), // Identified emotional spending triggers
      // Optional fields for backwards compatibility
      recommendations: v.optional(v.array(v.string())),
      positiveHighlights: v.optional(v.array(v.string())),
    }),
    
    // Metadata
    generatedAt: v.number(),
  })
    .index("by_period_type", ["periodType"])
    .index("by_generated_at", ["generatedAt"]),

  // Financial Therapist chat messages
  therapistMessages: defineTable({
    role: v.string(), // "user" or "assistant"
    content: v.string(), // Message content
    timestamp: v.number(), // Unix timestamp
    userId: v.optional(v.string()), // For multi-user support later
  }).index("by_timestamp", ["timestamp"]),
});
