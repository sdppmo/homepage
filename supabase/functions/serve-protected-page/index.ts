// Supabase Edge Function: serve-protected-page
// Serves protected HTML pages only to authenticated users with proper permissions
// Optimized with in-memory caching for faster responses

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Protected pages configuration
const PROTECTED_PAGES: Record<string, { permission: "column" | "beam"; file: string }> = {
  "auto-find-section": { permission: "column", file: "auto-find-section.html" },
  "cross-h-calculator": { permission: "column", file: "crossHcolumnCalculator-protected.html" },
  "boq-report": { permission: "column", file: "boq-report.html" },
};

// In-memory cache for HTML content (persists across warm invocations)
const pageCache: Map<string, { content: string; timestamp: number }> = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// Reuse Supabase client (avoid recreating on each request)
let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseClient;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get page ID from body (POST) or query params (GET)
    let pageId: string | null = null;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        pageId = body.page || null;
      } catch (jsonError) {
        return new Response(JSON.stringify({ 
          error: "bad_request", 
          message: "잘못된 요청 형식입니다" 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    } else {
      const url = new URL(req.url);
      pageId = url.searchParams.get("page");
    }

    if (!pageId || !PROTECTED_PAGES[pageId]) {
      return new Response("Page not found", { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "text/plain" } 
      });
    }

    // Extract JWT from Authorization header (sent by supabase.functions.invoke)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ 
        error: "unauthorized", 
        message: "로그인이 필요합니다" 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    const token = authHeader.replace("Bearer ", "");

    // Get reusable Supabase client
    const supabase = getSupabaseClient();

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        error: "unauthorized", 
        message: "인증이 만료되었습니다. 다시 로그인해주세요" 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Get user profile and check permissions
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_approved, role, access_beam, access_column")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ 
        error: "forbidden", 
        message: "사용자 프로필을 찾을 수 없습니다" 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Check if user is approved (admins bypass this check)
    if (!profile.is_approved && profile.role !== "admin") {
      return new Response(JSON.stringify({ 
        error: "pending", 
        message: "계정 승인을 기다리고 있습니다" 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Check specific permission
    const pageConfig = PROTECTED_PAGES[pageId];
    const hasPermission = profile.role === "admin" || 
      (pageConfig.permission === "column" && profile.access_column) ||
      (pageConfig.permission === "beam" && profile.access_beam);

    if (!hasPermission) {
      return new Response(JSON.stringify({ 
        error: "forbidden", 
        message: `${pageConfig.permission === "column" ? "Cross-H Column" : "Beam"} 기능 사용 권한이 없습니다. 관리자에게 문의하세요.` 
      }), { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Log usage for analytics (async, don't wait for it)
    supabase
      .from("usage_logs")
      .insert({
        user_id: user.id,
        feature_name: pageId,
        metadata: { page_file: pageConfig.file },
      })
      .then(({ error }) => {
        if (error) {
          console.error("Failed to log usage:", error);
        }
      });

    // User is authorized - get page from cache or Storage
    const cacheKey = pageConfig.file;
    const cached = pageCache.get(cacheKey);
    const now = Date.now();
    
    let htmlContent: string;
    
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      // Use cached content
      htmlContent = cached.content;
      console.log(`Cache hit for ${cacheKey}`);
    } else {
      // Fetch from Storage
      console.log(`Cache miss for ${cacheKey}, fetching from Storage`);
      const { data: fileData, error: fileError } = await supabase
        .storage
        .from("protected-pages")
        .download(pageConfig.file);

      if (fileError || !fileData) {
        console.error("File fetch error:", fileError);
        return new Response(JSON.stringify({ 
          error: "not_found", 
          message: "페이지를 찾을 수 없습니다" 
        }), { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }

      htmlContent = await fileData.text();
      
      // Store in cache
      pageCache.set(cacheKey, { content: htmlContent, timestamp: now });
    }

    return new Response(htmlContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ 
      error: "server_error", 
      message: "서버 오류가 발생했습니다" 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
