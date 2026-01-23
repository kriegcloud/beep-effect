# AGENTS Guide — `@beep/iam-client`

## Purpose & Fit

`@beep/iam-client` is the typed contract layer that bridges Better Auth's React client with Effect-first flows across the
repo. The package centers on contract schemas plus thin Effect implementations using `wrapIamMethod`. UI slices
(`packages/iam/ui`, `apps/web`) consume these contracts directly through runtime helpers, while adapters keep raw
Better Auth usage isolated to this workspace.

## Surface Map

- **Root exports (`src/index.ts`)** — expose `AuthClient` type and `AuthCallback` utilities for callback URL sanitization.
- **Adapters (`src/adapters/better-auth/*`)** — instantiate the Better Auth React client with all required plugins
  (`client.ts`) and wrap provider errors (`errors.ts`). `$store` and client methods are re-exported for guards that need to
  bind to session state.
- **Core (`src/core/*`)** — session management and sign-out handlers.
- **Sign-In (`src/sign-in/*`)** — email and username sign-in handlers with contract schemas.
- **Sign-Up (`src/sign-up/*`)** — email sign-up handler with password confirmation validation.
- **Password (`src/password/*`)** — change, request-reset, and reset password handlers.
- **Two-Factor (`src/two-factor/*`)** — enable, disable, TOTP, OTP, and backup code handlers.
- **Organization (`src/organization/*`)** — CRUD, invitations, and members handlers.
- **Multi-Session (`src/multi-session/*`)** — list, revoke, and set-active session handlers.
- **Email Verification (`src/email-verification/*`)** — send verification email handler.
- **Internal (`src/_internal/*`)** — shared utilities: `wrapIamMethod` factory, error handling, schemas, and runtime helpers.
- **Tests (`test/`)** — test suites for IAM client functionality.

## Usage Snapshots

- Dashboard layouts pipe sign-out contracts through atoms + `withToast` to power sign-out flows while refreshing the runtime.
- Auth guards import the Better Auth `client`, trigger `$store.notify("$sessionSignal")` on mount, and redirect when sessions disappear.
- Guest guards combine `AuthCallback.getURL` with `client.useSession()` to keep signed-in users away from guest-only pages.
- Sign-in forms and sibling components consume contract implementations to build runtime-powered atoms that surface toast + navigation.
- Verification forms use contract implementations directly, showing how UI forms should bind to contract sets.

## Related Documentation

- `packages/common/schema/AGENTS.md` — canonical reference for Effect Schema patterns and primitives used throughout IAM schemas.
- `packages/iam/domain/AGENTS.md` — canonical reference for IAM domain entities that client schemas MUST align with.
- `documentation/patterns/iam-client-patterns.md` — full pattern reference for contracts, handlers, services, and layers.

## EntityId Alignment (MANDATORY)

**CRITICAL**: All IAM client schemas MUST use branded EntityIds from `@beep/shared-domain` and align with domain entities in `@beep/iam-domain`.

### Common Schemas (`_common/*.schema.ts`)

```typescript
// REQUIRED - Use branded EntityIds
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,
  organizationId: SharedEntityIds.OrganizationId,
  userId: SharedEntityIds.UserId,
  roleId: IamEntityIds.RoleId,
  // ...
}) {}
```

```typescript
// FORBIDDEN - Plain string IDs break type safety
export class Member extends S.Class<Member>($I`Member`)({
  id: S.String,  // ❌ Missing branded EntityId!
  organizationId: S.String,  // ❌ Missing branded EntityId!
}) {}
```

### Contract Payloads with EntityIds

Contract payloads MUST use branded EntityIds:

```typescript
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: SharedEntityIds.UserId,
    teamId: SharedEntityIds.TeamId,
  },
  formValuesAnnotation({
    userId: "",
    teamId: "",
  })
) {}
```

### EntityId Creation and Validation

Use EntityId schema methods - NEVER use type casting:

```typescript
// Create a new ID
const memberId = IamEntityIds.MemberId.create();

// Validate a plain string
const validatedId = SharedEntityIds.UserId.make(rawString);

// Check if value is valid EntityId
if (IamEntityIds.MemberId.is(value)) { ... }
```

### Transformation Schemas (REQUIRED)

