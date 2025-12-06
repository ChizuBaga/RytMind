import { useState } from "react";
import { X, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JournalModalProps {
  transactionId: string;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
}

const JournalModal = ({ transactionId, onClose, onComplete }: JournalModalProps) => {
  const [journal, setJournal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async () => {
    if (!journal.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsComplete(true);
    
    // Auto close after success
    setTimeout(() => {
      onComplete(transactionId);
      onClose();
    }, 1500);
  };

  const prompts = [
    "Was this a planned purchase?",
    "How did you feel before buying?",
    "Would you buy it again?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-elevated p-6 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        {isComplete ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-pulse-success">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Insight Recorded!</h2>
            <p className="text-muted-foreground">Your emotional spending has been analyzed.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Journal Entry</h2>
                <p className="text-sm text-muted-foreground">Reflect on this purchase</p>
              </div>
            </div>

            {/* Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setJournal((prev) => prev + (prev ? " " : "") + prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <Textarea
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Start writing here...

How did this purchase make you feel?
Was it planned or spontaneous?
Would you make the same choice again?"
              className="min-h-[180px] mb-4 resize-none text-base leading-relaxed"
            />

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={!journal.trim() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                "Save Insight"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default JournalModal;
