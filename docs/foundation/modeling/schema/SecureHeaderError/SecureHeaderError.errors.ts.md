---
title: SecureHeaderError.errors.ts
nav_order: 194
parent: "@beep/schema"
---

## SecureHeaderError.errors.ts overview

CSP header schema & constructor's

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [CoreError (class)](#coreerror-class)
  - [CrossOriginEmbedderPolicyError (class)](#crossoriginembedderpolicyerror-class)
  - [CrossOriginOpenerPolicyError (class)](#crossoriginopenerpolicyerror-class)
  - [CrossOriginResourcePolicyError (class)](#crossoriginresourcepolicyerror-class)
  - [CspError (class)](#csperror-class)
  - [ExpectCtError (class)](#expectcterror-class)
  - [ForceHttpsRedirectError (class)](#forcehttpsredirecterror-class)
  - [FrameGuardError (class)](#frameguarderror-class)
  - [NoOpenError (class)](#noopenerror-class)
  - [NoSniffError (class)](#nosnifferror-class)
  - [PermissionsPolicyError (class)](#permissionspolicyerror-class)
  - [PermittedCrossDomainPoliciesError (class)](#permittedcrossdomainpolicieserror-class)
  - [ReferrerPolicyError (class)](#referrerpolicyerror-class)
  - [SecureHeaderError](#secureheadererror)
  - [SecureHeaderError (type alias)](#secureheadererror-type-alias)
  - [XssProtectionError (class)](#xssprotectionerror-class)
- [schemas](#schemas)
  - [Error](#error)
---

# errors

## CoreError (class)

Error raised by shared secure-header infrastructure.

**Example**

```ts
import * as O from "effect/Option"
import { CoreError } from "@beep/schema/SecureHeaderError"

const error = CoreError.make({ message: "Unable to build secure header", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class CoreError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L342)

Since v0.0.0

## CrossOriginEmbedderPolicyError (class)

Error raised while building Cross-Origin-Embedder-Policy headers.

**Example**

```ts
import * as O from "effect/Option"
import { CrossOriginEmbedderPolicyError } from "@beep/schema/SecureHeaderError"

const error = CrossOriginEmbedderPolicyError.make({ message: "Invalid embedder policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class CrossOriginEmbedderPolicyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L291)

Since v0.0.0

## CrossOriginOpenerPolicyError (class)

Error raised while building Cross-Origin-Opener-Policy headers.

**Example**

```ts
import * as O from "effect/Option"
import { CrossOriginOpenerPolicyError } from "@beep/schema/SecureHeaderError"

const error = CrossOriginOpenerPolicyError.make({ message: "Invalid opener policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class CrossOriginOpenerPolicyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L274)

Since v0.0.0

## CrossOriginResourcePolicyError (class)

Error raised while building Cross-Origin-Resource-Policy headers.

**Example**

```ts
import * as O from "effect/Option"
import { CrossOriginResourcePolicyError } from "@beep/schema/SecureHeaderError"

const error = CrossOriginResourcePolicyError.make({ message: "Invalid resource policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class CrossOriginResourcePolicyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L308)

Since v0.0.0

## CspError (class)

Error raised while building a Content-Security-Policy header.

**Example**

```ts
import * as O from "effect/Option"
import { CspError } from "@beep/schema/SecureHeaderError"

const error = CspError.make({ message: "Invalid CSP directive", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class CspError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L121)

Since v0.0.0

## ExpectCtError (class)

Error raised while building Expect-CT headers.

**Example**

```ts
import * as O from "effect/Option"
import { ExpectCtError } from "@beep/schema/SecureHeaderError"

const error = ExpectCtError.make({ message: "Invalid Expect-CT option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class ExpectCtError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L240)

Since v0.0.0

## ForceHttpsRedirectError (class)

Error raised while building force-HTTPS redirect headers.

**Example**

```ts
import * as O from "effect/Option"
import { ForceHttpsRedirectError } from "@beep/schema/SecureHeaderError"

const error = ForceHttpsRedirectError.make({ message: "Invalid redirect option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class ForceHttpsRedirectError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L138)

Since v0.0.0

## FrameGuardError (class)

Error raised while building frame-guard headers.

**Example**

```ts
import * as O from "effect/Option"
import { FrameGuardError } from "@beep/schema/SecureHeaderError"

const error = FrameGuardError.make({ message: "Invalid frame guard option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class FrameGuardError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L223)

Since v0.0.0

## NoOpenError (class)

Error raised while building X-Download-Options headers.

**Example**

```ts
import * as O from "effect/Option"
import { NoOpenError } from "@beep/schema/SecureHeaderError"

const error = NoOpenError.make({ message: "Invalid no-open option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class NoOpenError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L206)

Since v0.0.0

## NoSniffError (class)

Error raised while building X-Content-Type-Options headers.

**Example**

```ts
import * as O from "effect/Option"
import { NoSniffError } from "@beep/schema/SecureHeaderError"

const error = NoSniffError.make({ message: "Invalid no-sniff option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class NoSniffError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L189)

Since v0.0.0

## PermissionsPolicyError (class)

Error raised while building Permissions-Policy headers.

**Example**

```ts
import * as O from "effect/Option"
import { PermissionsPolicyError } from "@beep/schema/SecureHeaderError"

const error = PermissionsPolicyError.make({ message: "Invalid permissions policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class PermissionsPolicyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L257)

Since v0.0.0

## PermittedCrossDomainPoliciesError (class)

Error raised while building X-Permitted-Cross-Domain-Policies headers.

**Example**

```ts
import * as O from "effect/Option"
import { PermittedCrossDomainPoliciesError } from "@beep/schema/SecureHeaderError"

const error = PermittedCrossDomainPoliciesError.make({ message: "Invalid cross-domain policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class PermittedCrossDomainPoliciesError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L325)

Since v0.0.0

## ReferrerPolicyError (class)

Error raised while building Referrer-Policy headers.

**Example**

```ts
import * as O from "effect/Option"
import { ReferrerPolicyError } from "@beep/schema/SecureHeaderError"

const error = ReferrerPolicyError.make({ message: "Invalid referrer policy", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class ReferrerPolicyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L172)

Since v0.0.0

## SecureHeaderError

Tagged union schema for all secure-header errors.

**Example**

```ts
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { CspError, SecureHeaderError } from "@beep/schema/SecureHeaderError"

const error = CspError.make({ message: "Invalid CSP directive", cause: O.none() })
console.log(S.is(SecureHeaderError)(error)) // true
```

**Signature**

```ts
declare const SecureHeaderError: AnnotatedSchema<S.Union<readonly [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError]> & TaggedUnionUtils<"_tag", readonly [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError], [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L360)

Since v0.0.0

## SecureHeaderError (type alias)

Type for all secure-header errors.

**Signature**

```ts
type SecureHeaderError = typeof SecureHeaderError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L390)

Since v0.0.0

## XssProtectionError (class)

Error raised while building X-XSS-Protection headers.

**Example**

```ts
import * as O from "effect/Option"
import { XssProtectionError } from "@beep/schema/SecureHeaderError"

const error = XssProtectionError.make({ message: "Invalid XSS protection option", cause: O.none() })
console.log(error.message)
```

**Signature**

```ts
declare class XssProtectionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L155)

Since v0.0.0

# schemas

## Error

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Error: AnnotatedSchema<S.Union<readonly [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError]> & TaggedUnionUtils<"_tag", readonly [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError], [typeof CspError, typeof ForceHttpsRedirectError, typeof XssProtectionError, typeof ReferrerPolicyError, typeof NoSniffError, typeof NoOpenError, typeof FrameGuardError, typeof ExpectCtError, typeof PermissionsPolicyError, typeof CrossOriginOpenerPolicyError, typeof CrossOriginEmbedderPolicyError, typeof CrossOriginResourcePolicyError, typeof PermittedCrossDomainPoliciesError, typeof CoreError]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderError/SecureHeaderError.errors.ts#L398)

Since v0.0.0