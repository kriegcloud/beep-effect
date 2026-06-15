---
title: ReflectionArtifact.ts
nav_order: 59
parent: "@beep/repo-cli"
---

## ReflectionArtifact.ts overview

Reflection-artifact inventory and enforcement command.

Verifies that completed goal packets carry a schema-valid closeout reflection
under `goals/<slug>/history/reflections/<YYYY-MM-DD>-<agent>.md`. Packets that
opt in via `reflectionRequired: true` in their manifest are gated (blocking);
other completed packets surface non-fatal advisories so the backlog is visible.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [lintReflectionArtifactsCommand](#lintreflectionartifactscommand)
  - [runReflectionArtifactLint](#runreflectionartifactlint)
- [models](#models)
  - [ReflectionFinding (namespace)](#reflectionfinding-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
---

# commands

## lintReflectionArtifactsCommand

`bun run beep lint reflection-artifacts` — enforce closeout reflections.

**Example**

```ts
console.log("lintReflectionArtifactsCommand")
```

**Signature**

```ts
declare const lintReflectionArtifactsCommand: Command.Command<"reflection-artifacts", {}, {}, S.SchemaError | PlatformError | CliReportedExit | Issue, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/ReflectionArtifact.ts#L309)

Since v0.0.0

## runReflectionArtifactLint

Verifies completed goal packets carry a schema-valid closeout reflection.

**Example**

```ts
console.log("runReflectionArtifactLint")
```

**Signature**

```ts
declare const runReflectionArtifactLint: () => Effect.Effect<undefined, S.SchemaError | PlatformError | CliReportedExit | Issue, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/ReflectionArtifact.ts#L221)

Since v0.0.0

# models

## ReflectionFinding (namespace)

Namespace for `ReflectionFinding` companion types.

**Example**

```ts
console.log("ReflectionFinding")
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/ReflectionArtifact.ts#L105)

Since v0.0.0

### Encoded (type alias)

Encoded representation of `ReflectionFinding`.

**Example**

```ts
console.log("Encoded")
```

**Signature**

```ts
type Encoded = typeof ReflectionFinding.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Lint/ReflectionArtifact.ts#L116)

Since v0.0.0