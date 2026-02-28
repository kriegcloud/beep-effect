# JSDoc Tag Priorities For KG Semantic Richness

## Context
This recommendation is optimized for the current repo state and your active KG contracts.

Current signals observed in this repo:
- KG semantic mapping currently hard-codes: `@category`, `@module`, `@domain`, `@provides`, `@depends`, `@errors`.
- Existing parse-success targets include: `@category`, `@module`, `@since`, `@param`, `@returns`.
- Current tag prevalence (quick scan): `@since` (2442), `@category` (837), `@module` (161), `@param` (133), `@returns` (85), `@example` (84), `@link` (72), `@depends` (8), `@domain` (1), `@provides` (1).
- Archived docgen (`.repos/beep-effect`) previously treated `@category`, `@example`, `@since` as required.

## Most Valuable Tags To Require Repo-Wide

### Tier 1 (Require on all exported API symbols unless noted)

| Tag | Why it is high-impact for KG | Requirement shape |
|---|---|---|
| `@category` | Stable taxonomy node for retrieval routing and clustering | Required on every exported symbol |
| `@module` | File/package-level namespace grounding for cross-package disambiguation | Required once per source file with exports |
| `@param` | Adds argument intent semantics AST/types do not capture well | Required for each documented parameter |
| `@returns` | Adds return intent semantics beyond static return type | Required for non-`void` returns |
| `@throws` | Critical failure-mode edges for agent planning and safe edits | Required when function/effect can fail |
| `@since` | Temporal dimension for migration and compatibility reasoning | Required on exported symbols |
| `@see` (or inline `{@link ...}`) | Explicit cross-symbol relationships and "next-hop" navigation edges | At least one when symbol has a primary related symbol/replacement |

### Tier 2 (Require when applicable; still very high KG value)

| Tag | Why it matters | Requirement shape |
|---|---|---|
| `@deprecated` | Lifecycle and replacement intent; reduces stale API suggestions | Required whenever symbol is deprecated; pair with `@see` replacement |
| `@example` | High-signal usage retrieval for agent grounding | Required for command surfaces, services, and public constructors |
| `@typedef` / `@callback` | Promotes conceptual domain shapes/functions to first-class KG entities | Required for exported conceptual shapes not obvious from signature alone |
| `@implements` / `@augments` | Clarifies behavioral contracts and inheritance semantics | Required on classes where applicable |

## Why These Over Others
These tags add semantics that are not reliably recoverable from AST/type extraction alone:
- Intent: `@param`, `@returns`, `@example`
- Failure semantics: `@throws`
- Lifecycle/time: `@since`, `@deprecated`
- Explicit semantic linking: `@see`, `{@link ...}`
- Conceptual abstraction metadata: `@typedef`, `@callback`

## Recommended KG Edge Expansion (Next Contract Iteration)
You already map custom tags (`@domain/@provides/@depends/@errors`) to semantic edges. To unlock richer graph reasoning, add mappings for standard tags:

- `@param` -> `HAS_PARAM` / `PARAM_INTENT`
- `@returns` -> `RETURNS_INTENT`
- `@throws` -> `THROWS` (typed/literal error node)
- `@since` -> `INTRODUCED_IN`
- `@deprecated` -> `DEPRECATED_IN` + `REPLACED_BY` (from `@see`/`@link`)
- `@see` / `{@link}` -> `RELATED_TO` (or typed relation variants)
- `@example` -> `HAS_EXAMPLE`

Keep existing custom semantic tags because they encode repo/domain intent that standard JSDoc does not:
- `@domain`, `@provides`, `@depends`, `@errors`

## Proposed Lint Contract (Pragmatic)

1. Hard-required globally for exported APIs:
- `@category`, `@module`, `@since`

2. Hard-required by symbol shape:
- `@param` (if params exist)
- `@returns` (if non-void)
- `@throws` (if error channel/throw path exists)

3. Conditional lifecycle/navigation:
- `@deprecated` required when deprecated, with `@see` or `{@link}` replacement

4. High-value quality gate:
- `@example` required for entrypoints, commands, services, and exported constructors

## Rollout Order
1. Enforce Tier 1 with warnings, gather parse-success metrics.
2. Promote Tier 1 to errors once false positives are addressed.
3. Add Tier 2 requirements per scoped modules (tooling + shared domain first).
4. Expand KG parser/edge writer to emit new semantic edge families.

## Primary References
- JSDoc tag index: https://jsdoc.app/
- `@param`: https://jsdoc.app/tags-param
- `@returns`: https://jsdoc.app/tags-returns
- `@throws`: https://jsdoc.app/tags-throws
- `@since`: https://jsdoc.app/tags-since
- `@deprecated`: https://jsdoc.app/tags-deprecated
- `@see`: https://jsdoc.app/tags-see
- inline `{@link ...}`: https://jsdoc.app/tags-inline-link
- `@typedef`: https://jsdoc.app/tags-typedef
- `@callback`: https://jsdoc.app/tags-callback
- `@implements`: https://jsdoc.app/tags-implements
- `@augments`: https://jsdoc.app/tags-augments
- `@example`: https://jsdoc.app/tags-example
- `@module`: https://jsdoc.app/tags-module
