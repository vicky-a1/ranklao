import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import RoleSelection from "@/components/onboarding/RoleSelection";
import StudentOnboarding from "@/components/onboarding/StudentOnboarding";
import MentorOnboarding from "@/components/onboarding/MentorOnboarding";
import { Loader2 } from "lucide-react";
import { dbWithFallback } from "@/utils/databaseFallback";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"student" | "mentor" | null>(null);


  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, navigate]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const progress = await dbWithFallback.getOnboardingProgress(user.id);
      
      if (progress?.is_completed) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role: "student" | "mentor") => {
    if (!user) return;

    setSelectedRole(role);
    setLoading(true);

    try {
      // Set user role using fallback system
      await dbWithFallback.setUserRole(user.id, role);

      // Update onboarding progress using fallback system
      await dbWithFallback.updateOnboardingProgress(user.id, {
        role_selected: role,
        is_completed: false,
      });

      toast({
        title: "Role selected successfully",
        description: `You've selected to join as a ${role}`,
      });
    } catch (error) {
      console.error("Error setting role:", error);
      toast({
        title: "Error",
        description: "Failed to set role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedRole) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  return (
    <>
      {selectedRole === "student" ? (
        <StudentOnboarding />
      ) : (
        <MentorOnboarding />
      )}
    </>
  );
};

export default Onboarding;
