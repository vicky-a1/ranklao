import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

// Initialize Resend with provided API key
const resend = new Resend(
  Deno.env.get("RESEND_API_KEY") || "re_2gBirChA_FBTudQXqDaARp3VZwTvjuV8m"
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface MentorRegistrationRequest {
  mentorEmail: string;
  mentorName: string;
  examType: string;
  airRank: number;
  institution: string;
  specialization: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mentorEmail, mentorName, examType, airRank, institution, specialization }: MentorRegistrationRequest = await req.json();

    console.log("Sending mentor registration confirmation for:", mentorEmail);

    // Send confirmation to mentor
    const mentorEmailResponse = await resend.emails.send({
      from: "MentorConnect <onboarding@resend.dev>",
      to: [mentorEmail],
      subject: "Registration Received - Under Review",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to MentorConnect!</h1>
          <p>Dear ${mentorName},</p>
          
          <p>Thank you for registering as a mentor on MentorConnect. We've received your application and it's currently under review.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="margin-top: 0; color: #1e40af;">What's Next?</h2>
            <p>Our team will verify your credentials and approve your profile within 24-48 hours. Once approved, you'll receive a confirmation email and your profile will be visible to students.</p>
          </div>
          
          <p>In the meantime, you can:</p>
          <ul>
            <li>Complete your profile details</li>
            <li>Set up your availability schedule</li>
            <li>Prepare your bio and introduction</li>
          </ul>
          
          <p>If you have any questions, feel free to reach out to us.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>The MentorConnect Team</p>
        </div>
      `,
    });

    console.log("Mentor email sent:", mentorEmailResponse);

    if (mentorEmailResponse.error) {
      throw new Error(mentorEmailResponse.error.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        mentorEmailId: mentorEmailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-mentor-registration function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
