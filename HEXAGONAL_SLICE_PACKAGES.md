# Hexagonal / Clean Vertical Slice Packages (Examples)

This repo currently models vertical slices as:

```
packages/<slice>/{domain,tables,infra,sdk,ui}
```

That layering is close, but there are some boundary leaks that make “pure” Clean/Hex harder:

- `packages/*/domain` currently contains transport-level contracts (`@effect/platform/HttpApi*`, `@effect/rpc/*`). Example: `packages/iam/domain/src/DomainApi.ts`, `packages/documents/domain/src/entities/Document/Document.rpc.ts`.
- `packages/*/infra` currently mixes **delivery/transport** (routes/handlers) with **adapters** (repos, Better Auth, S3, etc.). Example: `packages/documents/infra/src/routes/KnowledgePage.router.ts` (transport) + `packages/documents/infra/src/adapters/repos/KnowledgePage.repo.ts` (adapter).
- `packages/*/sdk` (at least in IAM) currently mixes **client gateway/adapters** and **presentation logic** (atoms/hooks/forms). Example: `packages/iam/sdk/src/adapters/better-auth/client.ts` (gateway-ish) + `packages/iam/sdk/src/clients/sign-in/sign-in.atoms.ts` (presentation).

This document is a thought-experiment: a “purer” vertical slice package set, plus concrete examples using existing (or slightly modified) code from this repo.

---

## Proposed package set (per slice)

Canonical “clean-ish” slice layout (names are flexible; responsibilities are the important part):

```
packages/<slice>/
  domain/               # Pure domain logic, invariants, VO/entity types
  application/          # Use cases + ports (interfaces)
  contracts/            # Transport-neutral API surface (HTTP/RPC contracts, DTOs)
  persistence-schema/   # DB schema definitions (Drizzle tables, relations, etc.)
  server-transport/     # HTTP/RPC handlers/controllers, server wiring
  server-adapters/      # DB/BaaS/S3/email/auth implementations of ports
  client-gateway/       # Typed HTTP/RPC clients, browser-safe API adapters
  presentation/         # Client state, cache keys, atoms, forms, view-models
  ui/                   # React components/views (no server wiring)
```

Minimal rename-only version (fewer packages):

- `infra` → `server` (still mixed transport + adapters, but at least truthful)
- `sdk` → `presentation` (or `client`) (truthful that it’s mostly UI-facing client logic)
- `tables` → `persistence-schema` (optional; “tables” is fine if consistent)

---

## Dependency rules (the “purity” constraints)

If you want the “purest” clean/hex expression, enforce these:

- `domain` imports nothing “delivery” (`next/*`, `@effect/platform/*`, `@effect/rpc/*`, `drizzle-orm/*`, `better-auth`, AWS SDKs, etc.).
- `application` depends on `domain` and defines **ports** (interfaces/tags) only.
- `contracts` depends on `domain` (and maybe `application` types), but not on server/client runtimes.
- `server-*` implements and wires ports; it depends on `application` + `contracts` + `domain`.
- `client-*` consumes `contracts` and depends on `application` + `domain`; it never imports `server-*`.

This repo already has strong DI primitives (Effect `Layer`, `Context.Tag`, `Effect.Service`) to make those boundaries practical.

---

## 1) `domain/` (pure domain)

### Tree (proposed)

Example for IAM (note the absence of `api/`):

```txt
packages/iam/domain/
  src/
    errors/
      index.ts
      core.errors.ts
    value-objects/
      paths.ts
    IamError.ts
    index.ts
```

### Example code

Based on `packages/iam/domain/src/IamError.ts`:

```ts
// packages/iam/domain/src/IamError.ts
import { BeepError } from "@beep/errors/shared";
import * as S from "effect/Schema";

export class IamError extends S.TaggedError<IamError>()("IamError", { message: S.String }) {}
export class IamUnknownError extends BeepError.UnknownError {}
```

Boundary note: `packages/iam/domain/src/value-objects/paths.ts` currently defines URL/view paths. In strict Clean Architecture, URL path building is usually a presentation concern; if you want maximum purity, move that into `presentation/` (or keep it if you treat routes as part of the ubiquitous language).

---

## 2) `application/` (use cases + ports)

