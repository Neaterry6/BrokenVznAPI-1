# Multi-stage build for Node.js application
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev
WORKDIR /app

# Install all dependencies (including devDependencies for build)
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client and server
RUN npm run build

# Install only production dependencies for the runner
RUN rm -rf node_modules && npm ci --omit=dev --ignore-scripts

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

RUN apk add --no-cache cairo pango jpeg giflib librsvg pixman

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Start the server
CMD ["npm", "start"]