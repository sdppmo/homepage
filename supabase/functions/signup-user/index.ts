// Supabase Edge Function: signup-user
// Validates required fields before creating user account

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  // Remove hyphens and check format (000-00-00000 = 10 digits)
  const digits = bizNum.replace(/-/g, "");
  return /^\d{10}$/.test(digits);
}

function validatePhone(phone: string): boolean {
  // Remove hyphens and check format (010-0000-0000 = 10-11 digits)
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

  try {
    const body: SignupRequest = await req.json();
    const { email, password, business_name, business_number, phone } = body;

    // Validate required fields
    const errors: string[] = [];

    if (!email || !email.includes("@")) {
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

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ 
        error: "user_exists", 
        message: "이미 가입된 이메일입니다" 
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: false, // Require email verification
      user_metadata: {
        business_name: business_name.trim(),
        business_number: business_number,
        phone: phone,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      
      // Handle specific errors
      if (authError.message.includes("already registered")) {
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
        message: "회원가입 중 오류가 발생했습니다" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send verification email
    if (authData.user) {
      const { error: emailError } = await supabase.auth.admin.generateLink({
        type: "signup",
        email: email.toLowerCase(),
        options: {
          redirectTo: req.headers.get("origin") || "https://kcol.kr",
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the signup, just log the error
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.",
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
      }
    }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: "server_error", 
      message: "서버 오류가 발생했습니다" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
