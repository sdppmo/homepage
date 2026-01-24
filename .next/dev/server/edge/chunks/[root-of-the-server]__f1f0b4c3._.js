(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f1f0b4c3._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/lib/config.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Application configuration
 * These values are safe to expose in the frontend
 */ __turbopack_context__.s([
    "config",
    ()=>config
]);
const config = {
    supabase: {
        url: 'https://iwudkwhafyrhgzuntdgm.supabase.co',
        anonKey: 'sb_publishable_6GvHywiSQrcVXGapyPwvBA_lh2A76OW'
    },
    protectedPaths: [
        '/pages/k-col web software/',
        '/pages/K-product/2H_steel_product.html',
        '/pages/admin.html'
    ]
};
}),
"[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateSession",
    ()=>updateSession
]);
/**
 * Supabase client for middleware usage
 * Uses @supabase/ssr for proper cookie handling in middleware
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/config.ts [middleware-edge] (ecmascript)");
;
;
;
async function updateSession(request) {
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["config"].supabase.url, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$config$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["config"].supabase.anonKey, {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>{
                    request.cookies.set(name, value);
                    supabaseResponse.cookies.set(name, value, options);
                });
            }
        }
    });
    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const { data: { user } } = await supabase.auth.getUser();
    // Return user and response for middleware to handle
    return {
        user,
        response: supabaseResponse
    };
}
}),
"[project]/src/lib/rate-limit.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * In-memory rate limiter
 * Limits requests per IP address
 */ __turbopack_context__.s([
    "clearAllRateLimits",
    ()=>clearAllRateLimits,
    "clearRateLimit",
    ()=>clearRateLimit,
    "getRateLimitStatus",
    ()=>getRateLimitStatus,
    "rateLimit",
    ()=>rateLimit
]);
const store = new Map();
// Cleanup old entries every 5 minutes
setInterval(()=>{
    const now = Date.now();
    for (const [ip, entry] of store.entries()){
        if (entry.resetAt < now) {
            store.delete(ip);
        }
    }
}, 5 * 60 * 1000);
function rateLimit(ip, limit = 10) {
    const now = Date.now();
    const windowMs = 1000; // 1 second window
    const entry = store.get(ip);
    if (!entry || entry.resetAt < now) {
        // New window
        store.set(ip, {
            count: 1,
            resetAt: now + windowMs
        });
        return true;
    }
    if (entry.count >= limit) {
        // Rate limit exceeded
        return false;
    }
    // Increment count
    entry.count++;
    return true;
}
function getRateLimitStatus(ip) {
    return store.get(ip) || null;
}
function clearRateLimit(ip) {
    store.delete(ip);
}
function clearAllRateLimits() {
    store.clear();
}
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/middleware.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/rate-limit.ts [middleware-edge] (ecmascript)");
;
;
;
const PROTECTED_PATTERNS = [
    '/k-col/auto-find-section',
    '/k-col/calculator',
    '/k-col/boq-report',
    '/k-col/user-guide',
    '/k-col/developer-guide',
    '/k-col/print',
    '/k-col/calc-data-1',
    '/k-col/calc-data-2',
    '/admin'
];
const BLOCKED_PATTERNS = [
    /^\/\.git/,
    /^\/\.env/,
    /\/wp-admin/,
    /\/wp-login/,
    /\.php$/
];
async function middleware(request) {
    const pathname = request.nextUrl.pathname;
    for (const pattern of BLOCKED_PATTERNS){
        if (pattern.test(pathname)) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"](null, {
                status: 404
            });
        }
    }
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$rate$2d$limit$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["rateLimit"])(ip, 10)) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Too Many Requests', {
            status: 429
        });
    }
    const { user, response } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["updateSession"])(request);
    const isProtectedRoute = PROTECTED_PATTERNS.some((pattern)=>pathname.startsWith(pattern));
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    }
    return response;
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f1f0b4c3._.js.map