FROM node:20-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar arquivos de dependência do workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copiar packages (bibliotecas compartilhadas)
COPY packages ./packages

# Copiar worker app
COPY apps/worker ./apps/worker

# Instalar dependências (apenas produção)
RUN pnpm install --frozen-lockfile --prod

# Build do worker
WORKDIR /app/apps/worker
RUN pnpm run build

# Expor porta (se aplicável)
EXPOSE 3001

# Iniciar worker
CMD ["pnpm", "run", "start"]
