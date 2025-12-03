# --- Build ---
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN npm install -g pnpm

COPY . .
RUN pnpm install
RUN pnpm run build

# --- Runner ---
FROM node:20 AS runner

WORKDIR /app

# Solo copiar lo que realmente existe
COPY --from=builder /app/dist ./dist

# Servidor simple para producción
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]
