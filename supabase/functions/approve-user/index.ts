// Supabase Edge Function: approve-user
// Handles email-based user approval with secure tokens
// Security: Only APPROVE action is allowed via email link (non-destructive)
// Reject/delete must be done through authenticated admin panel

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

// Verify token with HMAC
async function verifyToken(token: string): Promise<{ 
  valid: boolean; 
  userId?: string; 
  action?: string; 
  error?: string;
  expiresAt?: number;
}> {
  try {
    // Decode base64url
    let decoded: string;
    try {
      decoded = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    } catch {
      return { valid: false, error: "Invalid token encoding" };
    }
    
    const parts = decoded.split(":");
    
    if (parts.length !== 4) {
      return { valid: false, error: "Invalid token format" };
    }
    
    const [userId, action, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    
    // Validate parts
    if (!userId || !action || isNaN(expiresAt) || !signature) {
      return { valid: false, error: "Invalid token data" };
    }
    
    // Check expiration (with 1 minute tolerance for clock skew)
    if (Date.now() > expiresAt + 60000) {
      return { valid: false, error: "Token expired" };
    }
    
    // Security: Only allow approve action via email link
    if (action !== "approve") {
      return { valid: false, error: "Invalid action" };
    }
    
    // Verify signature
    const data = `${userId}:${action}:${expiresAt}`;
    const encoder = new TextEncoder();
    
    let key: CryptoKey;
    try {
      key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(SERVICE_ROLE_KEY),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
    } catch {
      console.error("Failed to import key");
      return { valid: false, error: "Server error" };
    }
    
    // Parse signature hex to bytes
    const signatureMatch = signature.match(/.{2}/g);
    if (!signatureMatch || signatureMatch.length !== 32) {
      return { valid: false, error: "Invalid signature format" };
    }
    
    const signatureBytes = new Uint8Array(
      signatureMatch.map((byte) => parseInt(byte, 16))
    );
    
    // crypto.subtle.verify uses constant-time comparison internally
    const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, encoder.encode(data));
    
    if (!valid) {
      return { valid: false, error: "Invalid signature" };
    }
    
    return { valid: true, userId, action, expiresAt };
  } catch (e) {
    console.error("Token verification error:", e);
    return { valid: false, error: "Token verification failed" };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return htmlResponse("오류", "서버 설정 오류입니다.", "error");
  }

  // Get token from URL query params
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  
  if (!token) {
    return htmlResponse("오류", "유효하지 않은 요청입니다.", "error");
  }

  // Validate token format (base64url, reasonable length)
  if (token.length > 500 || !/^[A-Za-z0-9_-]+$/.test(token)) {
    return htmlResponse("오류", "유효하지 않은 토큰입니다.", "error");
  }

  // Verify token
  const result = await verifyToken(token);
  
  if (!result.valid) {
    const errorMessage = result.error === "Token expired" 
      ? "링크가 만료되었습니다. 관리자 페이지에서 직접 승인해주세요."
      : "유효하지 않은 링크입니다. 관리자 페이지에서 직접 승인해주세요.";
    return htmlResponse("오류", errorMessage, "error");
  }

  const { userId } = result;

  // Validate userId format (UUID)
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return htmlResponse("오류", "유효하지 않은 사용자 ID입니다.", "error");
  }

  // Get user info
  const { data: user, error: userError } = await supabase
    .from("user_profiles")
    .select("email, business_name, is_approved")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("Database error:", userError);
    return htmlResponse("오류", "데이터베이스 오류가 발생했습니다.", "error");
  }

  if (!user) {
    return htmlResponse("오류", "사용자를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.", "error");
  }

  // Check if already approved (idempotent operation)
  if (user.is_approved) {
    return htmlResponse(
      "알림", 
      `<strong>${escapeHtml(user.email || user.business_name || "사용자")}</strong>는 이미 승인되었습니다.`, 
      "info"
    );
  }

  // Perform approval
  const { error: updateError } = await supabase
    .from("user_profiles")
    .update({ is_approved: true })
    .eq("id", userId);

  if (updateError) {
    console.error("Approval error:", updateError);
    return htmlResponse("오류", "승인 처리 중 오류가 발생했습니다.", "error");
  }

  return htmlResponse(
    "승인 완료",
    `<strong>${escapeHtml(user.email || user.business_name || "사용자")}</strong> 사용자가 승인되었습니다.<br><br>이제 해당 사용자는 서비스를 이용할 수 있습니다.`,
    "success"
  );
});

// Prevent XSS by escaping HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlResponse(title: string, message: string, type: "success" | "error" | "warning" | "info"): Response {
  const colors = {
    success: { bg: "#10b981", icon: "✓" },
    error: { bg: "#ef4444", icon: "✕" },
    warning: { bg: "#f59e0b", icon: "!" },
    info: { bg: "#3b82f6", icon: "i" },
  };

  const { bg, icon } = colors[type];

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - 송도파트너스피엠오</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 400px;
      width: 100%;
      text-align: center;
      overflow: hidden;
    }
    .header {
      background: ${bg};
      padding: 32px;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      font-size: 32px;
      color: white;
      font-weight: bold;
    }
    .content {
      padding: 32px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .footer {
      padding: 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="icon">${icon}</div>
    </div>
    <div class="content">
      <h1>${escapeHtml(title)}</h1>
      <p>${message}</p>
      <a href="https://kcol.kr/pages/admin.html" class="btn">관리자 페이지로 이동</a>
    </div>
    <div class="footer">
      주식회사 송도파트너스피엠오
    </div>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    status: 200,
    headers: { 
      ...corsHeaders, 
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "default-src 'self'; style-src 'unsafe-inline'",
    },
  });
}
