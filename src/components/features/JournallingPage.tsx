import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Book, Plus, Calendar, Sparkles, ChevronRight, Mic, MicOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Transaction } from "./TransactionsPage";

interface JournallingPageProps {
  onBack: () => void;
  transactions: Transaction[];
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  moodEmoji: string;
  emotion: string;
  transactionIds?: string[];
}

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    date: "Dec 5, 2024",
    content: "Spent RM 245 on Lazada today. I think it was impulsive - I didn't really need those items but the sale was tempting...",
    mood: "Reflective",
    moodEmoji: "🤔",
    emotion: "Anxious",
  },
  {
    id: "2",
    date: "Dec 3, 2024",
    content: "Paid the electricity bill today. Feeling responsible about keeping up with essentials.",
    mood: "Content",
    moodEmoji: "😊",
    emotion: "Satisfied",
  },
];

const emotions = [
  { id: "happy", label: "Happy", emoji: "😊", color: "bg-success/10 text-success" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "bg-destructive/10 text-destructive" },
  { id: "excited", label: "Excited", emoji: "🤩", color: "bg-accent/10 text-accent" },
  { id: "guilty", label: "Guilty", emoji: "😔", color: "bg-muted text-muted-foreground" },
  { id: "satisfied", label: "Satisfied", emoji: "😌", color: "bg-primary/10 text-primary" },
  { id: "stressed", label: "Stressed", emoji: "😫", color: "bg-destructive/10 text-destructive" },
  { id: "relieved", label: "Relieved", emoji: "😮‍💨", color: "bg-success/10 text-success" },
  { id: "regretful", label: "Regretful", emoji: "😞", color: "bg-muted text-muted-foreground" },
];

const writingPrompts = [
  "What triggered this purchase?",
  "How did you feel before buying?",
  "How do you feel now about this purchase?",
  "Was this purchase necessary or impulsive?",
  "What would you do differently next time?",
  "How does this spending align with your goals?",
];

type JournalStep = "select" | "entry";

