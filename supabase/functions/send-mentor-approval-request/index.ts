import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mentorName, mentorEmail, mentorDetails } = await req.json();

    if (!mentorName || !mentorEmail || !mentorDetails) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: mentorName, mentorEmail, mentorDetails" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resendApiKey = "re_819f2kYR_A59x2au8MzyybBDBuXQLgag3";
    const adminEmail = "admin@vikas";

    // Create admin dashboard link
    const adminDashboardLink = `${req.headers.get("origin") || "https://ranklao.com"}/admin`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Mentor Approval Request - Ranklao</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6d28d9, #8b5cf6); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .mentor-details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #6d28d9; }
            .button { display: inline-block; background: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 New Mentor Approval Request</h1>
              <p>A new mentor has registered and is awaiting your approval</p>
            </div>
            <div class="content">
              <h2>Mentor Information</h2>
              <div class="mentor-details">
                <p><strong>Name:</strong> ${mentorName}</p>
                <p><strong>Email:</strong> ${mentorEmail}</p>
                <p><strong>AIR Rank:</strong> ${mentorDetails.air_rank}</p>
                <p><strong>Exam Type:</strong> ${mentorDetails.exam_type}</p>
                <p><strong>Exam Year:</strong> ${mentorDetails.exam_year}</p>
                <p><strong>Institution:</strong> ${mentorDetails.current_institution}</p>
                <p><strong>Specialization:</strong> ${mentorDetails.specialization || 'Not specified'}</p>
                <p><strong>Hourly Rate:</strong> ₹${mentorDetails.hourly_rate || 'Not specified'}</p>
                ${mentorDetails.bio ? `<p><strong>Bio:</strong> ${mentorDetails.bio}</p>` : ''}
              </div>
              
              <p>Please review this mentor's credentials and approve or reject their application.</p>
              
              <a href="${adminDashboardLink}" class="button">
                Review in Admin Dashboard
              </a>
              
              <div class="footer">
                <p>This email was sent from Ranklao's mentor approval system.</p>
                <p>Admin Dashboard: <a href="${adminDashboardLink}">${adminDashboardLink}</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailData = {
      from: "Ranklao <noreply@ranklao.com>",
      to: [adminEmail],
      subject: `New Mentor Approval Request - ${mentorName}`,
      html: emailHtml,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Mentor approval request email sent successfully",
        emailId: result.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("send-mentor-approval-request error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send mentor approval request email" 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);