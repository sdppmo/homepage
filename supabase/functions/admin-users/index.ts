// Supabase Edge Function: admin-users
// Admin user management, analytics, and password reset

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ADMIN_EMAIL_ALLOWLIST = (Deno.env.get("ADMIN_EMAIL_ALLOWLIST") ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

type AdminAction =
  | "list"
  | "create"
  | "update"
  | "delete"
  | "bootstrap_admin"
  | "get_features"
  | "get_usage_stats"
  | "get_user_usage"
  | "reset_password"
  | "set_password";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response("Missing Supabase env vars", {
      status: 500,
      headers: corsHeaders,
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return new Response("Missing auth token", {
      status: 401,
      headers: corsHeaders,
    });
  }

  let body: { action?: AdminAction; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON payload", {
      status: 400,
      headers: corsHeaders,
    });
  }

  const action = body.action;
  const payload = body.payload ?? {};

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response("Invalid auth token", {
      status: 401,
      headers: corsHeaders,
    });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id,role,email,is_approved")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";
  const isAllowlisted = ADMIN_EMAIL_ALLOWLIST.includes(user.email ?? "");

  // Bootstrap admin action (no admin check required)
  if (action === "bootstrap_admin") {
    const { data: existingAdmin } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (existingAdmin) {
      return new Response("Admin already exists", {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (!isAllowlisted) {
      return new Response("Not allowed to bootstrap admin", {
        status: 403,
        headers: corsHeaders,
      });
    }

    const { error: upsertError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: "admin",
          is_approved: true,
        },
        { onConflict: "id" },
      );

    if (upsertError) {
      return new Response(upsertError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // All other actions require admin role
  if (!isAdmin) {
    return new Response("Admin access required", {
      status: 403,
      headers: corsHeaders,
    });
  }

  // ============================================
  // List all users (from auth.users, with profile permissions)
  // ============================================
  if (action === "list") {
    // Primary source: auth.users (includes unverified users)
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      return new Response(authError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Get profiles for permission data
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("id,business_name,business_number,phone,is_approved,role,access_beam,access_column");
    
    if (profileError) {
      console.error("Failed to fetch profiles:", profileError);
    }

    // Create a map of user id -> profile
    const profileMap = new Map<string, typeof profiles[0]>();
    if (profiles) {
      for (const profile of profiles) {
        profileMap.set(profile.id, profile);
      }
    }

    // Merge auth users with profile data
    const users = (authData?.users ?? []).map((authUser) => {
      const profile = profileMap.get(authUser.id);
      const metadata = authUser.user_metadata || {};
      
      return {
        id: authUser.id,
        email: authUser.email,
        email_verified: !!authUser.email_confirmed_at,
        created_at: authUser.created_at,
        // Profile data (if exists) or metadata fallback
        business_name: profile?.business_name ?? metadata.business_name ?? null,
        business_number: profile?.business_number ?? metadata.business_number ?? null,
        phone: profile?.phone ?? metadata.phone ?? null,
        // Permission data (only from profile)
        has_profile: !!profile,
        is_approved: profile?.is_approved ?? false,
        role: profile?.role ?? "viewer",
        access_beam: profile?.access_beam ?? false,
        access_column: profile?.access_column ?? false,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(JSON.stringify({ users }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Get feature definitions
  // ============================================
  if (action === "get_features") {
    const { data, error } = await supabase
      .from("feature_definitions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    
    if (error) {
      return new Response(error.message, {
        status: 400,
        headers: corsHeaders,
      });
    }
    return new Response(JSON.stringify({ features: data ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Get usage statistics
  // ============================================
  if (action === "get_usage_stats") {
    const period = String(payload.period ?? "7d");
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "3d":
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get feature usage counts
    const { data: featureStats, error: featureError } = await supabase
      .from("usage_logs")
      .select("feature_name, user_id, accessed_at")
      .gte("accessed_at", startDate.toISOString())
      .lte("accessed_at", now.toISOString());

    if (featureError) {
      return new Response(featureError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Aggregate by feature
    const featureMap = new Map<string, { count: number; users: Set<string> }>();
    const dailyMap = new Map<string, number>();
    const userActivityMap = new Map<string, number>();

    (featureStats ?? []).forEach((log: { feature_name: string; user_id: string; accessed_at: string }) => {
      // Feature aggregation
      if (!featureMap.has(log.feature_name)) {
        featureMap.set(log.feature_name, { count: 0, users: new Set() });
      }
      const feat = featureMap.get(log.feature_name)!;
      feat.count++;
      feat.users.add(log.user_id);

      // Daily aggregation
      const day = log.accessed_at.split("T")[0];
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);

      // User activity aggregation
      userActivityMap.set(log.user_id, (userActivityMap.get(log.user_id) ?? 0) + 1);
    });

    // Convert to arrays
    const featureUsage = Array.from(featureMap.entries()).map(([name, data]) => ({
      feature_name: name,
      total_count: data.count,
      unique_users: data.users.size,
    }));

    const dailyUsage = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get user details for activity
    const userIds = Array.from(userActivityMap.keys());
    const { data: userDetails } = await supabase
      .from("user_profiles")
      .select("id, email, business_name")
      .in("id", userIds);

    const userActivity = Array.from(userActivityMap.entries()).map(([userId, count]) => {
      const userDetail = (userDetails ?? []).find((u: { id: string }) => u.id === userId);
      return {
        user_id: userId,
        email: userDetail?.email ?? "Unknown",
        business_name: userDetail?.business_name ?? "",
        access_count: count,
      };
    }).sort((a, b) => b.access_count - a.access_count);

    // Get total users and active users today
    const { count: totalUsers } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: activeToday } = await supabase
      .from("usage_logs")
      .select("user_id")
      .gte("accessed_at", todayStart.toISOString());

    const uniqueActiveToday = new Set((activeToday ?? []).map((l: { user_id: string }) => l.user_id)).size;

    return new Response(JSON.stringify({
      summary: {
        total_users: totalUsers ?? 0,
        active_today: uniqueActiveToday,
        total_accesses: featureStats?.length ?? 0,
        period,
      },
      feature_usage: featureUsage,
      daily_usage: dailyUsage,
      user_activity: userActivity.slice(0, 20), // Top 20 users
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Get specific user's usage details
  // ============================================
  if (action === "get_user_usage") {
    const userId = String(payload.user_id ?? "").trim();
    const period = String(payload.period ?? "7d");

    if (!userId) {
      return new Response("User ID required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "3d":
        startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "7d":
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
    }

    const { data: logs, error } = await supabase
      .from("usage_logs")
      .select("feature_name, accessed_at, metadata")
      .eq("user_id", userId)
      .gte("accessed_at", startDate.toISOString())
      .order("accessed_at", { ascending: false })
      .limit(100);

    if (error) {
      return new Response(error.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Aggregate by feature and day
    const featureMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();

    (logs ?? []).forEach((log: { feature_name: string; accessed_at: string }) => {
      featureMap.set(log.feature_name, (featureMap.get(log.feature_name) ?? 0) + 1);
      const day = log.accessed_at.split("T")[0];
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    });

    return new Response(JSON.stringify({
      logs: logs ?? [],
      feature_breakdown: Array.from(featureMap.entries()).map(([name, count]) => ({
        feature_name: name,
        count,
      })),
      daily_breakdown: Array.from(dailyMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Reset user password
  // ============================================
  if (action === "reset_password") {
    const userEmail = String(payload.email ?? "").trim();

    if (!userEmail) {
      return new Response("Email required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: userEmail,
      options: {
        redirectTo: "https://kcol.kr/pages/auth/reset-password.html",
      },
    });

    if (error) {
      return new Response(error.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true, message: "Password reset email sent" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Set user password directly (admin only)
  // ============================================
  if (action === "set_password") {
    const userId = String(payload.user_id ?? "").trim();
    const newPassword = String(payload.password ?? "");

    if (!userId) {
      return new Response("User ID required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return new Response("Password must be at least 6 characters", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      return new Response(error.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true, message: "Password updated" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Create new user
  // ============================================
  if (action === "create") {
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");
    const businessName = String(payload.business_name ?? "");
    const businessNumber = String(payload.business_number ?? "");
    const phone = String(payload.phone ?? "");
    const isApproved = Boolean(payload.is_approved);
    const role = payload.is_admin ? "admin" : "viewer";
    const accessBeam = Boolean(payload.access_beam);
    const accessColumn = Boolean(payload.access_column);

    if (!email || !password) {
      return new Response("Email and password are required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Admin creates user with email already confirmed (bypass email auth)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      return new Response(error?.message ?? "Failed to create user", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: data.user.id,
        email,
        business_name: businessName || null,
        business_number: businessNumber || null,
        phone: phone || null,
        is_approved: isApproved,
        role: role,
        access_beam: accessBeam,
        access_column: accessColumn,
      });

    if (profileError) {
      return new Response(profileError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Update user (creates profile if doesn't exist)
  // ============================================
  if (action === "update") {
    const userId = String(payload.user_id ?? "").trim();
    const updates = payload.updates as Record<string, unknown> ?? {};
    if (!userId || typeof updates !== "object") {
      return new Response("Invalid update payload", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // If approving user, also verify their email automatically
    if (updates.is_approved === true) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
      if (authUpdateError) {
        console.error("Failed to verify email for user:", userId, authUpdateError);
        // Continue with profile update even if email verification fails
      }
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId);

      if (error) {
        return new Response(error.message, {
          status: 400,
          headers: corsHeaders,
        });
      }
    } else {
      // Create new profile - get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      
      if (!authUser?.user) {
        return new Response("User not found in auth", {
          status: 404,
          headers: corsHeaders,
        });
      }

      const metadata = authUser.user.user_metadata || {};
      
      const { error } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          email: authUser.user.email,
          business_name: metadata.business_name ?? null,
          business_number: metadata.business_number ?? null,
          phone: metadata.phone ?? null,
          role: "viewer",
          is_approved: false,
          access_beam: false,
          access_column: false,
          ...updates,
        });

      if (error) {
        return new Response(error.message, {
          status: 400,
          headers: corsHeaders,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ============================================
  // Delete user
  // ============================================
  if (action === "delete") {
    const userId = String(payload.user_id ?? "").trim();
    if (!userId) {
      return new Response("User id required", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
      userId,
    );
    if (deleteAuthError) {
      return new Response(deleteAuthError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { error: deleteProfileError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (deleteProfileError) {
      return new Response(deleteProfileError.message, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response("Unsupported action", {
    status: 400,
    headers: corsHeaders,
  });
});
