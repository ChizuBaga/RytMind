import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FinancialTherapistPageProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  isTyping?: boolean;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your Financial Therapist, here to help you understand your relationship with money. 💙\n\nI can help you:\n• Identify emotional spending triggers\n• Develop healthier money habits\n• Create personalized saving strategies\n\nWhat's on your mind today?",
  },
];

const quickPrompts = [
  "I keep spending on things I don't need",
  "How can I save more money?",
  "I feel anxious about my finances",
  "Help me understand my spending patterns",
];

const aiResponses: Record<string, string> = {
  "spending": "I hear you. Emotional spending is very common, and acknowledging it is the first step. Let's explore what triggers these purchases. Often, we spend to fill an emotional void or as a response to stress. \n\nCan you think of a recent purchase that felt impulsive? What were you feeling right before you bought it?",
  "save": "Great question! Saving becomes easier when we understand why we want to save. Let's start with your 'why'.\n\nWhat would having more savings mean for you? Is it security, freedom, a specific goal, or something else?",
  "anxious": "Financial anxiety is real and valid. You're not alone in feeling this way. The good news is that awareness is power.\n\nLet's take a breath together. What specifically about your finances feels most overwhelming right now? Breaking it down can make it more manageable.",
  "patterns": "Understanding your spending patterns is key to financial wellness. Based on what I've seen, you tend to spend more on weekends and often on food & dining.\n\nHave you noticed any emotional states that coincide with these spending moments?",
  "default": "Thank you for sharing that with me. It takes courage to reflect on our financial behaviors.\n\nLet me ask you this: If you could change one thing about your relationship with money, what would it be?",
};

const FinancialTherapistPage = ({ onBack }: FinancialTherapistPageProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("spend") || lowerMessage.includes("buy") || lowerMessage.includes("impulse")) {
      return aiResponses.spending;
    }
    if (lowerMessage.includes("save") || lowerMessage.includes("saving")) {
      return aiResponses.save;
    }
    if (lowerMessage.includes("anxious") || lowerMessage.includes("stress") || lowerMessage.includes("worried")) {
      return aiResponses.anxious;
    }
    if (lowerMessage.includes("pattern") || lowerMessage.includes("habit")) {
      return aiResponses.patterns;
    }
    return aiResponses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Show typing indicator
    const typingId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: typingId, role: "assistant", content: "", isTyping: true }]);

    // Simulate AI response with delay
    setTimeout(() => {
      const response = getAIResponse(input);
      setMessages((prev) =>
        prev.map((m) => (m.id === typingId ? { ...m, content: response, isTyping: false } : m))
      );

      // Simulate voice response
      if (voiceEnabled) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    }, 1500);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Simulate voice recognition
    if (!isListening) {
      setTimeout(() => {
        setInput("I've been spending too much lately and I'm not sure why");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground">Financial Therapist</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">AI-powered • Voice enabled</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={cn(!voiceEnabled && "text-muted-foreground")}
        >
          {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-slide-up",
              message.role === "user" && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                message.role === "assistant" ? "gradient-primary" : "bg-muted"
              )}
            >
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary-foreground" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[85%] px-4 py-3 rounded-2xl",
                message.role === "assistant"
                  ? "bg-muted text-foreground rounded-tl-sm"
                  : "gradient-primary text-primary-foreground rounded-tr-sm"
              )}
            >
              {message.isTyping ? (
                <div className="flex gap-1.5 py-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {isSpeaking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
            <Volume2 className="w-4 h-4 animate-pulse text-primary" />
            <span>Speaking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Quick prompts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => setInput(prompt)}
                className="px-3 py-1.5 text-xs bg-muted rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button
            variant={isListening ? "primary" : "ghost"}
            size="icon"
            onClick={handleVoiceToggle}
            className={cn(isListening && "animate-pulse")}
          >
            {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type or speak your thoughts..."
            className="flex-1"
          />
          <Button variant="primary" size="icon" onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isListening ? "🎤 Listening... speak now" : "Tap the mic to use voice"}
        </p>
      </div>
    </div>
  );
};

export default FinancialTherapistPage;