const JournallingPage = ({ onBack, transactions }: JournallingPageProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries);
  const [currentStep, setCurrentStep] = useState<JournalStep>("select");
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [newContent, setNewContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Group transactions by date
  const transactionsByDate = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Initialize Speech Recognition
  useEffect(() => {
    try {
      const SpeechRecognition = 
        (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setNewContent((prev) => prev + (prev && !prev.endsWith(" ") ? " " : "") + finalTranscript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        console.log("Speech Recognition API not supported in this browser");
      }
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping
        }
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start recording:", error);
      }
    }
  };

  const toggleTransactionSelection = (transactionId: string) => {
    setSelectedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };


  const handleContinueFromSelection = () => {
    if (selectedTransactions.size === 0) {
      alert("Please select at least one transaction to journal about.");
      return;
    }
    setCurrentStep("entry");
  };

  const handleSaveEntry = () => {
    if (!selectedEmotion) {
      alert("Please select an emotion for this journal entry.");
      return;
    }
    if (!newContent.trim()) {
      alert("Please write something about your feelings.");
      return;
    }
    
    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    
    const emotionData = emotions.find(e => e.id === selectedEmotion);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      content: newContent,
      mood: emotionData?.label || "Reflective",
      moodEmoji: emotionData?.emoji || "💭",
      emotion: emotionData?.label || "Reflective",
      transactionIds: Array.from(selectedTransactions),
    };
    
    setEntries([newEntry, ...entries]);
    setNewContent("");
    setSelectedEmotion(null);
    setNewContent("");
    setSelectedTransactions(new Set());
    setCurrentStep("select");
  };

  const handleCancelEntry = () => {
    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setCurrentStep("select");
    setNewContent("");
    setSelectedEmotion(null);
    setNewContent("");
    setSelectedTransactions(new Set());
  };

  const getSelectedTransactionsList = () => {
    return transactions.filter(t => selectedTransactions.has(t.id));
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
        {currentStep === "select" && (
          <Button variant="primary" size="sm" onClick={() => setCurrentStep("select")}>
            <Plus className="w-4 h-4 mr-1" />
            New Entry
          </Button>
        )}
      </div>

      {/* Step 1: Transaction Selection */}
      {currentStep === "select" && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Select Transactions</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which transactions you want to journal about. Select individual transactions from each date.
            </p>

            {/* Transactions Grouped by Date */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {Object.keys(transactionsByDate).slice(0, 7).map((date) => {
                const dateTransactions = transactionsByDate[date] || [];
                const allDateSelected = dateTransactions.every(t => selectedTransactions.has(t.id));
                const someDateSelected = dateTransactions.some(t => selectedTransactions.has(t.id));
                
                return (
                  <div key={date} className="space-y-2">
                    {/* Date Header with Select All */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-foreground">{date}</h3>
                        <span className="text-xs text-muted-foreground">
                          ({dateTransactions.length} transaction{dateTransactions.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (allDateSelected) {
                            // Deselect all from this date
                            dateTransactions.forEach(t => {
                              setSelectedTransactions(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(t.id);
                                return newSet;
                              });
                            });
                          } else {
                            // Select all from this date
                            dateTransactions.forEach(t => {
                              setSelectedTransactions(prev => new Set(prev).add(t.id));
                            });
                          }
                        }}
                        className={cn(
                          "text-xs px-2 py-1 rounded-lg border transition-all",
                          allDateSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground"
                        )}
                      >
                        {allDateSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    {/* Transactions for this date */}
                    <div className="space-y-2 pl-6">
                      {dateTransactions.map((transaction) => {
                        const isSelected = selectedTransactions.has(transaction.id);
                        return (
                          <button
                            key={transaction.id}
                            onClick={() => toggleTransactionSelection(transaction.id)}
                            className={cn(
                              "w-full p-3 rounded-xl border-2 transition-all text-left",
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{transaction.merchant}</p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.time} • RM {Math.abs(transaction.amount).toFixed(2)}
                                  {transaction.category && ` • ${transaction.category}`}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 ml-2">
                                  <Check className="w-3 h-3 text-primary-foreground" />
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTransactions.size > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedTransactions.size} transaction{selectedTransactions.size !== 1 ? "s" : ""} selected
                </p>
                <Button
                  variant="primary"
                  onClick={handleContinueFromSelection}
                  className="w-full"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Journal Entry Form */}
      {currentStep === "entry" && (
        <div className="space-y-4 animate-slide-up">
          <div className="bg-card rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Journal Entry</h2>
            </div>

            {/* Selected Transactions Summary with Item Breakdown */}
            {selectedTransactions.size > 0 && (
              <div className="mb-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Journaling about:</p>
                {getSelectedTransactionsList().map((transaction) => {
                  const hasItems = transaction.items && transaction.items.length > 0;
                  return (
                    <div key={transaction.id} className="bg-muted/30 rounded-xl p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{transaction.merchant}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.date} • RM {Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                        {transaction.category && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            transaction.category === "Food" && "bg-accent/10 text-accent",
                            transaction.category === "Shopping" && "bg-primary/10 text-primary",
                            transaction.category === "Transport" && "bg-secondary/10 text-secondary-foreground",
                            transaction.category === "Entertainment" && "bg-destructive/10 text-destructive",
                            transaction.category === "Bills" && "bg-muted text-muted-foreground",
                            (!transaction.category || transaction.category === "Others") && "bg-muted text-muted-foreground",
                          )}>
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      
                      {/* Item Breakdown */}
                      {hasItems && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Items Breakdown</p>
                          <div className="space-y-2">
                            {transaction.items.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-foreground">{item.name}</p>
                                  <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full",
                                    item.category === "Food" && "bg-accent/10 text-accent",
                                    item.category === "Shopping" && "bg-primary/10 text-primary",
                                    item.category === "Transport" && "bg-secondary/10 text-secondary-foreground",
                                    item.category === "Entertainment" && "bg-destructive/10 text-destructive",
                                    item.category === "Bills" && "bg-muted text-muted-foreground",
                                    item.category === "Others" && "bg-muted text-muted-foreground",
                                  )}>
                                    {item.category}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-foreground ml-2">
                                  RM {item.price.toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Emotion Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-3 block">
                How are you feeling about this spending? *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {emotions.map((emotion) => {
                  const isSelected = selectedEmotion === emotion.id;
                  return (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 relative",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="text-2xl">{emotion.emoji}</span>
                      <span className="text-xs font-medium text-foreground">{emotion.label}</span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text Area */}
            <div className="relative mb-4">
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={`Write about your feelings and thoughts...

Writing prompts to guide your reflection:
• What triggered this purchase?
• How did you feel before buying?
• How do you feel now about this purchase?
• Was this purchase necessary or impulsive?
• What would you do differently next time?
• How does this spending align with your goals?`}
                className="min-h-[200px] resize-none text-base leading-relaxed pr-12"
              />
              <button
                onClick={toggleRecording}
                disabled={!isSupported}
                className={cn(
                  "absolute bottom-3 right-3 p-2 rounded-full transition-all",
                  isRecording
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : isSupported
                    ? "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                )}
                title={
                  !isSupported
                    ? "Voice input not supported in this browser"
                    : isRecording
                    ? "Stop recording"
                    : "Start voice input"
                }
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  Recording...
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSaveEntry} className="flex-1" disabled={!selectedEmotion || !newContent.trim()}>
                Save Entry
              </Button>
              <Button variant="ghost" onClick={handleCancelEntry}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Past Entries */}
      {currentStep === "select" && (
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
                    <span className="text-xs text-primary font-medium">{entry.emotion}</span>
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JournallingPage;
