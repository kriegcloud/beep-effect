# IAM Client Patterns

Canonical patterns for implementing authentication modules in `@beep/iam-client`. These patterns serve as the source of truth for refactoring legacy modules.

## Table of Contents

- [Module Structure](#module-structure)
- [Feature Structure](#feature-structure)
- [Contract Patterns](#contract-patterns)
- [Handler Patterns](#handler-patterns)
- [Service & Layer Patterns](#service--layer-patterns)
- [Atom Patterns](#atom-patterns)
- [Form Patterns](#form-patterns)
- [JSDoc Conventions](#jsdoc-conventions)
- [Naming Conventions](#naming-conventions)

---

## Module Structure

Each authentication module follows a consistent directory structure.

### Directory Layout

```
src/
├── sign-in/                    # Module directory
│   ├── index.ts                # Namespace export (re-exports from mod.ts)
│   ├── mod.ts                  # Module barrel (re-exports all features)
│   ├── atoms.ts                # React atom hooks
│   ├── form.ts                 # React Hook Form integration
│   ├── layer.ts                # Effect Layer composition
│   ├── service.ts              # Effect Service definition + atom runtime
│   ├── email/                  # Feature directory
│   │   ├── index.ts            # Feature namespace export
│   │   ├── mod.ts              # Feature barrel
│   │   ├── contract.ts         # Payload/Success/Wrapper schemas
│   │   └── handler.ts          # Effect handler implementation
│   └── username/               # Additional feature
│       └── ...                 # Same structure
```

### File Responsibilities

| File         | Purpose                                                               |
|--------------|-----------------------------------------------------------------------|
| `index.ts`   | Single namespace export (e.g., `export * as SignIn from "./mod.ts"`)  |
| `mod.ts`     | Barrel file re-exporting all features and module-level exports        |
| `atoms.ts`   | React hooks wrapping atom operations with `useAtomValue`/`useAtomSet` |
| `form.ts`    | `useAppForm` hooks with schema validation and atom submission         |
| `layer.ts`   | `WrapperGroup` definition and `Layer` composition                     |
| `service.ts` | `Effect.Service` definition with `accessors: true` and atom `runtime` |

---

## Feature Structure

Each feature (email, username, etc.) within a module has four files.

### Feature Files

```
email/
├── index.ts      # Namespace export: export * as Email from "./mod.ts"
├── mod.ts        # Barrel: export * from "./contract.ts"; export * from "./handler.ts"
├── contract.ts   # Schemas: Payload, Success, Wrapper (or PayloadFrom + Payload for transforms)
└── handler.ts    # Implementation: Handler = Wrapper.implement(...)
```

### index.ts Pattern

```typescript
/**
 * @module @beep/iam-client/sign-in/email
 * @category SignIn/Email
 * @since 0.1.0
 */
export * as Email from "./mod.ts";
```

### mod.ts Pattern

```typescript
/**
 * @module @beep/iam-client/sign-in/email/mod
 * @category SignIn/Email
 * @since 0.1.0
 */
export * from "./contract.ts";
export * from "./handler.ts";
```

---

## Contract Patterns

Contracts define the type-safe interface between UI and Better Auth. Two patterns exist depending on payload complexity.

### Pattern Selection

| Use Case | Pattern | Example |
|----------|---------|---------|
| Fields map 1:1 to API | Simple Pattern | `sign-in/email`, `core/sign-out` |
| Computed fields, validation, different form vs API shape | Transform Pattern | `sign-up/email` |

---

### Simple Pattern (Default)

Use when form fields directly map to Better Auth API parameters.

**Canonical Example: `sign-in/email/contract.ts`**

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/email");

// 1. Payload - Direct class (no transform needed)
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
  },
  // Default form values (use encoded types - plain strings)
  formValuesAnnotation({
    email: "",
    password: "",
  })
) {}

// 2. Success - Response schema
export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    user: Common.DomainUserFromBetterAuthUser,
  }
) {}

// 3. Wrapper - Contract with optional middleware
export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
```

**When to Use**: Most handlers. Form fields match API parameters without transformation.

---

### Transform Pattern (Complex Payloads)

Use when form differs from API (computed fields, password confirmation, field renaming).

**Canonical Example: `sign-up/email/contract.ts`**

```typescript
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-up/email");

// 1. PayloadFrom - Form input schema (what UI binds to)
export class PayloadFrom extends S.Class<PayloadFrom>($I`PayloadFrom`)(
  {
    email: Common.UserEmail,
    firstName: BS.NameAttribute,
    lastName: BS.NameAttribute,
    password: BS.Password,
    passwordConfirm: BS.Password,  // Not sent to API
    rememberMe: Common.RememberMe,
    redirectTo: S.optionalWith(BS.URLPath, { default: () => BS.URLPath.make("/") }),
  },
  formValuesAnnotation({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    passwordConfirm: "",
    rememberMe: true,
    redirectTo: "/",
  })
) {
  // Computed getter for API
  get name() {
    return `${this.firstName} ${this.lastName}`;
  }
}

// 2. PayloadEncodedStruct - Wire format (what Better Auth expects)
const PayloadEncodedStruct = S.Struct({
  email: S.String,
  name: S.String,           // Computed from firstName + lastName
  password: S.String,
  rememberMe: S.optional(S.Boolean),
  callbackURL: S.optional(S.String),
});

// 3. Payload - Transform between form and API
export const Payload = S.transformOrFail(PayloadEncodedStruct, PayloadFrom, {
  strict: true,
  decode: /* API → Form (rarely used, for schema completeness) */,
  encode: Effect.fnUntraced(function* (encodedFields, _, ast, formInstance) {
    // Validate passwords match
    if (encodedFields.password !== encodedFields.passwordConfirm) {
      return yield* Effect.fail(new ParseResult.Type(ast, encodedFields, "Passwords do not match"));
    }
    // Return API payload using computed getter
    return {
      email: encodedFields.email,
      name: formInstance.name,  // 4th param is class instance with getters
      password: encodedFields.password,
      rememberMe: encodedFields.rememberMe,
      callbackURL: encodedFields.redirectTo,
    };
  }),
});

// 4. Success - Response schema
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
    token: BS.OptionFromNullishOptionalProperty(S.Redacted(S.String), null),
  }
) {}

// 5. Wrapper
export const Wrapper = W.Wrapper.make("Email", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
```

**When to Use**:
- Computed fields (firstName + lastName → name)
- Password confirmation validation
- Field renaming (redirectTo → callbackURL)
- Additional validation beyond schema types

---

### Payload Guidelines

**Simple Pattern (Payload class)**:
- Use `S.Class` directly
- Include `formValuesAnnotation()` with default form values
- Default values use encoded types (plain strings for Redacted fields)

**Transform Pattern (PayloadFrom + Payload transform)**:
- `PayloadFrom` is the form-facing schema
- `PayloadEncodedStruct` is the wire format
- `Payload` transform connects them
- Use `S.transformOrFail` when validation is needed
- Access class instance via 4th parameter in encode for computed getters

### Success Schema Guidelines

- Use `S.Class` for response schemas
- Transform Better Auth types via `Common.DomainUserFromBetterAuthUser`
- Handle nullable/optional fields with `BS.OptionFromNullishOptionalProperty`
- Redact sensitive tokens with `S.Redacted(S.String)`

---

## Handler Patterns

Handlers implement contracts using `wrapIamMethod`.

### Standard Handler Pattern

```typescript
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    before: Common.withCaptchaResponse,
  })((encodedPayload, captchaResponse) =>
    client.signIn.email({
      ...encodedPayload,
      fetchOptions: {
        headers: {
          "x-captcha-response": captchaResponse,
        },
      },
    })
  )
);
```

### wrapIamMethod Options

| Option           | Type             | Purpose                                            |
|------------------|------------------|----------------------------------------------------|
| `wrapper`        | `Wrapper`        | The contract wrapper for schema access             |
| `mutatesSession` | `boolean`        | Triggers `$sessionSignal` notification when `true` |
| `before`         | `(ctx) => value` | Middleware context extractor (e.g., captcha token) |

### No-Payload Handler Pattern

For operations without input payload (e.g., sign-out, get-session):

```typescript
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.signOut())
);
```

---

## Service & Layer Patterns

Services compose handlers into Effect dependency injection layers.

### layer.ts Pattern

```typescript
import { ReCaptcha } from "@beep/shared-client";
import { Wrap } from "@beep/wrap";
import * as Layer from "effect/Layer";
import { Email } from "./email";
import { Username } from "./username";

