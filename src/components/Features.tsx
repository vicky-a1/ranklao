import { Card } from "@/components/ui/card";
import { Users, BookOpen, TrendingUp, MessageCircle, Target, Award } from "lucide-react";
import mentorIcon from "@/assets/mentor-icon.jpg";
import progressIcon from "@/assets/progress-icon.jpg";
import resourcesIcon from "@/assets/resources-icon.jpg";

const features = [
  {
    icon: Users,
    title: "Expert Mentorship",
    description: "Connect with top rankers who've cracked your target exam. Get personalized guidance and proven strategies.",
    image: mentorIcon,
  },
  {
    icon: BookOpen,
    title: "Curated Resources",
    description: "Access high-quality notes, study plans, and prep materials curated by rankers for maximum efficiency.",
    image: resourcesIcon,
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Track your daily progress, maintain study streaks, and visualize your improvement journey.",
    image: progressIcon,
  },
  {
    icon: MessageCircle,
    title: "Direct Chat Support",
    description: "Get instant doubt resolution and motivation through in-app messaging with your mentor.",
  },
  {
    icon: Target,
    title: "Mock Test Analytics",
    description: "Upload mock tests and receive detailed performance analytics to identify strengths and weaknesses.",
  },
  {
    icon: Award,
    title: "Gamified Learning",
    description: "Earn badges, climb leaderboards, and stay motivated with achievements and milestones.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive tools and mentorship to transform your exam preparation journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="space-y-4">
                  {feature.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
