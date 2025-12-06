import { useState } from "react";
import { ArrowLeft, Book, Plus, Calendar, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface JournallingPageProps {
  onBack: () => void;
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  moodEmoji: string;
}

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: "Dec 5, 2024",
    content: "Spent RM 245 on Lazada today. I think it was impulsive - I didn't really need those items but the sale was tempting...",
    mood: "Reflective",
    moodEmoji: "🤔",
  },
  {
    id: "2",
    date: "Dec 3, 2024",
    content: "Paid the electricity bill today. Feeling responsible about keeping up with essentials.",
    mood: "Content",
    moodEmoji: "😊",
  },
];

const writingPrompts = [
  "What triggered my last impulse purchase?",
  "How do I feel about my spending this week?",
  "What are 3 things I'm grateful I didn't buy?",
  "What's one financial goal I'm proud of?",
  "When do I tend to spend emotionally?",
];

const JournallingPage = ({ onBack }: JournallingPageProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handleSaveEntry = () => {
    if (!newContent.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: newContent,
      mood: "Reflective",
      moodEmoji: "💭",
    };
    
    setEntries([newEntry, ...entries]);
    setNewContent("");
    setShowNewEntry(false);
    setSelectedPrompt(null);
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setNewContent(prompt + "\n\n");
    setShowNewEntry(true);
  };

  return (
    <div className="flex-1 px-4 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Journalling</h1>
          <p className="text-sm text-muted-foreground">Reflect on your spending</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowNewEntry(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New
        </Button>
      </div>

      {/* Writing Prompts */}
      <div className="bg-card rounded-2xl shadow-card p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Writing Prompts</h2>
        </div>
        <div className="space-y-2">
          {writingPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all text-left group"
            >
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {prompt}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          ))}
        </div>
      </div>

      {/* New Entry Form */}
      {showNewEntry && (
        <div className="bg-card rounded-2xl shadow-card p-5 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <Book className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">New Entry</h2>
          </div>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Start writing your thoughts here... 

How did today's spending make you feel? What emotions were behind your purchases? Are there patterns you're noticing?"
            className="min-h-[200px] mb-4 resize-none text-base leading-relaxed"
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleSaveEntry} className="flex-1">
              Save Entry
            </Button>
            <Button variant="ghost" onClick={() => {
              setShowNewEntry(false);
              setNewContent("");
              setSelectedPrompt(null);
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Past Entries */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <h2 className="font-semibold text-foreground">Past Entries</h2>
        {entries.length === 0 ? (
          <div className="bg-card rounded-xl shadow-card p-8 text-center">
            <Book className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start journalling to track your emotional spending</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-card rounded-xl shadow-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{entry.moodEmoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                  </div>
                  <span className="text-xs text-primary font-medium">{entry.mood}</span>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournallingPage;
