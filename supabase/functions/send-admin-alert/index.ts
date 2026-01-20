import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = Deno.env.get("ADMIN_ALERT_EMAIL") || "admin@example.com";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  let payload: {
    record?: Record<string, unknown>;
  } = {};

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const record = payload.record || {};
  const email = String(record.email || "");
  const businessName = String(record.business_name || "");
  const createdAt = String(record.created_at || "");

  const subject = "New user signup awaiting approval";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New user signup</h2>
      <p>A new user has signed up and is awaiting approval.</p>
      <ul>
        <li><strong>Email:</strong> ${email || "-"}</li>
        <li><strong>Business name:</strong> ${businessName || "-"}</li>
        <li><strong>Created at:</strong> ${createdAt || "-"}</li>
      </ul>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SDP Alerts <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text();
    return new Response(
      JSON.stringify({ error: "Resend request failed", details: errorText }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