When mapping Better Auth responses to domain entities, ALWAYS create transformation schemas in `_internal/*.schemas.ts`:

**Pattern**: `Domain<Entity>FromBetterAuth<Entity>`

**Canonical Example**: See `_internal/user.schemas.ts` for `DomainUserFromBetterAuthUser`.

#### Transformation Schema Coverage

| Entity | Better Auth Schema | Transformation Schema | Domain Model | File |
|--------|-------------------|----------------------|--------------|------|
| User | `BetterAuthUserSchema` | `DomainUserFromBetterAuthUser` | `User.Model` | `_internal/user.schemas.ts` |
| Session | `BetterAuthSessionSchema` | `DomainSessionFromBetterAuthSession` | `Session.Model` | `_internal/session.schemas.ts` |
| Member | `BetterAuthMemberSchema` | `DomainMemberFromBetterAuthMember` | `Member.Model` | `_internal/member.schemas.ts` |
| Organization | `BetterAuthOrganizationSchema` | `DomainOrganizationFromBetterAuthOrganization` | `Organization.Model` | `_internal/organization.schemas.ts` |
| Invitation | `BetterAuthInvitationSchema` | `DomainInvitationFromBetterAuthInvitation` | `Invitation.Model` | `_internal/invitation.schemas.ts` |
| Team | `BetterAuthTeamSchema` | `DomainTeamFromBetterAuthTeam` | `Team.Model` | `_internal/team.schemas.ts` |
| TeamMember | `BetterAuthTeamMemberSchema` | `DomainTeamMemberFromBetterAuthTeamMember` | `TeamMember.Model` | `_internal/team.schemas.ts` |
| ApiKey | `BetterAuthApiKeySchema` | `DomainApiKeyFromBetterAuthApiKey` | `ApiKey.Model` | `_internal/api-key.schemas.ts` |
| OrganizationRole | `BetterAuthOrganizationRoleSchema` | `DomainOrganizationRoleFromBetterAuthOrganizationRole` | `OrganizationRole.Model` | `_internal/role.schemas.ts` |

**Note**: All transformation schemas:
- Validate branded EntityId formats using `.is()` checks
- Require audit fields (`_rowId`, `version`, `source`, `createdBy`, `updatedBy`) from Better Auth responses
- Fail with `ParseResult.Type` errors if validation fails
- Return the domain model's encoded representation for schema framework decoding

### Verification

```bash
# Check for plain string IDs in client schemas (should return 0)
grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):" | wc -l

# Verify alignment with domain entities
bun run check --filter @beep/iam-client
```

## Authoring Guardrails

- ALWAYS keep namespace imports for every Effect module and repo package (`import * as Effect from "effect/Effect"`,
  `import * as F from "effect/Function"`). Native array/string helpers remain forbidden—pipe through `effect/Array` and
  `effect/String`.
- Use Effect Schema (`import * as S from "effect/Schema"`) with PascalCase constructors (`S.Struct`, `S.String`, `S.Number`)
  for all validation schemas in forms and API payloads.
- When integrating with Better Auth, use `wrapIamMethod` from `@beep/iam-client/_internal` to maintain Effect-first semantics
  with automatic encoding, error handling, and session notification.
- Fire `client.$store.notify("$sessionSignal")` after any successful operation that mutates session state (sign-in, sign-out, passkey, social). The `wrapIamMethod` factory handles this when `mutatesSession: true`.
- Atoms MUST use `withToast` wrapper from `@beep/ui/common/with-toast` for optimistic updates and user feedback.
  Keep atoms narrowly focused on single operations (sign-in, sign-out, password change).
- Keep `AuthCallback` prefixes aligned with app middleware in `apps/web`. Update both whenever authenticated route trees move.

## Implemented Handler Patterns

All handlers use the canonical `wrapIamMethod` pattern with `Wrapper.implement()`:

| Pattern | Example Location | Key Characteristics |
|---------|------------------|---------------------|
| Standard handler | `src/sign-in/email/` | Payload schema + success schema |
| No-payload handler | `src/core/sign-out/` | No payload, returns status |
| Transform pattern | `src/sign-up/email/` | `PayloadFrom` + `Payload` transform for computed fields |
| Query-wrapped handler | `src/organization/members/list/` | Better Auth expects `{ query: payload }` |

