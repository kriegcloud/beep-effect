# `@beep/identity`

Composable builder for schema IDs, service tokens, and TypeId symbols. The builder keeps
literal string types intact while also exposing helpers for deterministic `Symbol.for`
creation.

## Usage

```ts
import { BeepId } from "@beep/identity";

// Root namespace for everything under `@beep/schema`
const schemaId = BeepId.module("schema");

// Sub-module for annotations helpers
const annotationsId = schemaId.compose("annotations");

// Annotation helper: schemaId symbol + identifier + automatic title (+ extras)
const annotation = annotationsId.annotations<string>("MySchema", {
  description: "Example schema.",
});
export class MySchema extends S.String.annotations(annotation) {}

// Service identifiers + TypeId
const userRepoId = BeepId.module("iam-infra", "adapters", "repos");
const descriptor = userRepoId.make("UserRepo"); // "@beep/iam-infra/adapters/repos/UserRepo"
const symbol = userRepoId.symbol(); // Symbol.for("@beep/iam-infra/adapters/repos")
```

## Notes

- Segments are validated at runtime so accidental `/` characters throw immediately.
- `make()` emits the literal string (branded via `IdentityString`) while `compose()`
  continues chaining.
- Use `BeepId.from("@beep/contract/contract-kit")` to continue an existing namespace.
- All exports carry full JSDoc blocks with summary, category, examples, and `@since 0.1.0`
  tags per the shared documentation strategy (`packages/common/schema-v2/DOCUMENTATION_STRATEGY.md`).
