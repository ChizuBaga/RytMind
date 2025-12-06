import { mutation } from "./_generated/server";

// Realistic Malaysian merchants and spending patterns
const foodMerchants = [
  "Mamak Corner", "Nasi Kandar Pelita", "Old Town White Coffee", "Secret Recipe",
  "Sushi King", "McDonald's", "KFC", "Texas Chicken", "Subway", "Pizza Hut",
  "Starbucks", "ZUS Coffee", "Tealive", "Gong Cha", "Grab Food", "Food Panda",
  "Mixed Rice Stall", "Economy Rice", "Roti Canai Stall", "Nasi Lemak Stall",
];

const groceryMerchants = [
  "Aeon", "Lotus's", "Giant", "Mydin", "99 Speedmart", "Family Mart", "7-Eleven",
  "Village Grocer", "Jaya Grocer", "NSK Trade City",
];

const transportMerchants = [
  "Grab", "Shell", "Petronas", "Petron", "Touch 'n Go", "Rapid KL", "MRT",
  "Parking", "Car Wash",
];

const shoppingMerchants = [
  "Shopee", "Lazada", "Uniqlo", "H&M", "Cotton On", "Padini", "Watson's",
  "Guardian", "Mr DIY", "Daiso", "IKEA",
];

const billsMerchants = [
  "Tenaga Nasional", "Air Selangor", "Maxis", "Celcom", "Digi", "Unifi",
  "Astro", "Netflix", "Spotify", "iCloud",
];

const entertainmentMerchants = [
  "GSC Cinema", "TGV Cinema", "Karaoke Box", "Timezone", "Bowling",
  "Netflix", "Spotify", "Steam", "PlayStation Store",
];

const healthcareMerchants = [
  "Klinik Kesihatan", "Guardian Pharmacy", "Watson's Pharmacy", "Caring Pharmacy",
];

// Helper to get random item from array
const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random amount in range
const randomAmount = (min: number, max: number): number =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

