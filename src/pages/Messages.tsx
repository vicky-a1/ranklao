import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Video, 
  Phone, 
  MoreVertical,
  Loader2,
  Clock,
  Check,
  CheckCheck,
  MessageCircle
} from "lucide-react";

interface SessionData {
  id: string;
}

interface PaymentData {
  session_id: string | null;
  payment_status: string;
}

interface Message {
  id: string;
  mentor_id: string;
  student_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read?: boolean;
  message_type?: 'text' | 'image' | 'file';
}

interface MentorProfile {
  full_name: string;
  avatar_url?: string;
  specialization?: string;
}

export default function Messages() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    checkAccessAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, mentorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAccessAndLoad = async () => {
    if (!mentorId) return;
    try {
      // Fetch sessions between this student and mentor
      const { data: sessions, error: sessionsError } = await supabase
        .from("sessions")
        .select("id")
        .eq("student_id", user!.id)
        .eq("mentor_id", mentorId);

      if (sessionsError) throw sessionsError;
      const sessionIds = (sessions || []).map((s: SessionData) => s.id);

      if (sessionIds.length === 0) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      // Fetch payments for the user and see if any reference these sessions
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("session_id, payment_status")
        .eq("user_id", user!.id)
        .eq("payment_status", "completed");

      if (paymentsError) throw paymentsError;
      const paidSessionIds = new Set((payments || []).map((p: PaymentData) => p.session_id).filter(Boolean));

      const hasAccess = sessionIds.some((id: string) => paidSessionIds.has(id));
      setAllowed(hasAccess);

      if (hasAccess) {
        await loadMessages();
        await loadMentorProfile();
      }
    } catch (err: unknown) {
      console.error("Access check error:", err);
      toast({ title: "Error", description: "Failed to verify access.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!mentorId) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("mentor_id", mentorId)
        .eq("student_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data || []) as unknown as Message[]);
    } catch (err) {
      console.error("Load messages error:", err);
      toast({ title: "Error", description: "Could not load messages.", variant: "destructive" });
    }
  };

  const loadMentorProfile = async () => {
    if (!mentorId) return;
    try {
      // Get mentor profile data
      const { data: mentorData, error: mentorError } = await supabase
        .from("mentor_profiles")
        .select("specialization")
        .eq("user_id", mentorId)
        .single();

      if (mentorError) throw mentorError;

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", mentorId)
        .single();

      if (profileError) throw profileError;

      setMentorProfile({
        full_name: profileData?.full_name || "Unknown Mentor",
        avatar_url: profileData?.avatar_url || undefined,
        specialization: mentorData?.specialization || undefined
      });
    } catch (err) {
      console.error("Load mentor profile error:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !mentorId) return;
    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        mentor_id: mentorId,
        student_id: user.id,
        sender_id: user.id,
        content: newMessage.trim()
      });
      if (error) throw error;
      setNewMessage("");
      await loadMessages();
    } catch (err) {
      console.error("Send message error:", err);
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <BackButton className="mb-4" aria-label="Go back from Messages" />
          Loading...
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <BackButton className="mb-4" aria-label="Go back from Messages" />
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Messaging Locked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To message this mentor, please book and complete payment for a session.
              </p>
              <Button onClick={() => navigate(`/book-session/${mentorId}`)}>Book a Session</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <BackButton className="mb-4" aria-label="Go back from Messages" />
        
        <Card className="max-w-4xl mx-auto shadow-premium border-border/50">
          {/* Chat Header */}
          <CardHeader className="border-b bg-card/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={mentorProfile?.avatar_url} />
                  <AvatarFallback>
                    {mentorProfile?.full_name?.charAt(0).toUpperCase() || "M"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {mentorProfile?.full_name || "Mentor"}
                  </CardTitle>
                  {mentorProfile?.specialization && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {mentorProfile.specialization}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <MessageCircle className="w-16 h-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
                  <p className="text-muted-foreground">
                    Send your first message to {mentorProfile?.full_name || "your mentor"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {!isOwn && (
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={mentorProfile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {mentorProfile?.full_name?.charAt(0).toUpperCase() || "M"}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {new Date(message.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              {isOwn && (
                                <div className="ml-1">
                                  {message.read ? (
                                    <CheckCheck className="w-3 h-3 opacity-70" />
                                  ) : (
                                    <Check className="w-3 h-3 opacity-70" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <Separator />
            <div className="p-4 bg-card/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                    className="pr-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                  className="px-4"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}