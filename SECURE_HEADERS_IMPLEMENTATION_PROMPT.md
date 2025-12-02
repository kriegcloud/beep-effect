# Secure Headers Implementation Prompt

## Context

You are implementing additional security headers for the `@beep/build-utils` package. This package provides Next.js configuration utilities including secure HTTP header generation using Effect.

**Working Directory**: `/home/elpresidank/YeeBois/projects/beep-effect/tooling/build-utils/`

## Objective

Implement the following missing security headers following the exact patterns established in the codebase:

1. **Permissions-Policy** (HIGH PRIORITY)
2. **Cross-Origin-Opener-Policy (COOP)** (MEDIUM PRIORITY)
3. **Cross-Origin-Embedder-Policy (COEP)** (MEDIUM PRIORITY)
4. **Cross-Origin-Resource-Policy (CORP)** (MEDIUM PRIORITY)
5. **X-Permitted-Cross-Domain-Policies** (LOW PRIORITY)

---

## File Locations

All source files go in: `src/secure-headers/`
All test files go in: `test/`

---

## Architecture Pattern (MUST FOLLOW EXACTLY)

Every header implementation consists of:

1. **Option Schema** - Effect Schema for configuration input validation
2. **Response Header Schema** - Effect Schema for the output structure
3. **Header Transform Schema** - `S.transformOrFail` that converts option → ResponseHeader (bidirectional)
4. **Option Type** - Derived from Schema: `typeof XxxOptionSchema.Type`
5. **Header Value Creator** - Effect that transforms option → string value
6. **Header Creator** - Effect that wraps value in `Option<ResponseHeader>`
7. **Exports** - Add to `src/secure-headers/index.ts`
8. **Integration** - Add to `src/create-secure-headers.ts`
9. **Tests** - Comprehensive test coverage including Schema tests

---

## Reference Implementation: `no-sniff.ts` (COMPLETE WITH SCHEMAS)

```typescript
// src/secure-headers/no-sniff.ts
import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-Content-Type-Options";

/**
 * Schema for the `nosniff` option value.
 * Accepts `false` to disable or `"nosniff"` to enable.
 */
export const NosniffOptionSchema = S.Union(S.Literal(false), S.Literal("nosniff"));

export type NosniffOption = typeof NosniffOptionSchema.Type;

/**
 * Schema for the X-Content-Type-Options response header output.
 */
const NosniffResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the X-Content-Type-Options response header.
 * Transforms a NosniffOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "X-Content-Type-Options", value: undefined }`
 * - `"nosniff"` → decodes to `{ name: "X-Content-Type-Options", value: "nosniff" }`
 * - `undefined` (default) → decodes to `{ name: "X-Content-Type-Options", value: "nosniff" }`
 */
export const NosniffHeaderSchema = S.transformOrFail(
  S.Union(NosniffOptionSchema, S.Undefined),
  NosniffResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "nosniff" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === "nosniff") {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "nosniff" });
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (header.value === "nosniff") {
        return ParseResult.succeed("nosniff" as const);
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
).annotations({ identifier: "NosniffHeaderSchema" });

export type NosniffHeader = typeof NosniffHeaderSchema.Type;

