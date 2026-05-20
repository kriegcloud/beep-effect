# Phase 3 waivers — genuine native usage left as-is

Scope note (see SPEC §2): a violation is a native **method call**, **static**, or
**constructor**. Object-literal spread/merge, computed-key literals, bracket index
access/assignment (`arr[0]`, `record[key]`, `match[n]`), and `.length` reads are
language syntax/properties and are **out of scope** — they are *not* waivers, they
were never violations. (An earlier draft of this file listed such sites; they have
been reclassified out of scope and removed.)

The entries below are the only **genuine** native usages (method calls /
constructors) deliberately left unmigrated, each `needsHumanDecision` because
migrating would change behavior or break an external contract (SPEC §8: no
behavior changes beyond the substitution).

## Date — native `Date.prototype.getTime()` on externally-supplied Dates

The Date comes from the Effect `FileSystem.File.Info.mtime` contract (a native
`Date`), so the `.getTime()` instant→epoch-millis read cannot be removed without
wrapping every FS stat in `DateTime`. Not matched by the §7 residue grep
(`new (Map|Set|Date)\(|Date.now\(`).

- **@beep/repo-ai-metrics** — `src/forwarder.ts`, `src/retention.ts`, `src/source-discovery.ts` (`O.map((mtime) => mtime.getTime())`).
- **@beep/repo-cli** — `src/commands/Ci.ts` (`O.map((mtime) => mtime.getTime())`).

## Set — native `Set`/`WeakSet` at boundaries with no Effect equivalent

- **@beep/nlp** — `src/Wink/WinkSimilarity.ts` `new Set(terms)`. wink-nlp's
  `similarity.set.tversky(left: Set, right: Set)` FFI **requires** a native JS
  `Set`; converting via `HashSet` then back still needs `new Set(`. Kept with an
  inline `// effect-native-migration: WONTFIX (wink-nlp FFI requires native Set)`
  marker. **This is the one site matched by the §7 `new Set(` residue grep** — an
  accepted, documented exception.
- **@beep/semantic-web** — `src/semantic-schema-metadata.ts` `WeakSet` cycle-detection
  guard (6 sites: `new WeakSet()`, `.has`, `.add`). `WeakSet` uses object-identity
  membership + weak-ref GC, which `HashSet`/`MutableHashSet` (value equality, strong
  refs) do not preserve. `new WeakSet(` is **not** matched by the `new (Map|Set|Date)\(`
  grep. WONTFIX.

## JSON sync-codec policy (applied, not waived)

JSON sites with no schema at a **synchronous** boundary were migrated to
`S.decodeUnknownSync` / `S.encodeUnknownSync(S.UnknownFromJsonString)` (pure
substitution preserving the sync call shape), each with a
`// TODO(effect-native-migration): model schema` comment. Where the site sits
**inside an Effect generator**, the Effect variant (`yield* S.encodeUnknownEffect`)
is used instead, to satisfy the repo's `effect(schemaSyncInEffect)` diagnostic.
Affected: `@beep/repo-cli`, `@beep/repo-ai-metrics`, `@beep/ffmpeg` (test),
`@beep/ui`, `@beep/agent-capability-use-cases`, `@beep/oip-web`,
`@beep/professional-runtime-proof`.
