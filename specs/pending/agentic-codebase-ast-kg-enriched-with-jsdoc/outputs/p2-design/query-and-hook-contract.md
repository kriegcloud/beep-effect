# Query and Hook Contract

## Purpose
Freeze hybrid retrieval behavior, ranking policy, packet format, latency guardrails, and hook failure semantics for KG context injection.

## Lock Alignment (Normative)

| Interface Surface | Frozen Contract |
|---|---|
| Hook context format | XML-style compact block containing `<kg-context>`, `<symbols>`, `<relationships>`, `<confidence>`, `<provenance>` |
| Hook fail behavior | Hard timeout + no-throw: on failure emit no KG block and preserve existing hook output |
| Read path policy | `hybrid` (`local deterministic cache` + `Graphiti semantic layer`) |
| Hook latency budget | Enforce `p95 <= 1.5s` starting at `R2 Limited On` |
| KG edge provenance | `provenance = ast | type | jsdoc` |

## Reuse Boundary
Reuse existing hook schema/wrapper contracts:
- `.claude/hooks/skill-suggester/index.ts`
- `.claude/hooks/schemas/index.ts`
- `.claude/hooks/*/run.sh`

This contract only adds a KG retrieval and packet assembly module.

## Query Composition Contract
1. Parse prompt signals: symbols, file paths, tags, domain terms.
2. Query local deterministic cache first for exact symbol/path hits.
3. Query Graphiti semantic layer second for relationship expansion when available.
4. Merge and rank combined candidates.
5. Emit bounded XML packet or emit nothing on failure/timeout.

## Ranking Policy

### Candidate Pools
- Symbol candidates from local cache: max `40`
- Relationship candidates from Graphiti: max `60`

### Final Packet Bounds
- `topKSymbols = 8`
- `topKRelationships = 14`
- `maxPacketChars = 6000`
- `maxPacketTokens = 900` (approximate tokenizer estimate)

### Score Function
`score = 0.45*lexical + 0.30*structural + 0.20*semantic + 0.05*recency`

Score rules:
1. `lexical`: prompt-to-symbol name/path match.
2. `structural`: graph distance and call/import relevance.
3. `semantic`: tag/domain relevance from JSDoc semantic edges.
4. `recency`: commit proximity bonus for recent updates.

## XML Packet Contract (Locked Shape)

```xml
<kg-context version="1">
  <symbols>
    <symbol id="beep-effect3::packages/x.ts::foo::function::..." kind="function" score="0.93" provenance="ast,type" />
  </symbols>
  <relationships>
    <relationship type="CALLS" from="..." to="..." score="0.88" provenance="type" />
    <relationship type="IN_DOMAIN" from="..." to="payments" score="0.81" provenance="jsdoc" />
  </relationships>
  <confidence overall="0.87" />
  <provenance local-cache="true" graphiti="true" commit="abcdef1234" />
</kg-context>
```

Required XML sections:
1. `<kg-context>`
2. `<symbols>`
3. `<relationships>`
4. `<confidence>`
5. `<provenance>`

## Timeout and Failure Contract
1. Hard timeout for KG retrieval and packet build: `1200ms`.
2. If timeout, parse error, query error, or serialization error occurs:
emit no KG block.
3. Hook output remains the existing non-KG output path.
4. Exceptions must be swallowed and logged through existing hook logging path.

## Hybrid Read Fallback Rules
1. Graphiti unavailable:
use local deterministic cache only.
2. Local cache unavailable but hook still running:
emit no KG block.
3. Neither source available:
emit no KG block.

## Packet Compression Rules
1. Deduplicate symbols by `nodeId`.
2. Collapse repeated edge patterns by `(type,from,to)`.
3. Truncate long literal fields to 160 characters.
4. Drop lowest-ranked candidates first to satisfy bounds.

## Acceptance Checks
1. Packet validates against existing hook schema wrappers with no wrapper change.
2. Injected packet always includes required XML sections.
3. Timeout path emits no KG block and does not throw.
4. Graphiti outage path still returns local-only packet when local cache is healthy.
5. Ranking outputs are deterministic for same prompt and same commit snapshot.

## P3 Ownership Handoff
- Hook Engineer:
query orchestrator, ranking, packet formatter, timeout/no-throw guard.
- Graphiti Engineer:
reliable semantic query adapter for hook module.
- AST Engineer:
local deterministic lookup API with stable response shape.
- Eval Engineer:
latency and usefulness instrumentation for `kg_hook` condition.

## Freeze Statement
Query merge, ranking bounds, packet shape, timeout policy, and failure behavior are fixed and implementation-ready.