export const createXContentTypeOptionsHeaderValue = (
  option?: undefined | NosniffOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return "nosniff";
    if (option === false) return undefined;
    if (option === "nosniff") return option;

    return yield* new SecureHeadersError({
      type: "NO_SNIFF",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createXContentTypeOptionsHeaderValue"));

export const createNosniffHeader = (
  option?: undefined | NosniffOption,
  headerValueCreator = createXContentTypeOptionsHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createNosniffHeader"));
```

---

## Schema Pattern Breakdown

Each header implementation MUST include these Schema components:

### 1. Option Schema (Input Validation)

```typescript
// Defines valid input values
export const XxxOptionSchema = S.Union(
  S.Literal(false),           // Always include false to disable
  S.Literal("value1"),
  S.Literal("value2"),
  // ... all valid literal values
);

export type XxxOption = typeof XxxOptionSchema.Type;
```

### 2. Response Header Schema (Output Structure)

```typescript
// Defines the output structure
const XxxResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),        // Literal type for the header name
  value: S.UndefinedOr(S.String),     // undefined when disabled, string when enabled
});
```

### 3. Header Transform Schema (Bidirectional Transformation)

```typescript
/**
 * Transforms option input ↔ ResponseHeader output
 *
 * DECODE: option → ResponseHeader (used when parsing config)
 * ENCODE: ResponseHeader → option (used for serialization/testing)
 */
export const XxxHeaderSchema = S.transformOrFail(
  S.Union(XxxOptionSchema, S.Undefined),  // Input: option or undefined
  XxxResponseHeaderSchema,                  // Output: ResponseHeader structure
  {
    strict: true,
    decode: (option, _, ast) => {
      // Handle undefined → default behavior
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "default" });
      }
      // Handle false → disabled
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      // Handle valid values
      if (isValidValue(option)) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      // Handle invalid values
      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      // Reverse transformation for encoding
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (isValidValue(header.value)) {
        return ParseResult.succeed(header.value as XxxOption);
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
).annotations({ identifier: "XxxHeaderSchema" });

export type XxxHeader = typeof XxxHeaderSchema.Type;
```

### 4. Required Imports for Schemas

```typescript
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
```

---

## Reference Implementation: `referrer-policy.ts` (Array Support)

```typescript
// src/secure-headers/referrer-policy.ts
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { SecureHeadersError } from "./errors.ts";
import { wrapArray } from "./helpers.ts";
import type { ResponseHeader } from "./types.ts";

const supportedValues = [
  "no-referrer",
  "no-referrer-when-downgrade",
  // ... more values
] as const;
type SupportedValue = (typeof supportedValues)[number];
export type ReferrerPolicyOption = false | SupportedValue | SupportedValue[];

const headerName = "Referrer-Policy";

export const createReferrerPolicyHeaderValue = (
  option?: undefined | ReferrerPolicyOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return undefined;
    if (option === false) return undefined;

    const values = wrapArray(option);

    for (const value of values) {
      if ((value as string) === "unsafe-url")
        return yield* new SecureHeadersError({
          type: "REFERRER_POLICY",
          message: `Cannot specify a dangerous value for ${headerName}: ${value}`,
        });
      if (!supportedValues.includes(value))
        return yield* new SecureHeadersError({
          type: "REFERRER_POLICY",
          message: `Invalid value for ${headerName}: ${value}`,
        });
    }

    return pipe(values, A.join(", "));
  }).pipe(Effect.withSpan("createReferrerPolicyHeaderValue"));
```

---

## Shared Types and Helpers

### `types.ts`
```typescript
export type ResponseHeader = {
  readonly name: string;
  readonly value?: string;
};
```

### `helpers.ts`
```typescript
import * as A from "effect/Array";
export const encodeStrictURI = (uri: string | URL) => new URL(uri.toString()).toString();
export const wrapArray = <T>(value: T | T[]): T[] => (A.isArray(value) ? value : A.make(value));
```

### `errors.ts`
```typescript
import * as Data from "effect/Data";

const SecureHeadersTypeEnum = {
  CONTENT_SECURITY_POLICY: "CONTENT_SECURITY_POLICY",
  FORCE_HTTPS_REDIRECT: "FORCE_HTTPS_REDIRECT",
  // ... existing types
  CORE: "CORE",
} as const;

export type SecureHeadersErrorType = (typeof SecureHeadersTypeEnum)[keyof typeof SecureHeadersTypeEnum];

export class SecureHeadersError extends Data.TaggedError("SecureHeadersError")<{
  readonly message: string;
  readonly type: SecureHeadersErrorType;
  readonly cause?: unknown;
}> {}
```

---

## TASK 1: Permissions-Policy Header

### Specification

**Header Name**: `Permissions-Policy`
**Purpose**: Controls which browser features can be used (camera, microphone, geolocation, etc.)

### Supported Directives (implement ALL)

```typescript
const permissionsPolicyDirectives = [
  "accelerometer",
  "ambient-light-sensor",
  "autoplay",
  "battery",
  "camera",
  "cross-origin-isolated",
  "display-capture",
  "document-domain",
  "encrypted-media",
  "execution-while-not-rendered",
  "execution-while-out-of-viewport",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "keyboard-map",
  "magnetometer",
  "microphone",
  "midi",
  "navigation-override",
  "payment",
  "picture-in-picture",
  "publickey-credentials-get",
  "screen-wake-lock",
  "sync-xhr",
  "usb",
  "web-share",
  "xr-spatial-tracking",
] as const;
```

### Allowlist Values

Each directive accepts an "allowlist" which can be:
- `*` - Allow all origins
- `self` - Allow same origin only (renders as `self`)
- `()` - Deny all (empty parens)
- `"https://example.com"` - Allow specific origin(s)

### Option Type Definition

```typescript
type PermissionsPolicyDirectiveValue =
  | "*"                           // Allow all
  | "self"                        // Same origin
  | "none"                        // Deny (renders as empty parens)
  | `"${string}"`                 // Specific origin (quoted)
  | Array<"self" | `"${string}"`> // Multiple origins

type PermissionsPolicyDirectives = Partial<{
  readonly [K in typeof permissionsPolicyDirectives[number]]: PermissionsPolicyDirectiveValue;
}>;

export type PermissionsPolicyOption =
  | false
  | {
      readonly directives: PermissionsPolicyDirectives;
    };
