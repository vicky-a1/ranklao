import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(
  Deno.env.get("RESEND_API_KEY") || "re_2gBirChA_FBTudQXqDaARp3VZwTvjuV8m"
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface ApprovalRequest {
  mentorEmail: string;
  mentorName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mentorEmail, mentorName }: ApprovalRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MentorConnect <onboarding@resend.dev>",
      to: [mentorEmail],
      subject: "Your Mentor Profile Has Been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Congratulations, ${mentorName}!</h1>
          <p>Your mentor profile has been verified and is now visible to students.</p>
          <div style="background: #ecfdf5; padding: 16px; border-left: 4px solid #10b981; border-radius: 8px;">
            <p>You can now accept bookings, manage your availability, and start mentoring.</p>
          </div>
          <p style="margin-top: 24px;">Log in to your dashboard to get started.</p>
          <p style="margin-top: 24px;">— The MentorConnect Team</p>
        </div>
      `,
    });

    if (emailResponse.error) throw new Error(emailResponse.error.message);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-mentor-approval:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);