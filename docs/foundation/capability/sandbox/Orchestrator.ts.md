---
title: Orchestrator.ts
nav_order: 12
parent: "@beep/sandbox"
---

## Orchestrator.ts overview

Agent iteration orchestration.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [orchestrate](#orchestrate)
- [models](#models)
  - [CommitSummary (class)](#commitsummary-class)
  - [IterationResult (class)](#iterationresult-class)
  - [OrchestrateResult (class)](#orchestrateresult-class)
- [services](#services)
  - [OrchestrateOptions (interface)](#orchestrateoptions-interface)
---

# combinators

## orchestrate

Run an agent provider for the requested number of iterations.

**Example**

```ts
import { orchestrate } from "@beep/sandbox/Orchestrator"

console.log(orchestrate)
```

**Signature**

```ts
declare const orchestrate: <R>(options: OrchestrateOptions<R>) => Effect.Effect<OrchestrateResult, SandboxError, R | Display | AgentStreamEmitter>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Orchestrator.ts#L223)

Since v0.0.0

# models

## CommitSummary (class)

Commit summary produced by a run.

**Example**

```ts
import { CommitSummary } from "@beep/sandbox/Orchestrator"

console.log(CommitSummary)
```

**Signature**

```ts
declare class CommitSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Orchestrator.ts#L64)

Since v0.0.0

## IterationResult (class)

Per-iteration run result.

**Example**

```ts
import { IterationResult } from "@beep/sandbox/Orchestrator"

console.log(IterationResult)
```

**Signature**

```ts
declare class IterationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Orchestrator.ts#L40)

Since v0.0.0

## OrchestrateResult (class)

Result of orchestrating agent iterations.

**Example**

```ts
import { OrchestrateResult } from "@beep/sandbox/Orchestrator"

console.log(OrchestrateResult)
```

**Signature**

```ts
declare class OrchestrateResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Orchestrator.ts#L86)

Since v0.0.0

# services

## OrchestrateOptions (interface)

Options for orchestrating agent iterations against a sandbox handle.

**Example**

```ts
import type { OrchestrateOptions } from "@beep/sandbox/Orchestrator"

const value = {} as OrchestrateOptions
console.log(value)
```

**Signature**

```ts
export interface OrchestrateOptions<R = never> {
  readonly branch: string;
  readonly completionSignal?: string | ReadonlyArray<string>;
  readonly idleTimeoutMs?: Duration.Duration;
  readonly iterations: number;
  readonly name?: string;
  readonly prompt: string;
  readonly promptExpansionTimeoutMs?: Duration.Duration;
  readonly provider: AgentProvider;
  readonly sandbox: SandboxHandle<R>;
  readonly sandboxRepoDir: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Orchestrator.ts#L114)

Since v0.0.0