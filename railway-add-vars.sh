#!/usr/bin/env bash

# Script para adicionar variáveis no Railway via CLI (quando o serviço estiver pronto)
# Uso: bash railway-add-vars.sh

echo "🚀 Adicionando variáveis no Railway..."

# Selecionar o serviço
railway service

# Adicionar variáveis
railway variables set \
  DATABASE_URL="postgresql://neondb_owner:npg_0YVfcmXG5syU@ep-dark-sunset-ac7rlt0n-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  REDIS_URL="redis://default:gQAAAAAAAbm_AAIgcDE4YzFjZDZmNmMyYjM0ZGQ3YTNiMzUwMjRlNGIwZTIxMQ@humane-cod-113087.upstash.io:6379" \
  ANTHROPIC_API_KEY="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" \
  ZAPI_INSTANCE_ID="instance_3F284FBBE1B4B168A54306AF8374E24E" \
  ZAPI_TOKEN="token_80B23ED013EA71A5409AB593" \
  ZAPI_SECURITY_TOKEN="security_token_F0d1170c89ff2448187cff7d1ef9de543S" \
  WHATSAPP_WEBHOOK_VERIFY_TOKEN="B19701F1AA4E28B1E3380C3A" \
  RESEND_API_KEY="re_Kb1ghC1f_Q5MYDthQrxEsh9MC4CW1qA4r" \
  JWT_SECRET="devsecret" \
  COOKIE_SECRET="devcookie" \
  ADMIN_SECRET="devadmin" \
  SENTRY_DSN="https://b9ac9fd4406f94bd5e041a563f3af610@o4510347010768896.ingest.us.sentry.io/4511320432246784" \
  SENTRY_AUTH_TOKEN="sntrys_placeholder" \
  NODE_ENV="production" \
  WHATSAPP_PROVIDER="zapi" \
  NEXT_PUBLIC_BASE_URL="https://pronto-ia.vercel.app"

echo "✅ Variáveis adicionadas!"
echo "🚀 Agora faça o deploy com: railway up"
