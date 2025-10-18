import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Award, Clock, Video, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

import { PaymentConfirmation } from "@/components/ui/payment-confirmation";
import { PaymentModal } from "@/components/ui/payment-modal";
import { createRazorpayOrder, initializeRazorpayCheckout, verifyRazorpayPayment } from "@/lib/razorpay";

interface SessionType {
  type: string;
  duration: number;
  price: number;
  features: string[];
}

const sessionTypes: SessionType[] = [
  {
    type: "trial",
    duration: 5,
    price: 0,
    features: ["First session free", "5 minute intro call", "Get to know your mentor"],
  },
  {
    type: "single",
    duration: 30,
    price: 139,
    features: ["30 minute session", "Personalized guidance", "Session recording"],
  },
  {
    type: "monthly",
    duration: 30,
    price: 3499,
    features: ["8 sessions per month", "Weekly check-ins", "Priority support", "Study materials"],
  },
  {
    type: "premium",
    duration: 60,
    price: 9999,
    features: ["24x7 support", "Unlimited sessions", "Custom study plan", "Mock tests"],
  },
];

export default function BookSession() {
  const { mentorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  interface MentorProfile {
    user_id: string;
    air_rank: number;
    exam_type: string;
    exam_year: number;
    current_institution: string;
    verification_status: string;
    profiles: {
      full_name: string;
      avatar_url: string | null;
    } | null;
  }
  
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>("trial");
  const [trialUsed, setTrialUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      setRazorpayReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => console.error("Failed to load Razorpay script");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchMentorAndTrialStatus();
  }, [user, mentorId]);

  const fetchMentorAndTrialStatus = async () => {
    try {
      if (!mentorId) {
        throw new Error("Mentor ID is required");
      }
      
      // Fetch mentor details using cached query
      const result = await import('@/utils/cachedQueries')
        .then(module => module.cachedQueries.getMentorProfile(mentorId));

      if (result.error) {
        throw new Error(`Failed to fetch mentor: ${result.error.message}`);
      }
      
      if (!result.data) {
        throw new Error("Mentor not found or not verified");
      }
      
      setMentor(result.data);

      // Check trial status
      if (user?.id) {
        const { data: trialData, error: trialError } = await supabase
          .from("student_trial_status")
          .select("has_used_trial")
          .eq("student_id", user.id)
          .single();

        if (trialError) {
          console.error("Trial status check error:", trialError);
          // Continue without failing - this is non-critical
        }

        if (trialData?.has_used_trial) {
          setTrialUsed(true);
          setSelectedType("single");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load mentor details.",
        variant: "destructive",
      });
      navigate("/browse-mentors"); // Redirect on critical error
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = () => {
    if (!selectedDate) {
      toast({
        title: "Missing Information",
        description: "Please select a date for your session.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    if (!mentorId) {
      toast({
        title: "Error",
        description: "Mentor information is missing.",
        variant: "destructive",
      });
      return;
    }

    // Show pre-payment confirmation screen
    setShowConfirmation(true);
  };

  const handlePaymentConfirm = () => {
    setShowConfirmation(false);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method: string) => {
    setShowPaymentModal(false);
    setBooking(true);
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (!mentorId) {
        throw new Error("Mentor ID not found");
      }
      
      if (!selectedDate) {
        throw new Error("Please select a date for the session");
      }
      
      const sessionType = sessionTypes.find((s) => s.type === selectedType);
      if (!sessionType) {
        throw new Error("Invalid session type selected");
      }
      
      // Create session first so we can tie payment to it
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(10, 0, 0, 0); // Default to 10 AM

      const { data: sessionData, error: sessionError } = await supabase.from("sessions").insert({
        student_id: user.id,
        mentor_id: mentorId,
        session_type: selectedType,
        duration_minutes: sessionType.duration,
        scheduled_at: scheduledAt.toISOString(),
        meeting_link: `https://meet.ranklao.com/${Date.now()}`, // Demo link
      }).select().single();

      if (sessionError) {
        throw new Error(`Failed to create session: ${sessionError.message}`);
      }
      
      if (!sessionData) {
        throw new Error("Session creation failed - no data returned");
      }

      // If trial session, skip payment and mark as completed
      if (selectedType === "trial") {
        await supabase.from("payments").insert({
          user_id: user.id,
          session_id: sessionData?.id,
          amount: 0,
          payment_method: "free",
          payment_status: "completed",
          transaction_id: `FREE-${Date.now()}`,
        });

        await supabase.from("student_trial_status").upsert({
          student_id: user.id,
          has_used_trial: true,
          trial_used_at: new Date().toISOString(),
        });

        toast({
          title: "Trial Session Booked!",
          description: "Your free trial session is confirmed.",
        });
        navigate("/dashboard/student");
        return;
      }

      // Create a Razorpay order using our enhanced utility
      const orderResult = await createRazorpayOrder(
        sessionType.price,
        "INR",
        `rcpt_${Date.now()}`,
        { 
          user_id: user.id, 
          mentor_id: mentorId || "", 
          session_id: sessionData?.id || "",
          payment_method: method
        }
      );

      if (!orderResult.success || !orderResult.data?.order?.id) {
        throw new Error(orderResult.error || "Failed to create payment order");
      }

      // Insert pending payment referencing session
      await supabase.from("payments").insert({
        user_id: user.id,
        session_id: sessionData?.id,
        amount: sessionType.price,
        payment_method: "razorpay",
        payment_status: "pending",
        transaction_id: orderResult.data.order.id,
      });

      if (!razorpayReady) {
        throw new Error("Razorpay not loaded");
      }

      // Initialize Razorpay checkout with enhanced error handling
      const rzpOptions = {
        key: orderResult.data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResult.data.order.amount, // paise
        currency: orderResult.data.order.currency,
        name: "Ranklao",
        description: `Session with ${mentor?.profiles?.full_name || "Mentor"}`,
        order_id: orderResult.data.order.id,
        prefill: {
          name: user.user_metadata?.full_name || "Student",
          email: user.email,
        },
        notes: { 
          mentor_id: mentorId || "", 
          session_id: sessionData?.id || "",
          payment_method: method
        },
        theme: { color: "#6d28d9" },
        handler: () => {} // Will be overridden by initializeRazorpayCheckout
      };

      const rzp = initializeRazorpayCheckout(
        rzpOptions,
        async (response) => {
          try {
            // Verify payment using our enhanced utility
            if (!user) {
              throw new Error("User not authenticated");
            }
            
            const verifyResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user.id,
              mentor_id: mentorId || "",
              session_id: sessionData?.id || ""
            });

            if (!verifyResult.success) {
              throw new Error(verifyResult.error || "Payment verification failed");
            }

            // Update payment status in database
            await supabase.from("payments")
              .update({ payment_status: "completed", transaction_id: response.razorpay_payment_id })
              .eq("transaction_id", response.razorpay_order_id);

            toast({ 
              title: "Payment Successful", 
              description: "Your session is confirmed. You can now message your mentor.",
              variant: "default"
            });
            
            navigate("/messages/" + mentorId);
          } catch (err) {
            console.error("Verification failed:", err);
            toast({ 
              title: "Verification Failed", 
              description: "Please contact support with order ID: " + response.razorpay_order_id, 
              variant: "destructive" 
            });
          }
        },
        (error) => {
          console.error("Payment failed:", error);
          toast({ 
            title: "Payment Failed", 
            description: error?.description || "Please try again or use a different payment method.", 
            variant: "destructive" 
          });
        }
      );

      if (rzp) {
        rzp.open();
      } else {
        throw new Error("Failed to initialize payment");
      }

      // Success handled in handler; do not navigate here
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to book session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <BackButton className="mb-4" aria-label="Go back from Book Session" />
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {mentor?.profiles?.full_name || "Mentor"}
                  </CardTitle>
                  <CardDescription>
                    AIR {mentor?.air_rank} • {mentor?.exam_type} {mentor?.exam_year}
                  </CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {mentor?.current_institution}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Session Type</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedType} onValueChange={setSelectedType}>
                  {sessionTypes.map((session) => {
                    const isDisabled = session.type === "trial" && trialUsed;
                    return (
                      <div
                        key={session.type}
                        className={`flex items-start space-x-3 space-y-0 border rounded-lg p-4 ${
                          isDisabled ? "opacity-50" : "cursor-pointer hover:bg-accent"
                        }`}
                      >
                        <RadioGroupItem
                          value={session.type}
                          id={session.type}
                          disabled={isDisabled}
                        />
                        <Label
                          htmlFor={session.type}
                          className={`flex-1 ${!isDisabled && "cursor-pointer"}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold capitalize">{session.type}</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{session.price}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-4 h-4" />
                            {session.duration} minutes
                          </div>
                          <ul className="space-y-1">
                            {session.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          {isDisabled && (
                            <Badge variant="destructive" className="mt-2">
                              Trial Already Used
                            </Badge>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
                <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-primary" />
                    <span className="font-medium">Online Video Session</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll receive a meeting link after booking confirmation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate("/browse-mentors")}>
              Cancel
            </Button>
            <Button
              onClick={handleBookSession}
              disabled={!selectedDate || booking || (!razorpayReady && selectedType !== "trial")}
              size="lg"
            >
              {booking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </div>

        {/* Payment Confirmation Dialog */}
        {showConfirmation && (
          <PaymentConfirmation
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            onConfirm={handlePaymentConfirm}
            sessionType={sessionTypes.find((s) => s.type === selectedType) || sessionTypes[0]}
            mentorName={mentor?.profiles?.full_name || "Mentor"}
          />
        )}

        {/* Payment Method Selection Modal */}
        {showPaymentModal && (
          <PaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            onSelectMethod={handlePaymentMethodSelect}
            amount={sessionTypes.find((s) => s.type === selectedType)?.price || 0}
          />
        )}
      </div>
    </div>
  );
}