```

### Output Format

```
Permissions-Policy: camera=(), microphone=(self), geolocation=(self "https://maps.example.com"), fullscreen=*
```

### File to Create

<tool_call>
Write file: src/secure-headers/permissions-policy.ts
</tool_call>

### Error Type to Add

<tool_call>
Edit file: src/secure-headers/errors.ts
Add to SecureHeadersTypeEnum: PERMISSIONS_POLICY: "PERMISSIONS_POLICY"
</tool_call>

### Test File to Create

<tool_call>
Write file: test/permissions-policy.test.ts
</tool_call>

### Required Exports

```typescript
// Schemas
export const PermissionsPolicyOptionSchema = ...
export const PermissionsPolicyHeaderSchema = ...
export type PermissionsPolicyOption = typeof PermissionsPolicyOptionSchema.Type;
export type PermissionsPolicyHeader = typeof PermissionsPolicyHeaderSchema.Type;

// Effect creators
export const createPermissionsPolicyHeaderValue = ...
export const createPermissionsPolicyHeader = ...
```

### Test Cases Required

**Effect Tests:**
1. `undefined` option → returns `Option.none()`
2. `false` option → returns `Option.none()`
3. Single directive with `none` → `camera=()`
4. Single directive with `self` → `microphone=(self)`
5. Single directive with `*` → `fullscreen=*`
6. Single directive with specific origin → `geolocation=("https://example.com")`
7. Multiple origins → `camera=(self "https://example.com")`
8. Multiple directives → correct comma-separated output
9. Invalid directive name → `SecureHeadersError`

**Schema Tests:**
10. `PermissionsPolicyOptionSchema` accepts valid directive objects
11. `PermissionsPolicyOptionSchema` accepts `false`
12. `PermissionsPolicyOptionSchema` rejects invalid directive names
13. `PermissionsPolicyHeaderSchema` decode transforms directives to header string
14. `PermissionsPolicyHeaderSchema` decode handles `undefined` → `value: undefined`
15. `PermissionsPolicyHeaderSchema` decode handles `false` → `value: undefined`

---

## TASK 2: Cross-Origin-Opener-Policy (COOP)

### Specification

**Header Name**: `Cross-Origin-Opener-Policy`
**Purpose**: Prevents cross-origin documents from opening in the same browsing context group

### Supported Values

```typescript
const coopValues = [
  "unsafe-none",
  "same-origin-allow-popups",
  "same-origin",
  "same-origin-plus-COEP",
] as const;
```

### Option Type

```typescript
export type CrossOriginOpenerPolicyOption = false | typeof coopValues[number];
```

### Default Behavior

- `undefined` → returns `Option.none()` (no default - explicit opt-in required)

### File to Create

<tool_call>
Write file: src/secure-headers/cross-origin-opener-policy.ts
</tool_call>

### Error Type to Add

<tool_call>
Edit file: src/secure-headers/errors.ts
Add to SecureHeadersTypeEnum: CROSS_ORIGIN_OPENER_POLICY: "CROSS_ORIGIN_OPENER_POLICY"
</tool_call>

### Test File to Create

<tool_call>
Write file: test/cross-origin-opener-policy.test.ts
</tool_call>

### Required Exports

```typescript
// Schemas
export const CrossOriginOpenerPolicyOptionSchema = ...
export const CrossOriginOpenerPolicyHeaderSchema = ...
export type CrossOriginOpenerPolicyOption = typeof CrossOriginOpenerPolicyOptionSchema.Type;
export type CrossOriginOpenerPolicyHeader = typeof CrossOriginOpenerPolicyHeaderSchema.Type;

// Effect creators
export const createCrossOriginOpenerPolicyHeaderValue = ...
export const createCrossOriginOpenerPolicyHeader = ...
```

### Test Cases Required

**Effect Tests:**
1. `undefined` option → returns `Option.none()`
2. `false` option → returns `Option.none()`
3. `"unsafe-none"` → header value `"unsafe-none"`
4. `"same-origin-allow-popups"` → header value `"same-origin-allow-popups"`
5. `"same-origin"` → header value `"same-origin"`
6. `"same-origin-plus-COEP"` → header value `"same-origin-plus-COEP"`
7. Invalid value → `SecureHeadersError`

**Schema Tests:**
8. `CrossOriginOpenerPolicyOptionSchema` accepts all valid values
9. `CrossOriginOpenerPolicyOptionSchema` accepts `false`
10. `CrossOriginOpenerPolicyOptionSchema` rejects invalid values
11. `CrossOriginOpenerPolicyHeaderSchema` decode/encode round-trip for each valid value
12. `CrossOriginOpenerPolicyHeaderSchema` decode `false` → `value: undefined`

---

## TASK 3: Cross-Origin-Embedder-Policy (COEP)

### Specification

**Header Name**: `Cross-Origin-Embedder-Policy`
**Purpose**: Prevents loading cross-origin resources that don't grant permission

### Supported Values

```typescript
const coepValues = [
  "unsafe-none",
  "require-corp",
  "credentialless",
] as const;
```

### Option Type

```typescript
export type CrossOriginEmbedderPolicyOption = false | typeof coepValues[number];
```

### File to Create

<tool_call>
Write file: src/secure-headers/cross-origin-embedder-policy.ts
</tool_call>

### Error Type to Add

<tool_call>
Edit file: src/secure-headers/errors.ts
Add to SecureHeadersTypeEnum: CROSS_ORIGIN_EMBEDDER_POLICY: "CROSS_ORIGIN_EMBEDDER_POLICY"
</tool_call>

### Test File to Create

<tool_call>
Write file: test/cross-origin-embedder-policy.test.ts
</tool_call>

### Required Exports

```typescript
// Schemas
export const CrossOriginEmbedderPolicyOptionSchema = ...
export const CrossOriginEmbedderPolicyHeaderSchema = ...
export type CrossOriginEmbedderPolicyOption = typeof CrossOriginEmbedderPolicyOptionSchema.Type;
export type CrossOriginEmbedderPolicyHeader = typeof CrossOriginEmbedderPolicyHeaderSchema.Type;

