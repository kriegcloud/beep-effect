# Eligibility receipt — 2026-10-09

The six named clones are mandatory candidates. Additional tools require at least 5,000 GitHub stars, recent maintenance and a usable local coding-agent interface. Official repository metadata was rechecked 2026-10-09; stars and push dates are observations, not immutable release identities. Frozen source/distribution versions and fixture/interface outcomes are in [readiness](READINESS.md), with exact identities in its digest projection. Recheck eligibility/maintenance at launch; any amendment precedes scored freeze, never silently changes a running matrix.

| Exact official repository | Stars observed | Last push observed (UTC) | Configuration admission |
| --- | ---: | --- | --- |
| [trailhq/Graft](https://github.com/trailhq/Graft) | 9,757 | 2026-10-09T14:06:12Z | one graph configuration; fixture/interface passed |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | 125,007 | 2026-10-09T19:08:04Z | one graph configuration; fixture/interface passed |
| [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) | 73,599 | 2026-10-07T16:34:38Z | one graph configuration; fixture/interface passed |
| [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus) | 47,797 | 2026-10-09T20:49:34Z | one graph configuration; fixture/interface passed |
| [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | 46,229 | 2026-10-09T20:36:49Z | one graph configuration; fixture/interface passed |
| [tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) | 32,006 | 2026-10-06T19:33:08Z | one graph configuration; fixture/interface passed |
| [oraios/serena](https://github.com/oraios/serena) | 30,129 | 2026-10-09T13:08:19Z | LSP and JetBrains, separate arms; fixture/interface passed |
| [repowise-dev/repowise](https://github.com/repowise-dev/repowise) | 7,385 | 2026-10-09T20:35:52Z | one graph configuration; fixture/interface passed |
| [fallow-rs/fallow](https://github.com/fallow-rs/fallow) | 5,030 | 2026-10-09T20:12:40Z | one graph configuration; fixture/interface passed |
| [vitali87/code-graph-rag](https://github.com/vitali87/code-graph-rag) | 5,240 | 2026-10-09T21:13:40Z | one graph configuration; fixture/interface passed |
| [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | 85,759 | 2026-10-09T05:35:24Z | one graph configuration; fixture/interface passed |

This yields 12 graph configurations and one no-graph control. A source/default-branch SHA is never substituted for a release distribution identity; Serena/UA use explicitly adjudicated reproducible source pins, recorded separately from older stable tags.

## Search coverage and exclusions

The protected eligibility-search receipt records exact queries, total counts and incomplete-results flags. The eight search queries were:

- `code graph mcp stars:>=5000 archived:false` — total5, incomplete=false.
- `code intelligence mcp stars:>=5000 archived:false` — total5, incomplete=false.
- `codebase graph stars:>=5000 archived:false` — total5, incomplete=false.
- `code knowledge graph stars:>=5000 archived:false` — total6, incomplete=false.
- `graph coding agent stars:>=5000 archived:false` — total2, incomplete=false.
- `code intelligence stars:>=5000 archived:false` — total14, incomplete=false.
- `repository graph stars:>=5000 archived:false` — total0, incomplete=false.
- `topic:code-graph stars:>=5000 archived:false` — total1, incomplete=false.

These searches provide reproducible bounded discovery evidence, not proof that every repository on GitHub was exhaustively enumerated. Include newly found qualifying tools before final matrix freeze; do not infer eligibility solely from a keyword or star count.

- [cocoindex framework](https://github.com/cocoindex-io/cocoindex):11,657stars, broader ingestion framework rather than an equivalent turnkey local coding-agent graph configuration. Its distinct [cocoindex-code](https://github.com/cocoindex-io/cocoindex-code) had2,810stars, below the required threshold. Separate identities remain explicit.
- [xberg](https://github.com/xberg-io/xberg): staged audit found a broad extractor interface without the equivalent persistent repository graph treatment; excluded from this scoped matrix.
- [TencentDB-Agent-Memory](https://github.com/TencentCloud/TencentDB-Agent-Memory): memory-hub/proxy scope conflicts with the experiment's no-memory-service/control boundary; do not reintroduce it through eligibility discovery.
- [ruflo](https://github.com/ruvnet/ruflo): broad swarm/harness/memory system, not a standalone graph treatment under these controls.
- Other below-threshold candidates remain exclusions in the protected search/inventory receipts. No blanket conclusion about their general usefulness is implied.

Eligibility/transport does not prove full documented Beep ingestion, scored tool adoption or outcome quality. Unsupported integrations remain explicit cells with evidence; no undocumented wrapper advantage is added to make a treatment appear usable.
