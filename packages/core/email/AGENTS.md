# AGENTS Guide — `@beep/core-email`

## Purpose & Fit
- Provides the Effect-first foundation for transactional email delivery, pairing React Email templates with the Resend API adapter.
- Bridges secrets from `@beep/core-env` (`serverEnv.email.resend`) into an `Effect.Service`, ensuring downstream layers receive fully wired clients (`packages/core/email/src/adapters/resend/service.ts:8`).
- Exposes reusable authentication templates so IAM slice services (`@beep/iam-infra`) can render React JSX once and send via the shared Resend transport.
- Centralises tagged error modelling for email rendering and Resend responses, allowing consistent logging and telemetry across runtimes.

## Surface Map

| Module | Exports | Notes |
| --- | --- | --- |
| `src/renderEmail.ts` | `renderEmail`, `EmailTemplateRenderError` (via `src/errors.ts`) | Wraps `@react-email/render` inside `Effect.tryPromise`, tagging failures and logging (`packages/core/email/src/renderEmail.ts:6`). |
| `src/adapters/resend/service.ts` | `ResendService` | Effect service with generated accessors, span-aware `send` helper, and Resend client bootstrapping (`packages/core/email/src/adapters/resend/service.ts:7`). |
| `src/adapters/resend/errors.ts` | `ResendErrorSchema`, `ResendError`, `UnknownResendError`, `matchResendError` | Schema-backed refinement of Resend error payloads, mapping to tagged errors for downstream handling (`packages/core/email/src/adapters/resend/errors.ts:1`). |
| `src/components/auth-emails/*.tsx` | `InviteUserEmail`, `reactInvitationEmail`, `ResetPasswordEmail`, `reactResetPasswordEmail` | Authentication-centric templates implemented with `@react-email/components` and Tailwind styling primitives (`packages/core/email/src/components/auth-emails/invitation.tsx:1`). |
| `src/index.ts` | Package entrypoint | Re-exports adapters, components, and render helper for consumers (`packages/core/email/src/index.ts:1`). |

## Usage Snapshots
- `packages/iam/infra/src/adapters/better-auth/AuthEmail.service.ts:1` — imports `ResendService`, `renderEmail`, and React templates to compose the IAM auth email service.
- `packages/iam/infra/src/adapters/better-auth/AuthEmail.service.ts:57` — declares `ResendService.Default` as a dependency, showing how downstream services wire the adapter.
- `packages/iam/infra/src/adapters/better-auth/AuthEmail.service.ts:81` — renders the reset-password template through `renderEmail` before invoking `send`.
- `packages/iam/infra/src/adapters/better-auth/AuthEmail.service.ts:105` — renders the invitation template and demonstrates redaction of sensitive props.
- `packages/runtime/server/src/server-runtime.ts:2` — imports `ResendService` into the server runtime assembly.
- `packages/runtime/server/src/server-runtime.ts:85` — provides `ResendService.Default` into the server Layer graph, illustrating environment composition.

## Tooling & Docs Shortcuts
- `context7__get-library-docs`
  ```json
  {"context7CompatibleLibraryID":"/resend/react-email","topic":"components","tokens":1500}
  ```
- `effect_docs__get_effect_doc`
  ```json
  {"documentId":6115}
  ```
  ```json
  {"documentId":6116}
  ```
  ```json
  {"documentId":5872}
  ```
  ```json
  {"documentId":5581}
  ```
- Recommended repo scripts
  - `bunx turbo run lint --filter=@beep/core-email`
  - `bunx turbo run check --filter=@beep/core-email`
  - `bunx turbo run test --filter=@beep/core-email` or `cd packages/core/email && bun test`
  - `bunx turbo run build --filter=@beep/core-email` when shipping adapter changes

## Authoring Guardrails
- Maintain Effect namespace imports (`Effect`, `Layer`, `Redacted`, `S`, etc.) and avoid native array/string helpers per monorepo policy.
- Preserve `ResendService` observability: spans, `Effect.annotateLogs`, and `Effect.tapError` must stay intact so downstream metrics remain meaningful (`packages/core/email/src/adapters/resend/service.ts:19`).
- Always wrap Resend API calls with `matchResendError` to retain typed error channels; add new error literals to `ResendErrorSchema` when Resend extends its surface.
- Keep `EmailTemplateRenderError.operation` aligned with the calling workflow; update the hard-coded label in `renderEmail` when introducing new render call sites (`packages/core/email/src/renderEmail.ts:12`).
- Strip debugging side effects from React templates (e.g. remove the `console.log` in `reactInvitationEmail` before production usage, `packages/core/email/src/components/auth-emails/invitation.tsx:90`).
- Tailwind styles must remain email-client safe; prefer utility classes supported by React Email and test render output against MJML-incompatible constructs.
- When introducing new templates, define prop schemas (Effect Schema or `S.Class`) alongside React components to mirror how IAM payloads are validated.

## Quick Recipes

### Provision Resend in an Effect test
```ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import { ResendService } from "@beep/core-email";

const FakeResendLayer = Layer.succeed(ResendService, {
  resend: { emails: { send: () => Promise.resolve({ id: "test" }) } },
  send: () => Effect.succeed({ id: "test" }),
});

const smokeTest = Effect.gen(function* () {
  const { send } = yield* ResendService;
  const from = Redacted.make("no-reply@example.com");
  const to = Redacted.make("user@example.com");
  yield* send({
    from: Redacted.value(from),
    to: Redacted.value(to),
    subject: "Smoke test",
    html: "<p>ok</p>",
  });
});

Effect.runPromise(smokeTest.pipe(Effect.provide(FakeResendLayer)));
```

### Render and deliver a template
```ts
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { ResendService, renderEmail, reactResetPasswordEmail } from "@beep/core-email";

const sendReset = Effect.gen(function* () {
  const template = yield* renderEmail(
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
    react: template,
  });
});

Effect.runPromise(sendReset.pipe(Effect.provide(ResendService.Default)));
```

### Extend Resend error coverage
```ts
import * as S from "effect/Schema";
import { ResendErrorSchema } from "@beep/core-email/adapters/resend/errors";

const ExtendedSchema = S.Union(
  ResendErrorSchema,
  S.Struct({
    message: S.String,
    name: S.Literal("message_rejected"),
  })
);
```

## Verifications
- `bunx turbo run lint --filter=@beep/core-email`
- `bunx turbo run check --filter=@beep/core-email`
- `bunx turbo run test --filter=@beep/core-email` (or `bun test` within `packages/core/email`)
- `bunx turbo run build --filter=@beep/core-email` before publishing adapter changes

## Contributor Checklist
- [ ] Observe Effect namespace import conventions; never fall back to native Array/String helpers.
- [ ] Update `ResendErrorSchema` when the Resend API introduces new codes.
- [ ] Keep `renderEmail` operation metadata accurate for tracing.
- [ ] Ensure new templates avoid console side effects and rely on supported React Email/Tailwind features.
- [ ] Redact all secret-bearing fields (`from`, `to`, OTPs) before invoking `ResendService.send`.
- [ ] Run lint, check, and test scripts listed above prior to merging.
- [ ] Document new recipes or guardrails in this guide and cross-link from the root `AGENTS.md`.