// Effect creators
export const createCrossOriginEmbedderPolicyHeaderValue = ...
export const createCrossOriginEmbedderPolicyHeader = ...
```

### Test Cases Required

**Effect Tests:**
1. `undefined` option → returns `Option.none()`
2. `false` option → returns `Option.none()`
3. `"unsafe-none"` → header value `"unsafe-none"`
4. `"require-corp"` → header value `"require-corp"`
5. `"credentialless"` → header value `"credentialless"`
6. Invalid value → `SecureHeadersError`

**Schema Tests:**
7. `CrossOriginEmbedderPolicyOptionSchema` accepts all valid values
8. `CrossOriginEmbedderPolicyOptionSchema` accepts `false`
9. `CrossOriginEmbedderPolicyOptionSchema` rejects invalid values
10. `CrossOriginEmbedderPolicyHeaderSchema` decode/encode round-trip for each valid value

---

## TASK 4: Cross-Origin-Resource-Policy (CORP)

### Specification

**Header Name**: `Cross-Origin-Resource-Policy`
**Purpose**: Prevents other origins from loading your resources

### Supported Values

```typescript
const corpValues = [
  "same-site",
  "same-origin",
  "cross-origin",
] as const;
```

### Option Type

```typescript
export type CrossOriginResourcePolicyOption = false | typeof corpValues[number];
```

### File to Create

<tool_call>
Write file: src/secure-headers/cross-origin-resource-policy.ts
</tool_call>

### Error Type to Add

<tool_call>
Edit file: src/secure-headers/errors.ts
Add to SecureHeadersTypeEnum: CROSS_ORIGIN_RESOURCE_POLICY: "CROSS_ORIGIN_RESOURCE_POLICY"
</tool_call>

### Test File to Create

<tool_call>
Write file: test/cross-origin-resource-policy.test.ts
</tool_call>

### Required Exports

```typescript
// Schemas
export const CrossOriginResourcePolicyOptionSchema = ...
export const CrossOriginResourcePolicyHeaderSchema = ...
export type CrossOriginResourcePolicyOption = typeof CrossOriginResourcePolicyOptionSchema.Type;
export type CrossOriginResourcePolicyHeader = typeof CrossOriginResourcePolicyHeaderSchema.Type;

// Effect creators
export const createCrossOriginResourcePolicyHeaderValue = ...
export const createCrossOriginResourcePolicyHeader = ...
```

### Test Cases Required

**Effect Tests:**
1. `undefined` option → returns `Option.none()`
2. `false` option → returns `Option.none()`
3. `"same-site"` → header value `"same-site"`
4. `"same-origin"` → header value `"same-origin"`
5. `"cross-origin"` → header value `"cross-origin"`
6. Invalid value → `SecureHeadersError`

**Schema Tests:**
7. `CrossOriginResourcePolicyOptionSchema` accepts all valid values
8. `CrossOriginResourcePolicyOptionSchema` accepts `false`
9. `CrossOriginResourcePolicyOptionSchema` rejects invalid values
10. `CrossOriginResourcePolicyHeaderSchema` decode/encode round-trip for each valid value

---

## TASK 5: X-Permitted-Cross-Domain-Policies

### Specification

**Header Name**: `X-Permitted-Cross-Domain-Policies`
**Purpose**: Controls Adobe Flash/Acrobat cross-domain data loading

### Supported Values

```typescript
const permittedCrossDomainValues = [
  "none",
  "master-only",
  "by-content-type",
  "by-ftp-filename",
  "all",
] as const;
```

### Option Type

```typescript
export type PermittedCrossDomainPoliciesOption = false | typeof permittedCrossDomainValues[number];
```

### Default Behavior

- `undefined` → returns `"none"` (secure default)

### File to Create

<tool_call>
Write file: src/secure-headers/permitted-cross-domain-policies.ts
</tool_call>

### Error Type to Add

<tool_call>
Edit file: src/secure-headers/errors.ts
Add to SecureHeadersTypeEnum: PERMITTED_CROSS_DOMAIN_POLICIES: "PERMITTED_CROSS_DOMAIN_POLICIES"
</tool_call>

### Test File to Create

<tool_call>
Write file: test/permitted-cross-domain-policies.test.ts
</tool_call>

### Required Exports

```typescript
// Schemas
export const PermittedCrossDomainPoliciesOptionSchema = ...
export const PermittedCrossDomainPoliciesHeaderSchema = ...
export type PermittedCrossDomainPoliciesOption = typeof PermittedCrossDomainPoliciesOptionSchema.Type;
export type PermittedCrossDomainPoliciesHeader = typeof PermittedCrossDomainPoliciesHeaderSchema.Type;

