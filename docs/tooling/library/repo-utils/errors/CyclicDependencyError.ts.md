---
title: CyclicDependencyError.ts
nav_order: 3
parent: "@beep/repo-utils"
---

## CyclicDependencyError.ts overview

Error raised when a cyclic dependency is detected in the workspace
dependency graph.

Contains the list of cycles found, where each cycle is an ordered
array of package names forming the loop.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [CyclicDependencyError (class)](#cyclicdependencyerror-class)
---

# error-handling

## CyclicDependencyError (class)

Raised when topological sorting or cycle detection finds circular
dependencies in the workspace dependency graph.

**Example**

```ts
import { CyclicDependencyError } from "@beep/repo-utils/errors/CyclicDependencyError"
const error = CyclicDependencyError.make({
  cycles: [["a", "b", "a"]],
  message: "Cyclic dependencies detected"
})
console.log(error.cycles)
```

**Signature**

```ts
declare class CyclicDependencyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/errors/CyclicDependencyError.ts#L33)

Since v0.0.0