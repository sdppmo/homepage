import { NextRequest, NextResponse } from 'next/server';

// KOSIS OpenAPI endpoints:
// - kosis.kr (official KOSIS OpenAPI; uses apiKey)
// - apis.data.go.kr (public data gateway; uses serviceKey)
const KOSIS_KR_ENDPOINT = 'https://kosis.kr/openapi/statisticsData.do';
const DATA_GO_KR_ENDPOINT =
  'https://apis.data.go.kr/1240000/statisticsData/getStatisticsData';

// Simple in-memory cache (warm invocations only)
const cache = new Map<string, { ts: number; body: string }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

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
  format?: 'json' | 'xml';
};

function jsonResponse(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders,
  });
}

function parsePayloadFromSearchParams(
  searchParams: URLSearchParams
): KosisRequest {
  return {
    orgId: searchParams.get('orgId') ?? '',
    tblId: searchParams.get('tblId') ?? '',
    itmId: searchParams.get('itmId') ?? '',
    prdSe: searchParams.get('prdSe') ?? undefined,
    objL1: searchParams.get('objL1') ?? undefined,
    objL2: searchParams.get('objL2') ?? undefined,
    objL3: searchParams.get('objL3') ?? undefined,
    objL4: searchParams.get('objL4') ?? undefined,
    objL5: searchParams.get('objL5') ?? undefined,
    objL6: searchParams.get('objL6') ?? undefined,
    objL7: searchParams.get('objL7') ?? undefined,
    objL8: searchParams.get('objL8') ?? undefined,
    startPrdDe: searchParams.get('startPrdDe') ?? undefined,
    endPrdDe: searchParams.get('endPrdDe') ?? undefined,
    numOfRows: searchParams.get('numOfRows')
      ? Number(searchParams.get('numOfRows'))
      : undefined,
    format:
      (searchParams.get('format') as 'json' | 'xml' | null) ?? undefined,
  };
}

async function handleKosisRequest(payload: KosisRequest): Promise<NextResponse> {
  // Prefer KOSIS official OpenAPI (kosis.kr) if available
  const kosisApiKey = process.env.KOSIS_API_KEY ?? '';
  // Support data.go.kr gateway as fallback
  const serviceKey = process.env.KOSIS_SERVICE_KEY ?? '';

  const orgId = String(payload.orgId || '').trim();
  const tblId = String(payload.tblId || '').trim();
  const itmId = String(payload.itmId || '').trim();

  if (!orgId || !tblId) {
    return jsonResponse(
      { error: 'missing_params', message: 'orgId/tblId are required' },
      400
    );
  }

  const prdSe = payload.prdSe ?? 'M';
  const objL1 = payload.objL1 ?? 'ALL';
  const numOfRows = payload.numOfRows ?? 24;
  const format = payload.format ?? 'json';

  const objParams: Array<[string, string]> = [];
  if (objL1) objParams.push(['objL1', objL1]);
  if (payload.objL2) objParams.push(['objL2', payload.objL2]);
  if (payload.objL3) objParams.push(['objL3', payload.objL3]);
  if (payload.objL4) objParams.push(['objL4', payload.objL4]);
  if (payload.objL5) objParams.push(['objL5', payload.objL5]);
  if (payload.objL6) objParams.push(['objL6', payload.objL6]);
  if (payload.objL7) objParams.push(['objL7', payload.objL7]);
  if (payload.objL8) objParams.push(['objL8', payload.objL8]);

  // Build request URL (try kosis.kr first if KOSIS_API_KEY set)
  const url = new URL(kosisApiKey ? KOSIS_KR_ENDPOINT : DATA_GO_KR_ENDPOINT);

  if (kosisApiKey) {
    // kosis.kr OpenAPI format:
    // https://kosis.kr/openapi/statisticsData.do?method=getList&apiKey=...&format=json&jsonVD=Y&orgId=...&tblId=...&prdSe=M&...
    url.searchParams.set('method', 'getList');
    url.searchParams.set('apiKey', kosisApiKey);
    url.searchParams.set('format', format);
    url.searchParams.set('jsonVD', 'Y');
    url.searchParams.set('orgId', orgId);
    url.searchParams.set('tblId', tblId);
    url.searchParams.set('prdSe', prdSe);
    url.searchParams.set('newEstPrdCnt', String(numOfRows));
    for (const [k, v] of objParams) url.searchParams.set(k, v);
    if (itmId && itmId !== 'ALL') url.searchParams.set('itmId', itmId);
    if (payload.startPrdDe)
      url.searchParams.set('startPrdDe', payload.startPrdDe);
    if (payload.endPrdDe) url.searchParams.set('endPrdDe', payload.endPrdDe);
  } else {
    if (!serviceKey) {
      return jsonResponse(
        {
          error: 'missing_kosis_key',
          message:
            'Missing KOSIS_API_KEY or KOSIS_SERVICE_KEY. Set one of them in environment variables.',
        },
        500
      );
    }

    // data.go.kr gateway format:
    // https://apis.data.go.kr/1240000/statisticsData/getStatisticsData?serviceKey=...&orgId=...&tblId=...&prdSe=M&objL1=ALL&...
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('orgId', orgId);
    url.searchParams.set('tblId', tblId);
    url.searchParams.set('prdSe', prdSe);
    url.searchParams.set('numOfRows', String(numOfRows));
    url.searchParams.set('format', format);
    for (const [k, v] of objParams) url.searchParams.set(k, v);
    if (itmId && itmId !== 'ALL') url.searchParams.set('itmId', itmId);
    if (payload.startPrdDe)
      url.searchParams.set('startPrdDe', payload.startPrdDe);
    if (payload.endPrdDe) url.searchParams.set('endPrdDe', payload.endPrdDe);
  }

  const cacheKey = url.toString();
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return new NextResponse(cached.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  const upstream = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    return jsonResponse(
      {
        error: 'upstream_error',
        status: upstream.status,
        body: text,
        endpoint: url.origin,
      },
      502
    );
  }

  cache.set(cacheKey, { ts: now, body: text });
  return new NextResponse(text, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse('ok', { headers: corsHeaders });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const payload = parsePayloadFromSearchParams(searchParams);
  return handleKosisRequest(payload);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const payload: KosisRequest = await request.json();
    return handleKosisRequest(payload);
  } catch {
    return jsonResponse({ error: 'invalid_json' }, 400);
  }
}
