---
title: Dependencies.ts
nav_order: 1
parent: "@beep/repo-utils"
---

## Dependencies.ts overview

Dependency extraction and classification for workspace packages.

Reads a decoded `PackageJson` and classifies each dependency as either
a workspace-internal dependency (the package name exists in the monorepo)
or an external NPM dependency.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [extractWorkspaceDependencies](#extractworkspacedependencies)
---

# utilities

## extractWorkspaceDependencies

Extract and classify dependencies from a decoded `PackageJson`.

Each dependency field (`dependencies`, `devDependencies`,
`peerDependencies`, `optionalDependencies`) is split into workspace
deps (names found in `workspaceNames`) and NPM deps (everything else).

**Example**

```ts
```typescript
import { HashSet } from "effect"
import * as O from "effect/Option"
import { extractWorkspaceDependencies } from "@beep/repo-utils/Dependencies"
import { decodePackageJson } from "@beep/repo-utils/schemas/PackageJson"

const pkg = decodePackageJson({


})
const deps = extractWorkspaceDependencies(pkg, HashSet.make("@my/other", "@my/another"))
console.log(deps)
// deps.workspace.dependencies -> { "@my/other": "workspace:*" }
// deps.npm.dependencies -> { "lodash": "^4.0.0" }
```
```

**Signature**

```ts
declare const extractWorkspaceDependencies: { (workspaceNames: HashSet.HashSet<string>): (packageJson: PackageJson) => WorkspaceDeps; (packageJson: PackageJson, workspaceNames: HashSet.HashSet<string>): WorkspaceDeps; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/Dependencies.ts#L75)

Since v0.0.0