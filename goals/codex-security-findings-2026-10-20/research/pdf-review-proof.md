# PDF round-one compatibility proof

Review: [4333008357](https://github.com/beep-effect/beep-effect/pull/1930#discussion_r4333008357).
The issue is valid: the first remediation threw on the 129th raw `/ObjStm` or
`/XRef` occurrence, including irrelevant bytes in ordinary valid streams.

## Final behavior and resource argument

The implementation retains the original hard work limits: collect at most 128
candidate offsets shared across both marker families; each header lookup decodes
at most 64 KiB, at most 8 MiB total; candidate deduplication/parsing runs at most
128 times. Marker discovery uses two forward buffer searches and constant-size
marker strings, with no unbounded marker-offset allocation. Header object and
generation numbers have bounded digit widths (10 and 5), preventing failed regex
matches from retrying every suffix of long digit runs. A candidate parse still
uses the existing pdf-lib parser and unchanged Flate/inflate accounting; this
receipt does not claim to replace or globally bound PDFDocument.load itself.

Discovery overflow now returns ordinary structural facts and the additive
`containerDiscovery: "limit-reached"` field. It never repurposes the inflation
status: `streamCheck: "complete"` means all discovered Flate streams were
checked, while complete global stream inspection requires BOTH fields complete.
Encrypted files explicitly return `containerDiscovery: "encrypted"` and the
existing encrypted inflation status. Existing constructors and old serialized
structure payloads default the additive field to `complete`; prior versions
never successfully emitted a partially discovered structure, so this default
preserves their prior completeness claim.

No parser subclass, cursor adapter, deep import, cast, monkeypatch, warning
exception, or relaxed bound remains. An explored forward-parser approach was
removed because pdf-lib rewinds after numeric lookahead and failed declared
stream-length seeks; its final offset does not establish an aggregate work
bound. The bounded status fallback is the reviewer's explicitly accepted option.
The temporary deep ByteStream import caused introduced local audit row
`local-shard-f5d713e18911` (TS2339); that code has been removed and the complete
package verifier now passes. Parent owns acknowledgment through the actual fix
commit/review thread.

## Proof on final source

- Valid loaded PDF with 129 repetitions of mixed irrelevant markers: inspection
  succeeds, page facts retained, discovery is explicitly partial, inflation
  status remains independent.
- Hostile 16000 fake headers/markers for each marker family: inspection returns
  partial discovery without exhausting unbounded offset/window storage.
- Failed header containing 200000 digits and 200000 whitespace characters:
  inspection completes under the fixed window/candidate bounds.
- Exact shared 128/129 boundary reports complete/partial discovery respectively.
- Existing intact and checksum-truncated object-stream/XRef-stream checks remain
  passing; existing inflate-limit and descendant-font bounds remain intact.
- Schema constructor and Effect decode accept the previous payload shape and
  default the new discovery field.
- Final Node/V8 run: 2 test files, 41 tests passed in 6.41s.
- Canonical `bun run beep quality package-verify @beep/pdf-tools`: exit 0;
  audit 16.8s and docgen 4.0s passed.
- Canonical package `package-test-typecheck`: exit 0.
- Root `lint:oxlint` over all three touched PDF source/test files: exit 0.
- Scoped `git diff --check`: passed.

Node/V8 package coverage: statements 95.08%, branches 81.09%, functions 89.74%,
lines 95.40%. Changed `structure.ts`: statements 96.68%, branches 87.01%,
functions 96.92%, lines 96.49%. No coverage configuration or floor was changed.
Coverage JSON is retained under `~/.cache/beep/pdf-review-node-coverage/`;
ignored final command logs are `raw/pdf-review-{package-verify,test-checker,
node-coverage,oxlint,format}.log` in this packet.

Within pdf-tools no production consumer separately interprets `streamCheck`.
A source search found Drawings/technical-drawing consumers outside this package
that discarded new discovery status; parent assigned their propagation to the
Cloud proof owner. That downstream handoff is a separate required integration
proof, not silently treated as complete here.

Reversal: revert the schema/structure/test review repair as one wave; the prior
128-candidate exception returns and the CPU bound remains. No new dependency,
runtime service, or persistent storage requires rollback. Publication and hosted
proof remain parent-owned.
