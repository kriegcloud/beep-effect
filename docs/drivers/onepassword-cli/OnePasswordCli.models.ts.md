---
title: OnePasswordCli.models.ts
nav_order: 3
parent: "@beep/onepassword-cli"
---

## OnePasswordCli.models.ts overview

Data models for the 1Password CLI driver.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [OnePasswordCliAccount (class)](#onepasswordcliaccount-class)
  - [OnePasswordCliProcessResult (class)](#onepasswordcliprocessresult-class)
  - [OnePasswordReferenceProbe (class)](#onepasswordreferenceprobe-class)
  - [OnePasswordReferenceProbeStatus](#onepasswordreferenceprobestatus)
  - [OnePasswordReferenceProbeStatus (type alias)](#onepasswordreferenceprobestatus-type-alias)
---

# models

## OnePasswordCliAccount (class)

1Password account/session probe result.

**Example**

```ts
import { OnePasswordCliAccount } from "@beep/onepassword-cli/OnePasswordCli.models"

console.log(OnePasswordCliAccount)
```

**Signature**

```ts
declare class OnePasswordCliAccount
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.models.ts#L78)

Since v0.0.0

## OnePasswordCliProcessResult (class)

Process output captured by a 1Password CLI command.

**Example**

```ts
import { OnePasswordCliProcessResult } from "@beep/onepassword-cli/OnePasswordCli.models"

console.log(OnePasswordCliProcessResult)
```

**Signature**

```ts
declare class OnePasswordCliProcessResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.models.ts#L54)

Since v0.0.0

## OnePasswordReferenceProbe (class)

Secret-reference validation result that does not expose the secret.

**Example**

```ts
import { OnePasswordReferenceProbe } from "@beep/onepassword-cli/OnePasswordCli.models"

console.log(OnePasswordReferenceProbe)
```

**Signature**

```ts
declare class OnePasswordReferenceProbe
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.models.ts#L101)

Since v0.0.0

## OnePasswordReferenceProbeStatus

1Password reference probe status.

**Example**

```ts
import { OnePasswordReferenceProbeStatus } from "@beep/onepassword-cli/OnePasswordCli.models"

console.log(OnePasswordReferenceProbeStatus)
```

**Signature**

```ts
declare const OnePasswordReferenceProbeStatus: AnnotatedSchema<LiteralKit<readonly ["resolved", "missing"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.models.ts#L27)

Since v0.0.0

## OnePasswordReferenceProbeStatus (type alias)

Runtime type for `OnePasswordReferenceProbeStatus`.

**Signature**

```ts
type OnePasswordReferenceProbeStatus = typeof OnePasswordReferenceProbeStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/onepassword-cli/src/OnePasswordCli.models.ts#L39)

Since v0.0.0