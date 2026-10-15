# Instrumentation catalog: design (P2)

2026-10-14. Normative inputs: the six-axis naming contract and its
families-and-hosts amendment in
[`explorations/observability-palantiri/DECISIONS.md`](../../../explorations/observability-palantiri/DECISIONS.md),
and the survey in
[`naming-and-identity-survey.md`](../../../explorations/observability-palantiri/research/naming-and-identity-survey.md).
Design order: schema, then service contract, then implementation.

## Operator rulings (2026-10-14, align for P2)

1. **Spans are harvested and checked.** A generator scans every literal
   `Effect.fn` / `Effect.fnUntraced` / `Effect.withSpan` name into a
   generated, committed span section: name, owning package, family. A check
   fails on duplicate names across packages, interpolated names, and drift
   between source and the generated section. Spans are hand-declared only when
   they need extra attributes or a tier override.
2. **Declarations live per package.** Each package that declares metrics,
   events or attribute keys owns a `src/<Pkg>.instruments.ts` built from the
   kernel schemas. A repo command merges every declaration file plus the
   harvested span section into one checked catalog.
   `@beep/repo-ai-metrics` owns the agent-attribution keys this way.

## Schemas (kernel subpath `@beep/observability/catalog`)

Literal domains (`LiteralKit`):

| Name | Values | Notes |
| --- | --- | --- |
| `TelemetryTier` | `shape-only`, `standard`, `dev-verbose` | Ordered strictest first; tier ceilings combine by taking the stricter one. |
| `PackageFamily` | `slice`, `foundation`, `driver`, `tooling`, `ecosystem`, `app`, `lab` | Derived from the package path, never hand-written. |
| `SignalKind` | `span`, `metric`, `event`, `log` | |
| `CardinalityClass` | `static`, `bounded`, `unbounded` | Metric labels accept only `static` and `bounded`. |
| `AttributeValueType` | `string`, `boolean`, `int`, `double`, `string-array` | |
| `MetricKind` | `counter`, `up-down-counter`, `gauge`, `histogram`, `summary` | |
| `SpanKind` | `internal`, `server`, `client`, `producer`, `consumer` | |
| `IdentitySource` | `vouched`, `self-claimed` | |

Branded names (regex-checked, so names are static by construction):

- `SpanName`: `Concept(.Sub)*.action`, for example `Parcels.read`. Semconv
  protocol spans are exempt and declared with `protocol: true`.
- `MetricName`: lowercase dotted `beep.<area>.<noun>`, with no unit or
  `_total` suffix, because the exporter adds suffixes.
- `EventName`: `Concept.event_happened`.
- `AttributeKeyName`: lowercase dotted.

Classes:

- `AttributeKey`: `key`, `type`, `signals` (non-empty `SignalKind` set),
  `cardinality`, `minTier` (the strictest tier allowed to carry it), an
  optional closed `values` list, `owner` (package name), `description`.
- `MetricInstrument` / `SpanInstrument` / `EventInstrument`, combined as the
  tagged union `Instrument`. Each has a `name`, `owner`, `attributes`
  (attribute-key names), `minTier` and `description`. Metrics also have a
  `kind`, a UCUM `unit` and optional histogram `boundaries`. Spans also have
  a `kind`, `protocol`, and `origin: harvested | declared`.
- `InstrumentDeclarations`: one package's file content (`attributes`,
  `instruments`).
- `InstrumentCatalog`: the merged result (`version`, `attributes`,
  `instruments`), decoded through checks:
  - names are unique per signal;
  - every referenced attribute key exists and allows that signal;
  - metric attributes are `static` or `bounded`;
  - an instrument's `minTier` is no looser than its attributes'.

`EmitterContext`, a tagged union, describes where a record ran. Every variant
carries `identitySource`, and each variant has a tier ceiling:

| Variant | Required fields | Ceiling |
| --- | --- | --- |
| `Workstation` | `hostName` | `dev-verbose` |
| `Server` | `hostName` | `standard` |
| `StrictDesktop` | none (the gateway stamps the host) | `shape-only` |
| `CiRunner` | `pipelineRunId`, `vcsRevision` | `standard` |
| `CloudVm` | `cloudProvider` | `standard` |
| `Serverless` | `cloudProvider`, `faasName`, `deploymentEnvironment` | `standard` |
| `Browser` | none | `shape-only` |

The kernel's generic attribute keys go in the kernel's own declarations file:
`beep.package`, `beep.family`, `beep.privacy_tier` and
`beep.identity_source`.

## Service contract

The catalog is data. Its operations are pure, total functions over the
schemas:

- `mergeDeclarations`: combines many declarations and the harvested span
  section into a `Result` of catalog or typed `CatalogConflict` errors.
- `allowedAttributes(signal, tier)`: the closed key set for a signal at a
  tier. The strict-tier gate and the collector allowlist generator use it.
- `tierCeiling(context)`, and `effectiveTier(context, requested)`, which
  returns the stricter of the two.
- `packageOf(spanName)`: name to package and family, used for export-time
  enrichment.

A `Context.Service` (`InstrumentCatalogService`) is added only once
something has to load the generated catalog at runtime. The exporter-side
enrichment in P2 takes a `ReadonlyMap`-free `HashMap` built from the
generated section, through a Layer.

## Repo tooling (repo CLI)

- `beep observability catalog --write | --check`: harvests the span literals,
  loads every `*.instruments.ts`, merges them, and writes
  `standards/instrumentation-catalog.generated.jsonc`. `--check` fails on
  conflicts, duplicates, interpolated names and drift.
- `12-observability.md` gets a generated section rendered from the catalog.

## Out of P2

The strict-tier gate itself (`goals/practice-kg-mcp-strict-tier`) and the
collector allowlist rendering (`goals/fleet-telemetry-tailnet`) consume
`allowedAttributes`; neither is built here.
