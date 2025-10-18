import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section id="mentors" className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <img
              src="/images/badge.png"
              alt=""
              aria-hidden="true"
              className="w-4 h-4 object-contain"
            />
            <span className="text-sm font-medium text-primary">Join thousands of successful aspirants</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Ready to Transform Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Exam Preparation?
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with proven rankers today and start your journey towards success. 
            Your dream college or career is just a mentor away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => document.getElementById('mentors')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Become a Mentor
            </Button>
          </div>
          
          <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              Free trial for 7 days
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
