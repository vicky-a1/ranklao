import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

interface CreateOrderRequest {
  amount: number; // in INR rupees
  currency?: string; // default INR
  receipt?: string;
  notes?: Record<string, string>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = "INR", receipt = `rcpt_${Date.now()}`, notes = {} }: CreateOrderRequest = await req.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Amount must be a positive number" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID") || Deno.env.get("VITE_RAZORPAY_KEY_ID") || "rzp_live_RUO0Va7zNQ4fLc";
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || Deno.env.get("VITE_RAZORPAY_KEY_SECRET") || "EnPwypv5uiwNCOjr3hKIbPLF";

    console.log("Using Razorpay Key ID:", keyId.substring(0, 8) + "...");
    
    if (!keyId || !keySecret) {
      console.error("Missing Razorpay credentials");
      return new Response(JSON.stringify({ error: "Payment service configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authString = btoa(`${keyId}:${keySecret}`);

    // Razorpay expects amount in smallest unit (paise)
    const paiseAmount = Math.round(amount * 100);

    const body = {
      amount: paiseAmount,
      currency,
      receipt,
      notes,
    };

    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error("Razorpay API Error:", {
        status: resp.status,
        statusText: resp.statusText,
        response: data,
        requestBody: body
      });
      return new Response(JSON.stringify({ 
        error: data?.error?.description || `Razorpay API error: ${resp.status} ${resp.statusText}`,
        details: data?.error || "Unknown error"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, order: data, key_id: keyId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("create-razorpay-order error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);