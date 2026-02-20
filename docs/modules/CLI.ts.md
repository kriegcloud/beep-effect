---
title: CLI.ts
nav_order: 2
parent: Modules
---

## CLI.ts overview

Since v0.6.0

---

## Exports Grouped by Category

- [CLI](#cli)
  - [cli](#cli-1)

---

# CLI

## cli

**Signature**

```ts
declare const cli: (
  args: ReadonlyArray<string>
) => Effect.Effect<
  void,
  ValidationError.ValidationError | Domain.DocgenError | PlatformError,
  Domain.Process | CommandExecutor | CliApp.Environment
>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/CLI.ts#L190)

Since v0.6.0
