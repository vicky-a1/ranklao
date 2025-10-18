import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  MessageCircle,
  Clock,
  Calendar,
  User,
  FileText,
  Save,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  Star
} from "lucide-react";
import BackButton from "@/components/BackButton";

interface Session {
  id: string;
  session_type: string;
  duration_minutes: number;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
  mentor_id: string;
  student_id: string;
  created_at: string;
  mentor_profiles?: {
    profiles: {
      full_name: string;
      avatar_url?: string;
    };
  };
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface SessionNote {
  id: string;
  session_id: string;
  content: string;
  author_id: string;
  created_at: string;
}

interface SessionRating {
  id: string;
  session_id: string;
  rating: number;
  feedback: string;
  created_by: string;
  created_at: string;
}

export default function SessionManagement() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [rating, setRating] = useState<SessionRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [newNote, setNewNote] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");
  const [sessionStatus, setSessionStatus] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (sessionId) {
      fetchSessionData();
    }
  }, [user, sessionId, navigate]);

  const fetchSessionData = async () => {
    if (!sessionId || !user) return;

    try {
      // Fetch session details
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select(`
          *,
          mentor_profiles!sessions_mentor_id_fkey (
            profiles!mentor_profiles_user_id_fkey (
              full_name,
              avatar_url
            )
          ),
          profiles!sessions_student_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Check if user has access to this session
      const hasAccess = sessionData.mentor_id === user.id || sessionData.student_id === user.id;
      if (!hasAccess) {
        toast({ title: "Access Denied", description: "You don't have access to this session.", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setSession(sessionData as unknown as Session);
      setSessionStatus(sessionData.status);

      // Fetch session notes
      const { data: notesData, error: notesError } = await (supabase as any)
        .from("session_notes")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (notesError) throw notesError;
      setNotes(notesData || []);

      // Fetch session rating (if exists)
      const { data: ratingData, error: ratingError } = await (supabase as any)
        .from("session_ratings")
        .select("*")
        .eq("session_id", sessionId)
        .eq("created_by", user.id)
        .single();

      if (!ratingError && ratingData) {
        setRating(ratingData);
        setUserRating(ratingData.rating);
        setUserFeedback(ratingData.feedback);
      }

    } catch (error) {
      console.error("Error fetching session data:", error);
      toast({ title: "Error", description: "Failed to load session data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !sessionId || !user) return;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("session_notes")
        .insert({
          session_id: sessionId,
          content: newNote.trim(),
          author_id: user.id
        });

      if (error) throw error;

      setNewNote("");
      await fetchSessionData();
      toast({ title: "Success", description: "Note added successfully." });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateSessionStatus = async (newStatus: string) => {
    if (!sessionId || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      setSessionStatus(newStatus);
      toast({ title: "Success", description: "Session status updated." });
    } catch (error) {
      console.error("Error updating session status:", error);
      toast({ title: "Error", description: "Failed to update session status.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const submitRating = async () => {
    if (!sessionId || !user || userRating === 0) return;

    setSaving(true);
    try {
      if (rating) {
        // Update existing rating
        const { error } = await (supabase as any)
          .from("session_ratings")
          .update({
            rating: userRating,
            feedback: userFeedback
          })
          .eq("id", rating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await (supabase as any)
          .from("session_ratings")
          .insert({
            session_id: sessionId,
            rating: userRating,
            feedback: userFeedback,
            created_by: user.id
          });

        if (error) throw error;
      }

      await fetchSessionData();
      toast({ title: "Success", description: "Rating submitted successfully." });
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({ title: "Error", description: "Failed to submit rating.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "in_progress": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
            <p className="text-muted-foreground mb-4">The session you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isStudent = user?.id === session.student_id;
  const isMentor = user?.id === session.mentor_id;
  const otherParticipant = isStudent ? session.mentor_profiles?.profiles : session.profiles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="relative z-10 border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <BackButton className="mb-4" />
          <h1 className="text-2xl font-bold">Session Management</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Session Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info Card */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Session Details
                  </CardTitle>
                  <Badge className={`${getStatusColor(sessionStatus)} text-white`}>
                    {sessionStatus.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={otherParticipant?.avatar_url} />
                      <AvatarFallback>
                        {otherParticipant?.full_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{otherParticipant?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isStudent ? "Mentor" : "Student"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(session.scheduled_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Session Actions */}
                <div className="flex flex-wrap gap-3">
                  {session.meeting_link && sessionStatus === "scheduled" && (
                    <Button
                      onClick={() => window.open(session.meeting_link!, "_blank")}
                      className="flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/messages/${isStudent ? session.mentor_id : session.student_id}`)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>

                  {isMentor && (
                    <div className="flex gap-2">
                      {sessionStatus === "scheduled" && (
                        <Button
                          variant="outline"
                          onClick={() => updateSessionStatus("in_progress")}
                          disabled={saving}
                        >
                          Start Session
                        </Button>
                      )}
                      {sessionStatus === "in_progress" && (
                        <Button
                          onClick={() => updateSessionStatus("completed")}
                          disabled={saving}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Session
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Notes */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Session Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] mb-4">
                  {notes.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No notes yet. Add the first note below.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div key={note.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Add Note Form */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a note about this session..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={addNote}
                    disabled={!newNote.trim() || saving}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating & Feedback */}
          <div className="space-y-6">
            {sessionStatus === "completed" && (
              <Card className="shadow-premium border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Rate This Session
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= userRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Share your experience..."
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={submitRating}
                    disabled={userRating === 0 || saving}
                    className="w-full"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Star className="w-4 h-4 mr-2" />
                    )}
                    {rating ? "Update Rating" : "Submit Rating"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/dashboard")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Sessions
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/browse-mentors")}
                >
                  <User className="w-4 h-4 mr-2" />
                  {isStudent ? "Find More Mentors" : "View Students"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/messages/${isStudent ? session.mentor_id : session.student_id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Continue Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}