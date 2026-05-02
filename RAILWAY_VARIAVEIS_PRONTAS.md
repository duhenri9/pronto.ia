# Railway — Variáveis de Ambiente Prontas para Copiar e Colar

## ✅ 16 Variáveis Extraídas do .env

Copie cada linha abaixo e adicione uma por uma no Railway:

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
WHATSAPP_PROVIDER=zapi
NEXT_PUBLIC_BASE_URL=https://pronto-ia.vercel.app
```

---

## 📋 Checklist para Adicionar no Railway

Para cada variável acima:

1. ✅ Na dashboard Railway, clique no projeto `pronto.ia`
2. ✅ Selecione o serviço (railway detecta como `pronto-ia`)
3. ✅ Vá para "Variables" (ou "Settings" → "Variables")
4. ✅ Clique em "New Variable" ou "Add Variable"
5. ✅ Cole a variável exatamente como está acima
6. ✅ Clique "Save" ou "Add"
7. ✅ Repita para cada variável

---

## 🚀 Atalho: Adicionar Múltiplas de Uma Vez

Se Railway permitir, você pode colar todas as variáveis de uma vez (formato `.env`):

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

---

## ⚠️ IMPORTANTE

- **Não compartilhe** essas variáveis em chat/Slack/email público
- **Estas credenciais são de produção** — cuide bem
- Se alguém tiver acesso a Railway, tem acesso a tudo
- Se precisar regenerar, avise no Passo 1 da Fase 1

---

## ✅ Após Adicionar Todas as Variáveis

1. Clique em "Deploy" ou "Redeploy"
2. Acompanhe os logs
3. Procure por "Connected to database" ou mensagens de sucesso
4. Se houver erros, veja a seção de Troubleshooting do FASE2_DEPLOY_WORKER_RAILWAY.md