This layer orchestrates domain rules and talks only to **ports** (interfaces).

### Tree (proposed)

Example for Documents:

```txt
packages/documents/application/
  src/
    ports/
      KnowledgePageRepo.ts
    usecases/
      GetKnowledgePage.ts
    index.ts
```

### Example code (ports)

Port definition example (new file; interface-only). This is derived from how `KnowledgePageRepo` is used today in `packages/documents/infra/src/routes/KnowledgePage.router.ts`.

```ts
// packages/documents/application/src/ports/KnowledgePageRepo.ts
import { Entities } from "@beep/documents-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export interface KnowledgePageRepo {
  readonly findById: (
    id: DocumentsEntityIds.KnowledgePageId.Type
  ) => Effect.Effect<typeof Entities.KnowledgePage.Model.Type>;
}

export const KnowledgePageRepo = Context.Tag<KnowledgePageRepo>("@beep/documents-application/KnowledgePageRepo");
```

### Example code (use case)

```ts
// packages/documents/application/src/usecases/GetKnowledgePage.ts
import { KnowledgePageRepo } from "../ports/KnowledgePageRepo";
import { DocumentsEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export const GetKnowledgePage = (id: DocumentsEntityIds.KnowledgePageId.Type) =>
  Effect.gen(function* () {
    const repo = yield* KnowledgePageRepo;
    return yield* repo.findById(id);
  });
```

---

## 3) `contracts/` (API surface: HTTP/RPC contracts + DTOs)

This is where `@effect/platform/HttpApi*` and `@effect/rpc/*` contracts belong if you want `domain` to stay pure.

### Tree (proposed)

```txt
packages/iam/contracts/
  src/
    http/
      User.contract.ts
      DomainApi.ts
    index.ts
```

### Example code (HTTP contract)

Based on `packages/iam/domain/src/api/User.contract.ts` and `packages/iam/domain/src/DomainApi.ts` (same code, just moved):

```ts
// packages/iam/contracts/src/http/User.contract.ts
import { User } from "@beep/shared-domain/entities";
import { AuthContextHttpMiddleware } from "@beep/shared-domain/Policy";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export class CurrentUserNotFound extends S.TaggedError<CurrentUserNotFound>(
  "@beep/iam-contracts/http/User/CurrentUserNotFound"
)(
  "CurrentUserNotFound",
  { message: S.String, cause: S.Defect },
  HttpApiSchema.annotations({ status: 404 })
) {}

export class CurrentUserGroup extends HttpApiGroup.make("currentUser")
  .middleware(AuthContextHttpMiddleware)
  .add(HttpApiEndpoint.get("get", "/current-user").addSuccess(User.Model).addError(CurrentUserNotFound)) {}
```

```ts
// packages/iam/contracts/src/http/DomainApi.ts
import { CurrentUserGroup } from "./User.contract";
import * as HttpApi from "@effect/platform/HttpApi";

export class DomainApi extends HttpApi.make("domain").add(CurrentUserGroup).prefix("/api/v1/iam") {}
```

### Example code (RPC contract)

Based on `packages/documents/domain/src/entities/Document/Document.rpc.ts` (same idea, different location):

```ts
// packages/documents/contracts/src/rpc/Document.rpc.ts
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema";
import * as Errors from "@beep/documents-domain/entities/Document/Document.errors";
import { Model } from "@beep/documents-domain/entities/Document/Document.model";

export class Rpcs extends RpcGroup.make(
  Rpc.make("get", {
    payload: { id: DocumentsEntityIds.DocumentId },
    success: Model.json,
    error: Errors.DocumentNotFoundError,
  })
  // ...rest unchanged
) {}
```

---

## 4) `persistence-schema/` (Drizzle tables, relations, schema objects)

This corresponds to today’s `tables` packages; it’s a clean outer-ring concern that can be shared by multiple adapters (server DB, local-first sync).

### Tree (current ≈ proposed)

IAM already looks like this:

```txt
packages/iam/tables/
  src/
    tables/
      account.table.ts
      ...
    relations.ts
    schema.ts
    index.ts
```

### Example code (table)

Based on `packages/iam/tables/src/tables/account.table.ts`:

