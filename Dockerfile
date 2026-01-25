# ============================================================
# NEXT.JS 15 + BUN DOCKERFILE FOR AWS LIGHTSAIL
# ============================================================
# Multi-stage build optimized for minimal image size (<200MB)
# Security hardened with non-root user

# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM oven/bun:1.2 AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies (production + dev for build)
RUN bun install --frozen-lockfile

# ============================================================
# Stage 2: Builder
# ============================================================
FROM oven/bun:1.2 AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build-time environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (standalone output configured in next.config.ts)
RUN bun run build

# ============================================================
# Stage 3: Runner (Production)
# ============================================================
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Environment variable placeholders (set at runtime)
# These are required for Supabase integration
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ENV SUPABASE_SERVICE_ROLE_KEY=""

# ============================================================
# SECURITY: Create non-root user
# ============================================================
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# ============================================================
# Copy standalone build output
# ============================================================
# Copy public assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# ============================================================
# SECURITY: Set restrictive permissions
# ============================================================
RUN chmod -R 755 /app && \
    chown -R nextjs:nodejs /app

# ============================================================
# Container configuration
# ============================================================
LABEL maintainer="SongDoPartners" \
      version="2.0" \
      description="Next.js 15 + Bun production container" \
      security.privileged="false"

# Switch to non-root user
USER nextjs

# Expose port 3000 (Lightsail handles HTTPS termination)
EXPOSE 3000

# Set hostname for Next.js standalone server
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# ============================================================
# Health check for /health endpoint
# ============================================================
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# ============================================================
# Start Next.js standalone server with Bun
# ============================================================
CMD ["bun", "server.js"]
