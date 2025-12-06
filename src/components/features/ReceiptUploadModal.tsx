import { useState } from "react";
import { X, Camera, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReceiptUploadModalProps {
  transactionId: string;
  onClose: () => void;
  onComplete: (transactionId: string) => void;
}

const ReceiptUploadModal = ({ transactionId, onClose, onComplete }: ReceiptUploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    
    // Simulate upload and processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsUploading(false);
    setIsComplete(true);
    
    // Auto close after success
    setTimeout(() => {
      onComplete(transactionId);
      onClose();
    }, 1500);
  };

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
        <div className="flex flex-col items-center text-center">
          {isComplete ? (
            <>
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-pulse-success">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Receipt Analyzed!</h2>
              <p className="text-muted-foreground">Your spending insight has been recorded.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Upload Receipt</h2>
              <p className="text-muted-foreground mb-6">
                Snap a photo of your receipt to begin the emotional spending analysis.
              </p>

              {/* Upload Area */}
              <div
                onClick={handleUpload}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Analyzing receipt...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Tap to capture or upload</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploadModal;
