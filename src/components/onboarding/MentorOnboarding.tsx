import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { dbWithFallback } from "@/utils/databaseFallback";

const mentorSchema = z.object({
  air_rank: z.number().min(1).max(100000),
  exam_year: z.number().min(2010).max(2025),
  exam_type: z.enum(["JEE", "NEET", "CA"]),
  current_institution: z.string().min(2),
  specialization: z.string().optional(),
  bio: z.string().min(50).max(500),
  hourly_rate: z.number().min(0).optional(),
});

const MentorOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    air_rank: "",
    exam_year: new Date().getFullYear(),
    exam_type: "",
    current_institution: "",
    current_course: "",
    specialization: "",
    bio: "",
    hourly_rate: 200,
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

      // Convert and validate form data
      const airRank = parseInt(formData.air_rank);
      if (isNaN(airRank)) {
        throw new Error("Please enter a valid AIR rank");
      }

      // Validate form data
      mentorSchema.parse({
        air_rank: airRank,
        exam_year: formData.exam_year,
        exam_type: formData.exam_type,
        current_institution: formData.current_institution,
        specialization: formData.specialization || undefined,
        bio: formData.bio,
        hourly_rate: formData.hourly_rate,
      });

      // Create mentor profile using fallback system
      await dbWithFallback.createMentorProfile(user.id, {
        air_rank: airRank,
        exam_year: formData.exam_year,
        exam_type: formData.exam_type,
        current_institution: formData.current_institution,
        current_course: formData.current_course || null,
        specialization: formData.specialization || null,
        bio: formData.bio,
        hourly_rate: formData.hourly_rate,
      });

      // Send approval request email to admin
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("user_id", user.id)
          .maybeSingle();

        await supabase.functions.invoke("send-mentor-approval-request", {
          body: {
            mentorName: profileData?.full_name || "New Mentor",
            mentorEmail: profileData?.email || user.email || "",
            mentorDetails: {
              air_rank: airRank,
              exam_type: formData.exam_type,
              exam_year: formData.exam_year,
              current_institution: formData.current_institution,
              specialization: formData.specialization || null,
              bio: formData.bio,
              hourly_rate: formData.hourly_rate,
            },
          },
        });
      } catch (emailError) {
        console.error("Approval email error:", emailError);
        // Don't block registration if email fails
      }

      // Update onboarding progress using fallback system
      await dbWithFallback.updateOnboardingProgress(user.id, { is_completed: true });

      toast({
        title: "Profile Submitted!",
        description: "Your profile is under review. We'll notify you once verified via email.",
      });

      navigate("/dashboard/mentor");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 via-background to-primary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/images/logo.png" 
              alt="Ranklao Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
              Ranklao
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Mentor Onboarding</h1>
          <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
        </div>

        <Progress value={progress} className="mb-6" />

        <Card className="shadow-premium border-border/50">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "AIR & Exam Details"}
              {currentStep === 2 && "Current Institution"}
              {currentStep === 3 && "Specialization"}
              {currentStep === 4 && "Tell Your Story"}
              {currentStep === 5 && "Pricing"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Verify your achievement"}
              {currentStep === 2 && "Where are you studying now?"}
              {currentStep === 3 && "What subjects do you excel in?"}
              {currentStep === 4 && "Share your journey with students"}
              {currentStep === 5 && "Set your hourly rate"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exam Type</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {["JEE", "NEET", "CA"].map((exam) => (
                      <Card
                        key={exam}
                        className={`cursor-pointer hover:shadow-lg transition-all ${
                          formData.exam_type === exam
                            ? "border-secondary shadow-glow"
                            : "border-border/50"
                        }`}
                        onClick={() => setFormData({ ...formData, exam_type: exam })}
                      >
                        <CardContent className="p-6 text-center">
                          <p className="text-2xl font-bold">{exam}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="air_rank">Your AIR (All India Rank)</Label>
                  <Input
                    id="air_rank"
                    type="number"
                    placeholder="e.g., 147"
                    value={formData.air_rank}
                    onChange={(e) =>
                      setFormData({ ...formData, air_rank: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam_year">Exam Year</Label>
                  <Select
                    value={formData.exam_year.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, exam_year: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 16 }, (_, i) => 2025 - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_institution">Current Institution</Label>
                  <Input
                    id="current_institution"
                    placeholder="e.g., IIT Bombay"
                    value={formData.current_institution}
                    onChange={(e) =>
                      setFormData({ ...formData, current_institution: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_course">Current Course (Optional)</Label>
                  <Input
                    id="current_course"
                    placeholder="e.g., B.Tech Computer Science"
                    value={formData.current_course}
                    onChange={(e) =>
                      setFormData({ ...formData, current_course: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">
                    Specialization (Optional)
                  </Label>
                  <Input
                    id="specialization"
                    placeholder="e.g., Physics, Mathematics"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    What subjects or topics do you specialize in?
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Your Story</Label>
                  <Textarea
                    id="bio"
                    placeholder="Share your journey, preparation strategy, and what makes you a great mentor..."
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum 50 characters, maximum 500 characters ({formData.bio.length}/500)
                  </p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    value={formData.hourly_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, hourly_rate: parseInt(e.target.value) })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Set your hourly rate for 1:1 mentorship sessions
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
                    (currentStep === 1 && (!formData.exam_type || !formData.air_rank || isNaN(parseInt(formData.air_rank)) || parseInt(formData.air_rank) < 1 || parseInt(formData.air_rank) > 100000)) ||
                    (currentStep === 2 && (!formData.current_institution || formData.current_institution.length < 2)) ||
                    (currentStep === 4 && formData.bio.length < 50)
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="ml-auto"
                  disabled={
                    loading ||
                    !formData.exam_type ||
                    !formData.air_rank ||
                    isNaN(parseInt(formData.air_rank)) ||
                    parseInt(formData.air_rank) < 1 ||
                    parseInt(formData.air_rank) > 100000 ||
                    !formData.current_institution ||
                    formData.current_institution.length < 2 ||
                    formData.bio.length < 50
                  }
                >
                  {loading ? "Submitting..." : "Submit for Verification"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MentorOnboarding;
