import { createClient } from "@supabase/supabase-js";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anonymous Key is missing. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const auth = {
  // Sign up a new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.first_name + " " + userData.last_name,
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error("Signup error:", error);
      return { data: null, error };
    }

    // If email confirmation is required
    if (data?.user?.identities?.length === 0) {
      return {
        data: {
          user: data.user,
          message: "Please check your email for the confirmation link.",
        },
        error: null,
      };
    }

    return { data, error };
  },

  // Sign in a user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out a user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get the current user
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Update user data
  updateUser: async (userData) => {
    const { data, error } = await supabase.auth.updateUser({
      data: userData,
    });
    return { data, error };
  },

  // Check if user is admin
  isAdmin: async (userId) => {
    try {
      const { data } = await supabase.rpc("is_admin", {
        user_uuid: userId,
      });
      return { data: data || false, error: null };
    } catch {
      // Fallback: check if user email is in admin allowlist
      const allowlistedAdmins = (import.meta.env.VITE_ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const { user } = await auth.getUser();
      const isAllowlisted = allowlistedAdmins.includes(
        (user?.email || "").toLowerCase()
      );

      return { data: isAllowlisted, error: null };
    }
  },
};

// User functions (profiles table)
export const users = {
  // Get all users
  getAll: async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    return { data, error };
  },

  // Get a user by user_id
  getById: async (user_id) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user_id)
      .single();
    return { data, error };
  },

  // Create a user profile (after auth signup)
  create: async (userData) => {
    const { data, error } = await supabase
      .from("profiles")
      .insert([userData])
      .select();
    return { data, error };
  },

  // Update a user profile by user_id
  update: async (user_id, userData) => {
    const { data, error } = await supabase
      .from("profiles")
      .update(userData)
      .eq("user_id", user_id)
      .select();
    return { data, error };
  },

  // Delete a user profile by user_id
  delete: async (user_id) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("user_id", user_id);
    return { error };
  },
};

