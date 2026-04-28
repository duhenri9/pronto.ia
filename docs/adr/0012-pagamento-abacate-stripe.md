# ADR-0012: Pagamento — Abacate Pay (Pix) + Stripe (Cartão/Internacional)

## Status

Approved · Phase 3

## Context

Pronto.IA needs payment processing for:
- **B2C Pro**: R$19/month subscription (Brazilian MEIs)
- **B2G Contract**: Municipal/state government contracts (large volumes)
- **B2B Partner**: SEBRAE/SENAC partnerships

The Brazilian payment landscape requires Pix as primary method (95%+ adoption among MEIs). International cards are needed for future expansion and B2G invoicing.

Mercado Pago was initially considered but discarded because:
- Poor developer experience and documentation
- Unreliable webhook delivery (our experience with AbacatePay shows this is a known pitfall)
- Abacate Pay offers better Pix-first experience with cleaner API
- Abacate Pay is a Brazilian startup focused on Pix — aligns with our MEI-first approach

## Decision

Use **Abacate Pay** for Pix payments (B2C and B2G domestic) and **Stripe** for card payments and international transactions.

| Provider | Method | Use Case |
|---|---|---|
| Abacate Pay | Pix | B2C Pro subscription, B2G domestic contracts |
| Stripe | Credit/Debit Card | International users, card-preferred customers |
| Stripe | Subscription Management | Recurring billing, trials, upgrades |

### Implementation Pattern

```typescript
// Factory pattern — same approach as WhatsApp provider
interface PaymentProvider {
  createCharge(params: CreateChargeParams): Promise<ChargeResult>;
  verifyWebhook(body: unknown, headers: Record<string, string>): Promise<boolean>;
  getChargeStatus(chargeId: string): Promise<ChargeStatus>;
}

// packages/payments/ (Phase 3 only)
```

### Why not just Stripe for everything?

Stripe Pix in Brazil exists but:
- Stripe Pix requires Stripe Brazil entity registration
- Abacate Pay Pix is faster to set up for pilot
- Abacate Pay has better Pix-specific features (Pix copia-e-colola, QR code generation)
- Cost: Abacate Pay ~1.99% per Pix transaction vs Stripe Pix ~3.99%

## Consequences

### Positive
- Pix-first approach matches Brazilian MEI payment behavior
- Lower transaction costs for domestic Pix payments
- Factory pattern allows switching providers without code changes
- Stripe handles complex subscription logic (trials, upgrades, downgrades)

### Negative
- Two payment providers = two webhook endpoints to secure
- Abacate Pay is a younger company — less established than Mercado Pago
- Need to maintain two provider integrations

### Mitigations
- Factory pattern abstracts provider differences
- Both webhooks use same dedup pattern (processed_events table already exists)
- ADR documents MERCADO_PAGO was discarded before production use — no migration needed

## Database Impact

`payment_provider` enum already updated from `MERCADO_PAGO` to `ABACATE`:
```sql
payment_provider = ['STRIPE', 'ABACATE', 'PIX', 'BANK_TRANSFER']
```

Note: `PIX` and `BANK_TRANSFER` remain as standalone values for manual/offline payment tracking in B2G contracts.

## References

- Abacate Pay documentation: https://docs.abacatepay.com
- Stripe Brazil: https://stripe.com/br
- Decision made by senior reviewer, 2025-04
- Implementation target: Phase 3 (after MVP validation)