// Group wrappers (positional arguments, not object)
export const Group = Wrap.WrapperGroup.make(Email.Wrapper, Username.Wrapper);

// Create Layer from Group with handler implementations
export const layer = Group.toLayer({
  Email: Email.Handler,
  Username: Username.Handler,
}).pipe(Layer.provide(ReCaptcha.ReCaptchaLive));  // Provide middleware dependencies
```

**CRITICAL**: `WrapperGroup.make()` takes **positional arguments**, not a labeled object.

```typescript
// ✅ CORRECT - Positional arguments
Wrap.WrapperGroup.make(Email.Wrapper, Username.Wrapper)

// ❌ WRONG - Labeled object (old pattern, no longer used)
W.WrapperGroup.make("SignIn", { Email: Email.Wrapper, Username: Username.Wrapper })
```

### service.ts Pattern

```typescript
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Group, layer } from "./layer.ts";

const $I = $IamClientId.create("sign-in/service");

// Service with accessors for all handlers
export class Service extends Effect.Service<Service>()($I`Service`, {
  accessors: true,
  effect: Group.accessHandlers("Email", "Username"),
}) {}

// Atom runtime with all dependencies provided
export const runtime = Common.makeAtomRuntime(
  Service.Default.pipe(Layer.provide(layer))
);
```

---

## Atom Patterns

Atoms provide React hooks for executing handlers with feedback.

### atoms.ts Pattern

```typescript
import * as Common from "@beep/iam-client/_internal";
import { useAtomRefresh, useAtomSet, useAtomValue } from "@effect-atom/jotai";
import { Service, runtime } from "./service.ts";

