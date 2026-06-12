# Decision Log

## 2026-06-11 — Packet creation (grill-with-docs session)

1. **One packet, not three.** This packet owns the data-engineering lane
   (salvage → consolidate → dedupe → restore → extract → organize → enrich).
   Ontology-research grounding went to `goals/ip-law-knowledge-graph` as a
   research amendment. Folding into `agentic-professional-runtime` was
   rejected (product-definition packet, not a data operation).
2. **Corpus home + salvage-first.** Canonical root
   `/home/elpresidank/data-home/oppold-corpus/` with immutable SHA-256
   verified `raw/`, plus `staging/`, `organized/`, `catalog/` tiers. P0 is
   USB salvage — the 26-PST motherlode has no second copy. Catalog-in-place
   (no consolidation) was rejected while the largest source sits on
   removable media. Real data stays outside the repo per the runtime SPEC.
3. **Code home: harden, don't fork.** `drivers/libpff` and `drivers/tika`
   scaffolds get real extraction; catalog rides `drivers/duckdb`; operator
   surface is a new `beep corpus` CLI family on the Files-command pattern;
   `@beep/file-processing` contracts reused as-is. Scratchpad-scripts-first
   and a dedicated app were both rejected (extraction logic would be written
   twice / app topology overkill for an operator workflow).
4. **Boundary: ends at enriched corpus.** Terminal outputs are the organized
   corpus + DuckDB catalog + manifests. New `drivers/uspto` is in-packet
   (multi-version draft grouping needs official patent identity to anchor
   versions). Epistemic ingestion and KG construction stay downstream. An
   epistemic-handoff stretch phase was considered and rejected to avoid
   coupling to the runtime's still-pending P4 fixture loop.
5. **FalkorDB tension flagged, not resolved.** `ip-law-knowledge-graph`
   locks FalkorDB storage while runtime doctrine says graph views are
   projections of epistemic truth. The amendment records the contradiction
   as an open question for that packet's own P0; rewriting another packet's
   locked decision from outside was rejected.

## 2026-06-11 — P0/P1 execution

1. **Salvage via fail-fast shell runner, formal CLI later.** P0 used
   `oppold-corpus/ops/{run-salvage,salvage}.sh` (hash origin → copy → hash
   copy → compare, per-file JSONL provenance) so the at-risk USB copy did not
   wait on repo code. The `beep corpus` CLI formalizes the operator surface
   from P1 onward; a `salvage` subcommand can re-verify rather than re-copy.
2. **`sha256sum` escape-marker correction.** 15 files with literal `\x3b`/
   `\x26` in their names produced `\`-prefixed digest fields in the
   provenance manifest. Digests re-verified against both copy and origin via
   Node crypto, manifest corrected in place (pre-fix manifest archived under
   `logs/`), salvage script patched. Treated as a manifest-encoding fix, not
   a salvage failure — no hash mismatched.
3. **`LH_Inbox_2011.pst` reclassified.** Expected exact duplicate (#1 vs #2
   in the scan inventory) is actually two distinct snapshots (2.43 GB USB vs
   1.14 GB Documents, different digests). Both stay; message-level diff
   deferred to P2 extraction.
4. **Recycle-bin restoration scope settled.** Only 252 `$I` / 283 `$R` files
   exist (tree root of `Oppold_IP_Law`), not ~8k as the packet README
   implied; the bulk of the 8,294 files already carry real names
   (`Agreements/`, `Responses/`, `Sent_Emails.export/`, …). Restoration
   manifest covers every `$I`; the 32 metadata-less `$R` files keep unknown
   names and route to `_unsorted` in P3.
