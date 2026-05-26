# ─────────────────────────────────────────────────────────────
# Stage 1 — Builder (Debian, required for Prisma glibc binary)
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

# openssl is required by the Prisma query engine on Debian slim images
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --ignore-scripts skips postinstall ("prisma generate")
# because prisma/schema.prisma is not copied yet at this point
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Copy only what's needed for compilation (specific COPYs = better cache invalidation)
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
COPY prisma ./prisma

# Run all build steps atomically — prevents caching a broken intermediate state
RUN npx prisma generate && \
    NODE_OPTIONS="--max-old-space-size=1024" npm run build && \
    test -f dist/src/main.js || { echo "ERROR: dist/src/main.js missing after nest build"; exit 1; }

# Prune devDependencies in-place inside builder.
# This avoids a second npm install (with network call) in the runner stage.
RUN npm prune --production --ignore-scripts

# ─────────────────────────────────────────────────────────────
# Stage 2 — Production runner (no network calls needed)
# ─────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

# Same openssl needed at runtime by the Prisma client
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy pruned node_modules from builder (devDeps already removed, no download needed)
COPY --from=builder /app/node_modules  ./node_modules

# Compiled NestJS output
COPY --from=builder /app/dist ./dist

# Pre-generated Prisma client (re-copy to ensure it survives the prune)
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma   ./node_modules/@prisma

# Prisma schema (needed by some Prisma runtime features)
COPY prisma ./prisma

# package.json needed by some Node.js module resolution at runtime
COPY package.json ./

EXPOSE 8080

# Use absolute path to avoid any working-directory ambiguity
CMD ["node", "/app/dist/src/main.js"]

