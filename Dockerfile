# Imagen ligera de Node
FROM node:22-slim
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Dependencias
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

# Código
COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
