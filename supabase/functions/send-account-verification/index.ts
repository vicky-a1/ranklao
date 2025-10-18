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

interface VerificationRequest {
  email: string;
  fullName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: VerificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MentorConnect <verify@resend.dev>",
      to: [email],
      subject: "Verify your MentorConnect account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome${fullName ? ", " + fullName : ""}!</h1>
          <p>Thanks for signing up. Please verify your email to secure your account.</p>
          <div style="background: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 8px;">
            <p><strong>Note:</strong> If you received a separate verification email, use that link. Otherwise, log in and follow the in-app prompt to verify your email.</p>
          </div>
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
    console.error("Error in send-account-verification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);