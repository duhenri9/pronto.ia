# 🚀 Railway — Adicionar Variáveis via Dashboard (Super Rápido)

## Status Atual
✅ Projeto `sunny-light` linkado no Railway
✅ Autenticação confirmada
⏳ Próximo: Criar serviço e adicionar variáveis

---

## 📋 Passo 1: Acessar Dashboard Railway

1. Vá para: https://dashboard.railway.app
2. Você deve ver o projeto: **`sunny-light`**
3. Se não ver, clique em "New" e escolha "Deploy from GitHub repo"
4. Selecione: `duhenri9/pronto.ia`

---

## 📋 Passo 2: Criar o Serviço do Worker

Após conectar o repo, Railway vai detectar que é um monorepo. Você precisa especificar que quer fazer deploy do **worker**:

**Opção A: Se Railway perguntar qual diretório fazer deploy**
- Escolha: `apps/worker` ou deixe em branco (vai usar root)

**Opção B: Se não perguntar**
1. Na dashboard, clique em "+ New Service"
2. Escolha: "GitHub repo" → `duhenri9/pronto.ia`
3. Clique em "Deploy"

---

## 📋 Passo 3: Adicionar Variáveis de Ambiente (No Dashboard)

### A. Acessar as Variáveis

1. Na dashboard, clique no projeto `sunny-light`
2. Clique no serviço (pode ter qualquer nome, geralmente `pronto-ia` ou similar)
3. Na barra lateral esquerda, procure por:
   - **"Variables"** ou
   - **"Settings" → "Variables"** ou
   - **"Configuration" → "Environment"**

### B. Adicionar as Variáveis

Você verá um campo para adicionar variáveis. Tem duas opções:

#### **Opção 1: Copiar/Colar Tudo de Uma Vez (Mais Rápido)**

Se houver um botão tipo "Import from file", "Paste variables" ou similar:
1. Clique nele
2. Cole o bloco abaixo (completo):

```env
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
WHATSAPP_PROVIDER=zapi
NEXT_PUBLIC_BASE_URL=https://pronto-ia.vercel.app
```

3. Clique em "Import" ou "Add"

#### **Opção 2: Adicionar Uma por Uma (Manual, Mais Demorado)**

1. Clique em "New Variable" ou "+ Add"
2. Para cada variável abaixo, preencha:
   - **Key**: `DATABASE_URL` (exatamente como está)
   - **Value**: `postgresql://neondb_owner:...` (o valor inteiro)
3. Clique "Save" ou "Add"
4. Repita para cada variável

**Variáveis na Ordem:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_0YVfcmXG5syU@ep-dark-sunset-ac7rlt0n-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `REDIS_URL` | `redis://default:gQAAAAAAAbm_AAIgcDE4YzFjZDZmNmMyYjM0ZGQ3YTNiMzUwMjRlNGIwZTIxMQ@humane-cod-113087.upstash.io:6379` |
| `ANTHROPIC_API_KEY` | `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` |
| `ZAPI_INSTANCE_ID` | `instance_3F284FBBE1B4B168A54306AF8374E24E` |
| `ZAPI_TOKEN` | `token_80B23ED013EA71A5409AB593` |
| `ZAPI_SECURITY_TOKEN` | `security_token_F0d1170c89ff2448187cff7d1ef9de543S` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | `B19701F1AA4E28B1E3380C3A` |
| `RESEND_API_KEY` | `re_Kb1ghC1f_Q5MYDthQrxEsh9MC4CW1qA4r` |
| `JWT_SECRET` | `devsecret` |
| `COOKIE_SECRET` | `devcookie` |
| `ADMIN_SECRET` | `devadmin` |
| `SENTRY_DSN` | `https://b9ac9fd4406f94bd5e041a563f3af610@o4510347010768896.ingest.us.sentry.io/4511320432246784` |
| `SENTRY_AUTH_TOKEN` | `sntrys_placeholder` |
| `NODE_ENV` | `production` |
| `WHATSAPP_PROVIDER` | `zapi` |
| `NEXT_PUBLIC_BASE_URL` | `https://pronto-ia.vercel.app` |

---

## 📋 Passo 4: Deploy

1. Após adicionar todas as variáveis, clique em **"Deploy"** ou **"Redeploy"**
2. Railway vai:
   - Detectar o Dockerfile em `apps/worker/`
   - Build a imagem Docker
   - Fazer deploy do worker

3. Acompanhe os logs (deve aparecer "Deployment started")

---

## ✅ Checklist Final

- [ ] Acessei https://dashboard.railway.app
- [ ] Selecionei o projeto `sunny-light`
- [ ] Vi o serviço do pronto.ia
- [ ] Fui para "Variables"
- [ ] Adicionei as 16 variáveis (colei tudo ou manualmente)
- [ ] Cliquei "Deploy" ou "Redeploy"
- [ ] Acompanhei os logs até ver sucesso

---

## 🎯 Depois do Deploy

Quando o deploy terminar com sucesso:
1. Status deve ficar **"Running"** (verde)
2. Logs devem mostrar: `Connected to database` ou `Worker started`
3. Sem erros nos últimos 5 minutos

Se vir um erro, me avisa que ajudo!

---

## 🚀 Próximo Passo

Após o worker estar rodando → **Fase 3**: Deploy do Frontend no Vercel (30 minutos)

