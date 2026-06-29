# Gold-intake research note: OCR-gating and PDF/text diagnostics for the deferred OCR strategy (2026-06-29)

Non-invasive Case-A extend. This note feeds the OCR/PDF-diagnostics phase that
SPEC.md already **defers** ("OCR belongs to the operation model as a future
strategy and driver boundary, not as a V1 implementation requirement"). It does
not reopen SPEC.md, PLAN.md, GOAL.md, or any phase/scope. It exists so the goal
owner can fold these patterns into the deferred OCR strategy + future driver
boundary when that phase is picked up.

## Source

- **Gold nuggets (13):** `doctor#1`, `doctor#2`, `doctor#3`, `doctor#6`,
  `doctor#7`, `doctor#9`, `doctor#10`, `doctor#11`, `doctor#12` (Free Law
  Project `doctor`); `harvest-mcp#7` (`harvest-mcp`); `judge-pics#1`
  (`judge-pics`); `lawyergpt#1` (`lawyergpt`); `legalmind-ai#2`
  (`legalmind-ai`). Detail captured in
  `explorations/_gold-intake/research/gold-catalog.json`.
- **Synthesis:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` →
  "Gold catalog by theme" → "Legal / court / patent data ingestion" →
  *Layout-aware PDF extraction + OCR-need heuristic + quality gate* (L196-207),
  *Robust MIME/extension detection with magic-byte fallbacks* (L209-218),
  *Encoding cascade + mojibake repair for legacy court TXT/HTML/PDF* (L220-229);
  plus "Provenance & evidence" entries *Two-pass PDF extraction with OCR-origin
  provenance flag*, *PDF metadata stripping for content-addressable hashing*,
  *OCR confidence-based artifact suppression*, *Per-artifact provenance record
  (source/hash/license)*.
- **Routing cluster:** `explorations/_gold-intake/routing.json` → cluster
  *"Layout-aware PDF extraction + OCR-need gating"* (route: `extend-goal`,
  primaryTarget: `goals/file-processing-capability`, wave P2). The router
  classified `doctor#7` and `doctor#12` as **already-covered** (small deltas
  only) and the other 11 ids as **net-new** for the deferred OCR phase.

## What goals/file-processing-capability already covers