// Effect creators
export const createPermittedCrossDomainPoliciesHeaderValue = ...
export const createPermittedCrossDomainPoliciesHeader = ...
```

### Test Cases Required

**Effect Tests:**
1. `undefined` option → returns `Option.some()` with value `"none"` (HAS DEFAULT)
2. `false` option → returns `Option.none()`
3. `"none"` → header value `"none"`
4. `"master-only"` → header value `"master-only"`
5. `"by-content-type"` → header value `"by-content-type"`
6. `"by-ftp-filename"` → header value `"by-ftp-filename"`
7. `"all"` → header value `"all"`
8. Invalid value → `SecureHeadersError`

**Schema Tests:**
9. `PermittedCrossDomainPoliciesOptionSchema` accepts all valid values
10. `PermittedCrossDomainPoliciesOptionSchema` accepts `false`
11. `PermittedCrossDomainPoliciesOptionSchema` rejects invalid values
12. `PermittedCrossDomainPoliciesHeaderSchema` decode `undefined` → `value: "none"` (default)
13. `PermittedCrossDomainPoliciesHeaderSchema` decode/encode round-trip for each valid value

---

## TASK 6: Update Index Exports

<tool_call>
Edit file: src/secure-headers/index.ts

Add imports (header creators):
import { createPermissionsPolicyHeader } from "./permissions-policy.ts";
import { createCrossOriginOpenerPolicyHeader } from "./cross-origin-opener-policy.ts";
import { createCrossOriginEmbedderPolicyHeader } from "./cross-origin-embedder-policy.ts";
import { createCrossOriginResourcePolicyHeader } from "./cross-origin-resource-policy.ts";
import { createPermittedCrossDomainPoliciesHeader } from "./permitted-cross-domain-policies.ts";

Add type exports (Option types):
export type { PermissionsPolicyOption } from "./permissions-policy.ts";
export type { CrossOriginOpenerPolicyOption } from "./cross-origin-opener-policy.ts";
export type { CrossOriginEmbedderPolicyOption } from "./cross-origin-embedder-policy.ts";
export type { CrossOriginResourcePolicyOption } from "./cross-origin-resource-policy.ts";
export type { PermittedCrossDomainPoliciesOption } from "./permitted-cross-domain-policies.ts";

Add Schema re-exports:
export {
  PermissionsPolicyOptionSchema,
  PermissionsPolicyHeaderSchema,
} from "./permissions-policy.ts";
export {
  CrossOriginOpenerPolicyOptionSchema,
  CrossOriginOpenerPolicyHeaderSchema,
} from "./cross-origin-opener-policy.ts";
export {
  CrossOriginEmbedderPolicyOptionSchema,
  CrossOriginEmbedderPolicyHeaderSchema,
} from "./cross-origin-embedder-policy.ts";
export {
  CrossOriginResourcePolicyOptionSchema,
  CrossOriginResourcePolicyHeaderSchema,
} from "./cross-origin-resource-policy.ts";
export {
  PermittedCrossDomainPoliciesOptionSchema,
  PermittedCrossDomainPoliciesHeaderSchema,
} from "./permitted-cross-domain-policies.ts";

Add to rules object:
createPermissionsPolicyHeader,
createCrossOriginOpenerPolicyHeader,
createCrossOriginEmbedderPolicyHeader,
createCrossOriginResourcePolicyHeader,
createPermittedCrossDomainPoliciesHeader,
</tool_call>

---

## TASK 7: Update create-secure-headers.ts

<tool_call>
Edit file: src/create-secure-headers.ts

1. Add type imports for all new option types

2. Add to CreateSecureHeadersOptions:
   readonly permissionsPolicy: PermissionsPolicyOption;
   readonly crossOriginOpenerPolicy: CrossOriginOpenerPolicyOption;
   readonly crossOriginEmbedderPolicy: CrossOriginEmbedderPolicyOption;
   readonly crossOriginResourcePolicy: CrossOriginResourcePolicyOption;
   readonly permittedCrossDomainPolicies: PermittedCrossDomainPoliciesOption;

3. Add JSDoc comments for each new option

4. Add to the fns array in createHeadersObject:
   rules.createPermissionsPolicyHeader(options.permissionsPolicy),
   rules.createCrossOriginOpenerPolicyHeader(options.crossOriginOpenerPolicy),
   rules.createCrossOriginEmbedderPolicyHeader(options.crossOriginEmbedderPolicy),
   rules.createCrossOriginResourcePolicyHeader(options.crossOriginResourcePolicy),
   rules.createPermittedCrossDomainPoliciesHeader(options.permittedCrossDomainPolicies),
</tool_call>

---

## TASK 8: Update NextConfig.ts Defaults

<tool_call>
Edit file: src/NextConfig.ts

1. Add type imports for new option types

2. Add to defaultSecureHeaders:
   permittedCrossDomainPolicies: "none" as PermittedCrossDomainPoliciesOption,

3. Add to mergeSecureHeaders function:
   ...optionalProp("permissionsPolicy", mergeSecureHeaderOption(user.permissionsPolicy, undefined)),
   ...optionalProp("crossOriginOpenerPolicy", mergeSecureHeaderOption(user.crossOriginOpenerPolicy, undefined)),
   ...optionalProp("crossOriginEmbedderPolicy", mergeSecureHeaderOption(user.crossOriginEmbedderPolicy, undefined)),
   ...optionalProp("crossOriginResourcePolicy", mergeSecureHeaderOption(user.crossOriginResourcePolicy, undefined)),
   ...optionalProp("permittedCrossDomainPolicies", mergeSecureHeaderOption(user.permittedCrossDomainPolicies, defaultSecureHeaders.permittedCrossDomainPolicies)),
</tool_call>

---

## TASK 9: Update errors.ts

<tool_call>
Edit file: src/secure-headers/errors.ts

Replace SecureHeadersTypeEnum with:

const SecureHeadersTypeEnum = {
  CONTENT_SECURITY_POLICY: "CONTENT_SECURITY_POLICY",
  FORCE_HTTPS_REDIRECT: "FORCE_HTTPS_REDIRECT",
  XSS_PROTECTION: "XSS_PROTECTION",
  REFERRER_POLICY: "REFERRER_POLICY",
  NO_SNIFF: "NO_SNIFF",
  NO_OPEN: "NO_OPEN",
  FRAME_GUARD: "FRAME_GUARD",
  EXPECT_CT: "EXPECT_CT",
  PERMISSIONS_POLICY: "PERMISSIONS_POLICY",
  CROSS_ORIGIN_OPENER_POLICY: "CROSS_ORIGIN_OPENER_POLICY",
  CROSS_ORIGIN_EMBEDDER_POLICY: "CROSS_ORIGIN_EMBEDDER_POLICY",
  CROSS_ORIGIN_RESOURCE_POLICY: "CROSS_ORIGIN_RESOURCE_POLICY",
  PERMITTED_CROSS_DOMAIN_POLICIES: "PERMITTED_CROSS_DOMAIN_POLICIES",
  CORE: "CORE",
} as const;
</tool_call>

---

## Test Pattern Reference

```typescript
// test/[header-name].test.ts
import {
  createXxxHeader,
  createXxxHeaderValue,
} from "@beep/build-utils/secure-headers/[header-name]";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option } from "effect";

