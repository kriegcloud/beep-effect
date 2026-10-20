# P2b: agent-attribution keys, exporter enrichment, tier ceilings

2026-10-14. This finishes P2 of `goals/observability-kernel-catalog` after PR 1
(#1727), PR 2 (#1762) and the Effect 4.0.4 bump (#1796). It builds on
[`catalog-design.md`](./catalog-design.md) and the naming contract in
[`explorations/observability-palantiri/DECISIONS.md`](../../../explorations/observability-palantiri/DECISIONS.md).
Order: schema, then contract, then implementation.

## A. Agent-attribution keys (owned by `@beep/repo-ai-metrics`)

New file `packages/tooling/library/ai-metrics/src/AiMetrics.instruments.ts`
exports `AiMetricsInstruments`, an `InstrumentDeclarations` built from
`@beep/observability/catalog` schemas. `beep observability catalog` finds it
by path, the same way it finds the kernel and desktop files.

| Key | Values | Signals | Cardinality | Min tier |
| --- | --- | --- | --- | --- |
| `beep.harness` | `claude-code`, `codex-cli`, `cursor-cli`, `grok-build`, `grok-bot`, `muse-code`, `junie-cli`, `ci`, `webapp` | span, metric, log | static | shape-only |
| `beep.provider` | `anthropic`, `openai`, `xai`, `cursor`, `meta`, `jetbrains` | span, metric, log | static | shape-only |
| `beep.provider_account` | open (ordinal or salted hash, never an email) | span, metric, log | bounded | standard |
| `beep.route` | `direct`, `proxy`, `cursor-seat`, `grok-build`, `junie` | span, metric, log | static | shape-only |
| `beep.model_role` | open (manifest role id) | span, metric, log | bounded | standard |
| `beep.emitter` | `native`, `wrapper`, `proxy`, `hook`, `transcript` | span, metric, log | static | shape-only |
| `beep.lane` | open | span, log | unbounded | standard |
| `beep.session` | open (salted hash of the native session id) | span, log | unbounded | standard |

- The closed value lists are `LiteralKit` domains exported from the same
  file, so the harness wrappers in `goals/harness-emitters-all-providers` can
  import them.
- `beep.lane` and `beep.session` are never metric labels. The catalog's
  `UnboundedMetricLabel` check enforces this.
- Dependency direction: ai-metrics → `@beep/observability/catalog` is
  allowed. No AI semantics move into `@beep/observability`, which is the
  `goals/ai-metrics-stack` boundary.

## B. Exporter enrichment and tier ceilings on the emit path

A new kernel layer, in `@beep/observability/catalog`:

```ts
layerCatalogEnrichment(options: {
  readonly catalog: InstrumentCatalog
  readonly context: EmitterContext
  readonly requestedTier: TelemetryTier
}): Layer.Layer<never>
```

It wraps the current `Tracer.Tracer`, the same way `layerFilteredDevTools`
wraps it, and on every span:

1. **Package and family.** When `packageOf(catalog, name)` is `Some`, it
   sets `beep.package` and `beep.family`. Spans missing from the catalog are
   left alone.
2. **Tier stamp.** It sets `beep.privacy_tier` to
   `effectiveTier(context, requestedTier)`, so the stricter of the context
   ceiling and the request wins. It also sets `beep.identity_source` from
   the context.
3. **Ceiling enforcement.** When the effective tier is `shape-only`, the
   wrapper drops any attribute whose key is not in
   `allowedAttributes(catalog, "span", "shape-only")`. This applies to keys
   given at span creation and to later `span.attribute(...)` calls. Each drop
   increments a `beep.telemetry.refused` counter, labelled
   `beep.schema_failure_tag = "attribute-not-allowed"`. At looser tiers
   nothing is filtered.

`goals/practice-kg-mcp-strict-tier`'s serializer gate stays the
authoritative fence for the attorney PC (exploration D2). This wrapper is
defence in depth plus the stamping, and both share `allowedAttributes`, so
the two fences agree.

**Gotchas:**
- The wrapper has to wrap a tracer that already exists. Compose it with
  `Layer.provideMerge` over the OTLP or DevTools tracer layer: the PR 1
  ordering lesson.
- Tier and identity attributes are stamped on the span, never as resource
  attributes. The resource stays constant per process.

## Acceptance (P2 complete)

- `AiMetricsInstruments` decodes, and the catalog (`--write`, then `--check`)
  lists `declaration-files=3` and the eight keys.
- Tests cover `layerCatalogEnrichment`:
  - package and family stamped for a catalogued span; untouched for an
    unknown one;
  - tier stamp equals `effectiveTier` for each `EmitterContext` variant;
  - under `shape-only`, a non-allowlisted attribute is dropped and counted,
    and an allowlisted one survives;
  - under `standard`, nothing is dropped.
- `package-verify` passes for `@beep/observability` and
  `@beep/repo-ai-metrics`. effect-vitest and schema-first report no
  introduced findings. The codemod `--check` on the changed files exits 0.
