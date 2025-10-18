import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Stethoscope, Calculator, ArrowRight } from "lucide-react";

const exams = [
  {
    icon: GraduationCap,
    name: "JEE",
    fullName: "Joint Entrance Examination",
    color: "from-purple-500 to-purple-600",
    students: "1.2M+ aspirants",
    mentors: "50+ top rankers",
  },
  {
    icon: Stethoscope,
    name: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    color: "from-blue-500 to-blue-600",
    students: "1.8M+ aspirants",
    mentors: "40+ top rankers",
  },
  {
    icon: Calculator,
    name: "CA",
    fullName: "Chartered Accountancy",
    color: "from-orange-500 to-orange-600",
    students: "800K+ aspirants",
    mentors: "30+ qualified CAs",
  },
];

const ExamCategories = () => {
  return (
    <section id="exams" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Exam Path
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect with mentors who've excelled in your target examination
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {exams.map((exam, index) => {
            const Icon = exam.icon;
            return (
              <Card 
                key={index}
                className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-border bg-card animate-fade-in-up group cursor-pointer"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="space-y-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${exam.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-foreground mb-2">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{exam.fullName}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        {exam.students}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-2"></div>
                        {exam.mentors}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Explore {exam.name}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">More exams coming soon: GATE, CLAT, CAT & more</p>
        </div>
      </div>
    </section>
  );
};

export default ExamCategories;