const runEffect = <A, E>(effect: Effect.Effect<A, E, never>): Promise<A> =>
  Effect.runPromise(effect);

const runEffectExit = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runSyncExit(effect);

describe("createXxxHeader", () => {
  describe("when giving undefined", () => {
    it("should return None", async () => {
      const result = await runEffect(createXxxHeader());
      expect(Option.isNone(result)).toBe(true);
    });
  });

  describe("when giving false", () => {
    it("should return None", async () => {
      const result = await runEffect(createXxxHeader(false));
      expect(Option.isNone(result)).toBe(true);
    });
  });

  // Mock-based tests for header value creator injection
  describe("when giving valid option", () => {
    let headerValueCreatorMock: ReturnType<typeof mock<typeof createXxxHeaderValue>>;
    beforeEach(() => {
      headerValueCreatorMock = mock(createXxxHeaderValue);
    });

    it("should return Some with header when value is provided", async () => {
      const dummyValue = "expected-value";
      headerValueCreatorMock.mockReturnValue(Effect.succeed(dummyValue));

      const result = await runEffect(
        createXxxHeader("some-option", headerValueCreatorMock)
      );

      expect(Option.isSome(result)).toBe(true);
      if (Option.isSome(result)) {
        expect(result.value).toEqual({
          name: "X-Header-Name",
          value: dummyValue,
        });
      }
    });
  });
});

