# Non-Slice Families

Not every important artifact in the repo is a product slice.

Some packages exist to provide domain-agnostic substrate. Some exist to support
development and operations. Some exist to steer coding agents. Some exist to
wrap external engines and SDKs. If those artifacts are all described as
`common`, `shared`, or `core`, the repo loses the same compressed context that
slice topology gives product code.

This is why non-slice artifacts get first-class family grammar, with kind where
applicable.

## Why `common`, `shared`, And `core` Are Not Enough

Those names are attractive because they feel flexible. The problem is that they
compress nothing.

If a package is called `common`, an agent still has to open files to discover
whether it is:

- a schema/identity substrate
- a shared UI primitive library
- a repo CLI
- a config preset bundle
- a prompt/policy asset directory

That is exactly the ambiguity the architecture is trying to remove.

When translating legacy `common`, default to `foundation`. Route to `shared/*`
or the owning slice instead when the code carries durable product semantics.

## The Family And Kind Grammar

The canonical non-slice families are:

- `foundation`: domain-agnostic reusable substrate
- `drivers`: flat repo-level external boundary wrappers
- `tooling`: developer-operational code packages
- `agents`: repo-local AI steering bundles

Every non-slice artifact declares one canonical family. Kind remains required
only for intentionally kinded families.

```txt
packages/foundation/<kind>/<name>
packages/drivers/<name>
packages/tooling/<kind>/<name>
agents/<kind>/<name>
```

The path is the first layer of context compression. The manifest metadata is the
second. Humans should infer role from the path. Tooling should enforce the same
fact from metadata.

`drivers` is the explicit flat-family exception. It records family metadata,
omits `kind` in manifest metadata, and does not add a second `<kind>` segment.

## `shared` Is Not `foundation`

`shared` remains the DDD shared kernel.

```txt
shared      = deliberate cross-slice product language
foundation  = domain-agnostic reusable substrate
```

That distinction matters because the coupling is different.

Promoting something into `shared` means slices are intentionally agreeing on the
same product semantics. Promoting something into `foundation` means the package
is useful without creating product-domain coupling.

Generic schema helpers, identity helpers, markdown utilities, or terminal-color
helpers belong in `foundation`, not `shared`. Shared-kernel value objects or
shared config contracts belong in `shared` when multiple slices deliberately
share the same meaning.

## Why `drivers` Stay Separate

`drivers` and `foundation` are not interchangeable.

```txt
drivers    = external engines, SDKs, and service boundaries
foundation = repo-owned substrate the repo increasingly owns
```

If the code wraps Drizzle, Postgres, Firecrawl, browser APIs, or another
third-party engine behind a dev-safe boundary, it belongs in `drivers`.

If the repo owns the implementation as internal substrate, it belongs in
`foundation` instead.

`shared` never owns technical wrappers or external drivers.

## Why UI Primitives Stay In `foundation`

A shared primitives library such as `@beep/ui` is not a slice and not a shared
kernel package. Its job is to provide domain-agnostic building blocks:
primitives, themes, tokens, hooks, and composition helpers.

That makes it a `foundation/ui-system` package.

This keeps the mental model clean:

- slice UI owns product screens and workflows
- shared kernel owns cross-slice product language
- `foundation/ui-system` owns product-agnostic UI primitives

`ui-system` is a side branch of foundation. It may depend on
`foundation/primitive` and `foundation/modeling`, but it does not depend on
`foundation/capability` by default.

## Why Tooling Uses A Small Kind Catalog

Tooling has many jobs, but it does not need many architectural kinds.

- `library` covers reusable repo-analysis and support code
- `tool` covers CLIs, pipeline tools, and orchestrators
- `policy-pack` covers config presets and governance data
- `test-kit` covers reusable testing helpers

This keeps the family legible while still making dependency rules visible.
Repo-wide orchestration is behavior inside `tool`, not a separate one-off
package kind.

## Why Agents Are Portable Bundles Plus Runtime Adapters

Agent content has two very different concerns:

- portable guidance and steering content
- runtime-specific assembly for Claude, Codex, or future runtimes

The architecture keeps those concerns separate.

- `skill-pack` owns portable task guidance
- `policy-pack` owns declarative steering packets
- `runtime-adapter` owns declarative runtime-specific composition

The adapter is where composition happens. It references skill/policy packs by
id and adds runtime-local config or templates. It does not own executable logic.
Executable hooks, CLIs, generators, and sync flows live in `tooling/tool`.

## Worked Examples

```txt
packages/foundation/modeling/schema
  -> reusable schema/modeling substrate

packages/drivers/drizzle
  -> repo-level Drizzle driver

packages/foundation/ui-system/ui
  -> shared UI primitives and themes

packages/tooling/tool/cli
  -> repo operational CLI

packages/tooling/policy-pack/repo-configs
  -> shared governance/config packets

agents/skill-pack/schema-first-development
  -> portable schema-first guidance bundle

agents/runtime-adapter/codex
  -> declarative Codex wiring over shared skill/policy packs
```

The pattern is the point: a reader should know the job of the artifact before
opening the first source file.
