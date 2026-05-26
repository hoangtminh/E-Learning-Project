# ─────────────────────────────────────────────────────────────
# Stage 1 — Dependencies
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ─────────────────────────────────────────────────────────────
# Stage 2 — Builder
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time by Next.js
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN NODE_OPTIONS="--max-old-space-size=1024" npm run build

# ─────────────────────────────────────────────────────────────
# Stage 3 — Production runner (Next.js standalone)
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Static assets
COPY --from=builder /app/public ./public

# Next.js standalone bundle (requires output: "standalone" in next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

USER nextjs

EXPOSE 3000

# Print real production URL dynamically from environment in the logs, then start standalone server
CMD ["sh", "-c", "echo \"\\n▲ Next.js 16.2.6\\n- Local:         http://localhost:3000\\n- Production:    ${FRONTEND_URL:-https://elearning.nampham.id.vn}\\n✓ Ready in 0ms\\n\" && PORT=3000 node server.js"]