### Handler Structure

Every handler uses the same pattern:

```ts
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,  // or false
  })((encodedPayload) => client.someMethod(encodedPayload))
);
```

## Quick Recipes

### Create a handler with wrapIamMethod

The `wrapIamMethod` factory handles encoding, error checking, and session notification:

```ts
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

// With payload (sign-in, sign-up)
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.email(encodedPayload))
);

// Without payload (sign-out)
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.signOut())
);
```

**Benefits:**
- Auto-generates Effect.fn span name from wrapper tag
- Properly encodes payload using `payloadSchema`
- Checks `response.error` before decoding
- Notifies `$sessionSignal` when `mutatesSession: true`
- Maps all errors to `IamError` type

### Create a contract

Contracts use `W.Wrapper.make()` with `formValuesAnnotation` for form defaults:

```ts
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/email");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
  },
  formValuesAnnotation({
    email: "",
    password: "",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  }
) {}

export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
```

### Wire a sign-out atom with toast feedback

```ts
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { Atom } from "@effect-atom/atom-react";
import { client } from "@beep/iam-client/adapters";
import { IamError } from "@beep/iam-client/errors";
import { clientRuntimeLayer } from "@beep/runtime-client";
import { withToast } from "@beep/ui/common/with-toast";

const runtime = Atom.runtime(clientRuntimeLayer);

export const signOutAtom = runtime.fn(
  F.flow(
    Effect.gen(function* () {
      const result = yield* Effect.tryPromise({
        try: () => client.signOut(),
        catch: (error) => IamError.match(error, { method: "signOut", domain: "auth" }),
      });

      client.$store.notify("$sessionSignal");
      return result;
    }),
    withToast({
      onWaiting: "Signing out",
      onSuccess: "Signed out successfully",
      onFailure: O.match({ onNone: () => "Failed with unknown error.", onSome: (err) => err.message }),
    })
  )
);
```

### Sanitize callback targets before redirecting

```ts
import * as F from "effect/Function";
import * as Str from "effect/String";
import { AuthCallback } from "@beep/iam-client";

export const resolveCallbackTarget = (raw: string | null | undefined) =>
  F.pipe(raw ?? AuthCallback.defaultTarget, Str.trim, AuthCallback.sanitizePath);
```

### Compose WrapperGroups for module layers

```ts
import { Wrap } from "@beep/wrap";
import { Email } from "./email";
import { Username } from "./username";

// Flat module (positional arguments)
export const Group = Wrap.WrapperGroup.make(Email.Wrapper, Username.Wrapper);

// Nested module (use .merge() instance method)
export const OrganizationGroup = CrudGroup.merge(InvitationsGroup, MembersGroup);

// Create layer from group
export const layer = Group.toLayer({
  Email: Email.Handler,
  Username: Username.Handler,
});
```

## Verifications

> **Note**: The `PATH` prefix ensures Bun is found when running from environments where `~/.bun/bin` is not in the default PATH (e.g., some IDE terminal configurations or CI runners). If Bun is already in your PATH, you can omit this prefix.

- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client lint` — Biome check for contracts, adapters, and docs.
- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client check` — TypeScript project references build.
- `PATH="$HOME/.bun/bin:$PATH" bun run --filter @beep/iam-client build` — Emits ESM/CJS bundles; catches export drift when contract directories move.
- `bun run --filter @beep/iam-client test` — Currently only the placeholder suite; expand alongside new Effect logic.
- Touching `AuthCallback` or session guards? Also run `bun run --filter apps/web lint` to confirm route and guard
  consumers stay healthy.

## Contributor Checklist

- Add new Better Auth flows by creating matching contract/handler files following the canonical pattern.
  Use `wrapIamMethod` for all handlers.
- Ensure all contracts include `formValuesAnnotation` for form default values.
- Ensure credential-bearing fields (password, tokens) use `S.Redacted(S.String)` in schemas.
- Set `mutatesSession: true` for operations that change session state (sign-in, sign-out, verify, etc.).
- Keep session-mutating implementations notifying `$sessionSignal` via the factory's `mutatesSession` flag.
- Update this guide whenever module structure changes or new Better Auth plugins are added.
- Add focused tests in `test/` when modifying adapters or adding new modules.

