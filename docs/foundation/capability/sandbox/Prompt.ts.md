---
title: Prompt.ts
nav_order: 13
parent: "@beep/sandbox"
---

## Prompt.ts overview

Prompt resolution and template argument substitution.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [expandPromptShellExpressions](#expandpromptshellexpressions)
  - [resolvePrompt](#resolveprompt)
  - [substitutePromptArgs](#substitutepromptargs)
  - [validateNoArgsWithInlinePrompt](#validatenoargswithinlineprompt)
  - [validateNoBuiltInArgOverride](#validatenobuiltinargoverride)
- [getters](#getters)
  - [findMissingPromptArgKeys](#findmissingpromptargkeys)
- [models](#models)
  - [BuiltInPromptArgKey (type alias)](#builtinpromptargkey-type-alias)
  - [ExpandPromptShellExpressionsOptions (class)](#expandpromptshellexpressionsoptions-class)
  - [PromptArgValue (type alias)](#promptargvalue-type-alias)
  - [PromptArgs (type alias)](#promptargs-type-alias)
  - [PromptSource (type alias)](#promptsource-type-alias)
  - [ResolvePromptOptions (class)](#resolvepromptoptions-class)
  - [ResolvedPrompt (class)](#resolvedprompt-class)
- [schemas](#schemas)
  - [BuiltInPromptArgKey](#builtinpromptargkey)
  - [PromptArgValue](#promptargvalue)
  - [PromptArgs](#promptargs)
  - [PromptSource](#promptsource)
- [utilities](#utilities)
  - [BUILT_IN_PROMPT_ARG_KEYS](#built_in_prompt_arg_keys)
  - [BUILT_IN_PROMPT_ARG_KEY_SET](#built_in_prompt_arg_key_set)
  - [SHELL_BLOCK_MARKER](#shell_block_marker)
---

# combinators

## expandPromptShellExpressions

Normalize marked shell prompt expressions without executing repository-controlled commands.

**Example**

```ts
import { expandPromptShellExpressions } from "@beep/sandbox/Prompt"

console.log(expandPromptShellExpressions)
```

**Signature**

```ts
declare const expandPromptShellExpressions: { <R>(sandbox: SandboxHandle<R>, options: ExpandPromptShellExpressionsOptions): Effect.Effect<string, SandboxError, R | Display>; <R>(options: ExpandPromptShellExpressionsOptions): (sandbox: SandboxHandle<R>) => Effect.Effect<string, SandboxError, R | Display>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L449)

Since v0.0.0

## resolvePrompt

Resolve an inline prompt or prompt file.

**Example**

```ts
import { resolvePrompt } from "@beep/sandbox/Prompt"

console.log(resolvePrompt)
```

**Signature**

```ts
declare const resolvePrompt: (options: ResolvePromptOptions) => Effect.Effect<ResolvedPrompt, PromptError, FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L268)

Since v0.0.0

## substitutePromptArgs

Substitute `{{KEY}}` prompt arguments in a prompt template.

**Example**

```ts
import { substitutePromptArgs } from "@beep/sandbox/Prompt"

console.log(substitutePromptArgs)
```

**Signature**

```ts
declare const substitutePromptArgs: (prompt: string, args: { readonly [x: string]: string | number | boolean; }, silentKeys?: HashSet.HashSet<string> | undefined) => Effect.Effect<string, PromptError, Display>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L393)

Since v0.0.0

## validateNoArgsWithInlinePrompt

Fail when prompt arguments are provided with an inline prompt.

**Example**

```ts
import { validateNoArgsWithInlinePrompt } from "@beep/sandbox/Prompt"

console.log(validateNoArgsWithInlinePrompt)
```

**Signature**

```ts
declare const validateNoArgsWithInlinePrompt: (args: { readonly [x: string]: string | number | boolean; }) => Effect.Effect<undefined, PromptError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L302)

Since v0.0.0

## validateNoBuiltInArgOverride

Fail when callers override built-in prompt arguments.

**Example**

```ts
import { validateNoBuiltInArgOverride } from "@beep/sandbox/Prompt"

console.log(validateNoBuiltInArgOverride)
```

**Signature**

```ts
declare const validateNoBuiltInArgOverride: (args: { readonly [x: string]: string | number | boolean; }) => Effect.Effect<undefined, PromptError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L328)

Since v0.0.0

# getters

## findMissingPromptArgKeys

Find placeholders that are missing corresponding prompt arguments.

**Example**

```ts
import { findMissingPromptArgKeys } from "@beep/sandbox/Prompt"

console.log(findMissingPromptArgKeys)
```

**Signature**

```ts
declare const findMissingPromptArgKeys: { (prompt: string, providedArgs: PromptArgs): ReadonlyArray<string>; (providedArgs: PromptArgs): (prompt: string) => ReadonlyArray<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L354)

Since v0.0.0

# models

## BuiltInPromptArgKey (type alias)

Runtime type for `BuiltInPromptArgKey`.

**Signature**

```ts
type BuiltInPromptArgKey = typeof BuiltInPromptArgKey.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L98)

Since v0.0.0

## ExpandPromptShellExpressionsOptions (class)

Options for expanding prompt shell expressions.

**Example**

```ts
import { ExpandPromptShellExpressionsOptions } from "@beep/sandbox/Prompt"

console.log(ExpandPromptShellExpressionsOptions)
```

**Signature**

```ts
declare class ExpandPromptShellExpressionsOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L242)

Since v0.0.0

## PromptArgValue (type alias)

Runtime type for `PromptArgValue`.

**Signature**

```ts
type PromptArgValue = typeof PromptArgValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L125)

Since v0.0.0

## PromptArgs (type alias)

Runtime type for `PromptArgs`.

**Signature**

```ts
type PromptArgs = typeof PromptArgs.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L152)

Since v0.0.0

## PromptSource (type alias)

Runtime type for `PromptSource`.

**Signature**

```ts
type PromptSource = typeof PromptSource.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L181)

Since v0.0.0

## ResolvePromptOptions (class)

Options for resolving a prompt.

**Example**

```ts
import { ResolvePromptOptions } from "@beep/sandbox/Prompt"

console.log(ResolvePromptOptions)
```

**Signature**

```ts
declare class ResolvePromptOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L196)

Since v0.0.0

## ResolvedPrompt (class)

Resolved prompt text and source.

**Example**

```ts
import { ResolvedPrompt } from "@beep/sandbox/Prompt"

console.log(ResolvedPrompt)
```

**Signature**

```ts
declare class ResolvedPrompt
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L219)

Since v0.0.0

# schemas

## BuiltInPromptArgKey

Built-in prompt argument key domain.

**Example**

```ts
import { BuiltInPromptArgKey } from "@beep/sandbox/Prompt"

console.log(BuiltInPromptArgKey)
```

**Signature**

```ts
declare const BuiltInPromptArgKey: AnnotatedSchema<LiteralKit<readonly ["SOURCE_BRANCH", "TARGET_BRANCH"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L86)

Since v0.0.0

## PromptArgValue

Primitive prompt argument value.

**Example**

```ts
import { PromptArgValue } from "@beep/sandbox/Prompt"

console.log(PromptArgValue)
```

**Signature**

```ts
declare const PromptArgValue: AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Boolean]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L113)

Since v0.0.0

## PromptArgs

Prompt argument map.

**Example**

```ts
import { PromptArgs } from "@beep/sandbox/Prompt"

console.log(PromptArgs)
```

**Signature**

```ts
declare const PromptArgs: AnnotatedSchema<S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Boolean]>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L140)

Since v0.0.0

## PromptSource

Prompt source discriminator.

**Example**

```ts
import { PromptSource } from "@beep/sandbox/Prompt"

console.log(PromptSource)
```

**Signature**

```ts
declare const PromptSource: AnnotatedSchema<LiteralKit<readonly ["Inline", "Template"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L169)

Since v0.0.0

# utilities

## BUILT_IN_PROMPT_ARG_KEYS

Built-in prompt argument keys injected by run orchestration.

**Example**

```ts
import { BUILT_IN_PROMPT_ARG_KEYS } from "@beep/sandbox/Prompt"

console.log(BUILT_IN_PROMPT_ARG_KEYS)
```

**Signature**

```ts
declare const BUILT_IN_PROMPT_ARG_KEYS: readonly ["SOURCE_BRANCH", "TARGET_BRANCH"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L56)

Since v0.0.0

## BUILT_IN_PROMPT_ARG_KEY_SET

Built-in prompt argument keys as a `HashSet` for membership checks.

**Example**

```ts
import { BUILT_IN_PROMPT_ARG_KEY_SET } from "@beep/sandbox/Prompt"

console.log(BUILT_IN_PROMPT_ARG_KEY_SET)
```

**Signature**

```ts
declare const BUILT_IN_PROMPT_ARG_KEY_SET: HashSet.HashSet<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L71)

Since v0.0.0

## SHELL_BLOCK_MARKER

Marker inserted before literal shell blocks in prompt templates.

**Example**

```ts
import { SHELL_BLOCK_MARKER } from "@beep/sandbox/Prompt"

console.log(SHELL_BLOCK_MARKER)
```

**Signature**

```ts
declare const SHELL_BLOCK_MARKER: "\0BEEP_SANDBOX_SHELL_BLOCK\0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Prompt.ts#L39)

Since v0.0.0