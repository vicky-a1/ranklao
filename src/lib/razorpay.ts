import { supabase } from "@/integrations/supabase/client";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  handler: (response: any) => void;
}

interface PaymentVerificationParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id: string;
  mentor_id: string;
  session_id: string;
}

export const createRazorpayOrder = async (
  amount: number,
  currency: string = "INR",
  receipt: string,
  notes: Record<string, string>
) => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("User not authenticated. Please log in to continue.");
    }

    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: {
        amount,
        currency,
        receipt,
        notes,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};

export const verifyRazorpayPayment = async (params: PaymentVerificationParams) => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("User not authenticated. Please log in to continue.");
    }

    const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
      body: params,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Payment verification failed" 
    };
  }
};

export const initializeRazorpayCheckout = (
  options: RazorpayOptions,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  if (!(window as any).Razorpay) {
    onError(new Error("Razorpay SDK not loaded"));
    return null;
  }

  try {
    const rzp = new (window as any).Razorpay({
      ...options,
      handler: (response: any) => {
        onSuccess(response);
        if (options.handler) {
          options.handler(response);
        }
      },
    });
    
    rzp.on("payment.failed", (response: any) => {
      onError(response.error);
    });
    
    return rzp;
  } catch (error) {
    console.error("Error initializing Razorpay:", error);
    onError(error);
    return null;
  }
};

export const openRazorpayCheckout = (
  params: {
    amountInINR: number;
    planName: string;
    description: string;
    email?: string;
    phone?: string;
  },
  successCallback?: (response: any) => void,
  errorCallback?: (error: any) => void
) => {
  const { amountInINR, planName, description, email = "", phone = "" } = params;
  // Load Razorpay script if not already loaded
  if (!(window as any).Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    script.onload = () => {
      createAndOpenCheckout();
    };
    
    script.onerror = () => {
      if (errorCallback) {
        errorCallback(new Error("Failed to load Razorpay SDK"));
      } else {
        console.error("Failed to load Razorpay SDK");
      }
    };
  } else {
    createAndOpenCheckout();
  }
  
  async function createAndOpenCheckout() {
    try {
      // Create order (amount in INR, Edge Function will convert to paise)
      const orderResponse = await createRazorpayOrder(
        amountInINR, // Amount in INR, not paise
        "INR",
        `receipt_${Date.now()}`,
        { user_email: email, plan_name: planName }
      );
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.error || "Failed to create order");
      }
      
      // Initialize checkout
      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.order.amount, // Use amount from order response (already in paise)
        currency: "INR",
        name: planName,
        description: description,
        order_id: orderResponse.data.id,
        prefill: {
          name: planName,
          email: email,
          contact: phone
        },
        notes: {
          user_email: email,
          plan_name: planName
        },
        theme: {
          color: "#3B82F6"
        },
        handler: successCallback || (() => {
          console.log("Payment successful");
        })
      };
      
      const handleSuccess = (response: any) => {
        if (successCallback) {
          successCallback(response);
        } else {
          console.log("Payment successful:", response);
        }
      };
      
      const handleError = (error: any) => {
        if (errorCallback) {
          errorCallback(error);
        } else {
          console.error("Payment error:", error);
        }
      };
      
      const rzp = initializeRazorpayCheckout(options, handleSuccess, handleError);
      if (rzp) {
        rzp.open();
      }
    } catch (error) {
      if (errorCallback) {
        errorCallback(error);
      } else {
        console.error("Checkout error:", error);
      }
    }
  }
};

// Handle payment failures
export const handlePaymentFailure = (response: any, onError: (error: any) => void) => {
  onError(new Error(`Payment failed: ${response.error.code} - ${response.error.description}`));
};