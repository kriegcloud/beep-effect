# IAM API Restructure Research - Effect Platform HttpApi Nested Grouping

## Executive Summary

After deep analysis of Effect Platform's HttpApi system, I've identified that **true nested grouping in OpenAPI documentation is not directly supported** through the current API design. However, the platform provides `HttpApi.addHttpApi` which allows **composing multiple APIs together**, and the `topLevel` option on groups which affects client generation and operationId formatting.

**Key Findings:**
1. `HttpApi` can contain multiple `HttpApiGroup`s (flat structure)
2. `HttpApi.addHttpApi` allows merging APIs together (composition, not nesting)
3. OpenAPI tags are generated from group identifiers (one tag per group)
4. The `topLevel` flag controls whether group names appear in operationIds and client method nesting
5. OpenAPI's `x-tagGroups` extension (for nested tag display) is **not generated** by Effect Platform
6. The current IAM API structure is already well-organized - the issue is purely cosmetic (documentation display)

**Recommendation:** Keep the current structure but improve export naming and consider custom OpenAPI transformation if nested tag display is critical.

---

## Current Implementation Analysis

### Domain Layer Structure

**File:** `packages/iam/domain/src/api/api.ts`
```typescript
import * as HttpApi from "@effect/platform/HttpApi";
import { V1 } from "./v1";

export class Api extends HttpApi.make("v1")
  .addHttpApi(V1.Api)
  .prefix("/v1") {}
```

**File:** `packages/iam/domain/src/api/v1/api.ts`
```typescript
import * as HttpApi from "@effect/platform/HttpApi";
import { Core } from "./core";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

export class Api extends HttpApi.make("domain")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .add(Core.Group)
  .prefix("/iam")
  {}
```

**File:** `packages/iam/domain/src/api/v1/sign-in/_group.ts`
```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Email from "./email.ts";
import * as Social from "./social.ts";

export class Group extends HttpApiGroup.make("signIn")
  .add(Email.Contract)
  .add(Social.Contract)
  .prefix("/sign-in") {}
```

### What This Structure Creates

**OpenAPI Tags Generated:**
- `signIn` (from group identifier)
- `signUp` (from group identifier)
- `core` (from group identifier)

**OperationIds:**
- `signIn.email` (group.identifier + "." + endpoint.name)
- `signIn.social`
- `signUp.email`
- `core.getSession`
- `core.signOut`

**API Paths:**
- `/v1/iam/sign-in/email`
- `/v1/iam/sign-in/social`
- `/v1/iam/sign-up/email`
- `/v1/iam/get-session`
- `/v1/iam/sign-out`

---

## Effect Platform HttpApi Deep Dive

### HttpApi Architecture

```typescript
// HttpApi structure
interface HttpApi<Id, Groups, Error, R> {
  identifier: Id                              // "v1" or "domain"
  groups: Record<string, Groups>              // { "signIn": Group, "signUp": Group }
  errorSchema: Schema<Error>
  annotations: Context<never>
  middlewares: Set<Middleware>

  add<A>(group: A): HttpApi                   // Add a group
  addHttpApi<Api2>(api: Api2): HttpApi        // Merge another API
  prefix(path): HttpApi                       // Add path prefix to all
}

// HttpApiGroup structure
interface HttpApiGroup<Id, Endpoints, Error, R, TopLevel> {
  identifier: Id                              // "signIn"
  topLevel: TopLevel                          // false (default)
  endpoints: Record<string, Endpoints>        // { "email": Endpoint, "social": Endpoint }
  errorSchema: Schema<Error>
  annotations: Context<never>
  middlewares: Set<Middleware>

  add<E>(endpoint: E): HttpApiGroup
  prefix(path): HttpApiGroup
}
```

### How `addHttpApi` Works

From `@effect/platform/src/HttpApi.ts` lines 159-176:

