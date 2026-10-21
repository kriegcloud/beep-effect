# Friction receipts

- 2026-10-20: Full report enrichment initially reached a browser challenge while
  CSV ingestion worked. The operator restored authenticated ChatGPT access;
  all eight reports were then captured through the supported browser UI.
  Prevent with an authenticated-session check before detail enrichment. No
  cookies, tokens, undocumented APIs or signed artifact URLs were extracted.
- 2026-10-20: fflate catches exceptions from a streaming output callback and
  returns them through its error callback. Preserve typed resource-limit errors
  across that boundary; otherwise node/byte-limit failures become generic parser
  errors. Source: installed UnzipInflate.push. Regression coverage is authored,
  execution held for PR #1928.

- 2026-10-20: The initial draft pass treated the dependency on PR #1928 as a
  reason to stop although source/test authoring could continue. The operator
  requested parallel work; disjoint DOCX, graph, and tooling workers found
  additional budget-accounting and consumer-coverage gaps without executing
  held checks. Prevent by distinguishing a proof/publication dependency from
  independent implementation work in the execution plan.

- 2026-10-20 resumed proof: `quality package-verify --help` documents a variadic
  package argument, but execution rejects multiple arguments with "expected at
  most one package argument". Run one package per command until the command
  help and runtime agree. The failed multi-package call ran no package proof.

- 2026-10-21: After #1928 integration, the Markdown import gate scanned
  ignored historical output under `scratchpad/.jsdoc-loop/generated-docs`.
  The source tree was not the failing input. Preserve such generated caches
  outside the repository scan surface, with a recoverable archive, before
  qualification; do not edit thousands of generated examples as source fixes.
- 2026-10-21: A newly generated Fallow audit reported introduced complexity
  in DOCX XML/ZIP handling and claim traversal. Targeted regressions alone
  had passed. Keep budget accounting explicit during refactoring and rerun
  both the security regressions and the collected gates before publication.

- 2026-10-20 resumed cheap proof: markdown Effect import enforcement scanned
  ignored historical `scratchpad/.jsdoc-loop/generated-docs` output, producing
  errors despite tracked authored docs passing. Preserved the 9 MiB cache
  outside the checkout; the specific gate passed. Future documentation scans
  should distinguish authored input from ignored generated caches without
  weakening enforcement on tracked docs.

- 2026-10-21: The package audit did not replace the synthetic test-file check
  used by Heavy/Check. Hosted diagnostics found metadata guard, optional-header
  and hub API issues after local package proof passed. Run each changed
  package's `package-test-typecheck` as part of the focused handoff; preserve
  its separate artifact and diagnostics instead of inferring it from audit.

### Parser progress is not a work-bound proof

During PDF compatibility review, a proposed forward parser used its final byte
offset to argue disjoint work. Installed `pdf-lib` source can scan an attacker-
selected stream-length target, rewind, then return a nearby offset. Many objects
can repeatedly scan one long tail. Independent source review caught this before
publication. Prefer explicit bounded/incomplete results unless parser accounting
covers lookahead and rewind work, and test adversarial shared-tail layouts rather
than assuming a final cursor records all bytes visited. No private parser adapter
or experimental deep import is retained in the chosen repair.

### Verify diagnostic policy as well as diagnostic output

A necessary native constant-time import was initially given a narrow diagnostic
suppression. Package checks passed, but hosted `lint:tsgo-rules` correctly rejected
the extra directive under its closed allowlist. Replaced it with Bun's documented
native global API and extended the existing Node test-runtime Bun shim with the
native Node comparator. Both runtime suites and the global policy pass. Future
native-boundary changes need the policy check and actual alternate test runtime,
not just a locally green compiler. No new suppression or weakened comparison was
retained.

### Codec regression tests need schema-derived variation

Adding three targeted codec assertions made the drawing critic test cross the
schema-heavy gate. Package lint/type/focused tests passed, but global schema-first
correctly required property coverage. Added a derived measurement property that
checks round-trip preservation and legacy omission defaults. The global gate now
passes with no inventory waiver. Run that gate while adding codec assertions,
not only after a publication commit.

### Refresh generated schema catalogs after public shape changes

Final-head Repo Sanity job `119051831298` rejected the stale generated
`@beep/pdf-tools` schema catalog after adding the discovery-status field.
Focused package proof and collected publication gates did not run that catalog
check. Regenerate through `beep lint schema-catalog --write` and prove the
read-only catalog gate before the follow-up push; retain the exact generated
delta. A public schema change should route its catalog refresh alongside its
codec and consumer proof.

### Retain the actual readiness verdict for proposed completion

The detached `--until-ready` monitor does not write a run verdict. Publication
alone can retain the pre-amend invocation head and no merge-readiness result.
After exact-head readiness, run the supported classic monitor to obtain the
genuine head-bound verdict, retain its bytes and digest, then use the pinned
merge gate before completion refresh. Never synthesize or hand-edit a green
verdict.

### Pair adversarial bounds with representative workload controls

External review `119056419884` identified one P1 and two P2 compatibility
regressions after the first repair: ordinary long Word XML exceeded the shared
node cap, unused media consumed the XML expansion budget, and larger claim sets
exhausted a term budget whose per-verdict charge grew with the whole input.
Existing small positive controls and adversarial bounds missed these cases.
Add realistic long-document, ignored-media and multi-dozen-claim controls beside
the security probes, and charge actual selected work. The earlier independent
source review is retained as historical evidence, superseded by these findings.
