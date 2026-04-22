# Hexagonal Vertical Slices

The architecture combines two ideas that are often separated:

- vertical slices, which keep product/domain work together
- hexagonal architecture, which keeps external systems behind ports and adapters

beep-effect needs both.

## Why Not Pure Feature Folders

Feature folders are good at locality, but they often become isolated piles of
UI, API calls, persistence, and state. Reuse becomes accidental. Two features
that share the same domain concept drift apart because there is no stable domain
package to hold the concept.

beep-effect wants experiments, but it also wants reusable domain language. The
domain spine gives feature work somewhere stable to land.

## Why Not Horizontal Layers Only

Horizontal layers make shared infrastructure obvious, but they often create
runtime packages that know too much. A central `DataAccess.layer` or
`Persistence.layer` can become the place where every slice is merged, even when
the slices are otherwise unrelated.

That shape makes local experimentation harder. Adding a slice means editing
global runtime composition. Removing a slice means unwinding global references.

## The Hybrid

The slice is vertical:

```txt
packages/iam/
  domain/
  use-cases/
  server/
  client/
  tables/
  ui/
  providers/
```

The boundaries are hexagonal:

```txt
domain <- use-cases <- server
domain <- client <- ui
use-cases <- client (client-safe exports only)

use-cases product ports <- server implementations <- providers
```

The result is local ownership without infrastructure leakage.

Client imports from use-cases must stay client-safe: command/query language,
contracts, and actionable errors are fine; product ports and server-only Layer
composition are not.

## Same Concept, Different Lens

The same domain concept appears across layers with a different role:

```txt
domain/src/entities/TwoFactor/TwoFactor.policy.ts
use-cases/src/entities/TwoFactor/TwoFactor.commands.ts
server/src/entities/TwoFactor/TwoFactor.http-handlers.ts
client/src/entities/TwoFactor/TwoFactor.command-client.ts
ui/src/entities/TwoFactor/TwoFactor.form.tsx
```

This is intentional. The `TwoFactor` folder is the concept. The package and role
suffix are the architectural lens.

## Cross-Concept Escape Hatches

Most roles are concept-local by default. Cross-concept behavior is allowed when
the behavior is genuinely cross-concept:

- process managers that coordinate multiple concepts
- projections built from several event streams
- slice-wide pure policies
- package-level composers

The default remains concept-local because concept locality is what makes the
slice navigable.
