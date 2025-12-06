import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Claude API configuration
const CLAUDE_API_KEY = "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";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

// Get chat history (most recent N messages)
export const getChatHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    const messages = await ctx.db
      .query("therapistMessages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
    
    // Return in chronological order (oldest first)
    return messages.reverse();
  },
});

// Save a message to chat history
export const saveMessage = mutation({
  args: {
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("therapistMessages", {
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
  },
});

// Clear all chat history (optional - for user privacy)
export const clearHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const allMessages = await ctx.db.query("therapistMessages").collect();
    
    for (const message of allMessages) {
      await ctx.db.delete(message._id);
    }
    
    return { deleted: allMessages.length };
  },
});

// Main action: Send message to Lindy with full context
export const sendMessage = action({
  args: {
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // 1. Save user message to history
    await ctx.runMutation(api.therapistChat.saveMessage, {
      role: "user",
      content: args.userMessage,
    });

    // 2. Fetch chat history (last 20 messages for context)
    const chatHistory: any = await ctx.runQuery(api.therapistChat.getChatHistory, {
      limit: 20,
    });

    // 3. Fetch latest insights from all periods
    const insights7d: any = await ctx.runQuery(api.insights.getLatest, {
      periodType: "7days",
    });
    const insights14d: any = await ctx.runQuery(api.insights.getLatest, {
      periodType: "14days",
    });
    const insights30d: any = await ctx.runQuery(api.insights.getLatest, {
      periodType: "30days",
    });

    // 4. Fetch recent transactions (last 30 days) for additional context
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const recentTransactions: any = await ctx.runQuery(api.transactions.listByTimeRange, {
      startTimestamp: thirtyDaysAgo,
      endTimestamp: now,
    });

    // 5. Fetch recent journal entries
    const recentJournals: any = await ctx.runQuery(api.journalEntries.listByTimeRange, {
      startTimestamp: thirtyDaysAgo,
      endTimestamp: now,
    });

    // 6. Build context payload for Lindy
    const payload: any = {
      userMessage: args.userMessage,
      chatHistory: chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      insights: {
        sevenDays: insights7d ? {
          totalSpending: insights7d.totalSpending,
          transactionCount: insights7d.transactionCount,
          categoryBreakdown: insights7d.categoryBreakdown,
          aiAnalysis: insights7d.aiAnalysis,
        } : null,
        fourteenDays: insights14d ? {
          totalSpending: insights14d.totalSpending,
          transactionCount: insights14d.transactionCount,
          categoryBreakdown: insights14d.categoryBreakdown,
          aiAnalysis: insights14d.aiAnalysis,
        } : null,
        thirtyDays: insights30d ? {
          totalSpending: insights30d.totalSpending,
          transactionCount: insights30d.transactionCount,
          categoryBreakdown: insights30d.categoryBreakdown,
          aiAnalysis: insights30d.aiAnalysis,
        } : null,
      },
      recentActivity: {
        transactions: recentTransactions.slice(0, 10).map((t: any) => ({
          merchant: t.merchant,
          date: t.date,
          category: t.category,
          amount: t.amount,
          emotion: t.emotion,
        })),
        journals: recentJournals.slice(0, 5).map((j: any) => ({
          content: j.content,
          mood: j.mood,
          date: j.date,
        })),
      },
    };

    // 7. Build system prompt with all context
    const systemPrompt = `You are a compassionate Financial Therapist AI for RytMind, an app that helps users understand their emotional relationship with money.

YOUR ROLE:
- Help users understand their spending habits and financial patterns
- Provide emotional support around money-related stress and anxiety
- Give actionable advice based on their ACTUAL spending data
- ONLY answer questions about:
  1. Financial matters (spending, budgeting, saving, money management)
  2. Mental health related to finances (financial stress, emotional spending, money anxiety)
  
If the user asks about anything else (unrelated topics), politely redirect them back to financial wellness.

USER'S SPENDING DATA:

📊 LAST 7 DAYS:
${insights7d ? `
- Total Spending: RM ${insights7d.totalSpending.toFixed(2)}
- Transactions: ${insights7d.transactionCount}
- Top Categories: ${insights7d.categoryBreakdown.slice(0, 3).map((c: any) => `${c.category} (RM ${c.amount.toFixed(2)})`).join(", ")}
- Key Insight: ${insights7d.aiAnalysis.topInsight}
- Patterns: ${insights7d.aiAnalysis.spendingPatterns.join("; ")}
- Emotional Triggers: ${insights7d.aiAnalysis.emotionalTriggers.join("; ")}
` : "No data available"}

📊 LAST 14 DAYS:
${insights14d ? `
- Total Spending: RM ${insights14d.totalSpending.toFixed(2)}
- Transactions: ${insights14d.transactionCount}
- Top Categories: ${insights14d.categoryBreakdown.slice(0, 3).map((c: any) => `${c.category} (RM ${c.amount.toFixed(2)})`).join(", ")}
- Patterns: ${insights14d.aiAnalysis.spendingPatterns.join("; ")}
` : "No data available"}

📊 LAST 30 DAYS:
${insights30d ? `
- Total Spending: RM ${insights30d.totalSpending.toFixed(2)}
- Transactions: ${insights30d.transactionCount}
- Top Categories: ${insights30d.categoryBreakdown.slice(0, 3).map((c: any) => `${c.category} (RM ${c.amount.toFixed(2)})`).join(", ")}
- Patterns: ${insights30d.aiAnalysis.spendingPatterns.join("; ")}
` : "No data available"}

RECENT TRANSACTIONS:
${recentTransactions.slice(0, 5).map((t: any) => `- ${t.merchant}: RM ${Math.abs(t.amount).toFixed(2)} (${t.category}${t.emotion ? `, felt: ${t.emotion}` : ""})`).join("\n")}

RECENT JOURNAL ENTRIES:
${recentJournals.length > 0 ? recentJournals.slice(0, 3).map((j: any) => `- ${j.date}: ${j.mood} - "${j.content}"`).join("\n") : "No journal entries yet"}

RESPONSE GUIDELINES:
1. Be warm, empathetic, and non-judgmental
2. Reference their ACTUAL spending data in your responses
3. Compare trends across time periods (7d vs 14d vs 30d)
4. Connect emotional triggers to spending behavior
5. Give specific, actionable advice
6. **KEEP RESPONSES UNDER 256 WORDS - BE CONCISE AND FOCUSED**
7. Keep responses 2-3 short paragraphs maximum
8. Ask thoughtful follow-up questions
9. Celebrate positive changes
10. If question is off-topic, say: "I'm here specifically to help with your financial wellness and money-related concerns. Could we talk about your spending or financial goals instead?"`;

    // 8. Build conversation messages for Claude
    const messages: any[] = chatHistory.map((msg: any) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));
    
    // Add current user message
    messages.push({
      role: "user",
      content: args.userMessage,
    });

    // 9. Call Claude API
    try {
      const response: any = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 400,
          system: systemPrompt,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const result: any = await response.json();
      console.log("Claude response:", JSON.stringify(result, null, 2));
      
      // Extract AI response
      const aiResponse = result.content?.[0]?.text || "I apologize, I'm having trouble processing that. Could you rephrase your question?";

      // Save AI response to history
      await ctx.runMutation(api.therapistChat.saveMessage, {
        role: "assistant",
        content: aiResponse,
      });

      return {
        success: true,
        message: aiResponse,
      };
      
    } catch (error: any) {
      console.error("Claude API error:", error);
      
      // Provide a fallback response
      const fallbackResponse = "I apologize, but I'm having trouble connecting right now. However, I can see you've been tracking your spending. What would you like to discuss about your financial habits?";
      
      await ctx.runMutation(api.therapistChat.saveMessage, {
        role: "assistant",
        content: fallbackResponse,
      });
      
      return {
        success: false,
        message: fallbackResponse,
        error: error.message,
      };
    }
  },
});