```typescript
addHttpApi(this: HttpApi.AnyWithProps, api: HttpApi.AnyWithProps) {
  const newGroups = { ...this.groups }
  for (const key in api.groups) {
    const newGroup: Mutable<HttpApiGroup.HttpApiGroup.AnyWithProps> =
      api.groups[key].annotateContext(Context.empty())
    newGroup.annotations = Context.merge(api.annotations, newGroup.annotations)
    newGroup.middlewares = new Set([...api.middlewares, ...newGroup.middlewares])
    newGroups[key] = newGroup as any
  }
  return makeProto({
    identifier: this.identifier,
    groups: newGroups,  // Merged groups (flat)
    errorSchema: HttpApiSchema.UnionUnify(this.errorSchema, api.errorSchema),
    annotations: this.annotations,
    middlewares: this.middlewares
  })
}
```

**Key Insight:** `addHttpApi` **flattens** the groups from the added API into the parent API's groups. It does NOT create a nested structure. The parent API identifier is used, and the child API's groups become direct children.

### OpenAPI Generation Process

From `@effect/platform/src/OpenApi.ts` lines 297-340:

```typescript
HttpApi.reflect(api, {
  onGroup({ group }) {
    let tag: OpenAPISpecTag = {
      name: Context.getOrElse(group.annotations, Title, () => group.identifier)
    }
    // ... process annotations ...
    spec.tags.push(tag)
  },
  onEndpoint({ endpoint, group, mergedAnnotations }) {
    let op: OpenAPISpecOperation = {
      tags: [Context.getOrElse(group.annotations, Title, () => group.identifier)],
      operationId: Context.getOrElse(
        endpoint.annotations,
        Identifier,
        () => group.topLevel ? endpoint.name : `${group.identifier}.${endpoint.name}`
      ),
      // ... rest of operation ...
    }
  }
})
```

**Key Insights:**
1. Each `HttpApiGroup` becomes **one OpenAPI tag**
2. Tags are **flat** - no hierarchy
3. `operationId` uses `group.identifier.endpoint.name` (unless `topLevel: true`)
4. No `x-tagGroups` extension is generated

### The `topLevel` Flag

```typescript
HttpApiGroup.make("group", { topLevel: true })
```

**Effects:**
1. **OperationId:** `endpoint.name` instead of `group.endpoint.name`
2. **Client Generation:** Methods are NOT nested under group name
3. **OpenAPI Tags:** Still uses group identifier as tag (no change)

**Example:**
```typescript
// Without topLevel (default)
const group = HttpApiGroup.make("users").add(getEndpoint)
// operationId: "users.get"
// client usage: client.users.get()

// With topLevel
const group = HttpApiGroup.make("users", { topLevel: true }).add(getEndpoint)
// operationId: "get"
// client usage: client.get()
```

---

## Addressing the Nested Documentation Goal

### Problem Statement

The desired OpenAPI documentation structure:
```
v1
├── signIn
│   ├── POST /v1/iam/sign-in/email
│   └── POST /v1/iam/sign-in/social
├── signUp
│   └── POST /v1/iam/sign-up/email
└── core
    ├── GET /v1/iam/get-session
    └── POST /v1/iam/sign-out
```

Current output (flat tags):
```
signIn
├── POST /v1/iam/sign-in/email
└── POST /v1/iam/sign-in/social
signUp
└── POST /v1/iam/sign-up/email
core
├── GET /v1/iam/get-session
└── POST /v1/iam/sign-out
```

### Why Effect Platform Doesn't Support This

1. **OpenAPI 3.1.0 Spec:** The `tags` field in operations is an array of strings (flat)
2. **Tag Grouping:** Nested tag display requires the `x-tagGroups` vendor extension
3. **Effect Platform:** Does not generate `x-tagGroups` (lines 240-253 in OpenApi.ts)

**OpenAPI's `x-tagGroups` extension:**
```json
{
  "openapi": "3.1.0",
  "x-tagGroups": [
    {
      "name": "v1",
      "tags": ["signIn", "signUp", "core"]
    }
  ],
  "tags": [
    { "name": "signIn", "description": "..." },
    { "name": "signUp", "description": "..." },
    { "name": "core", "description": "..." }
  ]
}
```

### Solution Options

#### Option 1: Custom OpenAPI Transformation (Recommended)

Use the `Transform` annotation to inject `x-tagGroups`:

