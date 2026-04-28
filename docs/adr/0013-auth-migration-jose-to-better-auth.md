# ADR-0013: Substituir jose por Better Auth quando base > 500 usuários

## Status

Proposed · 28/abr/2026

## Contexto

Auth atual usa `jose` com JWT manual (HS256). Funciona pro MVP mas não provê:

- **Social login**: Google e WhatsApp são os canais naturais de entrada para MEIs brasileiros
- **2FA**: Requerido por contratos B2G (prefeituras exigem autenticação robusta)
- **Rate limiting**: No endpoint de login — vulnerável a brute force
- **Sessão revogável server-side**: JWT HS256 não pode ser revogado sem infra adicional
- **RBAC built-in**: Current role check is manual string comparison

O auth caseira com jose é **tech debt reconhecido e documentado**. Não é um bug — é uma decisão consciente de simplicidade para o MVP.

## Decisão

Migrar para **Better Auth** quando:

1. Base ativa passar de **500 usuários**, OU
2. Primeiro cliente B2G exigir **2FA**

Better Auth é uma auth library para Node.js que oferece:
- Social login (Google, WhatsApp)
- 2FA (TOTP, email verification)
- Session management (server-side, revogável)
- RBAC com roles e permissions
- Adapter para Drizzle ORM
- Open source, self-hosted

## Quando executar

| Gatilho | Prioridade | Quem decide |
|---|---|---|
| 500 usuários ativos | P1 | Tech lead |
| Primeiro contrato prefeitura | P0 | Business + Tech |
| Brute force incident detectado | P0 | Security |

## Migration Path

1. Instalar Better Auth + Drizzle adapter
2. Migrar schema: `passwordHash` → Better Auth tables
3. Migrar `signToken/verifyToken` → Better Auth session management
4. Adicionar social login providers (Google, WhatsApp)
5. Adicionar rate limiting no login endpoint
6. Remover `packages/auth` com jose

**Duração estimada**: 1-2 dias de trabalho concentrado.

## Consequences

### Se não migrar
- JWT não-revogável = risco de segurança em escala
- Sem social login = friction alto para MEIs que usam WhatsApp
- Sem 2FA = não elegível para contratos B2G

### Se migrar prematuramente
- Over-engineering para <500 usuários
- Better Auth adds complexity (session tables, adapter config)
- Risk of migration bugs when user data exists

## References

- Better Auth: https://better-auth.com
- jose (current): https://github.com/panva/jose
- packages/auth/src/index.ts — current implementation