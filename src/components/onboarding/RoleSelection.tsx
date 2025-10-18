import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";

interface RoleSelectionProps {
  onSelectRole: (role: "student" | "mentor") => void;
}

const RoleSelection = ({ onSelectRole }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/images/logo.png"
              alt="Ranklao logo"
              className="w-12 h-12 rounded-lg object-contain"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranklao
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Path</h1>
          <p className="text-xl text-muted-foreground">
            Are you here to learn or to mentor?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="relative overflow-hidden hover:shadow-premium transition-all duration-300 hover:-translate-y-2 cursor-pointer border-border/50 group"
                onClick={() => onSelectRole("student")}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-8 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">I'm a Student</h2>
              <p className="text-muted-foreground mb-6">
                Connect with top rankers and get personalized mentorship to ace your exams
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Access to verified mentors
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Personalized study plans
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Mock test analysis
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  24x7 doubt solving
                </li>
              </ul>
              
              <Button className="w-full" size="lg">
                Continue as Student
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-premium transition-all duration-300 hover:-translate-y-2 cursor-pointer border-border/50 group"
                onClick={() => onSelectRole("mentor")}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardContent className="p-8 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              
              <h2 className="text-2xl font-bold mb-3">I'm a Mentor</h2>
              <p className="text-muted-foreground mb-6">
                Share your success journey and help aspirants achieve their dreams
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                  Earn while mentoring
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                  Flexible schedule
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                  Build your reputation
                </li>
                <li className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                  Make an impact
                </li>
              </ul>
              
              <Button className="w-full" size="lg" variant="default">
                Continue as Mentor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
