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
# Next.js inlines NEXT_PUBLIC_* into the client bundle while `next build` runs,
# so setting them only as runtime variables is not enough — the browser would
# receive empty strings and every auth call would fail with "Supabase не
# настроен". They must be declared as ARG here for the platform to pass them in.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_TELEMETRY_DISABLED=1

# A missing value here produces a bundle that looks fine and is silently broken,
# which is expensive to diagnose. Say so loudly in the build log instead.
RUN if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then \
      echo "=============================================================="; \
      echo "WARNING: NEXT_PUBLIC_SUPABASE_* not set at BUILD time."; \
      echo "Sign-in (including Google) will fail in the browser."; \
      echo "Set both as service variables so the builder receives them."; \
      echo "=============================================================="; \
    else \
      echo "Supabase public config present at build time."; \
    fi

RUN npm run build

# --- Runtime --------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind to all interfaces so Railway can reach the container. Next's standalone
# server.js reads HOSTNAME + PORT from the environment; Railway injects $PORT at
# runtime (overriding this default), and the server listens on 0.0.0.0:$PORT.
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output + static assets + public dir.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
