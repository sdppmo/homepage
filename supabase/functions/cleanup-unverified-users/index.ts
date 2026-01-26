// Supabase Edge Function: cleanup-unverified-users
// Deletes auth users who haven't verified their email within 48 hours
// Called by pg_cron job daily

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Cleanup threshold: 48 hours in milliseconds
const CLEANUP_THRESHOLD_MS = 48 * 60 * 60 * 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase configuration");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    console.log("[cleanup] Starting cleanup of unverified users (threshold: 48 hours)");
    
    const cutoffDate = new Date(Date.now() - CLEANUP_THRESHOLD_MS);
    console.log("[cleanup] Cutoff date:", cutoffDate.toISOString());

    // Get all users via admin API
    const { data: authData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("[cleanup] Failed to list users:", listError);
      return new Response(JSON.stringify({ error: listError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const users = authData?.users ?? [];
    console.log("[cleanup] Total users:", users.length);

    // Filter unverified users older than threshold
    const unverifiedToDelete = users.filter((user) => {
      // Skip if email is verified
      if (user.email_confirmed_at) {
        return false;
      }
      
      // Check if user was created before cutoff
      const createdAt = new Date(user.created_at);
      return createdAt < cutoffDate;
    });

    console.log("[cleanup] Unverified users to delete:", unverifiedToDelete.length);

    // Delete each unverified user
    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; email: string; error: string }[],
    };

    for (const user of unverifiedToDelete) {
      console.log("[cleanup] Deleting user:", user.id, user.email);
      
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error("[cleanup] Failed to delete user:", user.id, deleteError);
        results.failed.push({
          id: user.id,
          email: user.email ?? "",
          error: deleteError.message,
        });
      } else {
        console.log("[cleanup] Successfully deleted user:", user.id);
        results.deleted.push(user.id);
      }
    }

    console.log("[cleanup] Cleanup complete. Deleted:", results.deleted.length, "Failed:", results.failed.length);

    return new Response(JSON.stringify({
      success: true,
      threshold_hours: 48,
      cutoff_date: cutoffDate.toISOString(),
      total_users: users.length,
      deleted_count: results.deleted.length,
      failed_count: results.failed.length,
      deleted: results.deleted,
      failed: results.failed,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[cleanup] Error:", error);
    return new Response(JSON.stringify({
      error: "Cleanup failed",
      message: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
