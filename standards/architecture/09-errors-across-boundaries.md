# 09 — Errors across boundaries

Each hexagonal boundary translates errors. Driver errors die in the adapter; port errors die in the use-case service; application errors die in the protocol handler. The only failures crossing a boundary are the ones declared in that boundary's signature.

## 1. Taxonomy

Four kinds of failure live in the slice. Each has a fixed home and a fixed translator.

- **Actionable domain failures.** Defined in `domain/<concept>/<Concept>.errors.ts` as `S.TaggedErrorClass`. The use-case caller is expected to branch on them. Membership: `MembershipNotFound`, `MembershipAlreadyRevoked`, `UnauthorizedRevoker`.
- **Actionable application failures.** Defined in `use-cases/<Concept>/<Concept>.errors.ts` as `S.TaggedErrorClass`. The protocol caller (HTTP handler, RPC handler, UI atom) is expected to branch on them. Membership: `MembershipRevocationFailed`, `MembershipRevocationDenied`. Often a 1:1 with domain failures, but may compose multiple.
- **Internal failures.** Driver errors, network errors, deserialization errors, anything technical. These die at the boundary; they MUST NOT reach use-case callers as themselves.
- **Boundary protocol failures.** HTTP/RPC translation: actionable application failures map to `400`/`403`/`404`/`409` problem-detail bodies; internals map to `500` with a correlation ID and structured log.

```
domain          actionable domain errors        (in domain/.errors.ts)
   ↓ caller branches
use-cases       actionable application errors   (in use-cases/.errors.ts)
   ↓ caller branches
boundary        protocol shape (400/403/500 + body)
```

The arrow is always a translation, never a passthrough. A failure that escapes its declaration as itself is a doctrine violation (see section 6).

## 2. Translation contract

Three rules, one per boundary.

- **Server adapters translate driver errors -> port-declared errors.** A `MembershipRepository.findById` port declares `MembershipNotFound | RepositoryUnavailable` failures. The Drizzle adapter implementing it catches `PostgresError` and returns one of those declared errors. Driver errors do not escape the adapter.
- **Use-case services translate port errors -> actionable application errors.** `MembershipService.revoke` catches the port's `MembershipNotFound` and rethrows as `MembershipRevocationDenied` — an application-level meaning the protocol caller can branch on.
- **HTTP/RPC handlers translate actionable application errors -> protocol shape.** `Membership.http-handlers.ts` matches on the application errors and returns `403` for denials, `404` for not-found, etc. Anything not branched on hits a default `500` branch with a correlation ID.

A handler must never branch on a port error. A use-case must never branch on a driver error. If you need to, you have skipped a translator.

## 3. Naming convention

- For non-trivial translations, the translation lives in a `<Concept>.error-translation.ts` role file in the same package as the consumer: server-side adapter translations in `server`, HTTP translations alongside the handler files, etc.
- For single-call-site translations, inline `Effect.mapError` or `Effect.catchTag` is fine.
- The translation function shape: `(input: SourceError) => TargetError`. Pure. No Effects required — translation has no side effects. Logging the original is a separate concern wired around the translator (see section 6).

The presence of an `error-translation.ts` file is a signal that the translation has interesting policy. Inline translation is a signal that it does not.

## 4. Ports declare only actionable errors

A port's signature is `Effect.Effect<Result, Failures, never>`. `Failures` is a union of `S.TaggedErrorClass` types declared in the port file alongside the port. Internal/technical errors are NOT in this union. They die in the adapter.

This rule is what lets use-cases write `Effect.catchTags` exhaustively against a fixed set of failures — the union is closed and authored at the port. If a new technical mode appears in the adapter, it must either be translated to an existing port-declared error or motivate a new port-declared error and an explicit handler update.

`R` stays `never` at the port boundary. Live requirements (FileSystem, PostgresClient, etc.) are introduced when the adapter Layer is composed, not declared in the port type.

## 5. Worked example: revoking a membership

The full chain. Each block is one boundary.

### a) Driver-level error (no translation yet)

```ts
// packages/drivers/postgres/src/Postgres.errors.ts (excerpt)
import * as S from "effect/Schema"
import { TaggedErrorClass } from "@beep/schema"

export class PostgresError extends TaggedErrorClass<PostgresError>(
  "@beep/postgres/Postgres.errors/PostgresError"
)(
  "PostgresError",
  {
    operation: S.String,
    message: S.OptionFromOptionalKey(S.String),
    sqlState: S.OptionFromOptionalKey(S.String),
    query: S.OptionFromOptionalKey(S.String)
  },
  {
    title: "Postgres Error",
    description: "Technical Postgres driver failure scoped to a driver operation."
  }
) {}
```

This error is technical. It lives in the driver package and is invisible to anyone above the adapter.

### b) Port-declared errors (in use-cases)

```ts
// packages/iam/use-cases/src/Membership/Membership.errors.ts
import * as S from "effect/Schema"
import { MembershipId } from "@beep/iam-domain/Membership"

export class MembershipNotFound extends S.TaggedErrorClass<MembershipNotFound>(
  "@beep/iam-use-cases/Membership/MembershipNotFound"
)(
  "MembershipNotFound",
  { membershipId: MembershipId },
  {
    title: "Membership Not Found",
    description: "The requested membership does not exist."
  }
) {}

export class RepositoryUnavailable extends S.TaggedErrorClass<RepositoryUnavailable>(
  "@beep/iam-use-cases/Membership/RepositoryUnavailable"
)(
  "RepositoryUnavailable",
  { reason: S.String },
  {
    title: "Repository Unavailable",
    description: "The membership repository is temporarily unreachable."
  }
) {}
```

