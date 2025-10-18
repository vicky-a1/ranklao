import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Landmark, Wallet } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSelectMethod: (method: string) => void;
  amount: number;
}

export function PaymentModal({
  open,
  onClose,
  onSelectMethod,
  amount,
}: PaymentModalProps) {
  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Pay securely with your card",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "netbanking",
      name: "Net Banking",
      description: "Pay through your bank account",
      icon: <Landmark className="w-5 h-5" />,
    },
    {
      id: "upi",
      name: "UPI",
      description: "Google Pay, PhonePe, Paytm & more",
      icon: <Wallet className="w-5 h-5" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to complete your transaction of ₹{amount}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => onSelectMethod(method.id)}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  {method.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {method.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}