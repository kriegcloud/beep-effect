# Phase 3 waivers — needsHumanDecision sites left as-is

These native-usage sites were flagged in Phase 2 with `needsHumanDecision` and are
**deliberately not migrated** in this goal. None is matched by the SPEC §7 residue
grep (`JSON.parse|stringify`, native `.split|.trim|.toLowerCase|.toUpperCase|.replace`,
`new Map|Set|Date`, `Date.now`) **except** the one explicitly noted, which is an
unavoidable external-API boundary. Each is recorded here for a future human pass.

Rationale follows SPEC §8 (no behavior changes beyond the native→Effect
substitution) — converting these would change behavior, erase load-bearing type
inference, or break an external contract.

## Waiver-only packages (no source edits)

- **@beep/identity** — `src/Id.ts:1043` generic `Extras` spread-merge cast to
  `IdentityAnnotationResult`. The generic type parameter is load-bearing; a raw
  `effect/Struct` merge risks losing the inferred shape. Not grep-matched.
- **@beep/data** — `src/internal/data/mime-types/index.ts:93` six-way static
  spread (`{...application, ...audio, ...}`) that drives `MimeType = keyof typeof mimes`
  and `FileExtension`. A runtime merge erases literal-key inference. Not grep-matched.
- **@beep/test-utils** — `src/SqlTest.ts:1078` single-field override spread; a
  `Struct.evolve` offers no real gain. Not grep-matched.
- **@beep/openai-compat** — `src/OpenAiCompat.language-model.ts:638`
  `activeToolCalls[toolIndex]` read. `R.get` returns `Option`, but lines 639–651
  rely on `undefined` semantics (`?.id`, `=== undefined`); migrating ripples into
  those null-checks (behavior risk). Not grep-matched.
- **@beep/semantic-web** — `src/semantic-schema-metadata.ts` `WeakSet` cycle-detection
  guard (6 sites). `WeakSet` uses object-identity membership + weak-ref GC, which
  `HashSet`/`MutableHashSet` (value equality, strong refs) do not preserve.
  `new WeakSet(` is **not** matched by the `new (Map|Set|Date)\(` grep. WONTFIX.
- **@beep/acp** — `src/client.ts:434/446/452` `Array.length === 0` emptiness guards;
  compound short-circuits whose `A.match` rewrite is structural, not mechanical.
  `.length` is not grep-matched.

## Per-package partial waivers (package also has mechanical fixes applied)

- **@beep/repo-utils** — 8 local mutable string-keyed record accumulators
  (`Dependencies.ts:36,38`; `Reuse.service.ts:612,635,908,934,1207,1272`). Hot-loop
  accumulation that never escapes; SPEC §5 sanctions justified-local mutation, and
  immutable `R` rebuild vs `MutableHashMap` is a non-mechanical perf/shape decision.
  (The 4 clean `R.get` reads + `A.map`/`A.get` are migrated.)
- **@beep/repo-docgen** — `src/Core.ts:188/195/203` `RegExpMatchArray` capture-group
  index access (`match[1..3]`). Capture-group reads → `A.get`+Option is semantically
  awkward. (The clean `tokens[0]` → `A.head` in `Printer.ts:62` is migrated.)
- **@beep/repo-ai-metrics** — `forwarder.ts:517`, `retention.ts:80`,
  `source-discovery.ts:301` `mtime.getTime()` on a native `Date` from the Effect FS
  `File.Info` contract. `.getTime()` is not grep-matched. (JSON sites are migrated.)
- **@beep/repo-cli** — `Ci.ts:204` `mtime.getTime()` (FS-contract Date, not grep-matched).
  (All String/Array + `Operations.ts:1326` `toISOString`→`DateTime.formatIso` + the
  JSON site are migrated.)
- **@beep/ffmpeg** — 5 `S.Class`-instance spread-merges + a typed-key `R.singleton`
  (`FFmpeg.service.ts:264,468,477,518,911`); spreading class instances and
  substituting `Struct.assign` is behavior-adjacent / brushes SPEC §5 no-schema-authoring.
  Not grep-matched. (The clean inner `R.set` at :479 and the test JSON site are migrated.)
- **@beep/sandbox** — 18 `Array.length`/single-index/`RegExpMatchArray` sites; `.length`
  guards + capture-group reads are structural, not grep-matched. (The 4 test `.replace`
  → `Str.replace` are migrated.)
- **@beep/nlp** — `src/Wink/WinkSimilarity.ts:57` `new Set(terms)`. **This is the one
  grep-matched waiver:** wink-nlp's `similarity.set.tversky(left: Set, right: Set)`
  requires a native JS `Set`; it is a thin FFI adapter at the boundary. Materializing
  via `HashSet` then converting back still needs `new Set(`. Kept with an inline
  `// effect-native-migration: WONTFIX (wink-nlp FFI requires native Set)` marker;
  the residue-grep hit on this exact line is an accepted, documented exception.
  (The 3 `A.head`/`A.last` array fixes are migrated.)

## JSON sync-codec policy (applied, not waived)

JSON sites with no target schema at a **synchronous** boundary are migrated to
`S.decodeUnknownSync` / `S.encodeUnknownSync(S.UnknownFromJsonString)` (pure
substitution that preserves the synchronous call shape and removes the raw
`JSON.parse`/`JSON.stringify`), each with a `// TODO(effect-native-migration): model schema`
comment. This satisfies SPEC §5 (never leave raw JSON) without the §8-forbidden
sync→effectful behavior change. Affected: `@beep/repo-cli`, `@beep/repo-ai-metrics`,
`@beep/ffmpeg` (test), `@beep/ui`, `@beep/agent-capability-use-cases`, `@beep/oip-web`,
`@beep/professional-runtime-proof`.
