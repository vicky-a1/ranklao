import { TrendingUp, Users, Award, Target } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Students Mentored",
    color: "from-primary to-primary-glow",
  },
  {
    icon: Award,
    value: "95%",
    label: "Success Rate",
    color: "from-secondary to-secondary-glow",
  },
  {
    icon: Target,
    value: "500+",
    label: "Top 1000 Rankers",
    color: "from-accent to-primary",
  },
  {
    icon: TrendingUp,
    value: "4.9/5",
    label: "Average Rating",
    color: "from-secondary to-accent",
  },
];

const Stats = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Impact
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Numbers that speak for our commitment to your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className={`inline-flex w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} items-center justify-center mb-4 shadow-elegant`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-4xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </h3>
                  
                  <p className="text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
