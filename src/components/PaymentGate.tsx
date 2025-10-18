import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CreditCard, Users, BookOpen, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentGate = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Access to Verified Mentors",
      description: "Connect with top rankers from JEE, NEET, and CA exams"
    },
    {
      icon: BookOpen,
      title: "Personalized Study Plans",
      description: "Get customized study strategies based on your goals"
    },
    {
      icon: Trophy,
      title: "1-on-1 Mentorship Sessions",
      description: "Book sessions with mentors who've achieved your dream rank"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-premium border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Unlock Your Mentorship Journey</CardTitle>
          <p className="text-muted-foreground text-lg">
            Complete your payment to access our premium mentorship platform and start learning from top rankers.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="font-semibold">Secure Payment</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your payment information is processed securely through Razorpay. Start with a free trial session!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate("/browse-mentors")} 
              className="flex-1"
              size="lg"
            >
              Browse Mentors & Make Payment
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              size="lg"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGate;