# Suite A — MODEL_SPEC v1.3

## Mission
Shopify app (Polaris/Bridge) for Hardonia: listings, feeds, webhooks, billing, and admin UI.

## Inputs
- Shopify: SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_APP_URL, SHOPIFY_WEBHOOK_SECRET
- Billing: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- Observability (optional): SENTRY_DSN

## Outputs
- Signed app build, verified webhooks, Stripe billing functional
- Release artifacts via release-verify.yml

## Workflows
- release-verify.yml, secrets-watch.yml, ops-monitor.yml

## Guardrails
- HMAC verify Shopify calls; Stripe webhook signatures required.
