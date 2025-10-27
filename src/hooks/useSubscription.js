import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userSubscriptions, subscriptionPlans } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

/**
 * Custom hook to manage user subscriptions
 * Handles fetching, creating, and updating subscriptions
 */
export const useSubscription = (userId) => {
  const queryClient = useQueryClient();

  // Fetch user subscriptions
  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await userSubscriptions.getByUserId(userId);

      if (error) {
        throw new Error(error.message || "Failed to fetch subscriptions");
      }

      // Format subscriptions
      return (
        data?.map((sub) => ({
          ...sub,
          plan_name: sub.subscription_plans?.name || "Unknown Plan",
          nextBillingDate: new Date(sub.end_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          amount:
            sub.billing_type === "monthly"
              ? sub.subscription_plans?.price_monthly
              : sub.subscription_plans?.price_yearly,
          paymentHistory: [
            {
              date: sub.start_date,
              amount:
                sub.billing_type === "monthly"
                  ? sub.subscription_plans?.price_monthly
                  : sub.subscription_plans?.price_yearly,
              status: "completed",
              method: "Credit Card ending in 4242",
            },
          ],
        })) || []
      );
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch subscription plans
  const plansQuery = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: async () => {
      const { data, error } = await subscriptionPlans.getAll();

      if (error) {
        throw new Error(error.message || "Failed to fetch plans");
      }

      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData) => {
      const { data, error } = await userSubscriptions.create(subscriptionData);

      if (error) {
        throw new Error(error.message || "Failed to create subscription");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions", userId]);
      toast.success("Subscription created successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create subscription");
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, updateData }) => {
      const { data, error } = await userSubscriptions.update(id, updateData);

      if (error) {
        throw new Error(error.message || "Failed to update subscription");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions", userId]);
      toast.success("Subscription updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update subscription");
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId) => {
      const { error } = await userSubscriptions.update(subscriptionId, {
        status: "cancelled",
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message || "Failed to cancel subscription");
      }

      return subscriptionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions", userId]);
      toast.success("Subscription cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  // Get active subscription
  const activeSubscription =
    subscriptionsQuery.data?.find((sub) => sub.status === "active") ||
    subscriptionsQuery.data?.[0];

  return {
    subscriptions: subscriptionsQuery.data || [],
    activeSubscription,
    plans: plansQuery.data || [],
    isLoading: subscriptionsQuery.isLoading || plansQuery.isLoading,
    isError: subscriptionsQuery.isError || plansQuery.isError,
    error: subscriptionsQuery.error || plansQuery.error,
    createSubscription: createSubscriptionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    cancelSubscription: cancelSubscriptionMutation.mutate,
    isCreating: createSubscriptionMutation.isPending,
    isUpdating: updateSubscriptionMutation.isPending,
    isCancelling: cancelSubscriptionMutation.isPending,
    refetch: subscriptionsQuery.refetch,
  };
};

export default useSubscription;