describe("createXxxHeaderValue", () => {
  // Test each valid value
  // Test invalid values return SecureHeadersError
});
```

---

## Validation Commands

After implementation, run these commands to verify:

```bash
# Type check
bunx turbo run check --filter=@beep/build-utils

# Run tests
bunx turbo run test --filter=@beep/build-utils

# Lint
bunx turbo run lint --filter=@beep/build-utils
```

---

## Implementation Order

1. Update `errors.ts` with all new error types FIRST
2. Implement `permissions-policy.ts` (most complex, do first)
3. Implement `cross-origin-opener-policy.ts`
4. Implement `cross-origin-embedder-policy.ts`
5. Implement `cross-origin-resource-policy.ts`
6. Implement `permitted-cross-domain-policies.ts`
7. Update `index.ts` exports
8. Update `create-secure-headers.ts`
9. Update `NextConfig.ts`
10. Write all test files
11. Run validation commands

---

## Critical Requirements

### Effect Functions
- [ ] ALL functions must return `Effect.Effect<..., SecureHeadersError, never>`
- [ ] ALL functions must use `Effect.withSpan("functionName")` for observability
- [ ] ALL header creators must accept optional `headerValueCreator` parameter for testability
- [ ] ALL option types must support `false` to explicitly disable
- [ ] Use `Effect.gen(function* () { ... })` pattern for all Effect generators

### Schema Requirements (MANDATORY)
- [ ] EVERY header file MUST export an `XxxOptionSchema` using `S.Union` of `S.Literal` values
- [ ] EVERY header file MUST export a `XxxHeaderSchema` using `S.transformOrFail`
- [ ] EVERY header file MUST export `XxxHeader` type derived from Schema
- [ ] Schema transformations MUST be bidirectional (decode AND encode)
- [ ] Schema MUST use `.annotations({ identifier: "XxxHeaderSchema" })` for debugging
- [ ] Import `* as ParseResult from "effect/ParseResult"` and `* as S from "effect/Schema"`

### Testing
- [ ] ALL tests must use `@beep/testkit` for `describe`, `expect`, `it`, `mock`, `beforeEach`
- [ ] ALL imports must use the `@beep/build-utils/secure-headers/[name]` alias pattern in tests
- [ ] ALL tests must include Schema decode/encode round-trip tests

### Code Style
- [ ] NO default exports - use named exports only
- [ ] Use `as const` for literal arrays to preserve type inference

---

## Schema Test Pattern Reference

Each test file MUST include Schema-specific tests:

```typescript
// test/[header-name].test.ts
import {
  createXxxHeader,
  createXxxHeaderValue,
  XxxOptionSchema,
  XxxHeaderSchema,
} from "@beep/build-utils/secure-headers/[header-name]";
import { beforeEach, describe, expect, it, mock } from "@beep/testkit";
import { Effect, Exit, Option, Schema as S } from "effect";

// ... existing effect tests ...

describe("XxxOptionSchema", () => {
  it("should accept valid values", () => {
    expect(S.decodeUnknownSync(XxxOptionSchema)("valid-value")).toBe("valid-value");
    expect(S.decodeUnknownSync(XxxOptionSchema)(false)).toBe(false);
  });

  it("should reject invalid values", () => {
    expect(() => S.decodeUnknownSync(XxxOptionSchema)("invalid")).toThrow();
    expect(() => S.decodeUnknownSync(XxxOptionSchema)(123)).toThrow();
  });
});

describe("XxxHeaderSchema", () => {
  describe("decode", () => {
    it("should transform undefined to default header", () => {
      const result = S.decodeUnknownSync(XxxHeaderSchema)(undefined);
      expect(result).toEqual({
        name: "X-Header-Name",
        value: "default-value", // or undefined if no default
      });
    });

    it("should transform false to disabled header", () => {
      const result = S.decodeUnknownSync(XxxHeaderSchema)(false);
      expect(result).toEqual({
        name: "X-Header-Name",
        value: undefined,
      });
    });

    it("should transform valid option to header", () => {
      const result = S.decodeUnknownSync(XxxHeaderSchema)("valid-value");
      expect(result).toEqual({
        name: "X-Header-Name",
        value: "valid-value",
      });
    });
  });

  describe("encode", () => {
    it("should encode disabled header to false", () => {
      const result = S.encodeSync(XxxHeaderSchema)({
        name: "X-Header-Name",
        value: undefined,
      });
      expect(result).toBe(false);
    });

    it("should encode enabled header to option value", () => {
      const result = S.encodeSync(XxxHeaderSchema)({
        name: "X-Header-Name",
        value: "valid-value",
      });
      expect(result).toBe("valid-value");
    });
  });

  describe("round-trip", () => {
    it("should decode then encode back to original", () => {
      const original = "valid-value";
      const decoded = S.decodeUnknownSync(XxxHeaderSchema)(original);
      const encoded = S.encodeSync(XxxHeaderSchema)(decoded);
      expect(encoded).toBe(original);
    });
  });
});
```

---

## Complete Schema Examples Per Header Type

### Simple Enum Header (COOP, COEP, CORP, X-Permitted-Cross-Domain-Policies)

```typescript
import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "Cross-Origin-Opener-Policy";

