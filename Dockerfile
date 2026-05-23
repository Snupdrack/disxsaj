# ─── Raspados Didxsaj - Docker TODO-en-uno ───

FROM node:20-alpine AS base

# ─── Dependencies ───
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
COPY prisma ./prisma/

RUN npm install --legacy-peer-deps
RUN npx prisma generate

# ─── Builder ───
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runner ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# App construida
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# node_modules COMPLETO para migraciones y seed en runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Script de inicio
COPY --from=builder /app/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "start.sh"]