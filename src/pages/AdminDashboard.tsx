import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface MentorProfile {
  id: string;
  user_id: string;
  air_rank: number;
  exam_type: string;
  exam_year: number;
  current_institution: string;
  specialization: string | null;
  bio: string | null;
  hourly_rate: number | null;
  verification_status: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingMentors, setPendingMentors] = useState<MentorProfile[]>([]);
  const [approvedMentors, setApprovedMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  // Default admin credentials
  const adminEmail = "admin@vikas";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (user.email !== adminEmail) {
      toast({
        title: "Unauthorized",
        description: "You do not have access to the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchMentors();
  }, [user]);

  const fetchMentors = async () => {
    try {
      // Fetch pending mentors
      const { data: pendingData, error: pendingError } = await supabase
        .from("mentor_profiles")
        .select("*, profiles!mentor_profiles_user_id_fkey(full_name, email)")
        .eq("verification_status", "pending")
        .order("created_at", { ascending: false });

      if (pendingError) throw pendingError;
      setPendingMentors((pendingData || []) as any);

      // Fetch approved mentors
      const { data: approvedData, error: approvedError } = await supabase
        .from("mentor_profiles")
        .select("*, profiles!mentor_profiles_user_id_fkey(full_name, email)")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });

      if (approvedError) throw approvedError;
      setApprovedMentors((approvedData || []) as any);
    } catch (err) {
      console.error("Error loading mentors:", err);
      toast({ title: "Error", description: "Failed to load mentors", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (mentor: MentorProfile) => {
    try {
      const { error } = await supabase
        .from("mentor_profiles")
        .update({ verification_status: "verified" })
        .eq("id", mentor.id);

      if (error) throw error;

      try {
        await supabase.functions.invoke("notify-mentor-approval", {
          body: {
            mentorEmail: mentor.profiles?.email || "",
            mentorName: mentor.profiles?.full_name || "Mentor",
          },
        });
      } catch (emailErr) {
        console.error("Approval email error:", emailErr);
      }

      toast({ title: "Mentor Approved", description: `${mentor.profiles?.full_name || "Mentor"} is now verified.` });
      
      // Move mentor from pending to approved
      setPendingMentors((prev) => prev.filter((m) => m.id !== mentor.id));
      setApprovedMentors((prev) => [...prev, { ...mentor, verification_status: "verified" }]);
    } catch (err) {
      console.error("Error approving mentor:", err);
      toast({ title: "Error", description: "Failed to approve mentor", variant: "destructive" });
    }
  };

  const rejectMentor = async (mentor: MentorProfile) => {
    try {
      const { error } = await supabase
        .from("mentor_profiles")
        .update({ verification_status: "rejected" })
        .eq("id", mentor.id);

      if (error) throw error;

      toast({ title: "Mentor Rejected", description: `${mentor.profiles?.full_name || "Mentor"} has been rejected.` });
      setPendingMentors((prev) => prev.filter((m) => m.id !== mentor.id));
    } catch (err) {
      console.error("Error rejecting mentor:", err);
      toast({ title: "Error", description: "Failed to reject mentor", variant: "destructive" });
    }
  };

  const removeMentor = async (mentor: MentorProfile) => {
    try {
      const { error } = await supabase
        .from("mentor_profiles")
        .update({ verification_status: "rejected" })
        .eq("id", mentor.id);

      if (error) throw error;

      toast({ title: "Mentor Removed", description: `${mentor.profiles?.full_name || "Mentor"} has been removed from the platform.` });
      setApprovedMentors((prev) => prev.filter((m) => m.id !== mentor.id));
    } catch (err) {
      console.error("Error removing mentor:", err);
      toast({ title: "Error", description: "Failed to remove mentor", variant: "destructive" });
    }
  };

  const renderMentorCard = (mentor: MentorProfile, isPending: boolean = true) => (
    <Card key={mentor.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {mentor.profiles?.full_name || "Mentor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Badge variant="secondary">{mentor.exam_type} {mentor.exam_year}</Badge>
          <div className="text-sm">AIR {mentor.air_rank}</div>
          <div className="text-sm">{mentor.current_institution}</div>
          {mentor.specialization && (
            <div className="text-sm text-muted-foreground">Specialization: {mentor.specialization}</div>
          )}
          {mentor.hourly_rate && (
            <div className="text-sm text-muted-foreground">Rate: ₹{mentor.hourly_rate}/hour</div>
          )}
          {mentor.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
          )}
          <div className="flex gap-2 pt-4">
            {isPending ? (
              <>
                <Button onClick={() => approveMentor(mentor)}>Approve</Button>
                <Button variant="destructive" onClick={() => rejectMentor(mentor)}>Reject</Button>
              </>
            ) : (
              <Button variant="destructive" onClick={() => removeMentor(mentor)}>Remove</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading mentors...</div>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">
                    Pending Approvals ({pendingMentors.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved Mentors ({approvedMentors.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                  {pendingMentors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending mentor approvals.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingMentors.map((mentor) => renderMentorCard(mentor, true))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="mt-6">
                  {approvedMentors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved mentors yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {approvedMentors.map((mentor) => renderMentorCard(mentor, false))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}