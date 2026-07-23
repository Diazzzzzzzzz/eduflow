# syntax=docker/dockerfile:1
# Multi-stage build for Next.js (standalone output). Produces a minimal
# production image suitable for Railway, Fly, or any container host.

FROM node:22-alpine AS base
WORKDIR /app

# --- Dependencies (cached unless lockfile changes) ------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# --- Build ----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Guarantee public/ exists so the runtime COPY never fails, even if the repo
# ships without static assets.
RUN mkdir -p public
# Public Supabase vars are baked into the client bundle at build time. Pass
# them as build args on Railway if you want them inlined; the server also reads
# them at runtime from the environment.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime --------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Railway provides $PORT; Next standalone server reads PORT/HOSTNAME.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output + static assets + public dir.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