// Format date for display
const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Format time for display
const formatTime = (hour: number, minute: number): string => {
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

// Generate transactions for a single day
const generateDayTransactions = (date: Date) => {
  const transactions: Array<{
    merchant: string;
    date: string;
    time: string;
    timestamp: number;
    category: string;
    amount: number;
    processed: boolean;
    emotion?: string;
    emotionEmoji?: string;
  }> = [];

  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Breakfast (70% chance)
  if (Math.random() < 0.7) {
    const hour = 7 + Math.floor(Math.random() * 2);
    transactions.push({
      merchant: randomFrom(["Mamak Corner", "Roti Canai Stall", "Nasi Lemak Stall", "Old Town White Coffee", "Mixed Rice Stall"]),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Food",
      amount: -randomAmount(5, 15),
      processed: Math.random() < 0.6,
      emotion: Math.random() < 0.5 ? "Necessary" : undefined,
      emotionEmoji: Math.random() < 0.5 ? "✅" : undefined,
    });
  }

  // Morning coffee (40% chance)
  if (Math.random() < 0.4) {
    const hour = 9 + Math.floor(Math.random() * 2);
    transactions.push({
      merchant: randomFrom(["Starbucks", "ZUS Coffee", "Tealive", "Gong Cha"]),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Food",
      amount: -randomAmount(10, 25),
      processed: Math.random() < 0.5,
      emotion: Math.random() < 0.4 ? "Impulse" : undefined,
      emotionEmoji: Math.random() < 0.4 ? "😅" : undefined,
    });
  }

  // Lunch (90% chance)
  if (Math.random() < 0.9) {
    const hour = 12 + Math.floor(Math.random() * 2);
    transactions.push({
      merchant: randomFrom(foodMerchants),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Food",
      amount: -randomAmount(10, 35),
      processed: Math.random() < 0.6,
      emotion: Math.random() < 0.5 ? "Necessary" : undefined,
      emotionEmoji: Math.random() < 0.5 ? "✅" : undefined,
    });
  }

  // Transport (weekdays more likely)
  if (Math.random() < (isWeekend ? 0.3 : 0.7)) {
    const hour = isWeekend ? 10 + Math.floor(Math.random() * 8) : 8;
    transactions.push({
      merchant: randomFrom(transportMerchants),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Transport",
      amount: -randomAmount(5, 50),
      processed: Math.random() < 0.7,
      emotion: "Necessary",
      emotionEmoji: "✅",
    });
  }

  // Dinner (80% chance)
  if (Math.random() < 0.8) {
    const hour = 18 + Math.floor(Math.random() * 3);
    transactions.push({
      merchant: randomFrom(foodMerchants),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Food",
      amount: -randomAmount(15, 50),
      processed: Math.random() < 0.5,
      emotion: Math.random() < 0.4 ? "Planned" : undefined,
      emotionEmoji: Math.random() < 0.4 ? "📝" : undefined,
    });
  }

  // Weekend activities
  if (isWeekend) {
    // Shopping (60% chance on weekends)
    if (Math.random() < 0.6) {
      const hour = 14 + Math.floor(Math.random() * 4);
      transactions.push({
        merchant: randomFrom(shoppingMerchants),
        date: formatDate(date),
        time: formatTime(hour, Math.floor(Math.random() * 60)),
        timestamp: new Date(date).setHours(hour),
        category: "Shopping",
        amount: -randomAmount(30, 200),
        processed: Math.random() < 0.4,
        emotion: Math.random() < 0.5 ? "Impulse" : "Planned",
        emotionEmoji: Math.random() < 0.5 ? "😅" : "📝",
      });
    }

    // Entertainment (40% chance)
    if (Math.random() < 0.4) {
      const hour = 15 + Math.floor(Math.random() * 5);
      transactions.push({
        merchant: randomFrom(entertainmentMerchants),
        date: formatDate(date),
        time: formatTime(hour, Math.floor(Math.random() * 60)),
        timestamp: new Date(date).setHours(hour),
        category: "Entertainment",
        amount: -randomAmount(20, 80),
        processed: Math.random() < 0.5,
        emotion: "Planned",
        emotionEmoji: "📝",
      });
    }

    // Groceries (50% chance)
    if (Math.random() < 0.5) {
      const hour = 10 + Math.floor(Math.random() * 4);
      transactions.push({
        merchant: randomFrom(groceryMerchants),
        date: formatDate(date),
        time: formatTime(hour, Math.floor(Math.random() * 60)),
        timestamp: new Date(date).setHours(hour),
        category: "Groceries",
        amount: -randomAmount(50, 200),
        processed: Math.random() < 0.6,
        emotion: "Necessary",
        emotionEmoji: "✅",
      });
    }
  }

  // Random online shopping (20% chance any day)
  if (Math.random() < 0.2) {
    const hour = 20 + Math.floor(Math.random() * 3);
    transactions.push({
      merchant: randomFrom(["Shopee", "Lazada"]),
      date: formatDate(date),
      time: formatTime(hour, Math.floor(Math.random() * 60)),
      timestamp: new Date(date).setHours(hour),
      category: "Shopping",
      amount: -randomAmount(20, 150),
      processed: Math.random() < 0.3,
      emotion: Math.random() < 0.6 ? "Impulse" : "Planned",
      emotionEmoji: Math.random() < 0.6 ? "😅" : "📝",
    });
  }

  return transactions;
};

// Seed the database with realistic Malaysian monthly data
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingTransactions = await ctx.db.query("transactions").first();
    if (existingTransactions) {
      return { message: "Database already seeded" };
    }

    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    // Generate transactions for the past 30 days
    const allTransactions: Array<{
      merchant: string;
      date: string;
      time: string;
      timestamp: number;
      category: string;
      amount: number;
      processed: boolean;
      emotion?: string;
      emotionEmoji?: string;
    }> = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * day);
      const dayTransactions = generateDayTransactions(date);
      allTransactions.push(...dayTransactions);
    }

    // Add monthly bills (beginning of month)
    const billsToAdd = [
      { merchant: "Tenaga Nasional", amount: -randomAmount(80, 180), category: "Bills" },
      { merchant: "Air Selangor", amount: -randomAmount(15, 40), category: "Bills" },
      { merchant: "Unifi", amount: -randomAmount(120, 160), category: "Bills" },
      { merchant: "Maxis", amount: -randomAmount(50, 120), category: "Bills" },
      { merchant: "Netflix", amount: -44.90, category: "Entertainment" },
      { merchant: "Spotify", amount: -14.90, category: "Entertainment" },
    ];

    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    billsToAdd.forEach((bill, idx) => {
      const billDate = new Date(firstOfMonth.getTime() + idx * day);
      allTransactions.push({
        merchant: bill.merchant,
        date: formatDate(billDate),
        time: "12:00 AM",
        timestamp: billDate.getTime(),
        category: bill.category,
        amount: bill.amount,
        processed: true,
        emotion: "Necessary",
        emotionEmoji: "✅",
      });
    });

    // Insert all transactions
    for (const transaction of allTransactions) {
      await ctx.db.insert("transactions", transaction);
    }

    // Seed journal entries
    const journalEntries = [
      {
        content: "Spent way too much on Shopee again during the 12.12 sale. The discounts were too tempting but I ended up buying things I don't really need. Need to uninstall the app during sales...",
        mood: "Regretful",
        moodEmoji: "😔",
        timestamp: now.getTime() - 2 * day,
        date: formatDate(new Date(now.getTime() - 2 * day)),
      },
      {
        content: "Had a great mamak session with friends tonight. RM 30 well spent on good food and company. These moments are worth the money.",
        mood: "Happy",
        moodEmoji: "😊",
        timestamp: now.getTime() - 5 * day,
        date: formatDate(new Date(now.getTime() - 5 * day)),
      },
      {
        content: "Finally paid off my credit card bill in full this month! Feeling accomplished. The strict budgeting is paying off.",
        mood: "Proud",
        moodEmoji: "🎉",
        timestamp: now.getTime() - 7 * day,
        date: formatDate(new Date(now.getTime() - 7 * day)),
      },
      {
        content: "Grabbed a Starbucks again today even though I have coffee at home. It's becoming a habit I need to break. That's RM 20 I could save daily.",
        mood: "Reflective",
        moodEmoji: "🤔",
        timestamp: now.getTime() - 10 * day,
        date: formatDate(new Date(now.getTime() - 10 * day)),
      },
      {
        content: "Went grocery shopping at AEON with a list and stuck to it! Only bought what I needed. Small win but it feels good.",
        mood: "Content",
        moodEmoji: "✨",
        timestamp: now.getTime() - 14 * day,
        date: formatDate(new Date(now.getTime() - 14 * day)),
      },
      {
        content: "Petrol prices went up again. Filled up the tank and it cost RM 180. Transport costs are really eating into my budget.",
        mood: "Worried",
        moodEmoji: "😟",
        timestamp: now.getTime() - 18 * day,
        date: formatDate(new Date(now.getTime() - 18 * day)),
      },
    ];

    for (const entry of journalEntries) {
      await ctx.db.insert("journalEntries", entry);
    }

    // Calculate totals for insights
    const totalSpending = allTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Category breakdown
    const categoryMap: Record<string, number> = {};
    allTransactions.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Math.abs(t.amount);
    });
    
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalSpending) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Seed insights for different periods
    const insights = [
      {
        periodStart: now.getTime() - 7 * day,
        periodEnd: now.getTime(),
        periodType: "7days",
        totalSpending: totalSpending * 0.25,
        transactionCount: Math.floor(allTransactions.length * 0.25),
        categoryBreakdown: categoryBreakdown.map(c => ({
          ...c,
          amount: c.amount * 0.25,
        })),
        emotionBreakdown: [],
        aiAnalysis: {
          summary: `Based on your spending and journal entries this week, you've spent approximately RM ${(totalSpending * 0.25).toFixed(2)}. Your food expenses make up the largest portion at ${categoryBreakdown[0]?.percentage.toFixed(0)}% of spending.\n\nYour journal entries show awareness about impulse purchases, particularly around online shopping and daily coffee habits. The reflection about Starbucks spending (RM 20/day = RM 600/month) shows good financial awareness.\n\nNotably, you expressed pride in paying off your credit card - this positive financial behavior should be celebrated and continued.`,
          topInsight: "Your daily coffee purchases (averaging RM 15-20) could save you RM 450-600/month if reduced to twice weekly. Consider brewing at home on other days.",
          spendingPatterns: [
            "Food delivery spending peaks on weekday evenings (6-9 PM)",
            "Online shopping activity increases during late night hours (10 PM - 12 AM)",
            "Weekend spending is 40% higher than weekdays",
            "Coffee purchases happen most frequently on Monday and Wednesday mornings",
            "Grocery shopping tends to happen on Saturday mornings",
          ],
          recommendations: [],
          emotionalTriggers: [
            "Late night browsing on Shopee/Lazada leads to impulse purchases",
            "Work stress correlates with increased food delivery orders",
            "Social media ads trigger unplanned shopping",
            "Payday spending spike in first week of month",
          ],
          positiveHighlights: [],
        },
        generatedAt: now.getTime(),
      },
      {
        periodStart: now.getTime() - 14 * day,
        periodEnd: now.getTime(),
        periodType: "14days",
        totalSpending: totalSpending * 0.5,
        transactionCount: Math.floor(allTransactions.length * 0.5),
        categoryBreakdown: categoryBreakdown.map(c => ({
          ...c,
          amount: c.amount * 0.5,
        })),
        emotionBreakdown: [],
        aiAnalysis: {
          summary: `Over the past 2 weeks, your total spending reached RM ${(totalSpending * 0.5).toFixed(2)}. Your journal entries reveal a pattern of awareness followed by occasional setbacks - like the 12.12 sale impulse purchases.\n\nPositive signs: You successfully stuck to a grocery list and felt good about it. You also value experiences (mamak with friends) over material purchases.\n\nAreas for improvement: The Shopee/Lazada late-night browsing habit is a clear trigger. Your own suggestion to "uninstall the app during sales" is worth trying.`,
          topInsight: "Your spending patterns show a 35% increase during sales periods (11.11, 12.12). Setting a pre-sale budget and removing payment apps could help control impulse buying.",
          spendingPatterns: [
            "Food remains your largest expense category at 45% of total spending",
            "Transport costs increased 15% due to petrol price hikes",
            "Entertainment subscriptions (Netflix, Spotify) are consistent fixed costs",
            "Shopping spikes correlate with major e-commerce sales events",
            "Bill payments are well-organized and paid on time",
          ],
          recommendations: [],
          emotionalTriggers: [
            "Sale events (11.11, 12.12) trigger significant impulse spending",
            "Rising fuel costs causing financial anxiety",
            "Social activities (mamak sessions) seen as worthy expenses",
            "Achievement feelings from sticking to budgets",
          ],
          positiveHighlights: [],
        },
        generatedAt: now.getTime(),
      },
      {
        periodStart: now.getTime() - 30 * day,
        periodEnd: now.getTime(),
        periodType: "30days",
        totalSpending: totalSpending,
        transactionCount: allTransactions.length,
        categoryBreakdown: categoryBreakdown,
        emotionBreakdown: [],
        aiAnalysis: {
          summary: `Monthly Overview: You spent RM ${totalSpending.toFixed(2)} across ${allTransactions.length} transactions this month.\n\nBreakdown:\n• Food & Dining: RM ${categoryMap["Food"]?.toFixed(2) || 0} (eating out + groceries)\n• Transport: RM ${categoryMap["Transport"]?.toFixed(2) || 0} (fuel + Grab)\n• Shopping: RM ${categoryMap["Shopping"]?.toFixed(2) || 0} (online + retail)\n• Bills: RM ${categoryMap["Bills"]?.toFixed(2) || 0} (utilities + subscriptions)\n\nYour journal entries show growing financial awareness. Key themes: impulse control struggles with online shopping, appreciation for social experiences, and pride in debt management.\n\nThe fact that you paid off your credit card in full is excellent - maintaining this habit will save you significant interest charges.`,
          topInsight: "If you maintain current spending, your annual expenses would be approximately RM ${(totalSpending * 12).toFixed(0)}. Reducing food delivery by 50% and limiting online shopping to planned purchases could save RM 300-500/month.",
          spendingPatterns: [
            "Average daily spending: RM " + (totalSpending / 30).toFixed(2),
            "Highest spending day: Saturdays (weekend shopping + dining)",
            "Lowest spending day: Tuesdays",
            "Food delivery accounts for 30% of food expenses",
            "Coffee shop visits average 4-5 times per week",
            "Online shopping makes up 60% of shopping category",
          ],
          recommendations: [],
          emotionalTriggers: [
            "Convenience is the main driver for food delivery choices",
            "FOMO during sales events leads to unplanned purchases",
            "Stress relief often manifests as retail therapy",
            "Positive social experiences justify spending in your mind",
            "Financial achievements boost motivation to continue budgeting",
          ],
          positiveHighlights: [],
        },
        generatedAt: now.getTime(),
      },
    ];

    for (const insight of insights) {
      await ctx.db.insert("insights", insight);
    }

    return { 
      message: "Database seeded successfully",
      transactionCount: allTransactions.length,
      journalCount: journalEntries.length,
    };
  },
});

// Clear and reseed (for testing)
export const clearAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing data
    const transactions = await ctx.db.query("transactions").collect();
    for (const t of transactions) {
      await ctx.db.delete(t._id);
    }

    const journals = await ctx.db.query("journalEntries").collect();
    for (const j of journals) {
      await ctx.db.delete(j._id);
    }

    const insights = await ctx.db.query("insights").collect();
    for (const i of insights) {
      await ctx.db.delete(i._id);
    }

    return { message: "Database cleared. Run seedData to repopulate." };
  },
});
