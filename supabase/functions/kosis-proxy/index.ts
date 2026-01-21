import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// KOSIS OpenAPI endpoints:
// - kosis.kr (official KOSIS OpenAPI; uses apiKey)
// - apis.data.go.kr (public data gateway; uses serviceKey)
const KOSIS_KR_ENDPOINT = "https://kosis.kr/openapi/statisticsData.do";
const DATA_GO_KR_ENDPOINT =
  "https://apis.data.go.kr/1240000/statisticsData/getStatisticsData";

// Simple in-memory cache (warm invocations only)
const cache = new Map<string, { ts: number; body: string }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type KosisRequest = {
  orgId: string;
  tblId: string;
  itmId?: string; // optional (some tables return all items when omitted)
  prdSe?: string; // M
  objL1?: string; // ALL
  objL2?: string;
  objL3?: string;
  objL4?: string;
  objL5?: string;
  objL6?: string;
  objL7?: string;
  objL8?: string;
  startPrdDe?: string;
  endPrdDe?: string;
  numOfRows?: number;
  format?: "json" | "xml";
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Prefer KOSIS official OpenAPI (kosis.kr) if available
  const kosisApiKey = Deno.env.get("KOSIS_API_KEY") ?? "";
  // Support data.go.kr gateway as fallback
  const serviceKey = Deno.env.get("KOSIS_SERVICE_KEY") ?? "";

  let payload: KosisRequest;
  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      payload = {
        orgId: url.searchParams.get("orgId") ?? "",
        tblId: url.searchParams.get("tblId") ?? "",
        itmId: url.searchParams.get("itmId") ?? "",
        prdSe: url.searchParams.get("prdSe") ?? undefined,
        objL1: url.searchParams.get("objL1") ?? undefined,
        startPrdDe: url.searchParams.get("startPrdDe") ?? undefined,
        endPrdDe: url.searchParams.get("endPrdDe") ?? undefined,
        numOfRows: url.searchParams.get("numOfRows")
          ? Number(url.searchParams.get("numOfRows"))
          : undefined,
        format: (url.searchParams.get("format") as "json" | "xml") ?? undefined,
      };
    } else if (req.method === "POST") {
      payload = await req.json();
    } else {
      return json({ error: "method_not_allowed" }, 405);
    }
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const orgId = String(payload.orgId || "").trim();
  const tblId = String(payload.tblId || "").trim();
  const itmId = String(payload.itmId || "").trim();
  if (!orgId || !tblId) {
    return json(
      { error: "missing_params", message: "orgId/tblId are required" },
      400,
    );
  }

  const prdSe = payload.prdSe ?? "M";
  const objL1 = payload.objL1 ?? "ALL";
  const numOfRows = payload.numOfRows ?? 24;
  const format = payload.format ?? "json";

  const objParams: Array<[string, string]> = [];
  if (objL1) objParams.push(["objL1", objL1]);
  if (payload.objL2) objParams.push(["objL2", payload.objL2]);
  if (payload.objL3) objParams.push(["objL3", payload.objL3]);
  if (payload.objL4) objParams.push(["objL4", payload.objL4]);
  if (payload.objL5) objParams.push(["objL5", payload.objL5]);
  if (payload.objL6) objParams.push(["objL6", payload.objL6]);
  if (payload.objL7) objParams.push(["objL7", payload.objL7]);
  if (payload.objL8) objParams.push(["objL8", payload.objL8]);

  // Build request URL (try kosis.kr first if KOSIS_API_KEY set)
  const url = new URL(kosisApiKey ? KOSIS_KR_ENDPOINT : DATA_GO_KR_ENDPOINT);

  if (kosisApiKey) {
    // kosis.kr OpenAPI format:
    // https://kosis.kr/openapi/statisticsData.do?method=getList&apiKey=...&format=json&jsonVD=Y&orgId=...&tblId=...&prdSe=M&...
    url.searchParams.set("method", "getList");
    url.searchParams.set("apiKey", kosisApiKey);
    url.searchParams.set("format", format);
    url.searchParams.set("jsonVD", "Y");
    url.searchParams.set("orgId", orgId);
    url.searchParams.set("tblId", tblId);
    url.searchParams.set("prdSe", prdSe);
    url.searchParams.set("newEstPrdCnt", String(numOfRows));
    for (const [k, v] of objParams) url.searchParams.set(k, v);
    if (itmId && itmId !== "ALL") url.searchParams.set("itmId", itmId);
    if (payload.startPrdDe) url.searchParams.set("startPrdDe", payload.startPrdDe);
    if (payload.endPrdDe) url.searchParams.set("endPrdDe", payload.endPrdDe);
  } else {
    if (!serviceKey) {
      return json(
        {
          error: "missing_kosis_key",
          message:
            "Missing KOSIS_API_KEY or KOSIS_SERVICE_KEY. Set one of them in Supabase Edge Function secrets.",
        },
        500,
      );
    }

    // data.go.kr gateway format:
    // https://apis.data.go.kr/1240000/statisticsData/getStatisticsData?serviceKey=...&orgId=...&tblId=...&prdSe=M&objL1=ALL&...
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("orgId", orgId);
    url.searchParams.set("tblId", tblId);
    url.searchParams.set("prdSe", prdSe);
    url.searchParams.set("numOfRows", String(numOfRows));
    url.searchParams.set("format", format);
    for (const [k, v] of objParams) url.searchParams.set(k, v);
    if (itmId && itmId !== "ALL") url.searchParams.set("itmId", itmId);
    if (payload.startPrdDe) url.searchParams.set("startPrdDe", payload.startPrdDe);
    if (payload.endPrdDe) url.searchParams.set("endPrdDe", payload.endPrdDe);
  }

  const cacheKey = url.toString();
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return new Response(cached.body, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const upstream = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    return json(
      {
        error: "upstream_error",
        status: upstream.status,
        body: text,
        endpoint: url.origin,
      },
      502,
    );
  }

  cache.set(cacheKey, { ts: now, body: text });
  return new Response(text, {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
});