```typescript
import * as OpenApi from "@effect/platform/OpenApi";

export class Api extends HttpApi.make("v1")
  .addHttpApi(V1.Api)
  .prefix("/v1")
  .annotate(OpenApi.Transform, (spec) => ({
    ...spec,
    "x-tagGroups": [
      {
        name: "v1",
        tags: Object.keys(V1.Api.groups) // ["signIn", "signUp", "core"]
      }
    ]
  })) {}
```

**Pros:**
- Minimal code changes
- Works with Scalar/Swagger UI (they support `x-tagGroups`)
- Maintains current architecture

**Cons:**
- Vendor extension (not standard OpenAPI)
- Documentation tools must support `x-tagGroups`

#### Option 2: Prefix Group Names

Make the hierarchy explicit in group identifiers:

```typescript
// Domain layer
export class Group extends HttpApiGroup.make("v1/signIn")
  .add(Email.Contract)
  .add(Social.Contract)
  .prefix("/sign-in") {}
```

**Pros:**
- Works with any OpenAPI viewer
- Clear hierarchy in tag names

**Cons:**
- Ugly tag names ("v1/signIn" instead of "signIn")
- Breaks client method names

#### Option 3: Keep Current Structure (Recommended)

The current structure is **already optimal** for the Effect Platform architecture:

**Pros:**
- Follows Effect Platform conventions
- Clean client SDK generation
- Proper type inference
- Standard OpenAPI output

**Cons:**
- Flat tag display in docs (cosmetic only)

---

## Recommended File/Folder Structure

### Domain Layer

```
packages/iam/domain/src/api/
├── index.ts                    # Export IamApi
├── api.ts                      # Top-level IamApi class
├── common/
│   ├── index.ts
│   ├── common-fields.ts
│   └── errors.ts
└── v1/
    ├── index.ts                # Export V1 namespace
    ├── api.ts                  # V1.Api class
    ├── sign-in/
    │   ├── index.ts            # Export SignIn namespace
    │   ├── _group.ts           # SignIn.Group
    │   ├── email.ts            # Email.Contract
    │   └── social.ts           # Social.Contract
    ├── sign-up/
    │   ├── index.ts            # Export SignUp namespace
    │   ├── _group.ts           # SignUp.Group
    │   └── email.ts            # Email.Contract
    └── core/
        ├── index.ts            # Export Core namespace
        ├── _group.ts           # Core.Group
        ├── get-session.ts      # GetSession.Contract
        ├── sign-out.ts         # SignOut.Contract
        ├── change-email.ts
        ├── change-password.ts
        └── ...
```

### Infrastructure Layer

```
packages/iam/infra/src/api/
├── index.ts                    # Export IamApiLive
├── v1/
│   ├── index.ts                # Export layer
│   ├── api.ts                  # V1 route layer composition
│   ├── sign-in/
│   │   ├── index.ts            # Export SignIn namespace
│   │   ├── _group.ts           # SignIn.Routes layer
│   │   ├── email.ts            # Email.Handler
│   │   └── social.ts           # Social.Handler
│   ├── sign-up/
│   │   ├── index.ts
│   │   ├── _group.ts
│   │   └── email.ts
│   └── core/
│       ├── index.ts
│       ├── _group.ts
│       ├── get-session.ts
│       └── sign-out.ts
└── common/
    ├── index.ts
    ├── common.ts               # Shared handler utilities
    └── types.ts                # Common handler types
```

---

## Implementation Guide

### Step 1: Fix Domain Exports

**Goal:** Enable `import { IamApi } from "@beep/iam-domain"`

**File:** `packages/iam/domain/src/api/index.ts`
```typescript
export { Api as IamApi } from "./api";
export * as V1 from "./v1";
export * from "./common";
```

**File:** `packages/iam/domain/src/index.ts`
```typescript
export { IamApi } from "./api";
export * as IamApi from "./api"; // For namespace access
export * from "./api/common";
export * as Entities from "./entities";
export * from "./IamError";
export * from "./value-objects";
```

### Step 2: Fix Infrastructure Exports

**Goal:** Enable `import { IamApiLive } from "@beep/iam-infra"`

