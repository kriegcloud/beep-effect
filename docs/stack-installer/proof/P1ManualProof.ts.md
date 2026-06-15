---
title: P1ManualProof.ts
nav_order: 3
parent: "@beep/stack-installer"
---

## P1ManualProof.ts overview

App-facing P1 Manual Mode proof exports.

Since v0.0.0

---
## Exports Grouped by Category
- [workflows](#workflows)
  - [P1ManualProofSliceLayer](#p1manualproofslicelayer)
  - [previewP1ManualProof](#previewp1manualproof)
  - [runP1ManualProof](#runp1manualproof)
---

# workflows

## P1ManualProofSliceLayer

App-facing P1 Manual Mode proof exports.

**Signature**

```ts
declare const P1ManualProofSliceLayer: Layer<P1ManualProofWorkflow | HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases | StackManifestUseCases, SchemaError, ChildProcessSpawner | OnePasswordCli | AiProviderCli | Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/stack-installer/src/proof/P1ManualProof.ts#L10)

Since v0.0.0

## previewP1ManualProof

App-facing P1 Manual Mode proof exports.

**Signature**

```ts
declare const previewP1ManualProof: (request: P1ManualProofRequest) => Effect<P1ManualProofResult, SchemaError, P1ManualProofWorkflow>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/stack-installer/src/proof/P1ManualProof.ts#L11)

Since v0.0.0

## runP1ManualProof

App-facing P1 Manual Mode proof exports.

**Signature**

```ts
declare const runP1ManualProof: (request: P1ManualProofRequest) => Effect<P1ManualProofResult, SchemaError | SecretReferenceReadError, P1ManualProofWorkflow>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/stack-installer/src/proof/P1ManualProof.ts#L12)

Since v0.0.0