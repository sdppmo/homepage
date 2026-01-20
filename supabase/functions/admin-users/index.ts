import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
  | "bootstrap_admin";

serve(async (req) => {
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

  if (!isAdmin) {
    return new Response("Admin access required", {
      status: 403,
      headers: corsHeaders,
    });
  }

  if (action === "list") {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id,email,business_name,is_approved,role,access_beam,access_column,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      return new Response(error.message, {
        status: 400,
        headers: corsHeaders,
      });
    }
    return new Response(JSON.stringify({ users: data ?? [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "create") {
    const email = String(payload.email ?? "").trim();
    const password = String(payload.password ?? "");
    const businessName = String(payload.business_name ?? "");
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

  if (action === "update") {
    const userId = String(payload.user_id ?? "").trim();
    const updates = payload.updates ?? {};
    if (!userId || typeof updates !== "object") {
      return new Response("Invalid update payload", {
        status: 400,
        headers: corsHeaders,
      });
    }

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

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
