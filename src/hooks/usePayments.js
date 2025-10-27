import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

/**
 * Custom hook for managing payment transactions (mock system)
 */
export const usePayments = (userId) => {
  const queryClient = useQueryClient();

  // Fetch payment logs
  const paymentsQuery = useQuery({
    queryKey: ["payments", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("payments_log")
        .select("*, user_subscriptions(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message || "Failed to fetch payment history");
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  // Create payment mutation (mock)
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      const { data, error } = await supabase
        .from("payments_log")
        .insert([
          {
            ...paymentData,
            status: "completed",
            transaction_reference: `TXN-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)
              .toUpperCase()}`,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        throw new Error(error.message || "Payment processing failed");
      }

      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payments", userId]);
      queryClient.invalidateQueries(["subscriptions", userId]);
      toast.success("Payment processed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Payment failed");
    },
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    isError: paymentsQuery.isError,
    error: paymentsQuery.error,
    createPayment: createPaymentMutation.mutate,
    isProcessing: createPaymentMutation.isPending,
    refetch: paymentsQuery.refetch,
  };
};

export default usePayments;

