// Supabase Edge Function: send-admin-alert
// Sends notification emails to all admins when new users sign up
// Security: Only approve action is available via email (non-destructive)
// Reject/delete requires authenticated admin panel access

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Generate secure token for email-based approval only
async function generateApproveToken(userId: string, expiresAt: number): Promise<string> {
  const action = "approve"; // Only approve action allowed via email
  const data = `${userId}:${action}:${expiresAt}`;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SERVICE_ROLE_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  const tokenData = `${userId}:${action}:${expiresAt}:${signatureHex}`;
  return btoa(tokenData).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Escape HTML to prevent XSS in emails
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars");
    return new Response("Missing Supabase env vars", { status: 500 });
  }

  let payload: {
    record?: Record<string, unknown>;
  } = {};

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  // Get all admin emails from user_profiles
  const { data: admins, error: adminError } = await supabase
    .from("user_profiles")
    .select("email")
    .eq("role", "admin");

  if (adminError) {
    console.error("Failed to fetch admin emails:", adminError);
    return new Response("Failed to fetch admin emails", { status: 500 });
  }

  const adminEmails = (admins ?? [])
    .map((a: { email: string | null }) => a.email)
    .filter((e): e is string => !!e && e.includes("@"));

  if (adminEmails.length === 0) {
    console.log("No admin emails found, skipping notification");
    return new Response(JSON.stringify({ ok: true, skipped: "no admins" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const record = payload.record || {};
  const userId = String(record.id || "");
  const email = String(record.email || "");
  const businessName = String(record.business_name || "");
  const businessNumber = String(record.business_number || "");
  const phone = String(record.phone || "");
  const createdAt = String(record.created_at || "");

  // Validate userId is a valid UUID
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    console.error("Invalid user ID:", userId);
    return new Response("Invalid user ID", { status: 400 });
  }

  // Generate secure token (valid for 48 hours) - only for approve action
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;
  const approveToken = await generateApproveToken(userId, expiresAt);

  // Build action URL
  const baseUrl = SUPABASE_URL.replace(/\/$/, "");
  const approveUrl = `${baseUrl}/functions/v1/approve-user?token=${approveToken}`;

  // Escape user-provided data for HTML
  const safeEmail = escapeHtml(email || "-");
  const safeBusinessName = escapeHtml(businessName || "-");
  const safeBusinessNumber = escapeHtml(businessNumber || "-");
  const safePhone = escapeHtml(phone || "-");
  const safeCreatedAt = escapeHtml(createdAt || "-");

  const subject = "[송도파트너스피엠오] 새 사용자 가입 승인 대기";
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0;">새 사용자 가입 알림</h2>
      </div>
      <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155; margin-top: 0;">새로운 사용자가 가입하여 승인 대기 중입니다.</p>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; width: 130px; font-weight: 500;">이메일</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">회사명</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${safeBusinessName}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">사업자등록번호</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${safeBusinessNumber}</td>
          </tr>
          <tr>
            <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">전화번호</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${safePhone}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 12px 16px; color: #64748b; font-weight: 500;">가입 시간</td>
            <td style="padding: 12px 16px; color: #0f172a; font-weight: 600;">${safeCreatedAt}</td>
          </tr>
        </table>
        
        <!-- Quick Approve Button -->
        <div style="margin-top: 24px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">아래 버튼을 클릭하면 즉시 승인됩니다:</p>
          <a href="${approveUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">✓ 바로 승인하기</a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        
        <!-- Admin Panel Link -->
        <div style="text-align: center;">
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 12px;">거절 또는 상세 관리가 필요하시면 관리자 페이지를 이용하세요:</p>
          <a href="https://kcol.kr/pages/admin.html" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px;">관리자 페이지 열기</a>
        </div>
      </div>
      <div style="background: #1e293b; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          본 메일은 송도파트너스피엠오 시스템에서 자동 발송되었습니다.<br>
          본 메일은 발신 전용이며 회신되지 않습니다.<br>
          승인 링크는 48시간 동안 유효합니다.
        </p>
      </div>
    </div>
  `;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "송도파트너스피엠오 <sdppmo@kcol.kr>",
        to: adminEmails,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error("Resend error:", errorText);
      return new Response(
        JSON.stringify({ error: "Resend request failed", details: errorText }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, notified: adminEmails.length }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Email send error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