## Security

### Credential Handling in Contracts
- ALWAYS use `S.Redacted(S.String)` for credential fields in schemas. The `wrapIamMethod` factory handles encoding which unwraps Redacted values.
- NEVER log credential payloads—contract implementations MUST NOT include password or token values in telemetry.
- ALWAYS define credential fields with sensitive schema wrappers in contract definitions.
- NEVER expose raw credential values in error messages or continuation metadata.

### Token Security
- NEVER store session tokens in localStorage or sessionStorage—rely on Better Auth's httpOnly cookie handling.
- ALWAYS use `AuthCallback.sanitizePath` to validate redirect URLs before authentication redirects.
- NEVER include tokens in URL query parameters; use POST bodies or secure cookies only.
- ALWAYS fire `$sessionSignal` after credential operations to ensure guards react to state changes.

### Contract Implementation Security
- ALWAYS use `wrapIamMethod` to wrap Better Auth calls—this ensures proper error boundary handling.
- NEVER bypass contract encoding/decoding; raw Better Auth responses may contain sensitive data.
- ALWAYS decode responses via the wrapper's `successSchema` to strip unexpected fields.
- NEVER expose Better Auth internal error details to UI consumers; map to `IamError` types.

### Rate Limiting Awareness
- Client implementations MUST handle rate limit responses gracefully (429 status).
- NEVER implement client-side retry loops that could amplify rate-limited requests.
- ALWAYS surface rate limit feedback to users rather than silently retrying.

### Callback URL Validation
- ALWAYS constrain `callbackURL` values to known `privatePrefix` paths via `AuthCallback`.
- NEVER allow user-controlled callback URLs without sanitization.
- ALWAYS validate callback targets match the application's authenticated route structure.

### Session State Management
- ALWAYS treat `client.$store` as the single source of truth for session state.
- NEVER cache session data outside the Better Auth client store.
- ALWAYS handle session expiry by redirecting to authentication flows—NEVER show stale session state.

## Gotchas

### Contract Schema Mismatches
- **Symptom**: Runtime decode errors with `ParseError` when calling Better Auth methods.
- **Root Cause**: Contract success/failure schemas drift from Better Auth's actual response shapes after plugin updates.
- **Solution**: When upgrading Better Auth, verify response shapes in browser devtools and update contract schemas accordingly.

### `$sessionSignal` Notification Timing
- **Symptom**: Auth guards do not react after sign-in/sign-out completes; UI shows stale session state.
- **Root Cause**: `mutatesSession: true` was not set in `wrapIamMethod` config.
- **Solution**: Every handler that changes session state MUST have `mutatesSession: true`. The factory handles calling `client.$store.notify("$sessionSignal")`.

### Better Auth Query Wrapping
- **Symptom**: List handlers fail with unexpected errors.
- **Root Cause**: Some Better Auth methods (like `listInvitations`, `listMembers`) expect payload wrapped in `{ query: ... }`.
- **Solution**: Wrap encoded payload: `(encoded) => client.organization.listMembers({ query: encoded })`.

### WrapperGroup API
- **Symptom**: Type errors when composing WrapperGroups.
- **Root Cause**: Using wrong API for WrapperGroup.
- **Solution**:
  - `WrapperGroup.make(W1, W2, W3)` — positional arguments, NOT a labeled object
  - `group1.merge(group2, group3)` — instance method, NOT static method

### Missing formValuesAnnotation
- **Symptom**: Forms have no default values or validation fails unexpectedly.
- **Root Cause**: Contract `Payload` class missing `formValuesAnnotation`.
- **Solution**: ALWAYS include `formValuesAnnotation({ field: defaultValue })` in Payload class definition.

### AuthCallback Prefix Synchronization
- **Symptom**: After sign-in, users redirect to wrong pages or get 404 errors.
- **Root Cause**: `AuthCallback.privatePrefix` values in this package are out of sync with route middleware in `apps/web`.
- **Solution**: When adding authenticated routes, update BOTH `packages/iam/client/src/constants.ts` AND the corresponding middleware in `apps/web`. Run `bun run --filter apps/web lint` to catch mismatches.
