import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workouts } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

/**
 * Custom hook to manage user workouts
 * Handles fetching, creating, updating, and deleting workouts
 */
export const useWorkouts = (userId) => {
  const queryClient = useQueryClient();

  // Fetch workouts
  const workoutsQuery = useQuery({
    queryKey: ["workouts", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await workouts.getByUserId(userId);

      if (error) {
        throw new Error(error.message || "Failed to fetch workouts");
      }

      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create workout mutation
  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      const { data, error } = await workouts.create(workoutData);

      if (error) {
        throw new Error(error.message || "Failed to create workout");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workouts", userId]);
      toast.success("Workout scheduled successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to schedule workout");
    },
  });

  // Update workout mutation
  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, updateData }) => {
      const { data, error } = await workouts.update(id, updateData);

      if (error) {
        throw new Error(error.message || "Failed to update workout");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workouts", userId]);
      toast.success("Workout updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update workout");
    },
  });

  // Delete workout mutation
  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId) => {
      const { error } = await workouts.delete(workoutId);

      if (error) {
        throw new Error(error.message || "Failed to delete workout");
      }

      return workoutId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workouts", userId]);
      toast.success("Workout deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete workout");
    },
  });

  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutsQuery.isLoading,
    isError: workoutsQuery.isError,
    error: workoutsQuery.error,
    createWorkout: createWorkoutMutation.mutate,
    updateWorkout: updateWorkoutMutation.mutate,
    deleteWorkout: deleteWorkoutMutation.mutate,
    isCreating: createWorkoutMutation.isPending,
    isUpdating: updateWorkoutMutation.isPending,
    isDeleting: deleteWorkoutMutation.isPending,
    refetch: workoutsQuery.refetch,
  };
};

export default useWorkouts;

