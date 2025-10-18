import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Users, BookOpen, Calendar, Star, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProgressIndicator from "@/components/ProgressIndicator";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [planName, setPlanName] = useState("");
  const [currentStep] = useState(1);

  const [onboardingSteps] = useState([
    {
      id: "payment",
      title: "Payment",
      description: "Complete payment",
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      id: "profile",
      title: "Profile Setup",
      description: "Complete your profile",
      icon: <Users className="w-5 h-5" />
    },
    {
      id: "browse",
      title: "Browse Mentors",
      description: "Find your mentor",
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      id: "book",
      title: "Book Session",
      description: "Schedule your first session",
      icon: <Calendar className="w-5 h-5" />
    }
  ]);

  useEffect(() => {
    // Get plan name from URL params
    const plan = searchParams.get("plan") || "Premium Plan";

    setPlanName(plan);

    // Show success toast
    toast({
      title: "🎉 Payment Successful!",
      description: `Welcome to ${plan}! Let's get you started.`,
      duration: 5000,
    });
  }, [searchParams, toast]);

  const steps = [
    {
      id: 1,
      title: "Complete Your Profile",
      description: "Tell us about your goals and preferences",
      icon: Users,
      action: () => navigate("/onboarding"),
      buttonText: "Complete Profile",
      completed: false,
    },
    {
      id: 2,
      title: "Browse Top Mentors",
      description: "Find the perfect mentor for your journey",
      icon: BookOpen,
      action: () => navigate("/browse-mentors"),
      buttonText: "Browse Mentors",
      completed: false,
    },
    {
      id: 3,
      title: "Book Your First Session",
      description: "Schedule a session with your chosen mentor",
      icon: Calendar,
      action: () => navigate("/browse-mentors"),
      buttonText: "Book Session",
      completed: false,
    },
  ];

  const benefits = [
    {
      icon: Star,
      title: "Expert Mentors",
      description: "Learn from IIT toppers and industry experts",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience",
    },
    {
      icon: Gift,
      title: "Exclusive Resources",
      description: "Access premium study materials and notes",
    },
  ];

  const handleNextStep = () => {
    const nextStep = steps.find(step => step.id === currentStep);
    if (nextStep) {
      nextStep.action();
    }
  };

  const handleSkipToMentors = () => {
    navigate("/browse-mentors");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator steps={onboardingSteps} currentStep="profile" className="max-w-2xl mx-auto" />
        </div>

        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {planName}!
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your payment was successful. Let's get you started on your journey to success!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Main Flow */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {currentStep}
                  </span>
                  Next Steps
                </CardTitle>
                <CardDescription>
                  Follow these steps to make the most of your mentorship experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                      step.id === currentStep
                        ? "border-primary bg-primary/5 shadow-md"
                        : step.id < currentStep
                        ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.id === currentStep
                          ? "bg-primary text-primary-foreground"
                          : step.id < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.id < currentStep ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    {step.id === currentStep && (
                      <Button onClick={handleNextStep} className="shrink-0">
                        {step.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump to any section when you're ready
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate("/onboarding")}>
                  Complete Profile
                </Button>
                <Button variant="outline" onClick={handleSkipToMentors}>
                  Browse Mentors
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard/student")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Details */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Active
                  </Badge>
                  {planName}
                </CardTitle>
                <CardDescription>
                  Your subscription is now active
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>What You Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <benefit.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <CardHeader>
                <CardTitle className="text-secondary">Need Help?</CardTitle>
                <CardDescription>
                  Our support team is here to help you succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;