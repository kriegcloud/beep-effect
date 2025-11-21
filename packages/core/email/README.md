# @beep/core-email — Resend + React Email foundation

Effect-first email layer that renders React Email templates and sends via Resend with tagged error handling. It centralizes template rendering, redacted secret wiring, and transport telemetry so slices can deliver transactional mail without reimplementing adapters.

## Purpose and fit
- Expose `ResendService` as an Effect service with generated accessors and span-aware `send`.
- Render JSX templates through `renderEmail`, tagging failures with `EmailTemplateRenderError`.
- Share IAM-focused templates (invite, reset password) for reuse across runtimes.
- Normalize Resend API errors into schema-backed tagged errors for consistent logging.

## Public surface map
- `adapters/resend/service.ts` — `ResendService` default Layer and `send` helper.
- `adapters/resend/errors.ts` — `ResendErrorSchema`, `matchResendError`, tagged errors.
- `renderEmail.ts` — wraps `@react-email/render` in an Effect with logging and tags.
- `components/auth-emails/*` — React Email templates for auth flows.
- `index.ts` — package entrypoint re-exporting adapters, templates, and helpers.

## Quickstart — render and send
```ts
import { ResendService, renderEmail, reactResetPasswordEmail } from "@beep/core-email";
import { serverEnv } from "@beep/core-env/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

const ResendConfigured = Layer.provide(ResendService.Default, Layer.succeed(
  ResendService,
  serverEnv.email.resend
));

export const sendReset = Effect.gen(function* () {
  const html = yield* renderEmail(
    reactResetPasswordEmail({
      username: "Ada",
      resetLink: "https://example.com/reset?token=abc",
    })
  );

  const { send } = yield* ResendService;
  const from = Redacted.make("no-reply@example.com");
  const recipient = Redacted.make("ada@example.com");

  return yield* send({
    from: Redacted.value(from),
    to: Redacted.value(recipient),
    subject: "Reset your password",
    react: html,
  });
}).pipe(Effect.provide(ResendConfigured));
```

## Validation and scripts
- `bun run lint --filter @beep/core-email`
- `bun run check --filter @beep/core-email`
- `bun run test --filter @beep/core-email` (or `bun test` in `packages/core/email`)
- `bun run build --filter @beep/core-email`

## Notes and guardrails
- Use namespace imports for all Effect modules; avoid native array/string helpers.
- Keep `ResendService` spans, annotations, and error mapping intact so telemetry stays useful.
- Redact all secrets and addresses; unwrap with `Redacted.value` only at the call boundary.
- Extend `ResendErrorSchema` when Resend ships new error shapes.
- Templates must avoid console side effects and stick to React Email/Tailwind-safe primitives.
- See `packages/core/email/AGENTS.md` for deeper recipes and contributor checklists.
