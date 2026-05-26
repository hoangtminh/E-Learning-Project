# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install ALL deps (including devDeps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client, then compile TypeScript
RUN npx prisma generate
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production image
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package manifests and install ONLY production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema & generated client (needed at runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

# Expose the application port
EXPOSE 8080

# Run database migrations then start the app
CMD ["node", "dist/main"]
