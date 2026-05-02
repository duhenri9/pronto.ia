# Fase 2 — Deploy do Worker no Railway (Passo a Passo)

## 🎯 Objetivo
Fazer deploy do `apps/worker` (processador de mensagens e filas) no Railway, para que ele rode 24/7 processando requisições de WhatsApp, IA e banco de dados.

---

## 1️⃣ CRIAR CONTA NO RAILWAY

### Passo 2.1: Signup
1. Acesse: https://railway.app
2. Clique em "Sign up"
3. Escolha: **"Sign up with GitHub"** (conecta direto com seu GitHub)
4. Autorize o Railway a acessar seu GitHub
5. Escolha o email/organização para Railway

### Passo 2.2: Criar Novo Projeto
1. Na dashboard, clique em "+ New Project"
2. Escolha: **"Deploy from GitHub repo"**
3. Conecte o repositório: `duhenri9/pronto.ia`
4. Clique em "Deploy"
5. Railway vai fazer o primeiro deploy (pode falhar, é normal)

---

## 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE NO RAILWAY

### Passo 2.3: Acessar Settings do Projeto
1. Na dashboard do Railway, clique no projeto `pronto.ia`
2. Na esquerda, você verá os serviços:
   - `pronto-ia` (este é o serviço que Railway criou automaticamente)
3. Clique no serviço para acessar as configurações

### Passo 2.4: Adicionar Variáveis de Ambiente
1. Na página do serviço, vá para "Variables"
2. Adicione as seguintes variáveis (copie exatamente do seu `.env`):

```
DATABASE_URL=postgresql://neondb_owner:npg_0YVfcmXG5syU@ep-dark-sunset-ac7rlt0n-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

REDIS_URL=redis://default:gQAAAAAAAbm_AAIgcDE4YzFjZDZmNmMyYjM0ZGQ3YTNiMzUwMjRlNGIwZTIxMQ@humane-cod-113087.upstash.io:6379

ANTHROPIC_API_KEY=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

ZAPI_INSTANCE_ID=instance_3F284FBBE1B4B168A54306AF8374E24E

ZAPI_TOKEN=token_80B23ED013EA71A5409AB593

ZAPI_SECURITY_TOKEN=security_token_F0d1170c89ff2448187cff7d1ef9de543S

WHATSAPP_WEBHOOK_VERIFY_TOKEN=B19701F1AA4E28B1E3380C3A

RESEND_API_KEY=re_Kb1ghC1f_Q5MYDthQrxEsh9MC4CW1qA4r

JWT_SECRET=devsecret

COOKIE_SECRET=devcookie

ADMIN_SECRET=devadmin

SENTRY_DSN=https://b9ac9fd4406f94bd5e041a563f3af610@o4510347010768896.ingest.us.sentry.io/4511320432246784

SENTRY_AUTH_TOKEN=sntrys_placeholder

NODE_ENV=production
```

3. Clique em "Add Variable" para cada uma
4. Salve as mudanças

---

## 3️⃣ CONFIGURAR O BUILD E DEPLOY DO WORKER

### Passo 2.5: Especificar o Serviço a Deployar
Railway detecta automaticamente que é um monorepo com pnpm. Você precisa especificar que quer deployar apenas o `apps/worker`:

1. Na página do serviço, vá para "Settings"
2. Procure por "Root Directory" ou "Dockerfile"
3. Se não houver Dockerfile, Railway tentará rodar `pnpm install && pnpm run build`

### Passo 2.6: Criar/Atualizar railway.json (Opcional mas Recomendado)
Se quiser ter certeza, crie um arquivo `railway.json` na raiz do projeto:

```json
{
  "build": {
    "builder": "nix"
  }
}
```

E um `Dockerfile` em `apps/worker/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependency
COPY pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/worker ./apps/worker
COPY packages ./packages

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Build do worker
WORKDIR /app/apps/worker
RUN pnpm run build

# Executar worker
CMD ["pnpm", "run", "start"]
```

---

## 4️⃣ DEPLOY E MONITORAMENTO

### Passo 2.7: Triggar Deploy Manual
1. Na dashboard do Railway, vá para "Deployments"
2. Clique em "+ New Deployment"
3. Escolha a branch: `main`
4. Clique em "Deploy"
5. Acompanhe o progresso na aba "Build Logs"

### Passo 2.8: Verificar Logs
1. Após o deploy, clique em "Logs"
2. Procure por mensagens de erro
3. Se encontrar erros, leia o arquivo `Passo 2.10` abaixo

### Passo 2.9: Configurar Auto-Deploy
1. Na página do serviço, vá para "Settings"
2. Procure por "Auto Deploy"
3. Ative: "Deploy on push to main"
4. Agora, toda vez que você fizer push no GitHub, Railway faz deploy automaticamente

---

## ⚠️ TROUBLESHOOTING

### Erro: "Command not found: pnpm run start"
**Solução**: O arquivo `apps/worker/package.json` não tem um script `start`. Verifique:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

Se não tiver `start`, Railway pode usar `dev` ou `build` + `start`.

### Erro: "Database connection failed"
**Solução**: Verifique se `DATABASE_URL` e `REDIS_URL` estão corretos em Railway → Variables.

### Erro: "Port already in use"
**Solução**: O worker não precisa de porta. Se estiver tentando rodar um servidor HTTP, verifique se a aplicação está configurada corretamente.

---

## 📋 Checklist — O que Você Precisa Fazer

- [ ] Criar conta no Railway (railway.app)
- [ ] Conectar repositório GitHub `duhenri9/pronto.ia`
- [ ] Adicionar todas as variáveis de ambiente (16 variáveis)
- [ ] Criar Dockerfile em `apps/worker/Dockerfile` (se necessário)
- [ ] Triggar deploy manual
- [ ] Acompanhar logs até ver "Server started" ou similar
- [ ] Ativar Auto-Deploy para push automático

---

## 💰 Custo

- **Hobby Plan**: US$ 5/mês
- **1 GB RAM**: Grátis
- **Banco de Dados**: Não precisa (usa Neon + Upstash externo)

---

## ✅ Como Saber que o Deploy foi Bem-Sucedido

1. ✅ Build completado sem erros
2. ✅ Serviço está "Running" (status verde)
3. ✅ Logs mostram "Connected to database" ou "Worker started"
4. ✅ Não há mensagens de erro nos últimos 5 minutos

---

## 🚀 Próximos Passos

Após o worker estar rodando no Railway:
1. **Fase 3**: Deploy do Frontend no Vercel
2. **Fase 4**: Configurar webhook Z-API → Vercel
3. **Fase 5**: Testes end-to-end com WhatsApp real

---

## ⏱️ Tempo Estimado
- **Criar conta**: 2 minutos
- **Conectar repo**: 3 minutos
- **Configurar variáveis**: 5 minutos
- **Deploy**: 5-10 minutos
- **Validar**: 2 minutos

**Total**: ~20-25 minutos

---

## 📝 Notas Importantes

1. **Railway paga pelo uso**: Free tier dura 5 USD/mês. Após isso, você paga pelo tempo de execução.
2. **Worker roda 24/7**: Se quiser economizar, pode pausar de noite.
3. **Logs persistem**: Você consegue ver histórico de logs mesmo após parar o serviço.
4. **Variáveis de ambiente**: Railway permite múltiplas ambientes (prod, staging, dev).