**File:** `packages/iam/infra/src/api/v1/api.ts`
```typescript
import type { IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as Layer from "effect/Layer";
import { Core } from "./core";
import { SignIn } from "./sign-in";
import { SignUp } from "./sign-up";

export type Service = SignIn.Service | SignUp.Service | Core.Service;
export type ApiError = IamAuthError;
export type ApiDependencies = Auth.Service;

export const layer: Layer.Layer<Service, ApiError, ApiDependencies> =
  Layer.mergeAll(SignIn.Routes, SignUp.Routes, Core.Routes);
```

**File:** `packages/iam/infra/src/api/index.ts`
```typescript
export { layer as IamApiLive } from "./v1/api";
export * as V1 from "./v1";
```

**File:** `packages/iam/infra/src/index.ts`
```typescript
export { IamApiLive } from "./api";
export * from "./adapters";
export * as IamRepos from "./adapters/repositories";
export * from "./db";
```

### Step 3: Update Domain API Definition

**File:** `packages/iam/domain/src/api/api.ts`

**Option A: Keep current structure (recommended)**
```typescript
import * as HttpApi from "@effect/platform/HttpApi";
import * as OpenApi from "@effect/platform/OpenApi";
import { V1 } from "./v1";

export class IamApi extends HttpApi.make("iam")
  .addHttpApi(V1.Api)
  .prefix("/v1/iam")
  .annotate(OpenApi.Title, "IAM API")
  .annotate(OpenApi.Version, "1.0.0")
  .annotate(OpenApi.Description, "Identity and Access Management API")
  .annotate(OpenApi.Transform, (spec) => ({
    ...spec,
    "x-tagGroups": [
      {
        name: "v1",
        tags: ["signIn", "signUp", "core"]
      }
    ]
  })) {}
```

**Option B: Single-level API (simpler)**
```typescript
import * as HttpApi from "@effect/platform/HttpApi";
import * as OpenApi from "@effect/platform/OpenApi";
import { Core, SignIn, SignUp } from "./v1";

export class IamApi extends HttpApi.make("iam")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .add(Core.Group)
  .prefix("/v1/iam")
  .annotate(OpenApi.Title, "IAM API")
  .annotate(OpenApi.Version, "1.0.0") {}
```

### Step 4: Group Annotations

Add descriptions and metadata to groups:

**File:** `packages/iam/domain/src/api/v1/sign-in/_group.ts`
```typescript
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as OpenApi from "@effect/platform/OpenApi";
import * as Email from "./email";
import * as Social from "./social";

export class Group extends HttpApiGroup.make("signIn")
  .add(Email.Contract)
  .add(Social.Contract)
  .prefix("/sign-in")
  .annotate(OpenApi.Title, "Sign In")
  .annotate(OpenApi.Description, "Authentication endpoints for signing in users") {}

export { Email, Social };
```

### Step 5: Endpoint Annotations

Add metadata to individual endpoints:

**File:** `packages/iam/domain/src/api/v1/sign-in/email.ts`
```typescript
import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as OpenApi from "@effect/platform/OpenApi";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/sign-in/email");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: CommonFields.UserEmail,
    password: CommonFields.UserPassword,
    callbackURL: CommonFields.CallbackURL,
    rememberMe: CommonFields.RememberMe,
  },
  $I.annotations("SignInPayload", {
    description: "Sign in with email and password.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    redirect: CommonFields.Redirect,
    token: CommonFields.SessionToken,
    url: CommonFields.RedirectURL,
  },
  $I.annotations("SignInSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.post("email", "/email")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An Error indicating a failure to sign in with email and password.",
      })
    )
  )
  .addSuccess(Success)
  .annotate(OpenApi.Summary, "Sign in with email and password")
  .annotate(OpenApi.Description,
    "Authenticate a user using their email address and password. " +
    "Returns a session token upon successful authentication."
  );
```

### Step 6: Infrastructure Handler Pattern

**File:** `packages/iam/infra/src/api/v1/sign-in/_group.ts`
```typescript
import { IamApi, IamAuthError } from "@beep/iam-domain";
import type { Auth } from "@beep/iam-infra";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import type * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import type * as Layer from "effect/Layer";
import * as Email from "./email";
import * as Social from "./social";

export type Service = HttpApiGroup.ApiGroup<"iam", "signIn">;
export type ServiceError = IamAuthError;
export type ServiceDependencies = Auth.Service;

export type Routes = Layer.Layer<Service, ServiceError, ServiceDependencies>;

export const Routes: Routes = HttpApiBuilder.group(
  IamApi,
  "signIn",
  (handlers) =>
    handlers
      .handle("email", Email.Handler)
      .handle("social", Social.Handler)
);
```

