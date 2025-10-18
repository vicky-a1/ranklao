import { Card } from "@/components/ui/card";
import { UserPlus, Users2, BookOpenCheck, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Sign Up",
    description: "Create your account and tell us about your exam goals and current preparation level.",
  },
  {
    icon: Users2,
    number: "02",
    title: "Get Matched",
    description: "We connect you with the perfect mentor who's excelled in your target exam.",
  },
  {
    icon: BookOpenCheck,
    number: "03",
    title: "Learn & Practice",
    description: "Access curated resources, follow personalized study plans, and take mock tests.",
  },
  {
    icon: TrendingUp,
    number: "04",
    title: "Track Progress",
    description: "Monitor your improvement, maintain streaks, and stay motivated throughout your journey.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranklao Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Your journey from aspirant to achiever in four simple steps
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-4"></div>
                  )}
                  
                  <Card 
                    className="p-6 hover:shadow-xl transition-all duration-300 border-border bg-card animate-fade-in-up relative overflow-hidden group"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 select-none">
                      {step.number}
                    </div>
                    
                    <div className="relative space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-primary mb-2">Step {step.number}</div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