// Atom definitions using Service accessors
const EmailAtom = runtime.atom(Service.Email);
const UsernameAtom = runtime.atom(Service.Username);

// Hook factory returning atom operations
export const use = () => ({
  email: useAtomSet(EmailAtom, Common.modePromise),
  username: useAtomSet(UsernameAtom, Common.modePromise),
});
```

### Atom Hook Guidelines

- Return plain object with handler operations
- Use `Common.modePromise` for standard Promise-based execution
- Avoid complex Exit handling - keep atoms simple
- Use `useAtomSet` for write operations, `useAtomValue` for read operations
- Use `useAtomRefresh` for refresh operations (e.g., session refresh)

---

## Form Patterns

Form integration provides pre-configured React Hook Form instances with schema validation.

### form.ts Pattern

```typescript
import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Atoms from "./atoms";
import { Email } from "./email";
import { Username } from "./username";

export const use = () => {
  const { username, email } = Atoms.use();

  return {
    emailForm: useAppForm(
      formOptionsWithDefaults({
        schema: Email.Payload,
        onSubmit: email,
      })
    ),
    usernameForm: useAppForm(
      formOptionsWithDefaults({
        schema: Username.Payload,
        onSubmit: username,
      })
    ),
  };
};
```

### Usage in Components

```typescript
import { SignIn } from "@beep/iam-client/sign-in";

