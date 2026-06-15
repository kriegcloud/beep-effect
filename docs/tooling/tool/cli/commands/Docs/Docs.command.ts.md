---
title: Docs.command.ts
nav_order: 26
parent: "@beep/repo-cli"
---

## Docs.command.ts overview

Docs discovery command suite for command-first policy lookup.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DocsSection](#docssection)
  - [DocsSection (type alias)](#docssection-type-alias)
- [utilities](#utilities)
  - [docsCommand](#docscommand)
---

# models

## DocsSection

Documentation section model.

**Example**

```ts
console.log("DocsSection")
```

**Signature**

```ts
declare const DocsSection: AnnotatedSchema<S.Union<readonly [typeof DocsSectionLaws, typeof DocsSectionSkills, typeof DocsSectionPolicies]> & TaggedUnionUtils<"name", readonly [typeof DocsSectionLaws, typeof DocsSectionSkills, typeof DocsSectionPolicies], [typeof DocsSectionLaws, typeof DocsSectionSkills, typeof DocsSectionPolicies]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Docs/Docs.command.ts#L78)

Since v0.0.0

## DocsSection (type alias)

Documentation section model.

**Example**

```ts
console.log("DocsSection")
```

**Signature**

```ts
type DocsSection = typeof DocsSection.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Docs/Docs.command.ts#L96)

Since v0.0.0

# utilities

## docsCommand

Command-first docs discovery entrypoint used by agent config surfaces.

**Example**

```ts
console.log("docsCommand")
```

**Signature**

```ts
declare const docsCommand: Command.Command<"docs", {} | {}, {}, CliReportedExit, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Docs/Docs.command.ts#L244)

Since v0.0.0