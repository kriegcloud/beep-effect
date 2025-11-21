# @beep/core-env — canonical config loaders

Effect-based environment loaders for server and client runtimes. Secrets are redacted, naming is enforced through `ConfigProvider.constantCase`, and both runtimes share typed schemas so slices compose configuration uniformly.

## Purpose and fit
- `serverEnv` resolves all sensitive configuration once and returns redacted values for runtimes, adapters, and slices.
- `clientEnv` validates the `NEXT_PUBLIC_*` surface before React boot so UI code reads typed flags only.
- Helpers (`isPlaceholder`, `withPlaceholderRedacted`) keep placeholder secrets safe during local scaffolding.
- Shared factories (`ConfigURL`, `ConfigArrayURL`) standardize URL handling while preserving immutability.

## Public surface map
- `src/server.ts` — `ServerConfig`, `serverEnv`, placeholder helpers, and constant-case provider wiring.
- `src/client.ts` — `ClientEnvSchema`, `clientEnv`, and auth provider parsing.
- `src/common.ts` — URL helpers for single and array URL configs.

## Quickstart — consume serverEnv safely
```ts
import { isPlaceholder, serverEnv } from "@beep/core-env/server";
import * as Effect from "effect/Effect";

export const ensureStripeConfigured = Effect.gen(function* () {
  const secret = serverEnv.payment.stripe.key;
  if (isPlaceholder(secret)) {
    return yield* Effect.dieMessage(
      "Replace placeholder Stripe secret before enabling payments"
    );
  }
  return secret;
});
```

## Quickstart — add a nested config branch
```ts
import * as Config from "effect/Config";
import * as F from "effect/Function";
import * as A from "effect/Array";

const BillingConfig = Config.nested("BILLING")(
  Config.all({
    apiKey: Config.redacted("API_KEY"),
    webhookSecrets: Config.array(Config.redacted("WEBHOOK_SECRETS")),
  })
).pipe(
  Config.map((config) => ({
    apiKey: config.apiKey,
    webhookSecrets: F.pipe(
      config.webhookSecrets,
      A.map((secret) => secret)
    ),
  }))
);

// Provide BillingConfig into ServerConfig and expose from serverEnv.
```

## Validation and scripts
- `bun run lint --filter @beep/core-env`
- `bun run check --filter @beep/core-env`
- `bun run test --filter @beep/core-env` (when tests are present)
- `bun run build --filter @beep/core-env` if publishing a change

## Notes and guardrails
- Never read `process.env` outside `clientEnv`/`ServerConfig`; route all env additions through schemas.
- Redact every secret and keep placeholder semantics intact for `.env.example`.
- Maintain constant-case naming via `ConfigProvider.constantCase`; avoid ad-hoc casing helpers.
- Replace native array/string/object helpers with Effect utilities when touching env code.
- Update downstream docs and `.env.example` when adding or renaming variables.
- See `packages/core/env/AGENTS.md` for deeper recipes, consumer snapshots, and contributor checklists.