function SignInForm() {
  const { emailForm } = SignIn.Form.use();

  return (
    <form onSubmit={emailForm.handleSubmit}>
      <input {...emailForm.register("email")} />
      <input {...emailForm.register("password")} type="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Form Hook Guidelines

- Use `useAppForm` with `formOptionsWithDefaults` for consistent form setup
- Pass the `Payload` schema for validation (defaults come from `formValuesAnnotation`)
- Connect `onSubmit` to the corresponding atom handler
- Return named form instances for each feature (e.g., `emailForm`, `usernameForm`)

---

## JSDoc Conventions

Consistent documentation across all files.

### Required Tags

Every file MUST include:

```typescript
/**
 * @fileoverview Brief description of file purpose.
 *
 * @module @beep/iam-client/{module}/{feature}/{file}
 * @category {Module}/{Feature}
 * @since 0.1.0
 */
```

### Category Hierarchy

| Level    | Format                      | Example                |
|----------|-----------------------------|------------------------|
| Module   | `{Module}`                  | `SignIn`               |
| Feature  | `{Module}/{Feature}`        | `SignIn/Email`         |
| Specific | `{Module}/{Feature}/{Type}` | `SignIn/Email/Schemas` |

### Category Examples

```typescript
// Module-level files (layer.ts, service.ts, atoms.ts)
@category SignIn

// Feature-level files (contract.ts, handler.ts)
@category SignIn/Email

// Specific exports within a file
@category SignIn/Email/Schemas    // For PayloadFrom, Payload, Success
@category SignIn/Email/Handlers   // For Handler
@category SignIn/Email/Contracts  // For Wrapper
```

### Export Documentation

````typescript
/**
 * Email sign-in handler with captcha validation.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/iam-client/sign-in"
 * const result = yield* Email.Handler(payload)
 * ```
 *
 * @category SignIn/Email/Handlers
 * @since 0.1.0
 */
export const Handler = ...
````

---

## Naming Conventions

Consistent naming across all modules.

### File Names

| Type                   | Convention    | Example                     |
|------------------------|---------------|-----------------------------|
| Namespace export       | `index.ts`    | `sign-in/email/index.ts`    |
| Barrel file            | `mod.ts`      | `sign-in/email/mod.ts`      |
| Contract schemas       | `contract.ts` | `sign-in/email/contract.ts` |
| Handler implementation | `handler.ts`  | `sign-in/email/handler.ts`  |

### Export Names

| Type              | Convention    | Example                                                          |
|-------------------|---------------|------------------------------------------------------------------|
| Payload (simple)  | `Payload`     | `export class Payload extends S.Class`                           |
| Form input schema | `PayloadFrom` | `export class PayloadFrom extends S.Class` (transform pattern)   |
| Transform schema  | `Payload`     | `export const Payload = S.transformOrFail(...)` (transform only) |
| Response schema   | `Success`     | `export class Success extends S.Class`                           |
| Contract wrapper  | `Wrapper`     | `export const Wrapper = W.Wrapper.make(...)`                     |
| Handler function  | `Handler`     | `export const Handler = Contract.Wrapper.implement(...)`         |
| Service class     | `Service`     | `export class Service extends Effect.Service`                    |
| Handler group     | `Group`       | `export const Group = Wrap.WrapperGroup.make(W1, W2)`            |
| Layer export      | `layer`       | `export const layer = Group.toLayer(...)`                        |
| Runtime export    | `runtime`     | `export const runtime = Common.makeAtomRuntime(...)`             |

### Namespace Names

Feature namespaces use PascalCase matching the feature name:

```typescript
export * as Email from "./mod.ts";      // sign-in/email/index.ts
export * as Username from "./mod.ts";   // sign-in/username/index.ts
export * as SignIn from "./mod.ts";     // sign-in/index.ts
```

---

## Migration Checklist

When refactoring legacy modules to use these patterns:

1. **Structure**
   - [ ] Create `index.ts` with namespace export
   - [ ] Create `mod.ts` barrel file
   - [ ] Split into feature directories if multiple features

2. **Contracts (Simple Pattern - default)**
   - [ ] Create `Payload` class with `formValuesAnnotation`
   - [ ] Create `Success` response class
   - [ ] Create `Wrapper` with appropriate middleware

3. **Contracts (Transform Pattern - when needed)**
   - [ ] Define `PayloadFrom` class with `formValuesAnnotation` (form-facing)
   - [ ] Define `PayloadEncodedStruct` (wire format)
   - [ ] Create `Payload` transform with `S.transformOrFail`
   - [ ] Create `Success` response class
   - [ ] Create `Wrapper` with appropriate middleware

4. **Handler**
   - [ ] Use `Wrapper.implement()` + `wrapIamMethod()`
   - [ ] Remove legacy `createHandler` usage
   - [ ] Set `mutatesSession` flag appropriately

5. **Service Layer**
   - [ ] Create `layer.ts` with `WrapperGroup.make(Wrapper1, Wrapper2)`
   - [ ] Create `service.ts` with `Effect.Service`
   - [ ] Export `runtime` for atom usage

6. **UI Integration**
   - [ ] Create `atoms.ts` with simple hook factory
   - [ ] Create `form.ts` with `useAppForm` hooks

7. **Documentation**
   - [ ] Add `@fileoverview` to all files
   - [ ] Add `@module` tags with correct paths
   - [ ] Add `@category` tags following hierarchy
   - [ ] Add `@since` version tags
   - [ ] Add `@example` blocks to public exports