const coopValues = [
  "unsafe-none",
  "same-origin-allow-popups",
  "same-origin",
  "same-origin-plus-COEP",
] as const;

/**
 * Schema for COOP option values.
 */
export const CrossOriginOpenerPolicyOptionSchema = S.Union(
  S.Literal(false),
  ...coopValues.map(v => S.Literal(v))
);

export type CrossOriginOpenerPolicyOption = typeof CrossOriginOpenerPolicyOptionSchema.Type;

/**
 * Schema for the COOP response header output.
 */
const COOPResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Transform schema: option ↔ ResponseHeader
 */
export const CrossOriginOpenerPolicyHeaderSchema = S.transformOrFail(
  S.Union(CrossOriginOpenerPolicyOptionSchema, S.Undefined),
  COOPResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (coopValues.includes(option as typeof coopValues[number])) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (coopValues.includes(header.value as typeof coopValues[number])) {
        return ParseResult.succeed(header.value as CrossOriginOpenerPolicyOption);
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
).annotations({ identifier: "CrossOriginOpenerPolicyHeaderSchema" });

export type CrossOriginOpenerPolicyHeader = typeof CrossOriginOpenerPolicyHeaderSchema.Type;

// ... Effect-based creators follow same pattern as before ...
```

### Complex Directive Header (Permissions-Policy)

```typescript
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { Struct } from "effect";
import { SecureHeadersError } from "./errors.ts";
import { wrapArray } from "./helpers.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "Permissions-Policy";

const permissionsPolicyDirectives = [
  "accelerometer",
  "camera",
  "geolocation",
  "microphone",
  // ... all directives
] as const;

type DirectiveName = typeof permissionsPolicyDirectives[number];

/**
 * Schema for directive allowlist value.
 * Can be: "*", "self", "none", quoted origin, or array of origins
 */
const DirectiveValueSchema = S.Union(
  S.Literal("*"),
  S.Literal("self"),
  S.Literal("none"),
  S.TemplateLiteral(S.Literal('"'), S.String, S.Literal('"')),
  S.Array(S.Union(
    S.Literal("self"),
    S.TemplateLiteral(S.Literal('"'), S.String, S.Literal('"'))
  ))
);

/**
 * Schema for Permissions-Policy directives object.
 */
const DirectivesSchema = S.partial(
  S.Struct(
    Object.fromEntries(
      permissionsPolicyDirectives.map(d => [d, DirectiveValueSchema])
    ) as Record<DirectiveName, typeof DirectiveValueSchema>
  )
);

/**
 * Schema for Permissions-Policy option.
 */
export const PermissionsPolicyOptionSchema = S.Union(
  S.Literal(false),
  S.Struct({
    directives: DirectivesSchema,
  })
);

export type PermissionsPolicyOption = typeof PermissionsPolicyOptionSchema.Type;

/**
 * Response header schema
 */
const PermissionsPolicyResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Helper to convert directive value to header string format
 */
const formatDirectiveValue = (value: string | string[]): string => {
  if (value === "*") return "*";
  if (value === "none") return "()";
  if (value === "self") return "(self)";
  if (Array.isArray(value)) {
    return `(${value.join(" ")})`;
  }
  return `(${value})`;
};

/**
 * Transform schema for Permissions-Policy
 */
export const PermissionsPolicyHeaderSchema = S.transformOrFail(
  S.Union(PermissionsPolicyOptionSchema, S.Undefined),
  PermissionsPolicyResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }

      // Build header value from directives
      const directives = option.directives;
      const parts: string[] = [];

      for (const [key, value] of Object.entries(directives)) {
        if (value !== undefined) {
          parts.push(`${key}=${formatDirectiveValue(value as string | string[])}`);
        }
      }

      const headerValue = parts.length > 0 ? parts.join(", ") : undefined;
      return ParseResult.succeed({ name: headerName as typeof headerName, value: headerValue });
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      // Note: Full parsing back to directives object is complex
      // For now, encoding from header back to option may not be fully reversible
      // This is acceptable as encode is primarily used for testing
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Encoding Permissions-Policy header back to option is not supported`)
      );
    },
  }
).annotations({ identifier: "PermissionsPolicyHeaderSchema" });

export type PermissionsPolicyHeader = typeof PermissionsPolicyHeaderSchema.Type;
```