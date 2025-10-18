import { useState, useEffect } from "react";

import { useAuth } from "./useAuth";
import { dbWithFallback, shouldBypassPayment } from "@/utils/databaseFallback";

export const usePaymentStatus = () => {
  const { user } = useAuth();
  const [hasValidPayment, setHasValidPayment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) {
        setHasValidPayment(false);
        setLoading(false);
        return;
      }

      try {
        // In development mode, allow bypassing payment for testing
        if (shouldBypassPayment(user.id)) {
          setHasValidPayment(true);
          setLoading(false);
          return;
        }

        const hasPayment = await dbWithFallback.hasValidPayment(user.id);
        setHasValidPayment(hasPayment);
      } catch (error) {
        console.error("Error checking payment status:", error);
        setHasValidPayment(false);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [user]);

  return { hasValidPayment, loading };
};