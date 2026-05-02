#!/bin/bash

# Script para extrair variáveis do .env e formatar para Railway
# Uso: bash railway-extract-vars.sh

echo "🚀 Extraindo variáveis de .env para Railway..."
echo ""

# Variáveis que precisam ir para Railway
VARS=(
  "DATABASE_URL"
  "REDIS_URL"
  "ANTHROPIC_API_KEY"
  "ZAPI_INSTANCE_ID"
  "ZAPI_TOKEN"
  "ZAPI_SECURITY_TOKEN"
  "WHATSAPP_WEBHOOK_VERIFY_TOKEN"
  "RESEND_API_KEY"
  "JWT_SECRET"
  "COOKIE_SECRET"
  "ADMIN_SECRET"
  "SENTRY_DSN"
  "SENTRY_AUTH_TOKEN"
  "WHATSAPP_PROVIDER"
  "NEXT_PUBLIC_BASE_URL"
)

# Adicionar NODE_ENV manualmente
echo "NODE_ENV=production"

# Extrair cada variável do .env
for var in "${VARS[@]}"; do
  value=$(grep "^$var=" .env | cut -d '=' -f 2-)
  if [ -n "$value" ]; then
    echo "$var=$value"
  else
    echo "⚠️  AVISO: $var não encontrada em .env"
  fi
done

echo ""
echo "✅ Variáveis extraídas!"
echo "📋 Copie a saída acima e adicione cada linha no Railway"
echo ""
echo "Para salvar em arquivo: bash railway-extract-vars.sh > railway-vars.txt"