// Subscription plans functions
export const subscriptionPlans = {
  // Get all subscription plans
  getAll: async () => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true);
    return { data, error };
  },

  // Get a subscription plan by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Create a subscription plan
  create: async (planData) => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .insert([planData])
      .select();
    return { data, error };
  },

  // Update a subscription plan
  update: async (id, planData) => {
    const { data, error } = await supabase
      .from("subscription_plans")
      .update(planData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // Delete a subscription plan
  delete: async (id) => {
    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", id);
    return { error };
  },
};

// User subscriptions functions
export const userSubscriptions = {
  // Get all user subscriptions
  getAll: async () => {
    const { data, error } = await supabase.from("user_subscriptions").select(`
        *,
        subscription_plans (*)
      `);
    return { data, error };
  },

  // Get a user subscription by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans (*)
      `
      )
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Get subscriptions for a specific user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        subscription_plans (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Create a user subscription
  create: async (subscriptionData) => {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .insert([subscriptionData]).select(`
        *,
        subscription_plans (*)
      `);
    return { data, error };
  },

  // Update a user subscription
  update: async (id, subscriptionData) => {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .update(subscriptionData)
      .eq("id", id).select(`
        *,
        subscription_plans (*)
      `);
    return { data, error };
  },

  // Delete a user subscription
  delete: async (id) => {
    const { error } = await supabase
      .from("user_subscriptions")
      .delete()
      .eq("id", id);
    return { error };
  },
};

// Gyms functions
export const gyms = {
  // Get all gyms
  getAll: async () => {
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("is_active", true);
    return { data, error };
  },

  // Admin: get all gyms (including inactive)
  getAllAdmin: async () => {
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Get a gym by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from("gyms")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Create a gym
  create: async (gymData) => {
    const { data, error } = await supabase
      .from("gyms")
      .insert([gymData])
      .select();
    return { data, error };
  },

  // Update a gym
  update: async (id, gymData) => {
    const { data, error } = await supabase
      .from("gyms")
      .update(gymData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // Delete a gym
  delete: async (id) => {
    const { error } = await supabase.from("gyms").delete().eq("id", id);
    return { error };
  },
};

// Payment transactions functions
export const paymentTransactions = {
  // Get all payment transactions
  getAll: async () => {
    const { data, error } = await supabase
      .from("payments_log")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Admin-specific: fetch with optional status filter
  getAllAdmin: async ({ status } = {}) => {
    let query = supabase
      .from("payments_log")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    return { data, error };
  },

  // Get payment transactions for a specific user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("payments_log")
      .select(
        `
        *,
        user_subscriptions (*),
        subscription_plans (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Get payment transactions for a specific subscription
  getBySubscriptionId: async (subscriptionId) => {
    const { data, error } = await supabase
      .from("payments_log")
      .select("*")
      .eq("subscription_id", subscriptionId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Create a payment transaction
  create: async (transactionData) => {
    const { data, error } = await supabase
      .from("payments_log")
      .insert([transactionData]).select(`
        *,
        user_subscriptions (*),
        subscription_plans (*)
      `);
    return { data, error };
  },

  // Update a payment transaction
  update: async (id, transactionData) => {
    const { data, error } = await supabase
      .from("payments_log")
      .update(transactionData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // Delete a payment transaction
  delete: async (id) => {
    const { error } = await supabase.from("payments_log").delete().eq("id", id);
    return { error };
  },
};

// Gym access logs functions
export const gymAccessLogs = {
  // Get all access logs
  getAll: async () => {
    const { data, error } = await supabase.from("gym_access_logs").select(`
        *,
        gyms (*)
      `);
    return { data, error };
  },

  // Get access logs for a specific user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("gym_access_logs")
      .select("*")
      .eq("user_id", userId);
    return { data, error };
  },

  // Get access logs for a specific gym
  getByGymId: async (gymId) => {
    const { data, error } = await supabase
      .from("gym_access_logs")
      .select(
        `
        *,
        gyms (*)
      `
      )
      .eq("gym_id", gymId)
      .order("scanned_at", { ascending: false });
    return { data, error };
  },

  // Create an access log
  create: async (logData) => {
    const { data, error } = await supabase
      .from("gym_access_logs")
      .insert([logData]).select(`
        *,
        gyms (*)
      `);
    return { data, error };
  },

  // Update an access log
  update: async (id, logData) => {
    const { data, error } = await supabase
      .from("gym_access_logs")
      .update(logData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // Delete an access log
  delete: async (id) => {
    const { error } = await supabase
      .from("gym_access_logs")
      .delete()
      .eq("id", id);
    return { error };
  },
};

// Favorite gyms (user_favorite_gyms) functions
export const favoriteGyms = {
  // Get all favorite gym rows for a user (with joined gym details)
  getDetailedByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("user_favorite_gyms")
      .select(
        `
        id,
        gym_id,
        created_at,
        gyms (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Get gym ids for a user
  getIdsByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("user_favorite_gyms")
      .select("gym_id")
      .eq("user_id", userId);
    return { data, error };
  },

  // Add favorite
  add: async (userId, gymId) => {
    const { data, error } = await supabase
      .from("user_favorite_gyms")
      .insert([{ user_id: userId, gym_id: gymId }])
      .select();
    return { data, error };
  },

  // Remove favorite
  remove: async (userId, gymId) => {
    const { error } = await supabase
      .from("user_favorite_gyms")
      .delete()
      .eq("user_id", userId)
      .eq("gym_id", gymId);
    return { error };
  },
};

// Workouts functions
export const workouts = {
  // Get all workouts for a user
  getByUserId: async (userId) => {
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        gyms (*)
      `
      )
      .eq("user_id", userId)
      .order("workout_date", { ascending: false });
    return { data, error };
  },

  // Get a workout by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Create a workout
  create: async (workoutData) => {
    const { data, error } = await supabase
      .from("workouts")
      .insert([workoutData])
      .select(
        `
        *,
        gyms (*)
      `
      );
    return { data, error };
  },

  // Update a workout
  update: async (id, workoutData) => {
    const { data, error } = await supabase
      .from("workouts")
      .update(workoutData)
      .eq("id", id)
      .select();
    return { data, error };
  },

  // Delete a workout
  delete: async (id) => {
    const { error } = await supabase.from("workouts").delete().eq("id", id);
    return { error };
  },
};
