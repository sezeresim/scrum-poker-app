# Base image
FROM node:22.3.0-slim as base


WORKDIR /app

ENV NODE_ENV="production"

ARG PNPM_VERSION=9.4.0
RUN npm install -g pnpm@$PNPM_VERSION

# Dependencies stage
FROM base as dependencies

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Build stage
FROM dependencies as build

COPY . .
RUN pnpm run build

# Production stage
FROM node:22.3.0-slim

WORKDIR /app

ENV NODE_ENV="production"

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 8080

CMD ["node", "dist/main"]