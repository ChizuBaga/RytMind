import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TherapistChat from "@/components/features/TherapistChat";

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-md h-[70vh] max-h-[600px] animate-slide-up">
            <TherapistChat onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      {/* FAB */}
      <Button
        variant="fab"
        size="fab"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 animate-bounce-in"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>
    </>
  );
};

export default FloatingChatButton;
