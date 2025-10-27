import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth, users } from "../lib/supabaseClient";
import { toast } from "react-hot-toast";

/**
 * Custom hook to fetch and manage user data
 * Includes authentication check and profile information
 */
export const useUserData = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      // Get current authenticated user
      const { user, error: authError } = await auth.getUser();

      if (authError || !user) {
        throw new Error(authError?.message || "Not authenticated");
      }

      // Get user profile data
      const { data: existingProfile, error: profileError } =
        await users.getById(user.id);

      let profileData;

      if (profileError && profileError.message.includes("No rows returned")) {
        // Create profile if it doesn't exist
        const newProfile = {
          user_id: user.id,
          first_name: user.user_metadata?.first_name || "",
          last_name: user.user_metadata?.last_name || "",
          avatar_url:
            user.user_metadata?.avatar_url ||
            "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          phone: "",
          address: "",
          fitness_goals: ["Build Muscle", "Improve Endurance"],
        };

        const { data: createdProfile, error: createError } =
          await users.create(newProfile);

        if (createError) {
          throw new Error(createError.message || "Failed to create profile");
        }

        profileData = createdProfile[0];
      } else if (profileError) {
        throw new Error(
          profileError.message || "Failed to fetch profile data"
        );
      } else {
        profileData = existingProfile;
      }

      // Combine auth user data with profile data
      return {
        ...user,
        ...profileData,
        name:
          `${profileData?.first_name || ""} ${
            profileData?.last_name || ""
          }`.trim() || user.email,
        avatar:
          profileData?.avatar_url ||
          "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        memberSince: new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
    onError: (error) => {
      toast.error(error.message || "Failed to load user data");
    },
  });

  const updateUserData = async (updateData) => {
    try {
      const currentData = query.data;
      if (!currentData) throw new Error("No user data available");

      const { error } = await users.update(currentData.user_id, updateData);

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      // Invalidate and refetch
      queryClient.invalidateQueries(["userData"]);

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
      return { success: false, error: error.message };
    }
  };

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateUserData,
  };
};

export default useUserData;

