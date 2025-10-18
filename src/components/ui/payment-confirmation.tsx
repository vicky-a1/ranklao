import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield } from "lucide-react";

interface SessionType {
  type: string;
  duration: number;
  price: number;
  features: string[];
}

interface PaymentConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sessionType: SessionType;
  mentorName: string;
}

export function PaymentConfirmation({
  open,
  onClose,
  onConfirm,
  sessionType,
  mentorName,
}: PaymentConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Your Purchase</DialogTitle>
          <DialogDescription>
            You're about to book a {sessionType.type} session with {mentorName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-secondary/30 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Session Details</h3>
            <div className="flex justify-between mb-2">
              <span>Session Type:</span>
              <span className="font-medium capitalize">{sessionType.type}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Duration:</span>
              <span className="font-medium">{sessionType.duration} minutes</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Price:</span>
              <span className="font-bold text-primary">₹{sessionType.price}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold">What's included:</h3>
            <ul className="space-y-2">
              {sessionType.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg flex items-start gap-2 text-sm">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-300">Secure Payment</p>
              <p className="text-blue-600/80 dark:text-blue-400/80">Your payment information is processed securely through Razorpay.</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="sm:w-auto w-full">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="sm:w-auto w-full">
            Proceed to Pay ₹{sessionType.price}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}