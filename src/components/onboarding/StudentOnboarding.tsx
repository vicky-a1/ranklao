import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { dbWithFallback } from "@/utils/databaseFallback";

const studentSchema = z.object({
  target_exam: z.enum(["JEE", "NEET", "CA"]),
  target_year: z.number().min(2024).max(2030),
  current_level: z.enum(["beginner", "intermediate", "advanced"]),
  study_hours_per_day: z.number().min(1).max(16).optional(),
  target_rank: z.number().min(1).optional(),
});

const StudentOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    target_exam: "",
    target_year: new Date().getFullYear() + 1,
    current_level: "",
    study_hours_per_day: 6,
    target_rank: 1000,
  });

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Validate form data
      studentSchema.parse({
        target_exam: formData.target_exam,
        target_year: formData.target_year,
        current_level: formData.current_level,
        study_hours_per_day: formData.study_hours_per_day,
        target_rank: formData.target_rank,
      });

      // Create student profile using fallback system
      await dbWithFallback.createStudentProfile(user.id, {
        target_exam: formData.target_exam,
        target_year: formData.target_year,
        current_level: formData.current_level,
        study_hours_per_day: formData.study_hours_per_day,
        target_rank: formData.target_rank,
      });

      // Update onboarding progress using fallback system
      await dbWithFallback.updateOnboardingProgress(user.id, { is_completed: true });

      toast({
        title: "Profile Created!",
        description: "Welcome to Ranklao. Complete payment to access mentors!",
      });

      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/images/logo.png"
              alt="Ranklao logo"
              className="w-10 h-10 rounded-lg object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Ranklao
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Student Onboarding</h1>
          <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card className="shadow-premium border-border/50">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Select Your Target Exam"}
              {currentStep === 2 && "Set Your Goals"}
              {currentStep === 3 && "Your Current Level"}
              {currentStep === 4 && "Study Commitment"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Choose the exam you're preparing for"}
              {currentStep === 2 && "Tell us your target year and rank"}
              {currentStep === 3 && "Help us understand where you are"}
              {currentStep === 4 && "Set your daily study hours"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <Label>Target Exam</Label>
                <div className="grid grid-cols-3 gap-4">
                  {["JEE", "NEET", "CA"].map((exam) => (
                    <Card
                      key={exam}
                      className={`cursor-pointer hover:shadow-lg transition-all ${
                        formData.target_exam === exam
                          ? "border-primary shadow-glow"
                          : "border-border/50"
                      }`}
                      onClick={() => setFormData({ ...formData, target_exam: exam })}
                    >
                      <CardContent className="p-6 text-center">
                        <p className="text-2xl font-bold">{exam}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_year">Target Year</Label>
                  <Select
                    value={formData.target_year.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, target_year: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_rank">Target Rank</Label>
                  <Input
                    id="target_rank"
                    type="number"
                    value={formData.target_rank}
                    onChange={(e) =>
                      setFormData({ ...formData, target_rank: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Label>Current Preparation Level</Label>
                <div className="grid gap-4">
                  {[
                    {
                      value: "beginner",
                      label: "Beginner",
                      description: "Just starting my preparation",
                    },
                    {
                      value: "intermediate",
                      label: "Intermediate",
                      description: "Been preparing for a few months",
                    },
                    {
                      value: "advanced",
                      label: "Advanced",
                      description: "Well into my preparation",
                    },
                  ].map((level) => (
                    <Card
                      key={level.value}
                      className={`cursor-pointer hover:shadow-lg transition-all ${
                        formData.current_level === level.value
                          ? "border-primary shadow-glow"
                          : "border-border/50"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, current_level: level.value })
                      }
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="study_hours">Daily Study Hours</Label>
                  <Input
                    id="study_hours"
                    type="number"
                    min="1"
                    max="16"
                    value={formData.study_hours_per_day}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        study_hours_per_day: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    How many hours can you dedicate to studying each day?
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="ml-auto"
                  disabled={
                    (currentStep === 1 && !formData.target_exam) ||
                    (currentStep === 3 && !formData.current_level)
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="ml-auto"
                  disabled={loading}
                >
                  {loading ? "Completing..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentOnboarding;
