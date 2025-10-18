import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, User, Target, Star, CheckCircle2, Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ProgressIndicator from "@/components/ProgressIndicator";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const plan = searchParams.get("plan") || "Premium Plan";
  
  const onboardingSteps = [
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
      icon: <User className="w-5 h-5" />
    },
    {
      id: "browse",
      title: "Browse Mentors",
      description: "Find your mentor",
      icon: <Search className="w-5 h-5" />
    },
    {
      id: "book",
      title: "Book Session",
      description: "Schedule your first session",
      icon: <Calendar className="w-5 h-5" />
    }
  ];
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    currentRole: "",
    experience: "",
    goals: "",
    interests: [] as string[],
    preferredMentorType: "",
    availability: "",
    bio: ""
  });

  const interestOptions = [
    "Career Development", "Technical Skills", "Leadership", "Entrepreneurship",
    "Product Management", "Data Science", "Software Engineering", "Design",
    "Marketing", "Sales", "Finance", "Operations", "Strategy", "Communication"
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update user profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          email: user.email || '',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "🎉 Profile Setup Complete!",
        description: "Your profile has been saved. Let's find you the perfect mentor!",
      });

      // Redirect to mentor browsing with plan info
      setTimeout(() => {
        navigate(`/browse-mentors?plan=${encodeURIComponent(plan)}&new_user=true`);
      }, 1500);

    } catch (error: unknown) {
      console.error("Profile setup error:", error);
      toast({
        title: "Setup Error",
        description: error instanceof Error ? error.message : "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ProgressIndicator steps={onboardingSteps} currentStep="profile" className="max-w-2xl mx-auto" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">Help us personalize your mentorship experience</p>
          <Badge variant="secondary" className="mt-2">{plan}</Badge>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Tell Us About Yourself
            </CardTitle>
            <CardDescription>
              This information helps us match you with the most suitable mentors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentRole">Current Role/Position *</Label>
                  <Input
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                    placeholder="e.g., Software Engineer, Student, Manager"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level *</Label>
                  <Select value={formData.experience} onValueChange={(value) => setFormData(prev => ({ ...prev, experience: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="experienced">Experienced (5-10 years)</SelectItem>
                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      <SelectItem value="student">Student/Fresh Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label htmlFor="goals" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  What are your main goals? *
                </Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder="e.g., Career transition, skill development, leadership growth, startup guidance..."
                  rows={3}
                  required
                />
              </div>

              {/* Interests */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Areas of Interest (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                      />
                      <Label htmlFor={interest} className="text-sm font-normal cursor-pointer">
                        {interest}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredMentorType">Preferred Mentor Type</Label>
                  <Select value={formData.preferredMentorType} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredMentorType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mentor preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industry-expert">Industry Expert</SelectItem>
                      <SelectItem value="startup-founder">Startup Founder</SelectItem>
                      <SelectItem value="corporate-leader">Corporate Leader</SelectItem>
                      <SelectItem value="technical-specialist">Technical Specialist</SelectItem>
                      <SelectItem value="career-coach">Career Coach</SelectItem>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Preferred Meeting Time</Label>
                  <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekday-morning">Weekday Morning</SelectItem>
                      <SelectItem value="weekday-afternoon">Weekday Afternoon</SelectItem>
                      <SelectItem value="weekday-evening">Weekday Evening</SelectItem>
                      <SelectItem value="weekend">Weekend</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Brief Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us a bit about yourself, your background, and what you're looking for in a mentor..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={loading || !formData.fullName || !formData.currentRole || !formData.experience || !formData.goals}
                  className="w-full md:w-auto px-8"
                >
                  {loading ? "Saving Profile..." : "Complete Setup & Browse Mentors"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;