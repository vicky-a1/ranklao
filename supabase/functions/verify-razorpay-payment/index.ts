import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface VerifyRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id: string;
  mentor_id?: string;
  session_id?: string;
  amount?: number; // optional, for redundancy
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VerifyRequest = await req.json();

    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || Deno.env.get("VITE_RAZORPAY_KEY_SECRET") || "EnPwypv5uiwNCOjr3hKIbPLF";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const expectedSignature = await crypto.subtle.sign(
      { name: "HMAC" },
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(keySecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    );

    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = expectedHex === body.razorpay_signature;

    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: "Invalid signature" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mark payment as completed for the user/session
    const { error: payError } = await supabase
      .from("payments")
      .update({ payment_status: "completed", payment_method: "razorpay", transaction_id: body.razorpay_payment_id })
      .eq("user_id", body.user_id)
      .eq("session_id", body.session_id ?? null)
      .eq("payment_status", "pending");

    if (payError) {
      console.error("Payment update error:", payError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("verify-razorpay-payment error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);