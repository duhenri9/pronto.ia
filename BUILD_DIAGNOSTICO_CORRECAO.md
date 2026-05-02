# 🔧 Diagnóstico e Correção de Build — Relatório

## 🚨 Erro Anterior
```
Error: Cannot find module '/app/apps/worker/dist/src/index.js'
```

---

## 🎯 Root Cause Analysis

### Problema 1: Path Incorreto no Start Command
```json
// ❌ ANTES (package.json)
"start": "node dist/src/index.js"

// ✅ DEPOIS
"start": "node dist/index.js"
```

**Razão:** O `tsconfig.json` está configurado assim:
```json
"rootDir": "./src",
"outDir": "./dist"
```

Com essa configuração:
- `src/index.ts` compila para `dist/index.js` (não `dist/src/index.js`)
- TypeScript preserva a estrutura interna de src/, mas a coloca na raiz de outDir

### Problema 2: Path Incorreto no Build Script (Prompts)
```json
// ❌ ANTES
"build": "tsc && copyfiles -u 2 ../../prompts/personas/*.md dist/src/prompts/personas/"

// ✅ DEPOIS
"build": "tsc && copyfiles -u 2 ../../prompts/personas/*.md dist/prompts/personas/"
```

**Mesma razão:** Os arquivos vão para `dist/prompts/` (raiz), não `dist/src/prompts/`

### Problema 3: Cache de Build Obsoleto (tsbuildinfo)
O arquivo `tsconfig.tsbuildinfo` estava velho e impedindo recompilação:
- Em novo build Docker, arquivo antigo causava skip da compilação
- Resultado: `dist/` ficava vazio, sem os .js compilados

**Solução no Dockerfile:**
```dockerfile
# Limpar cache antes de compilar
RUN pnpm run clean && rm -f tsconfig.tsbuildinfo
RUN pnpm run build
```

---

## ✅ Mudanças Aplicadas

### 1. `apps/worker/package.json`
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && copyfiles -u 2 ../../prompts/personas/*.md dist/prompts/personas/",
    "start": "node dist/index.js",  // ← CORRIGIDO
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run"
  }
}
```

### 2. `apps/worker/Dockerfile`
```dockerfile
# Stage 1: Builder
RUN pnpm install --frozen-lockfile
WORKDIR /app/apps/worker
RUN pnpm run clean && rm -f tsconfig.tsbuildinfo  # ← NOVO
RUN pnpm run build

# Stage 2: Production
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
RUN pnpm install --frozen-lockfile --prod
WORKDIR /app/apps/worker
CMD ["pnpm", "run", "start"]  # ← Agora aponta para dist/index.js correto
```

---

## 📊 Estrutura de Diretórios (Validada)

```
apps/worker/
├── src/
│   ├── index.ts          → compila para dist/index.js ✅
│   ├── core-logic.ts     → compila para dist/core-logic.js
│   ├── env.ts            → compila para dist/env.js
│   └── ... outros arquivos
├── tsconfig.json
├── package.json          # ← CORRIGIDO com paths certos
├── Dockerfile            # ← CORRIGIDO com cleanup de tsbuildinfo
└── dist/
    ├── index.js          ← START COMMAND APONTA AQUI
    ├── core-logic.js
    ├── env.js
    ├── prompts/
    │   └── personas/     ← Copiado via copyfiles
    └── ... outros arquivos compilados
```

---

## 🚀 Próximos Passos

### 1. Railway Detecta Push (automático)
- Railway monitora main branch
- Detecção em ~2-5 minutos
- Rebuild iniciará automaticamente

### 2. Monitorar Status
**URL**: https://dashboard.railway.app
**Projeto**: `sunny-light`

Status esperado:
1. 🟠 **Building** — Docker executando build
   - Stage 1: tsc compila, copyfiles copia prompts
   - Stage 2: copia dist/, instala --prod
2. 🟢 **Running** — Worker online

### 3. Validar nos Logs
Procure por (sinais de sucesso):
```
✅ Successfully built image
✅ Running container
✅ ENV] DATABASE_URL loaded
✅ Connected to database
✅ Worker started
```

Ou se houver erro:
```
❌ Error compiling TypeScript
❌ Cannot find module
❌ Runtime crash
```

---

## 📋 Checklist de Validação Local (Já Feito ✅)

- [x] Arquivo `dist/index.js` existe após build
- [x] `pnpm run start` pode executar (falha por falta ENV, mas arquivo existe ✅)
- [x] Prompts copiados para `dist/prompts/personas/`
- [x] package.json tem paths corretos
- [x] Dockerfile limpa tsbuildinfo antes de compilar

---

## 💡 Lições Aprendidas

1. **TypeScript rootDir/outDir**: Quando `rootDir: ./src` e `outDir: ./dist`, os arquivos compilam para a raiz de dist/, não em um subfolder
2. **Caching em Docker**: tsbuildinfo pode cachear builds antigos, sempre limpar antes de multi-stage builds
3. **COPY --from=builder**: Precisa copiar de caminho correto (relativo à stage anterior)

---

## ⏭️ Próximas Ações Após Deploy

1. **Worker rodando**: ✅ Completo
2. **Vercel Frontend**: ⏳ Aguardando worker ok
3. **Z-API Webhook**: ⏳ Aguardando Vercel
4. **E2E Tests**: ⏳ Aguardando webhook

---

**Commit**: `57cc122`  
**Status**: Railway rebuild pendente  
**ETA**: Build completo em ~10 minutos após detecção  