The port's `findById` then declares `Effect.Effect<Membership, MembershipNotFound | RepositoryUnavailable>`. That union is the closed contract every adapter must honor.

### c) Adapter translation (server-side)

```ts
// packages/iam/server/src/Membership/Membership.repo.ts
import { Effect, pipe } from "effect"
import { PostgresError } from "@beep/postgres"
import { MembershipNotFound, RepositoryUnavailable } from "@beep/iam-use-cases/Membership"

const findById = (id: MembershipId): Effect.Effect<Membership, MembershipNotFound | RepositoryUnavailable> =>
  pipe(
    runDrizzleQuery(id), // returns Effect.Effect<Membership, PostgresError>
    Effect.catchTag("PostgresError", (e) =>
      e.sqlStateName._tag === "Some" && e.sqlStateName.value === "NO_DATA"
        ? Effect.fail(new MembershipNotFound({ membershipId: id }))
        : Effect.fail(new RepositoryUnavailable({ reason: e.operation }))
    )
  )
```

`PostgresError` is consumed inside the adapter and never re-emitted. The compiler now refuses to let `PostgresError` reach the use-case.

### d) Application-level translation (use-case)

```ts
// packages/iam/use-cases/src/Membership/Membership.service.ts
import { Effect } from "effect"
import {
  MembershipRevocationDenied,
  MembershipRevocationFailed
} from "@beep/iam-use-cases/Membership"

const revoke = Effect.fn("Membership.revoke")(function* (cmd: RevokeMembership) {
  const m = yield* repo.findById(cmd.membershipId).pipe(
    Effect.catchTag("MembershipNotFound", (e) =>
      Effect.fail(
        new MembershipRevocationDenied({ reason: "not_found", membershipId: e.membershipId })
      )
    ),
    Effect.catchTag("RepositoryUnavailable", () =>
      Effect.fail(new MembershipRevocationFailed({ reason: "infrastructure" }))
    )
  )
  // ... rest of the use-case: invariant checks, state transition, persist, emit event
  return m
})
```

The use-case never names a port error in its return type. The application-level union (`MembershipRevocationDenied | MembershipRevocationFailed | ...`) is what the handler will see.

### e) Protocol translation (HTTP handler)

```ts
// packages/iam/server/src/Membership/Membership.http-handlers.ts
import { Effect } from "effect"
import { problemDetail } from "@beep/http-problem-detail"

const handler = (cmd: RevokeMembership, correlationId: string) =>
  service.revoke(cmd).pipe(
    Effect.catchTags({
      MembershipRevocationDenied: (e) =>
        Effect.succeed(
          problemDetail({
            status: 403,
            type: "membership/denied",
            detail: e.reason,
            correlationId
          })
        ),
      MembershipRevocationFailed: (e) =>
        Effect.zipRight(
          Effect.logError("membership.revoke failed", { reason: e.reason, correlationId }),
          Effect.succeed(
            problemDetail({ status: 500, type: "internal", correlationId })
          )
        )
    })
  )
```

`Effect.catchTags` is exhaustive against the application-error union. The handler's return type is the protocol response — no application error escapes.

The exact transport helper (`problemDetail`, JSON shape, status mapping table) is defined once per protocol stack and reused. It is not invented per handler.

## 6. The "internal failure dies at the boundary" rule

A failure that escapes its boundary as itself is a doctrine violation. Concretely:

- A `PostgresError` returned by a port: violation. The adapter must translate.
- A `MembershipNotFound` (port-level) returned by a use-case service: violation. The service must translate to an application error.
- A `RepositoryUnavailable` reaching an HTTP body: violation. The handler must convert to `500` with a correlation ID and log the original via `Effect.logError`.

Two corollaries follow.

- **Logging is the dual of translation.** When a translator drops information (driver stack trace, SQL, retry count) it logs that information at the boundary it dies in. The translator returns a thin actionable error; the surrounding `Effect.tapError` or `Effect.catchTag` body emits the structured log. The two halves are co-located so the dropped detail is never lost — it is just not in the public error surface.
- **Defects are not failures.** `Effect.die` is reserved for invariant violations the program cannot recover from (impossible state, broken assumption). Defects bypass translation by design and surface as `500` with a different log level. If a translator needs to emit `Effect.die`, the precondition that produced the unexpected case is what to fix — not the translator.

The only failures crossing each boundary are the ones declared in that boundary's signature. The signature is the contract; everything else is implementation.

## See also

- `03-driver-boundaries.md` — where adapter translation lives (driver vs. server vs. tables responsibilities).
- `04-rich-domain-model.md` — the "Forbidden Effect dependencies" subsection: domain errors are `S.TaggedErrorClass`, not raw `Error`, and never carry transport details.
- `08-testing.md` — testing error paths: each translator has a test that asserts the source error becomes the expected target error.