```ts
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/Table";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const account = Table.make(IamEntityIds.AccountId)(
  {
    // ...
    userId: pg
      .text("user_id")
      .notNull()
      .$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
    // ...
  },
  (t) => [
    pg.index("account_user_id_idx").on(t.userId),
    pg.uniqueIndex("account_provider_account_unique_idx").on(t.providerId, t.accountId),
    pg.index("account_access_token_expires_idx").on(t.accessTokenExpiresAt).where(d.sql`${t.accessTokenExpiresAt} IS NOT NULL`),
  ]
);
```

Local-first caution: sharing Drizzle schemas between server and browser works only if those imports remain bundler-safe; `drizzle-orm/pg-core` is Postgres-specific and may not be desirable in a browser-only build. If the goal is “schema shared across adapters”, consider a schema format that is DB-agnostic (or a second schema for Zero/SQLite).

---

## 5) `server-transport/` (controllers/handlers/routes)

This is “delivery”: it turns HTTP/RPC requests into `application` calls.

### Tree (proposed)

Documents example:

```txt
packages/documents/server-transport/
  src/
    http/
      KnowledgePage.routes.ts
    index.ts
```

### Example code

Based on `packages/documents/infra/src/routes/KnowledgePage.router.ts`, but calling an application use case instead of a repo directly:

```ts
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Effect from "effect/Effect";
import { DomainApi } from "@beep/documents-contracts/http/DomainApi";
import { GetKnowledgePage } from "@beep/documents-application/usecases/GetKnowledgePage";

export const KnowledgePageRouterLive = HttpApiBuilder.group(
  DomainApi,
  "knowledgePage",
  Effect.fnUntraced(function* (handlers) {
    return handlers.handle("get", ({ urlParams }) => GetKnowledgePage(urlParams));
  })
);
```

---

## 6) `server-adapters/` (DB/auth/email/S3 implementations)

These implement `application` ports using third-party libs (Drizzle, Better Auth, AWS, Resend, etc.).

### Tree (proposed)

```txt
packages/iam/server-adapters/
  src/
    auth/
      Auth.service.ts
    repos/
      User.repo.ts
      ...
    index.ts
```

### Example code (adapter)

Based on `packages/iam/infra/src/adapters/better-auth/Auth.service.ts`:

```ts
import { betterAuth } from "better-auth";
import { customSession } from "better-auth/plugins/custom-session";
import * as Effect from "effect/Effect";

import { AuthOptions } from "./AuthOptions";

export const authServiceEffect = Effect.gen(function* () {
  const opts = yield* AuthOptions;

  const auth = betterAuth({
    ...opts,
    plugins: [
      ...(opts.plugins ?? []),
      customSession(async ({ user, session }) => ({ user, session }), opts),
    ],
  });

  return { auth };
});
```

### Example code (repo adapter)

Based on `packages/documents/infra/src/adapters/repos/KnowledgePage.repo.ts`:

- Drizzle/SQL details stay here.
- The exported service/layer satisfies the `application` port (`KnowledgePageRepo` tag).

---

## 7) `client-gateway/` (typed client adapters)

This layer creates typed clients for your own APIs (HTTP/RPC) and external services, and is typically browser-safe.

### Tree (proposed)

```txt
packages/iam/client-gateway/
  src/
    ApiClient.ts
    index.ts
```

### Example code (HTTP client)

Based on `packages/runtime/client/src/services/common/iam-api-client.ts` (same code, slice-local location):

```ts
import { DomainApi } from "@beep/iam-contracts/http/DomainApi";
import { clientEnv } from "@beep/shared-infra/ClientEnv";
import * as HttpApiClient from "@effect/platform/HttpApiClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as BrowserHttpClient from "@effect/platform-browser/BrowserHttpClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  accessors: true,
  dependencies: [BrowserHttpClient.layerXMLHttpRequest],
  effect: Effect.gen(function* () {
    return {
      client: yield* HttpApiClient.make(DomainApi, {
        baseUrl: `${clientEnv.apiUrl.toString()}/iam`,
        transformClient: (client) => client.pipe(HttpClient.retryTransient({ times: 3 })),
      }),
    };
  }),
}) {
  static readonly Live = ApiClient.Default.pipe(Layer.provideMerge(BrowserHttpClient.layerXMLHttpRequest));
}
```