### Step 7: Verify Imports

After restructure, verify these imports work:

```typescript
// From domain
import { IamApi } from "@beep/iam-domain";
import { IamApi as IamApiNS } from "@beep/iam-domain"; // Namespace
import { IamAuthError } from "@beep/iam-domain";

// From infra
import { IamApiLive } from "@beep/iam-infra";

// Usage
const api: typeof IamApi = IamApi;
const v1SignIn = IamApiNS.V1.SignIn;

const layer = IamApiLive.pipe(
  Layer.provide(AuthServiceLive)
);
```

---

## Advanced Patterns

### Pattern 1: Versioned APIs with Shared Groups

If you want to support multiple API versions:

```typescript
// v1/api.ts
export class V1Api extends HttpApi.make("v1")
  .add(SignIn.Group)
  .add(SignUp.Group)
  .prefix("/v1") {}

// v2/api.ts (future)
export class V2Api extends HttpApi.make("v2")
  .add(SignIn.GroupV2)
  .add(SignUp.GroupV2)
  .add(OAuth.Group)
  .prefix("/v2") {}

// api.ts
export class IamApi extends HttpApi.make("iam")
  .addHttpApi(V1.V1Api)
  .addHttpApi(V2.V2Api) {}
```

**Result:**
- Groups from v1: `signIn`, `signUp`
- Groups from v2: `signIn`, `signUp`, `oauth`
- **Problem:** Name collision! Both v1 and v2 have `signIn`

**Solution:** Prefix group identifiers with version
```typescript
// v1/sign-in/_group.ts
export class Group extends HttpApiGroup.make("v1_signIn") // or "signIn_v1"
```

### Pattern 2: Feature-Based Grouping

Instead of version nesting, group by feature:

```typescript
export class IamApi extends HttpApi.make("iam")
  .add(Authentication.Group)   // signIn, signUp, signOut
  .add(Profile.Group)           // updateProfile, changeEmail
  .add(Security.Group)          // changePassword, enable2FA
  .prefix("/v1/iam") {}
```

### Pattern 3: Middleware at Different Levels

```typescript
// API-level middleware (all groups)
export class IamApi extends HttpApi.make("iam")
  .add(SignIn.Group)
  .middleware(RateLimitMiddleware)  // Applied to all groups

// Group-level middleware (all endpoints in group)
export class Group extends HttpApiGroup.make("signIn")
  .add(Email.Contract)
  .middleware(CaptchaMiddleware)    // Only for signIn endpoints

// Endpoint-level middleware
export const Contract = HttpApiEndpoint.post("email", "/email")
  .middleware(IpThrottleMiddleware) // Only for this endpoint
```

---

## OpenAPI Output Comparison

### Current Structure

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Api",
    "version": "0.0.1"
  },
  "paths": {
    "/v1/iam/sign-in/email": {
      "post": {
        "operationId": "signIn.email",
        "tags": ["signIn"],
        "summary": "Sign in with email and password",
        "requestBody": { "..." },
        "responses": { "..." }
      }
    },
    "/v1/iam/sign-in/social": {
      "post": {
        "operationId": "signIn.social",
        "tags": ["signIn"]
      }
    },
    "/v1/iam/sign-up/email": {
      "post": {
        "operationId": "signUp.email",
        "tags": ["signUp"]
      }
    }
  },
  "tags": [
    { "name": "signIn", "description": "..." },
    { "name": "signUp", "description": "..." },
    { "name": "core", "description": "..." }
  ]
}
```

### With `x-tagGroups` Transform

```json
{
  "openapi": "3.1.0",
  "info": { "..." },
  "paths": { "..." },
  "tags": [ "..." ],
  "x-tagGroups": [
    {
      "name": "v1",
      "tags": ["signIn", "signUp", "core"]
    }
  ]
}
```

**Scalar/Swagger UI Display:**
```
v1 ▼
  signIn ▼
    POST /v1/iam/sign-in/email
    POST /v1/iam/sign-in/social
  signUp ▼
    POST /v1/iam/sign-up/email
  core ▼
    GET /v1/iam/get-session
    POST /v1/iam/sign-out
