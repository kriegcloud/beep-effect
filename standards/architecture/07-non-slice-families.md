# Non-Slice Families

Not every important artifact in the repo is a product slice.

Some packages exist to provide domain-agnostic substrate. Some exist to support
development and operations. Some exist to wrap external engines and SDKs. If
those artifacts are all described as
`common`, `shared`, or `core`, the repo loses the same compressed context that
slice topology gives product code.

This is why non-slice artifacts get first-class family grammar, with kind where
applicable.

## Why `common`, `shared`, And `core` Are Not Enough

Those names are attractive because they feel flexible. The problem is that they
compress nothing.

If a package is called `common`, a reader still has to open files to discover
whether it is:

- a schema/identity substrate
- a shared UI primitive library
- a repo CLI
- a config preset bundle

That is exactly the ambiguity the architecture is trying to remove.

When translating legacy `common`, default to `foundation`. Route to `shared/*`
or the owning slice instead when the code carries durable product semantics.

## Specific Homes Before Capability

`foundation/capability` is the last generic destination, not the default home
for reusable technical code.

Route in this order:

1. Product semantics go to the owning slice or `shared/*`.
2. External engines, SDKs, services, frameworks, and browser platform wrappers
   go to `drivers`.
3. Repo operations, generators, policy packs, and automation go to `tooling`.
4. Product-agnostic UI primitives, themes, tokens, hooks, and composition
   helpers go to `foundation/ui-system`.
5. Only remaining repo-owned, domain-agnostic technical services may go to
   `foundation/capability`.

`foundation/capability` must pass a negative gate plus proof:

- no product semantics
- no external-engine, third-party SDK, service, framework, or browser platform
  wrapping
- no repo-operational/tooling purpose
- no UI primitive, design-system role, or React ergonomics layer
- **≥2 named consumers currently importing the package**, listed by name in the
  package's README

One importer is not promotion-ready. The README must name each importer with a
one-line note on what it uses the capability for; this list is checked at PR
review.

Reusable shape alone is not proof. A `Context.Service` or Layer can belong in
the owning slice, `drivers`, `tooling`, or `foundation/ui-system` depending on
what it wraps and who owns the meaning.

### Worked rejection example: "schema validator wrapper"

A proposed `foundation/capability/schema-validator` package wraps
`S.decodeUnknownEffect` with a custom error formatter and is imported by the
iam slice's HTTP handlers.

Looks like a capability: domain-agnostic, reusable, no product semantics,
would-be importable from anywhere.

Fails the gate because:

- Only one current consumer (iam HTTP handlers); the gate requires ≥2.
- The functionality is a thin formatter over a v4 `Schema` API; "reusable shape
  alone is not proof."
- The owning home is correct: it's an HTTP-layer concern. It belongs in iam's
  server package as an internal helper, or — if a second slice's HTTP handlers
  later want the same formatter — in `tooling/library/http-formatters` (a
  tooling library), not in foundation.

The shape of the rejection: a capability candidate is rejected by **(a)** a
consumer count below 2, **(b)** the existence of a more specific home
(`drivers`, `tooling`, slice-local), or **(c)** the candidate being an
ergonomic wrapper around an existing capability rather than a capability
itself.

## The Family And Kind Grammar

The canonical non-slice families are:

- `foundation`: domain-agnostic reusable substrate
- `drivers`: flat repo-level external boundary wrappers
- `tooling`: developer-operational code packages

Every non-slice artifact declares one canonical family. Kind remains required
only for families that intentionally declare a kind segment.

```txt
packages/foundation/<kind>/<name>
packages/drivers/<name>
packages/tooling/<kind>/<name>
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

Browser/runtime helpers follow platform-first routing:

- low-level browser platform wrappers belong in `drivers` and expose their
  browser-safe surface through `@beep/<driver>/browser`
- thin product-agnostic React hooks or components belong in
  `foundation/ui-system`
- product-specific browser state and behavior belong in slice `client` or `ui`
- rare runtime-neutral technical services may belong in
  `foundation/capability` only after the capability gate

Driver package roots are not browser-safe by default. Foundation package roots
must be runtime-neutral or browser-safe by contract; environment-specific
foundation surfaces need explicit environment entrypoints.

## Why Tooling Uses A Small Kind Catalog

Tooling has many jobs, but it does not need many architectural kinds.

- `library` covers reusable repo-analysis and support code
- `tool` covers CLIs, pipeline tools, and orchestrators
- `policy-pack` covers config presets and governance data
- `test-kit` covers reusable testing helpers

This keeps the family legible while still making dependency rules visible.
Repo-wide orchestration is behavior inside `tool`, not a separate one-off
package kind.

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
```

The pattern is the point: a reader should know the job of the artifact before
opening the first source file.