This is an extend, not a rebuild. The packet has shipped its P1 minimum vertical
proof (PR #262, merged 2026-06-18) and already owns the substrate these nuggets
plug into:

- **Capability substrate.** `@beep/file-processing`
  (`packages/foundation/capability/file-processing`) owns the schema-first
  `Artifact`, `Operation`, `Extraction`, `Strategy`, `Service`, and `test`
  surfaces (SPEC "Public Surface", L108-196).
- **Content-addressable identity.** `Artifact` already carries a source hash /
  digest concept (SPEC "Artifact", L125-139). Per the routing record, only the
  PDF `/CreationDate`+`/ModDate` strip-before-hash normalization (`doctor#7`) is
  a delta on top of the existing digest — it must compose with it, not fork it.
- **Format classification.** Extension→format classification plus the
  `MimeType` / `FileExtension` schemas live in `@beep/schema`, composed into
  `Strategy` (SPEC "Schema-First Operation Model", L102-106). `doctor#6` extends
  this with content sniffing; it does not replace it.
- **Text-layer extraction driver.** `@beep/tika` (`packages/drivers/tika`)
  already extracts text-layer PDF/DOCX/RTF/HTML/text (SPEC "V1 Formats",
  L210-225; "Driver Requirements → @beep/tika", L271-287).
- **Strategy already reserves the OCR flag.** `Strategy` already exposes
  "whether OCR-capable strategies are allowed" (SPEC L184), and the skip-reason
  taxonomy already includes `ocr-disabled` (SPEC L322-324; manifest
  `skipReasons`). The gold fills in *what runs when that flag flips on*.
- **Future OCR/diagnostics boundary is named and deferred.** Locked decision
  `ocr-deferred` (manifest `keyDecisions`) and the engine matrix already
  earmark a future `@beep/poppler` ("PDF diagnostics, bbox/text comparison,
  image extraction") and Docling ("structured extraction, OCR, layout-aware")
  driver. `Tesseract` is named in SPEC L51-52 as a later driver. These nuggets
  are the concrete recipe for that already-reserved seam.
- **Observability + provenance.** `doctor#12`'s upload-lifecycle decorator is
  already covered by Effect-native `Effect.withLogSpan` / `annotateLogs` /
  spans (routing `alreadyCovered`); `@beep/provenance` (TextAnchor /
  EvidenceSpan) is the home for the OCR lineage flag and license-tagged source
  record below.

## Net-new this contributes

Concrete capabilities/patterns absent from the codebase today, each tied to its
nugget id. External engines named here are *out-of-process runtimes that belong
behind a future driver*, not dependencies of the capability core (see Cautions).

- **`page_needs_ocr` gating heuristic (`doctor#2`, P1).** A cheap pre-OCR gate:
  flag a page for OCR only when the text layer is empty, contains `(cid:`
  broken-font maps, has FreeText/Widget annotations, embedded images, or
  curve-count > 10. Lets the cheap text path run first and reserves expensive
  OCR for pages that actually need it — load-bearing on a local-first desktop.
- **Layout-aware extraction for stable spans (`doctor#1`, P1).** Top/bottom
  margin crop on portrait pages + skew/transform-matrix filtering (`is_skewed`
  strips circular stamps and perpendicular court text) so extracted character
  offsets stay stable and meaningful for provenance spans. Upstream uses
  `pdfplumber` (MIT-licensed) [1].
- **Two-pass extraction orchestration + OCR lineage flag (`doctor#11`, P2).**
  Run the text layer first; fall back to OCR only when the gate fires; keep
  whichever output is longer; carry an `extracted_by_ocr` boolean lineage flag.
  That flag (human-rendered vs OCR-guessed) maps straight onto evidence
  provenance via `@beep/provenance`.
- **OCR confidence-based artifact suppression (`doctor#3`, P3).** Per-word
  Tesseract confidence + margin position → keep / blank-out / replace with box
  glyphs, so low-confidence OCR text never silently becomes authoritative.
  Aligns with the retrieval/logic wall: uncertain OCR must degrade to a typed
  warning or non-authoritative evidence, not a candidate claim.
- **Content-sniffing MIME repair (`doctor#6`, P2).** Magic-byte correction over
  extension/Magika misclassification (WordPerfect `\xffWPC`, ASF/WMA, `%PDF-`,
  FLAC/AAC/OGG/RealMedia, plus a libmagic fixup). Magika is Apache-2.0 [2]; this
  is the deterministic correction layer attorney/court corpora need when
  extensions lie. **Extends** `classifyFormatFromExtension` + `@beep/schema`
  `MimeType`, not a fork.
- **Mojibake repair table for broken court PDF producers (`doctor#9`, P2).** An
  empirically-built character substitution map that rescues garbled output from
  a specific pdfFactory / Ninth-Circuit producer, with the `'e'`-absent
  corruption detector as the trigger. A domain remediation artifact, not core
  logic.
- **Encoding cascade for legacy TXT/HTML court files (`doctor#10`, P2).**
  Ordered decode attempts (utf-8 → ISO8859 → cp1252 → latin-1) before failing,
  reflecting Windows-produced WPD/DOC-origin court text. A small decoding
  utility for the `Extraction` text-decode pass.
- **Graded input-quality gate with typed verdict (`harvest-mcp#7`, P2).** Score
  input completeness as excellent/good/poor/empty and, when insufficient, return
  a typed error that *bundles issues + recommendations* (e.g. "OCR quality low",
  "missing pages") rather than proceeding. A reusable pre-extraction quality
  wall.
- **PDF text-quality / garbage assessment (`legalmind-ai#2`, P1).** Word count,
  real-letter ratio, and a repeated-character gibberish regex to detect
  image-only scans and refuse low-quality input before it becomes a candidate
  claim. Upstream uses `pdfjs-dist` with a cMap config for CJK fonts; the
  heuristic generalizes the OCR-need decision beyond the `doctor#2` structural
  gate.
- **Panic-isolated per-file parsing + rasterize→OCR fallback (`lawyergpt#1`,
  P1).** Each parser wraps work so a malformed upload cannot crash the ingestion
  worker, with a PDF→PNG→Tesseract fallback when digital text yields nothing.
  The isolation maps onto Effect typed-error boundaries; the rasterize fallback
  is the OCR-driver behavior.
- **License-tagged source-artifact provenance record (`judge-pics#1`, P3).** A
  minimal asset-with-provenance shape — source URL / sha256 / license / artist /
  date — as a convention for ingested source artifacts, coordinating with the
  existing digest and `@beep/provenance` source record.

Already-covered members carried for completeness (deltas only, per routing):
`doctor#7` (PDF `/CreationDate`+`/ModDate` blanking — a normalization delta that
must compose with the existing `ContentDigest`) and `doctor#12` (upload
lifecycle logging — already satisfied by Effect-native log spans).

## Recommended integration (non-invasive)

For the goal owner to act on later — no SPEC rewrite implied. Suggested seams,
mapped to surfaces SPEC.md already defines:

1. **Land it in the already-deferred OCR strategy phase**, alongside P2 (Tika)
   and P3 (libpff) completion, not inside them. The locked `ocr-deferred`
   decision and the `Strategy` "OCR allowed" flag are the natural anchor; this
   note is the content for that flag's "on" path.
2. **`Strategy` surface** is the home for the decision logic that needs no
   external runtime: the `page_needs_ocr` structural gate (`doctor#2`), the
   text-quality scorer (`legalmind-ai#2`), and the graded input-quality verdict
   (`harvest-mcp#7`) — all pure, deterministic, and runtime-neutral, so they can
   live in the capability without violating the "no external engine in core"
   contract. They decide *whether* to OCR before any driver runs.
3. **A future OCR/diagnostics driver** (the already-reserved `@beep/poppler` /
   Tesseract / Docling seam in the engine matrix) owns everything that shells
   out to an out-of-process runtime: layout extraction (`doctor#1`), the
   rasterize→OCR fallback (`lawyergpt#1`), two-pass orchestration with the
   longer-wins rule (`doctor#11`), and confidence-based suppression (`doctor#3`)
   — mirroring how `@beep/tika` already isolates the JVM sidecar.
4. **`Artifact` intake** is where MIME repair (`doctor#6`) extends
   `classifyFormatFromExtension`, and where the deterministic-hash normalization
   (`doctor#7`) composes into the existing digest.
5. **`Extraction` IR** already records "engine name and version" and "skipped
   capabilities" — extend it with the `extracted_by_ocr` lineage flag
   (`doctor#11`) and route the encoding cascade (`doctor#10`) + mojibake repair
   (`doctor#9`) through its text-decode pass. Surface low-quality/low-confidence
   verdicts as `FileProcessingWarningRecord` / a typed `skipReason`
   (the taxonomy already has `ocr-disabled`; an `ocr-low-confidence` or
   `low-quality-source` reason would be additive), never as a silent success.
6. **Provenance** (`@beep/provenance`) is where the OCR lineage flag and the
   license-tagged source record (`judge-pics#1`) land, keeping the
   `langextract-capability` / epistemic claim-evidence gate fed with
   trustworthy spans.

## Cautions

- **Non-invasive only.** Do not reopen SPEC.md / PLAN.md / GOAL.md or disturb
  the active P2 (Tika) / P3 (libpff) phases. This is the deferred OCR phase's
  research input; the owner integrates it when that phase is scheduled.
- **Locked-decision alignment.** External runtimes (Tesseract, pdfplumber /
  pdftotext / Poppler, Magika, pdfjs) belong behind a **new future OCR/diagnostics
  driver** (privilege-safe local execution, like the existing Tika JVM sidecar),
  per the `ocr-deferred` and `driver-boundaries` locked decisions — NOT in V1
  and NOT inside `@beep/file-processing` core. Only the pure decision heuristics
  (gates, scorers) belong in the capability.
- **Licensing — reimplement, do not copy.** Free Law Project `doctor` is
  permissive **BSD-2-Clause** [3] and pdfplumber is **MIT** [1] — reusable, but
  port as clean-room Effect/TS heuristics with attribution, not lifted source.
  Tesseract and Magika are **Apache-2.0** [2] (driver-level dependencies, not
  vendored code). `legalmind-ai`, `lawyergpt`, and `harvest-mcp` upstream
  licenses are **UNVERIFIED** — verify before lifting anything beyond the idea.
- **Data tables are not logic — re-derive and attribute.** `doctor#9`'s mojibake
  `letter_map` and `doctor#3`'s confidence constants are empirical data tables
  tuned to specific producers; treat them as referenced domain artifacts, not
  copied code.
- **Corpus mismatch — retune thresholds.** `legalmind-ai#2` (and `doctor`) ship
  CJK-tuned gibberish heuristics and Chinese-language issue strings; beep's
  corpus is English legal text. Adapt the real-letter-ratio threshold and
  messages before use.
- **Retrieval/logic-wall alignment.** `doctor#3` + `harvest-mcp#7` +
  `legalmind-ai#2` all touch the same wall: low-confidence OCR or low-quality
  input must surface as a typed error / non-authoritative evidence, never
  silently become a candidate claim. Keep this consistent with the epistemic
  claim/evidence gate and `@beep/langextract` span grounding.
- **Compose, don't fork.** `doctor#7` hash normalization must compose with the
  existing `Artifact`/`ContentDigest`, and `doctor#6` MIME repair must extend
  `classifyFormatFromExtension` + `@beep/schema` `MimeType` — not introduce
  parallel hashing or typing paths.

---

### External sources

1. pdfplumber (jsvine/pdfplumber) — MIT license:
   <https://github.com/jsvine/pdfplumber>
2. Google Magika — Apache-2.0 license; Tesseract OCR — Apache-2.0 license:
   <https://github.com/google/magika>, <https://github.com/tesseract-ocr/tesseract>
3. Free Law Project `doctor` — BSD-2-Clause license:
   <https://github.com/freelawproject/doctor>
