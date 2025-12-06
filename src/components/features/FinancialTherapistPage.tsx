import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, Mic, MicOff, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface FinancialTherapistPageProps {
  onBack: () => void;
}

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  isTyping?: boolean;
}

const quickPrompts = [
  "I keep spending on things I don't need",
  "How can I save more money?",
  "I feel anxious about my finances",
  "Help me understand my spending patterns",
];

const FinancialTherapistPage = ({ onBack }: FinancialTherapistPageProps) => {
  // Convex hooks
  const chatHistory = useQuery(api.therapistChat.getChatHistory, { limit: 50 }) || [];
  const sendMessageAction = useAction(api.therapistChat.sendMessage);
  
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Transform Convex data to Message format
  const messages: Message[] = chatHistory.map((msg: any) => ({
    id: msg._id,
    role: msg.role as "assistant" | "user",
    content: msg.content,
  }));

  // Add initial message if no chat history
  if (messages.length === 0) {
    messages.push({
      id: "initial",
      role: "assistant",
      content: "Hello! I'm your Financial Therapist, here to help you understand your relationship with money. 💙\n\nI can help you:\n• Identify emotional spending triggers\n• Develop healthier money habits\n• Create personalized saving strategies\n\nWhat's on your mind today?",
    });
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setInput("");
    setIsTyping(true);

    try {
      // Call Convex action which handles everything:
      // - Save user message
      // - Fetch insights & context
      // - Call Lindy AI
      // - Save AI response
      const result = await sendMessageAction({ userMessage });

      // Simulate voice response if enabled
      if (voiceEnabled && result.success) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      {/* Header - Fixed */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-card flex-shrink-0">
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

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5 py-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-4">
            <Volume2 className="w-4 h-4 animate-pulse text-primary" />
            <span>Speaking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Section - Fixed */}
      <div className="flex-shrink-0 bg-card border-t border-border">
        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pt-2 pb-2">
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
        <div className="p-4">
          <div className="flex gap-2">
            <Button
              variant={isListening ? "primary" : "ghost"}
              size="icon"
              onClick={handleVoiceToggle}
              className={cn(isListening && "animate-pulse")}
              disabled={isTyping}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Type or speak your thoughts..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button 
              variant="primary" 
              size="icon" 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {isTyping ? "💭 Thinking..." : isListening ? "🎤 Listening... speak now" : "Tap the mic to use voice"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialTherapistPage;
