# @beep/mcp-kit

Reusable MCP host-construction kit: credential-keyed toolkit composition, the
`api_key_required` envelope, tier-gate dispatch, progressive field-tier
projection, and span hygiene — built natively on `effect/unstable/ai`
(`Tool`, `Toolkit`, `McpServer`, `McpSchema`), pinned to `effect@4.0.0-beta.92`
and MCP protocol `2025-06-18`.

## Consumer plan (`foundation/capability` ≥2-consumer gate)

Per `standards/architecture/07-non-slice-families.md:56`, `foundation/capability`
requires ≥2 named consumers. This kit lands first in a PR train; the exception
ledger below (mirrored from `goals/mcp-kit/SPEC.md`) tracks discharge.

| Consumer | Status | Uses it for |
| --- | --- | --- |
| `uspto-mcp` | Candidate goal (not yet created; see [exploration MAP](../../../../explorations/mcp-auth-gated-registration/MAP.md)) | The thin USPTO MCP proving host — exercises the `SourceAuth` gate registry, credential-keyed composition, and the `api_key_required` envelope against USPTO's `soft`-gated credential. |
| `mcp-host-retrofit` | Candidate goal (not yet created; see [exploration MAP](../../../../explorations/mcp-auth-gated-registration/MAP.md)) | Retrofits `packages/drivers/nlp-mcp` and `packages/drivers/m365-mcp` onto the kit's tier-gate dispatch wrapper and four-hint annotation helper, replacing their ad hoc equivalents. |
| `packages/drivers/nlp-mcp` | Existing host, retrofit target | Currently mounts `NlpToolkit`/`StreamingToolkit` directly via `McpServer.toolkit`; retrofit adopts the kit's `SanitizedSpan` wrapper and four-hint helper. |
| `packages/drivers/m365-mcp` | Existing host, retrofit target | Currently applies the four annotation hints inline per tool (`M365Tools.ts`); retrofit adopts `annotateFourHints`/`readOnlyToolHints`. |

**Removal condition** (per the SPEC exception ledger): remove this section's
"candidate"/"target" framing once `uspto-mcp` and `mcp-host-retrofit` have
landed and this README lists them as current importers with grep-verifiable
`@beep/mcp-kit` imports, matching the `@beep/api-transport` promotion-record
precedent.

## Deliverables

1. **`SourceAuth`** — schema-first per-source credential-gate registry
   (`{name, envVar, gate, signupUrl}`), plus `Config.redacted(envVar).pipe(Config.option)`
   resolution and mount/vanish decisions.
2. **`ToolkitComposition`** — folds credential-gated layers; `hard`-gated
   sources vanish at composition when their key is absent, `none`/`soft`
   sources always mount.
3. **`ApiKeyRequired`** — the typed `failureMode: "return"` envelope for
   `soft`/`none`-gated tools whose credential is absent at call time.
4. **`TierGate`** — the fail-closed, refusal-as-value `tools/call` dispatch
   wrapper (the real security boundary), its sanitized audit record schema,
   and the `EnabledWhen` list-filter helper (list-visibility only).
5. **`FieldTier`** — named `minimal`/`balanced`/`complete` Schema projection
   tiers, null-stripping, columnar reshaping, and fetchable handles for
   oversized payloads.
6. **`SanitizedSpan`** — suppresses raw tool `parameters` from span
   attributes.
7. **`ToolAnnotations`** — the four-hint (`readOnly`/`destructive`/
   `idempotent`/`openWorld`) annotation helper.

## Installation

```bash
bun add @beep/mcp-kit
```

## Usage

```ts
import { Effect, Layer } from "effect"
import * as O from "effect/Option"
import * as S from "effect/Schema"
import { Tool, Toolkit } from "effect/unstable/ai"
import * as McpServer from "effect/unstable/ai/McpServer"
import { composeGatedLayers, gatedLayer, SourceAuthRegistration } from "@beep/mcp-kit"

const registration = SourceAuthRegistration.make({
  name: "Example Source",
  envVar: "EXAMPLE_API_KEY",
  gate: "hard",
  signupUrl: O.none()
})

const ExampleTool = Tool.make("example_tool", { success: S.String })
const ExampleToolkit = Toolkit.make(ExampleTool)
const exampleHandlers = ExampleToolkit.toLayer({ example_tool: () => Effect.succeed("ok") })
const exampleSourceLayer = McpServer.toolkit(ExampleToolkit).pipe(Layer.provide(exampleHandlers))

// Vanishes entirely when EXAMPLE_API_KEY is unset; mounts when present.
const hostLayer = composeGatedLayers(gatedLayer(registration, exampleSourceLayer))

void hostLayer
```

## Development

```bash
# Build
bun run build

# Type check
bun run check

# Test
bun run test

# Integration test
bun run test:integration

# Lint
bun run lint:fix
```

Unit tests stay outside `test/integration`; package integration tests live under `test/integration` and use `bun run test:integration`. Tests and dtslint files import package source through `@beep/mcp-kit` or other `@beep/*` aliases. Use relative imports only for local helpers, fixtures, and snapshots.

## License

MIT
