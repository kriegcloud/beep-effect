---
title: Sandbox.provider.ts
nav_order: 21
parent: "@beep/sandbox"
---

## Sandbox.provider.ts overview

Provider contracts for sandbox runtimes.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [matchSandboxProvider](#matchsandboxprovider)
- [constructors](#constructors)
  - [createBindMountSandboxProvider](#createbindmountsandboxprovider)
  - [createIsolatedSandboxProvider](#createisolatedsandboxprovider)
  - [fromPromiseBindMountSandboxProvider](#frompromisebindmountsandboxprovider)
  - [fromPromiseIsolatedSandboxProvider](#frompromiseisolatedsandboxprovider)
- [models](#models)
  - [BindMountCreateOptions (class)](#bindmountcreateoptions-class)
  - [BranchStrategy (type alias)](#branchstrategy-type-alias)
  - [ExecResult (class)](#execresult-class)
  - [HeadBranchStrategy (class)](#headbranchstrategy-class)
  - [InteractiveExecOptions (interface)](#interactiveexecoptions-interface)
  - [InteractiveExecResult (class)](#interactiveexecresult-class)
  - [IsolatedCreateOptions (class)](#isolatedcreateoptions-class)
  - [MergeToHeadBranchStrategy (class)](#mergetoheadbranchstrategy-class)
  - [MountEntry (class)](#mountentry-class)
  - [NamedBranchStrategy (class)](#namedbranchstrategy-class)
  - [SandboxExecOptions (class)](#sandboxexecoptions-class)
  - [SandboxProviderKind (type alias)](#sandboxproviderkind-type-alias)
- [schemas](#schemas)
  - [BranchStrategy](#branchstrategy)
  - [SandboxProviderKind](#sandboxproviderkind)
- [services](#services)
  - [BindMountSandboxHandle (interface)](#bindmountsandboxhandle-interface)
  - [BindMountSandboxProvider (interface)](#bindmountsandboxprovider-interface)
  - [BindMountSandboxProviderConfig (interface)](#bindmountsandboxproviderconfig-interface)
  - [IsolatedSandboxHandle (interface)](#isolatedsandboxhandle-interface)
  - [IsolatedSandboxProvider (interface)](#isolatedsandboxprovider-interface)
  - [IsolatedSandboxProviderConfig (interface)](#isolatedsandboxproviderconfig-interface)
  - [NoSandboxHandle (interface)](#nosandboxhandle-interface)
  - [NoSandboxProvider (interface)](#nosandboxprovider-interface)
  - [SandboxHandle (interface)](#sandboxhandle-interface)
  - [SandboxProvider (type alias)](#sandboxprovider-type-alias)
---

# combinators

## matchSandboxProvider

Match a sandbox provider by provider kind.

**Example**

```ts
import { matchSandboxProvider } from "@beep/sandbox/Sandbox.provider"

console.log(matchSandboxProvider)
```

**Signature**

```ts
declare const matchSandboxProvider: { <A>(cases: { readonly BindMount: (provider: BindMountSandboxProvider) => A; readonly Isolated: (provider: IsolatedSandboxProvider) => A; readonly None: (provider: NoSandboxProvider) => A; }): (provider: SandboxProvider) => A; <A>(provider: SandboxProvider, cases: { readonly BindMount: (provider: BindMountSandboxProvider) => A; readonly Isolated: (provider: IsolatedSandboxProvider) => A; readonly None: (provider: NoSandboxProvider) => A; }): A; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L627)

Since v0.0.0

# constructors

## createBindMountSandboxProvider

Create a bind-mount sandbox provider.

**Example**

```ts
import { createBindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"

console.log(createBindMountSandboxProvider)
```

**Signature**

```ts
declare const createBindMountSandboxProvider: <R = never>(config: BindMountSandboxProviderConfig<R>) => BindMountSandboxProvider<R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L518)

Since v0.0.0

## createIsolatedSandboxProvider

Create an isolated sandbox provider.

**Example**

```ts
import { createIsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"

console.log(createIsolatedSandboxProvider)
```

**Signature**

```ts
declare const createIsolatedSandboxProvider: <R = never>(config: IsolatedSandboxProviderConfig<R>) => IsolatedSandboxProvider<R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L541)

Since v0.0.0

## fromPromiseBindMountSandboxProvider

Convert a Promise-based bind-mount provider into the Effect contract.

**Example**

```ts
import { fromPromiseBindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"

console.log(fromPromiseBindMountSandboxProvider)
```

**Signature**

```ts
declare const fromPromiseBindMountSandboxProvider: (config: PromiseBindMountProviderConfig) => BindMountSandboxProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L571)

Since v0.0.0

## fromPromiseIsolatedSandboxProvider

Convert a Promise-based isolated provider into the Effect contract.

**Example**

```ts
import { fromPromiseIsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"

console.log(fromPromiseIsolatedSandboxProvider)
```

**Signature**

```ts
declare const fromPromiseIsolatedSandboxProvider: (config: PromiseIsolatedProviderConfig) => IsolatedSandboxProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L599)

Since v0.0.0

# models

## BindMountCreateOptions (class)

Options passed when creating a bind-mount sandbox.

**Example**

```ts
import { BindMountCreateOptions } from "@beep/sandbox/Sandbox.provider"

console.log(BindMountCreateOptions)
```

**Signature**

```ts
declare class BindMountCreateOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L174)

Since v0.0.0

## BranchStrategy (type alias)

Runtime type for `BranchStrategy`.

**Signature**

```ts
type BranchStrategy = typeof BranchStrategy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L299)

Since v0.0.0

## ExecResult (class)

Result of executing a command inside a sandbox.

**Example**

```ts
import { ExecResult } from "@beep/sandbox/Sandbox.provider"

console.log(ExecResult)
```

**Signature**

```ts
declare class ExecResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L58)

Since v0.0.0

## HeadBranchStrategy (class)

Branch strategy that runs against the current working tree.

**Example**

```ts
import { HeadBranchStrategy } from "@beep/sandbox/Sandbox.provider"

console.log(HeadBranchStrategy)
```

**Signature**

```ts
declare class HeadBranchStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L221)

Since v0.0.0

## InteractiveExecOptions (interface)

Options for interactive sandbox command execution.

**Example**

```ts
import type { InteractiveExecOptions } from "@beep/sandbox/Sandbox.provider"

const value = {} as InteractiveExecOptions
console.log(value)
```

**Signature**

```ts
export interface InteractiveExecOptions {
  readonly cwd?: string;
  readonly stderr: NodeJS.WritableStream;
  readonly stdin: NodeJS.ReadableStream;
  readonly stdout: NodeJS.WritableStream;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L130)

Since v0.0.0

## InteractiveExecResult (class)

Result of an interactive sandbox command.

**Example**

```ts
import { InteractiveExecResult } from "@beep/sandbox/Sandbox.provider"

console.log(InteractiveExecResult)
```

**Signature**

```ts
declare class InteractiveExecResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L107)

Since v0.0.0

## IsolatedCreateOptions (class)

Options passed when creating an isolated sandbox.

**Example**

```ts
import { IsolatedCreateOptions } from "@beep/sandbox/Sandbox.provider"

console.log(IsolatedCreateOptions)
```

**Signature**

```ts
declare class IsolatedCreateOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L199)

Since v0.0.0

## MergeToHeadBranchStrategy (class)

Branch strategy that merges a temporary branch back to the host branch.

**Example**

```ts
import { MergeToHeadBranchStrategy } from "@beep/sandbox/Sandbox.provider"

console.log(MergeToHeadBranchStrategy)
```

**Signature**

```ts
declare class MergeToHeadBranchStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L242)

Since v0.0.0

## MountEntry (class)

A host-to-sandbox mount declaration.

**Example**

```ts
import { MountEntry } from "@beep/sandbox/Sandbox.provider"

console.log(MountEntry)
```

**Signature**

```ts
declare class MountEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L150)

Since v0.0.0

## NamedBranchStrategy (class)

Branch strategy that writes changes to a named branch.

**Example**

```ts
import { NamedBranchStrategy } from "@beep/sandbox/Sandbox.provider"

console.log(NamedBranchStrategy)
```

**Signature**

```ts
declare class NamedBranchStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L263)

Since v0.0.0

## SandboxExecOptions (class)

Options for non-interactive sandbox command execution.

**Example**

```ts
import { SandboxExecOptions } from "@beep/sandbox/Sandbox.provider"

console.log(SandboxExecOptions)
```

**Signature**

```ts
declare class SandboxExecOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L82)

Since v0.0.0

## SandboxProviderKind (type alias)

Runtime type for `SandboxProviderKind`.

**Signature**

```ts
type SandboxProviderKind = typeof SandboxProviderKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L43)

Since v0.0.0

# schemas

## BranchStrategy

Branch strategy for a sandbox run.

**Example**

```ts
import { BranchStrategy } from "@beep/sandbox/Sandbox.provider"

console.log(BranchStrategy)
```

**Signature**

```ts
declare const BranchStrategy: AnnotatedSchema<S.Union<readonly [typeof HeadBranchStrategy, typeof MergeToHeadBranchStrategy, typeof NamedBranchStrategy]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L287)

Since v0.0.0

## SandboxProviderKind

Sandbox provider kind.

**Example**

```ts
import { SandboxProviderKind } from "@beep/sandbox/Sandbox.provider"

console.log(SandboxProviderKind)
```

**Signature**

```ts
declare const SandboxProviderKind: AnnotatedSchema<LiteralKit<readonly ["BindMount", "Isolated", "None"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L31)

Since v0.0.0

# services

## BindMountSandboxHandle (interface)

Handle returned by bind-mount providers.

**Example**

```ts
import type { BindMountSandboxHandle } from "@beep/sandbox/Sandbox.provider"

const value = {} as BindMountSandboxHandle
console.log(value)
```

**Signature**

```ts
export interface BindMountSandboxHandle<R = never> extends SandboxHandle<R> {
  readonly copyFileIn: (hostPath: string, sandboxPath: string) => Effect.Effect<void, SandboxError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L340)

Since v0.0.0

## BindMountSandboxProvider (interface)

Bind-mount sandbox provider contract.

**Example**

```ts
import type { BindMountSandboxProvider } from "@beep/sandbox/Sandbox.provider"

const value = {} as BindMountSandboxProvider
console.log(value)
```

**Signature**

```ts
export interface BindMountSandboxProvider<R = never> {
  readonly _tag: "BindMount";
  readonly create: (options: BindMountCreateOptions) => Effect.Effect<BindMountSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
  readonly sandboxHomedir: string | undefined;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L392)

Since v0.0.0

## BindMountSandboxProviderConfig (interface)

Configuration for `createBindMountSandboxProvider`.

**Example**

```ts
import type { BindMountSandboxProviderConfig } from "@beep/sandbox/Sandbox.provider"

const value = {} as BindMountSandboxProviderConfig
console.log(value)
```

**Signature**

```ts
export interface BindMountSandboxProviderConfig<R = never> {
  readonly create: (options: BindMountCreateOptions) => Effect.Effect<BindMountSandboxHandle<R>, SandboxError, R>;
  readonly env?: Readonly<Record<string, string>>;
  readonly name: string;
  readonly sandboxHomedir?: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L478)

Since v0.0.0

## IsolatedSandboxHandle (interface)

Handle returned by isolated providers.

**Example**

```ts
import type { IsolatedSandboxHandle } from "@beep/sandbox/Sandbox.provider"

const value = {} as IsolatedSandboxHandle
console.log(value)
```

**Signature**

```ts
export interface IsolatedSandboxHandle<R = never> extends SandboxHandle<R> {
  readonly copyIn: (hostPath: string, sandboxPath: string) => Effect.Effect<void, SandboxError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L358)

Since v0.0.0

## IsolatedSandboxProvider (interface)

Isolated sandbox provider contract.

**Example**

```ts
import type { IsolatedSandboxProvider } from "@beep/sandbox/Sandbox.provider"

const value = {} as IsolatedSandboxProvider
console.log(value)
```

**Signature**

```ts
export interface IsolatedSandboxProvider<R = never> {
  readonly _tag: "Isolated";
  readonly create: (options: IsolatedCreateOptions) => Effect.Effect<IsolatedSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L414)

Since v0.0.0

## IsolatedSandboxProviderConfig (interface)

Configuration for `createIsolatedSandboxProvider`.

**Example**

```ts
import type { IsolatedSandboxProviderConfig } from "@beep/sandbox/Sandbox.provider"

const value = {} as IsolatedSandboxProviderConfig
console.log(value)
```

**Signature**

```ts
export interface IsolatedSandboxProviderConfig<R = never> {
  readonly create: (options: IsolatedCreateOptions) => Effect.Effect<IsolatedSandboxHandle<R>, SandboxError, R>;
  readonly env?: Readonly<Record<string, string>>;
  readonly name: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L499)

Since v0.0.0

## NoSandboxHandle (interface)

Handle returned by the no-sandbox provider.

**Example**

```ts
import type { NoSandboxHandle } from "@beep/sandbox/Sandbox.provider"

const value = {} as NoSandboxHandle
console.log(value)
```

**Signature**

```ts
export interface NoSandboxHandle<R = never> extends SandboxHandle<R> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L376)

Since v0.0.0

## NoSandboxProvider (interface)

Host-local no-sandbox provider contract.

**Example**

```ts
import type { NoSandboxProvider } from "@beep/sandbox/Sandbox.provider"

const value = {} as NoSandboxProvider
console.log(value)
```

**Signature**

```ts
export interface NoSandboxProvider<R = never> {
  readonly _tag: "None";
  readonly create: (options: {
    readonly env: Readonly<Record<string, string>>;
    readonly worktreePath: string;
  }) => Effect.Effect<NoSandboxHandle<R>, SandboxError, R>;
  readonly env: Readonly<Record<string, string>>;
  readonly name: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L435)

Since v0.0.0

## SandboxHandle (interface)

Common handle returned by a running sandbox provider.

**Example**

```ts
import type { SandboxHandle } from "@beep/sandbox/Sandbox.provider"

const value = {} as SandboxHandle
console.log(value)
```

**Signature**

```ts
export interface SandboxHandle<R = never> {
  readonly close: Effect.Effect<void, SandboxError, R>;
  readonly copyFileOut: (sandboxPath: string, hostPath: string) => Effect.Effect<void, SandboxError, R>;
  readonly exec: (command: string, options?: SandboxExecOptions) => Effect.Effect<ExecResult, SandboxError, R>;
  readonly interactiveExec?: (
    args: ReadonlyArray<string>,
    options: InteractiveExecOptions
  ) => Effect.Effect<InteractiveExecResult, SandboxError, R>;
  readonly worktreePath: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L315)

Since v0.0.0

## SandboxProvider (type alias)

Any sandbox provider supported by the first programmatic port.

**Example**

```ts
import type { SandboxProvider } from "@beep/sandbox/Sandbox.provider"

const value = {} as SandboxProvider
console.log(value)
```

**Signature**

```ts
type SandboxProvider<R> = | BindMountSandboxProvider<R>
  | IsolatedSandboxProvider<R>
  | NoSandboxProvider<R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.provider.ts#L459)

Since v0.0.0