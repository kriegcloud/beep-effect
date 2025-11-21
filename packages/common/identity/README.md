# `@beep/identity`

Composable builder for schema IDs, service tokens, and TypeId symbols. The builder keeps
literal string types intact while also exposing helpers for deterministic `Symbol.for`
creation.

## Usage

```ts
import { BeepId } from "@beep/identity/BeepId";

// Root namespace for everything under `@beep/schema`
const DomainId = BeepId.package("domain");

// Sub-module for annotations helpers
const EntitiesId = schemaId.compose("entities");

// Service identifiers + TypeId
const {
  UserId,
  TeamId,
  ProjectId
} = EntitiesId.module("User", "Team", "Project");
const annotations = DomainEntityId.annotations("UserModel", {
  description: "User model.",
}); // "@beep/iam-infra/adapters/repos/UserRepo"
export class MySchema extends S.String.annotations(annotations) {}
const symbol = DomainEntityId.symbol(); // Symbol.for("@beep/domain/entities/")
```

## Notes

- Segments are validated at runtime so accidental `/` characters throw immediately.
- `make()` emits the literal string (branded via `IdentityString`) while `compose()`
  continues chaining.
- Use `BeepId.from("@beep/contract/contract-kit")` to continue an existing namespace.
- All exports carry full JSDoc blocks with summary, category, examples, and `@since 0.1.0`
  tags per the shared documentation strategy (`packages/common/schema/DOCUMENTATION_STRATEGY.md`).