---

## 8) `presentation/` (reactivity, forms, view-models, cache keys)

This is the layer you described as “state is always fresh”: atoms, query keys, invalidations, form schemas, derived state, etc.

### Tree (proposed)

IAM already has strong examples (currently under `sdk/src/clients/*`):

```txt
packages/iam/presentation/
  src/
    sign-in/
      sign-in.atoms.ts
      sign-in.forms.ts
      sign-in.service.ts
    index.ts
```

### Example code (atoms + hook)

Based on `packages/iam/sdk/src/clients/sign-in/sign-in.atoms.ts` (same code, different package name):

```ts
"use client";
import { makeAtomRuntime } from "@beep/runtime-client/services/runtime/make-atom-runtime";
import { withToast } from "@beep/ui/common";
import { useAtomSet } from "@effect-atom/atom-react";
import type * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { SignInService } from "./sign-in.service";

const signInRuntime = makeAtomRuntime(SignInService.Live);

const signInToastOptions = {
  onWaiting: "Signing in",
  onSuccess: "Signed in successfully",
  onFailure: (e: Effect.Effect.Error<ReturnType<(typeof SignInService)["SignInPasskey"]>>) => e.message,
} as const;

export const signInPasskeyAtom = signInRuntime.fn(F.flow(SignInService.SignInPasskey, withToast(signInToastOptions)));
export const signInSocialAtom = signInRuntime.fn(SignInService.SignInSocial);

export const useSignIn = () => {
  const signInSocial = useAtomSet(signInSocialAtom);
  const signInPasskey = useAtomSet(signInPasskeyAtom);
  return { signInSocial, signInPasskey };
};
```

---

## 9) `ui/` (React components/views)

This should stay “dumb-ish”: it uses `presentation` hooks/services and renders UI.

### Tree (current)

IAM UI is already in this shape:

```txt
packages/iam/ui/
  src/
    sign-in/
      sign-in.view.tsx
      sign-in-email.form.tsx
      sign-in-social.tsx
      sign-in-passkey.tsx
    sign-up/
      ...
    IamProvider.tsx
    index.ts
```

### Example code (view)

Based on `packages/iam/ui/src/sign-in/sign-in.view.tsx`:

```tsx
"use client";
import { useSignIn } from "@beep/iam-presentation/sign-in";
import { paths } from "@beep/shared-domain";
import { RouterLink } from "@beep/ui/routing";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { FormDivider, FormHead } from "../_components";
import { SignInEmailForm } from "./sign-in-email.form";
import { SignInPasskey } from "./sign-in-passkey";
import { SignInSocial } from "./sign-in-social";

export const SignInView = () => {
  const { signInPasskey, signInSocial } = useSignIn();
  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={
          <>
            {`Don’t have an account? `}
            <Link component={RouterLink} href={paths.auth.signUp} variant="subtitle2">
              Get started
            </Link>
          </>
        }
        sx={{ textAlign: { xs: "center", md: "left" } }}
      />
      <SignInEmailForm />
      <FormDivider />
      <Stack spacing={2}>
        <SignInSocial signIn={async (provider) => signInSocial({ provider })} />
        <SignInPasskey onSubmit={async () => signInPasskey()} />
      </Stack>
    </>
  );
};
```

Note: the UI layer can still use `async` handlers because that’s React event glue, not domain/application logic. If you want to go stricter, pass Effects upward and run them via a runtime helper, but most teams accept `async` at the component boundary.

---

## “Purest” next step (what you’d actually change first)

If you want to incrementally move toward the pure layout without a repo-wide rename:

1. **Move contracts out of `domain`**: relocate `packages/*/domain/src/api/*`, `DomainApi.ts`, and `*.rpc.ts` into `packages/*/contracts`.
2. **Split `infra`**: move `routes/` + `handlers/` into `server-transport`, keep repos/external libs in `server-adapters`.
3. **Split `sdk`**: move atoms/forms/hooks into `presentation`, move HTTP/RPC clients into `client-gateway`.

That alone eliminates the biggest dependency inversions while preserving most existing code.
