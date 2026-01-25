// Supabase Edge Function: signup-user
// Validates required fields, creates user, creates profile, and notifies admins
// Security: Users are created with is_approved=false (Pending state)

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SignupRequest {
  email: string;
  password: string;
  business_name: string;
  business_number: string;
  phone: string;
}

function validateBusinessNumber(bizNum: string): boolean {
  const digits = bizNum.replace(/-/g, "");
  return /^\d{10}$/.test(digits);
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/-/g, "");
  return /^\d{10,11}$/.test(digits);
}

function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "비밀번호는 8자 이상이어야 합니다" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "비밀번호에 소문자가 포함되어야 합니다" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "비밀번호에 대문자가 포함되어야 합니다" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "비밀번호에 숫자가 포함되어야 합니다" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "비밀번호에 특수문자가 포함되어야 합니다" };
  }
  return { valid: true, message: "" };
}

function validateEmail(email: string): boolean {
  // Basic email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
    console.log("[signup-user] Starting request processing");
    
    const body: SignupRequest = await req.json();
    console.log("[signup-user] Parsed body, email:", body.email);
    
    const { email, password, business_name, business_number, phone } = body;

    // Validate required fields
    const errors: string[] = [];

    if (!email || !validateEmail(email)) {
      errors.push("유효한 이메일 주소를 입력해주세요");
    }

    const passwordCheck = validatePassword(password || "");
    if (!passwordCheck.valid) {
      errors.push(passwordCheck.message);
    }

    if (!business_name || business_name.trim().length === 0) {
      errors.push("회사명을 입력해주세요");
    }

    if (!business_number || !validateBusinessNumber(business_number)) {
      errors.push("사업자등록번호를 정확히 입력해주세요 (000-00-00000)");
    }

    if (!phone || !validatePhone(phone)) {
      errors.push("전화번호를 정확히 입력해주세요 (010-0000-0000)");
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({ 
        error: "validation_error", 
        message: errors[0],
        errors: errors
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[signup-user] Validation passed, checking existing user:", normalizedEmail);

    // Check if user already exists in user_profiles (more reliable than auth API)
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("[signup-user] User already exists in profiles:", existingProfile.id);
      return new Response(JSON.stringify({ 
        error: "user_exists", 
        message: "이미 가입된 이메일입니다" 
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[signup-user] No existing profile, creating auth user");
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: false, // Require email verification
      user_metadata: {
        business_name: business_name.trim(),
        business_number: business_number,
        phone: phone,
      },
    });

    console.log("[signup-user] createUser result - error:", authError, "user:", authData?.user?.id);
    
    if (authError || !authData.user) {
      console.error("[signup-user] Auth error:", JSON.stringify(authError));
      
      // Check for duplicate user (various error message formats)
      const errorMsg = authError?.message?.toLowerCase() || "";
      if (
        errorMsg.includes("already registered") ||
        errorMsg.includes("already been registered") ||
        errorMsg.includes("user already exists") ||
        errorMsg.includes("duplicate")
      ) {
        return new Response(JSON.stringify({ 
          error: "user_exists", 
          message: "이미 가입된 이메일입니다" 
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ 
        error: "signup_error", 
        message: authError?.message || "회원가입 중 오류가 발생했습니다" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = authData.user.id;
    const now = new Date().toISOString();
    console.log("[signup-user] User created successfully, userId:", userId);

    // Update user_profiles entry (trigger may have already created basic profile)
    // Use upsert to handle both cases: trigger created it or not
    console.log("[signup-user] About to upsert profile for userId:", userId);
    
    let profileError = null;
    try {
      const result = await supabase
        .from("user_profiles")
        .upsert({
          id: userId,
          email: normalizedEmail,
          business_name: business_name.trim(),
          business_number: business_number,
          phone: phone,
          role: "viewer",           // Default role
          is_approved: false,       // PENDING STATE - requires admin approval
          access_beam: false,       // No access by default
          access_column: false,     // No access by default
          created_at: now,
        }, { onConflict: "id" });
      profileError = result.error;
      console.log("[signup-user] Profile upsert completed - error:", profileError);
    } catch (insertException) {
      console.error("[signup-user] Profile upsert THREW:", insertException);
      profileError = { message: String(insertException) };
    }
    
    if (profileError) {
      console.error("[signup-user] Profile creation error:", JSON.stringify(profileError));
      
      // Check if it's a duplicate key error (user already exists)
      if (profileError.code === "23505" || profileError.message?.includes("duplicate")) {
        // Don't delete the auth user - they already exist
        return new Response(JSON.stringify({ 
          error: "user_exists", 
          message: "이미 가입된 이메일입니다" 
        }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // For other errors, try to clean up the auth user
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(JSON.stringify({ 
        error: "signup_error", 
        message: "프로필 생성 중 오류가 발생했습니다" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Note: This Edge Function is primarily for admin-created users.
    // For user-initiated signups, the frontend uses supabase.auth.signUp() directly,
    // which triggers the email via Supabase's configured SMTP template.
    console.log("[signup-user] User created via admin API (email verification handled separately)");

    console.log("[signup-user] About to notify admins");
    // Notify admins about new user signup (async, don't wait)
    notifyAdmins(supabase, {
      id: userId,
      email: normalizedEmail,
      business_name: business_name.trim(),
      business_number: business_number,
      phone: phone,
      created_at: now,
    }).catch((err) => {
      console.error("[signup-user] Admin notification error:", err);
    });

    console.log("[signup-user] Returning success response");
    return new Response(JSON.stringify({ 
      success: true, 
      message: "회원가입이 완료되었습니다. 이메일 인증 후 관리자 승인을 기다려주세요.",
      user: {
        id: userId,
        email: normalizedEmail,
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[signup-user] UNCAUGHT ERROR:", error);
    console.error("[signup-user] Error stack:", error instanceof Error ? error.stack : "no stack");
    return new Response(JSON.stringify({ 
      error: "server_error", 
      message: error instanceof Error ? error.message : "서버 오류가 발생했습니다" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Notify admins about new user signup
async function notifyAdmins(
  supabase: ReturnType<typeof createClient>,
  record: {
    id: string;
    email: string;
    business_name: string;
    business_number: string;
    phone: string;
    created_at: string;
  }
) {
  // Call send-admin-alert function
  const { error } = await supabase.functions.invoke("send-admin-alert", {
    body: { record },
  });

  if (error) {
    throw error;
  }
}