```

---

## Client SDK Generation

### Generated Client Structure

**Without `topLevel`:**
```typescript
const client = HttpApiClient.make(IamApi);

// Usage
await client.signIn.email({ payload: { ... } });
await client.signIn.social({ payload: { ... } });
await client.signUp.email({ payload: { ... } });
await client.core.getSession();
```

**With `topLevel` on groups:**
```typescript
const client = HttpApiClient.make(IamApi);

// Usage (methods not nested)
await client.email({ payload: { ... } }); // Ambiguous!
await client.social({ payload: { ... } });
await client.getSession();
```

**Recommendation:** Do NOT use `topLevel` for IAM API. The nested client structure (`client.signIn.email`) is clearer and matches the domain model.

---

## Migration Checklist

- [ ] Update `packages/iam/domain/src/api/index.ts` - export `IamApi`
- [ ] Update `packages/iam/domain/src/index.ts` - export `IamApi`
- [ ] Rename `Api` class to `IamApi` in `packages/iam/domain/src/api/api.ts`
- [ ] Add OpenAPI annotations (Title, Version, Description) to `IamApi`
- [ ] Add `x-tagGroups` transform if nested docs desired
- [ ] Update `packages/iam/infra/src/api/index.ts` - export `IamApiLive`
- [ ] Update `packages/iam/infra/src/index.ts` - export `IamApiLive`
- [ ] Add OpenAPI annotations to all groups (Title, Description)
- [ ] Add OpenAPI annotations to all endpoints (Summary, Description)
- [ ] Update imports in `apps/server` and `apps/web`
- [ ] Run `bun run check` to verify types
- [ ] Test OpenAPI generation at `/openapi.json`
- [ ] Verify Scalar/Swagger UI display
- [ ] Update documentation

---

## References

### Effect Platform Source Files Analyzed

- `@effect/platform/src/HttpApi.ts` - HttpApi class and `addHttpApi`
- `@effect/platform/src/HttpApiGroup.ts` - HttpApiGroup class and `topLevel`
- `@effect/platform/src/HttpApiBuilder.ts` - Handler registration and routing
- `@effect/platform/src/OpenApi.ts` - OpenAPI spec generation
- `@effect/platform/src/HttpApiSchema.ts` - Schema annotations

### Key Discoveries

1. **Line 159-176 (HttpApi.ts):** `addHttpApi` merges groups into flat structure
2. **Line 297-340 (OpenApi.ts):** Tag generation from group identifiers
3. **Line 330 (OpenApi.ts):** OperationId uses `topLevel` flag
4. **Line 420-430 (HttpApiGroup.ts):** `topLevel` default is `false`
5. **No `x-tagGroups` generation** in OpenApi.ts

### OpenAPI Extensions

- **`x-tagGroups`:** Scalar and Swagger UI extension for nested tag display
- **`x-displayName`:** Redoc extension for tag display names
- **`tags[].externalDocs`:** Link to external documentation

### Effect Platform Patterns

- **Single-level APIs:** Most Effect examples use flat group structure
- **`addHttpApi`:** Used for modular API composition, not nesting
- **Group naming:** Use clear, descriptive identifiers (auto-generate operationIds)
- **Annotations:** Leverage OpenApi annotations for rich documentation

---

## Conclusion

The current IAM API structure is **architecturally sound** and follows Effect Platform best practices. The perceived "flat" documentation is a limitation of OpenAPI's tag system, not a flaw in the code structure.

**Recommended Actions:**

1. **Keep the current architecture** - it's well-organized and type-safe
2. **Improve exports** - make `IamApi` and `IamApiLive` top-level exports
3. **Add rich annotations** - use OpenApi annotations for better docs
4. **Optional:** Add `x-tagGroups` transform for nested display in Scalar
5. **Document the pattern** - create internal docs on this approach for future slices

The real value is in the **type-safe client SDK** and **maintainable codebase**, not cosmetic documentation nesting.
