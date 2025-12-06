import { useState } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

interface TherapistChatProps {
  onClose: () => void;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi there! I'm your Financial Therapist. I'm here to help you understand your spending patterns and develop a healthier relationship with money. What's on your mind today?",
  },
];

const TherapistChat = ({ onClose }: TherapistChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. Let's break this down together. What triggered this spending decision?",
        "That's a great observation about your habits. Have you noticed any patterns in when you tend to make these purchases?",
        "It sounds like there might be some emotional factors at play here. Let's explore that a bit more.",
        "Remember, awareness is the first step to change. You're already making progress by reflecting on this.",
      ];
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-elevated overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Financial Therapist</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-slide-up ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === "assistant"
                  ? "gradient-primary"
                  : "bg-muted"
              }`}
            >
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary-foreground" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === "assistant"
                  ? "bg-muted text-foreground rounded-tl-sm"
                  : "gradient-primary text-primary-foreground rounded-tr-sm"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            variant="primary"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TherapistChat;
