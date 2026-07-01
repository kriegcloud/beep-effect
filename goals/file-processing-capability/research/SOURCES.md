# File Processing Capability - Sources & Provenance

Provenance ledger for the gold nuggets folded into this goal's deferred OCR /
PDF-diagnostics phase. It derives from the Gold-Intake cluster *"Layout-aware PDF
extraction + OCR-need gating"* and lets an implementing agent trace each pattern
back to its mined nugget, upstream repo + license, external citation, and the
in-repo capability it composes with.

- **Cluster:** Layout-aware PDF extraction + OCR-need gating (13 nuggets, route
  `extend-goal`, wave P2; histogram P1×4 / P2×6 / P3×3).
- **Gold-intake provenance:**
  [`explorations/_gold-intake/ROUTING.md`](../../../explorations/_gold-intake/ROUTING.md),
  [`explorations/_gold-intake/routing.json`](../../../explorations/_gold-intake/routing.json),
  [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md),
  catalog detail in
  [`explorations/_gold-intake/research/gold-catalog.json`](../../../explorations/_gold-intake/research/gold-catalog.json).
- **Folded research note (the consumer of this ledger):**
  [`research/gold-intake-ocr-pdf-diagnostics.md`](./gold-intake-ocr-pdf-diagnostics.md).
- **Codex review:** none present under this packet.

This is **non-invasive research input only.** It does not reopen `SPEC.md`,
`PLAN.md`, or the active P2 (Tika) / P3 (libpff) phases; the goal owner folds
these into the SPEC-deferred OCR strategy + future driver boundary when that
phase is scheduled.

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `doctor#2` | Heuristic deciding when a PDF page needs OCR | doctor | `doctor/lib/text_extraction.py:132-145` | data-ingestion | P1 | **port** (clean-room) |
| `doctor#1` | Layout-aware PDF text extraction w/ margin crop + skew filtering | doctor | `doctor/lib/text_extraction.py:32-69` | data-ingestion | P1 | **port** (clean-room) |
| `legalmind-ai#2` | Client-side PDF text extraction + quality/garbage assessment | legalmind-ai | `src/services/pdfService.ts:123-151` | data-ingestion | P1 | **port** (adapt thresholds) |
| `lawyergpt#1` | PDF/DOCX/image ingestion w/ OCR fallback + panic-isolated parsing | lawyergpt | `api/pkg/main.go:61-168` | data-ingestion | P1 | **port** (pattern; license unverified) |
| `doctor#11` | Two-pass PDF extraction: pdftotext first, OCR only if longer/needed | doctor | `doctor/tasks.py:197-218` | provenance-evidence | P2 | **adopt** (clean-room) |
| `doctor#6` | Robust MIME/extension detection: Magika + magic-byte fallbacks | doctor | `doctor/views.py:343-371` | data-ingestion | P2 | **port** (extend, not fork) |
| `doctor#7` | PDF metadata stripping for content-addressable hashing | doctor | `doctor/lib/utils.py:265-278` | provenance-evidence | P2 | **port** (compose w/ digest) |
| `doctor#9` | Mojibake repair table for corrupt court PDFs (pdfFactory / ca9) | doctor | `doctor/lib/mojibake.py:4-33` | data-ingestion | P2 | **reference** (data table; re-derive) |
| `doctor#10` | Encoding-cascade extraction for legacy TXT/HTML court files | doctor | `doctor/tasks.py:353-363` | data-ingestion | P2 | **port** (clean-room) |
| `harvest-mcp#7` | Input-quality gating w/ graded verdict + issues/recommendations | harvest-mcp | `src/core/HARParser.ts:174-227` | governance-ops | P2 | **port** (pattern; license unknown) |
| `doctor#12` | Upload-lifecycle observability decorator (request_id + logfmt + size) | doctor | `doctor/lib/utils.py:417-444` | governance-ops | P3 | **already-covered** (Effect log spans) |
| `doctor#3` | OCR confidence-based artifact suppression | doctor | `doctor/lib/text_extraction.py:285-320` | provenance-evidence | P3 | **reference** (data table; re-derive) |
| `judge-pics#1` | Per-image provenance record schema (source/hash/license) | judge-pics | `judge_pics/data/people.json:2-10` | provenance-evidence | P3 | **adopt** (convention) |

Per the routing record, `doctor#7` and `doctor#12` are **already-covered**
(small deltas only); the other 11 are **net-new** for the deferred OCR phase.

**How these inform this packet**

- **OCR-need gating (decide *whether* to OCR; pure, runtime-neutral → `Strategy`).**
  `doctor#2` is the cheap structural gate — take its trigger set verbatim as a
  contract: a page needs OCR when text is empty, contains `(cid:` broken-font
  maps, has FreeText/Widget annotations, embedded images, or `len(page.curves)
  > 10`. `legalmind-ai#2` generalizes the decision with a *content* scorer
  (word count, real-letter ratio, repeated-char gibberish regex); take the
  shape, **leave** the CJK-tuned `0.5` ratio and Chinese issue strings — beep's
  corpus is English legal text. `harvest-mcp#7` is the graded verdict wrapper:
  take its `excellent/good/poor/empty` ladder and the "return a typed error
  bundling issues + recommendations rather than proceeding" contract; leave the
  HAR-specific statistics.
- **Layout + OCR execution (shells out → future OCR/diagnostics driver).**
  `doctor#1` carries the load-bearing extraction contract — crop top/bottom
  margins on portrait pages and `filter(is_skewed)` to strip circular stamps and
  perpendicular court text so character offsets stay stable for provenance spans
  (`extract_text(layout=True, keep_blank_chars=True, y_tolerance=5,
  y_density=25)`). `lawyergpt#1` gives the panic-isolation + rasterize→PNG→OCR
  fallback shape (maps onto Effect typed-error boundaries). `doctor#11` is the
  exact two-pass orchestration to adopt: text layer first, OCR only when the
  gate fires, keep whichever output is longer, and carry the `extracted_by_ocr`
  lineage boolean.
- **Repair passes (`Extraction` text-decode + `Artifact` intake).** `doctor#10`
  is a tiny ordered decode cascade (`utf-8 → ISO8859 → cp1252 → latin-1`) — port
  as-is. `doctor#6` MIME repair must **extend** `classifyFormatFromExtension` +
  `@beep/schema` `MimeType` (magic-byte correction for `\xffWPC`, ASF/WMA,
  `%PDF-`, FLAC/AAC/OGG/RealMedia). `doctor#9` mojibake `letter_map` and
  `doctor#3` confidence constants are **empirical data tables tuned to specific
  producers** — reference and re-derive, do not lift verbatim.
- **Provenance / hashing (compose, don't fork).** `doctor#7`'s blank
  `/CreationDate` + `/ModDate` before hashing is a normalization **delta** that
  must compose with the existing `ContentDigest`, never a parallel hashing path.
  `judge-pics#1` is the minimal source-artifact record convention (source URL /
  sha256 / license / artist / date) for `@beep/provenance`. `doctor#3` +
  `harvest-mcp#7` + `legalmind-ai#2` all sit on the retrieval/logic wall:
  low-confidence OCR or low-quality input must surface as a typed error /
  non-authoritative evidence, never a silent candidate claim.
- **Already satisfied.** `doctor#12`'s upload-lifecycle decorator is covered by
  Effect-native `Effect.withLogSpan` / `annotateLogs` / spans — carried for
  completeness only.

This cluster is **not split**; all 13 nuggets route to this packet. The
`@beep/langextract` epistemic claim/evidence gate is a downstream *consumer* of
the quality wall (see §5), not a sibling owner of these nuggets.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| doctor (Free Law Project) | T1 | BSD-2-Clause | **port with attribution** (clean-room the data tables) | OCR-need gate, layout-aware extraction, two-pass orchestration, MIME/encoding/mojibake repair, deterministic-hash PDF metadata strip, confidence suppression |
| harvest-mcp | T2 | unknown (no LICENSE file) | **pattern reference only** — verify license before lifting code | Graded input-quality verdict + typed-error-with-recommendations gate |
| judge-pics (Free Law Project) | T3 | BSD-2-Clause | **port with attribution** | Minimal source-artifact provenance record (URL/hash/license) |
| lawyergpt | T2 | unknown | **pattern reference only** — verify license before lifting code | Panic-isolated per-file parsing + rasterize→OCR fallback shape |
| legalmind-ai | T3 | MIT | **port with attribution** (adapt CJK thresholds) | PDF text-quality / garbage assessment heuristic |

> **Cautions (echoed from the bundle):**
> - **Non-invasive:** do not reopen this goal's `SPEC.md`; the owner integrates
>   these into the deferred OCR strategy / driver boundary later. P2 Tika and P3
>   libpff are the active pending phases and must not be disturbed.
> - **External runtimes belong behind a NEW future OCR strategy + driver**
>   (privilege-safe local execution like the existing Tika JVM driver): Tesseract,
>   pdfplumber/pdftotext/Poppler, Magika, pdfjs — **not** in V1 and **not** inside
>   `@beep/file-processing` core. Only the pure decision heuristics (gates,
>   scorers) belong in the capability.
> - **License hygiene:** port as clean-room Effect/TS heuristics, not copied
>   source. `doctor` is BSD-2-Clause (verify); `legalmind-ai` is MIT; `harvest-mcp`
>   and `lawyergpt` licenses are **UNVERIFIED**. The `doctor#9` mojibake
>   `letter_map` and `doctor#3` confidence constants are data tables — re-derive
>   and attribute rather than lifting verbatim.
> - **Corpus mismatch:** `legalmind-ai#2` (and `doctor`) ship CJK-tuned gibberish
>   heuristics and Chinese issue strings; adapt the real-letter-ratio threshold
>   and messages for English legal text before use.
> - **Compose, don't fork:** `doctor#7` hash normalization must compose with the
>   existing `ContentDigest` (no parallel hashing path); `doctor#6` MIME repair
>   must extend `classifyFormatFromExtension` + `@beep/schema` `MimeType`.
> - **Retrieval/logic wall:** `doctor#3` + `harvest-mcp#7` + `legalmind-ai#2` —
>   low-confidence OCR or low-quality input must surface as a typed error /
>   non-authoritative evidence, never silently become a candidate claim; keep
>   aligned with the epistemic claim/evidence gate.

## 3. External research sources

Citations that actually appear on disk in this packet's
[`research/gold-intake-ocr-pdf-diagnostics.md`](./gold-intake-ocr-pdf-diagnostics.md)
("External sources", L210-217) and
[`research/engine-selection.md`](./engine-selection.md). No URL is invented here.

From the gold-intake note:

1. pdfplumber (`jsvine/pdfplumber`) — MIT — <https://github.com/jsvine/pdfplumber>
   (upstream layout engine behind `doctor#1`).
2. Google Magika — Apache-2.0 — <https://github.com/google/magika>; Tesseract OCR
   — Apache-2.0 — <https://github.com/tesseract-ocr/tesseract> (driver-level
   runtimes for `doctor#6` / OCR).
3. Free Law Project `doctor` — BSD-2-Clause —
   <https://github.com/freelawproject/doctor> (the T1 upstream).

From the engine-selection note (the deferred-driver landscape these nuggets feed):

4. Apache Tika 3.x formats — <https://tika.apache.org/3.3.1/formats.html>.
5. libpff — <https://github.com/libyal/libpff>.
6. Poppler utils (`pdfinfo` / `pdftotext` / `pdfimages`) — manpages at
   <https://manpages.debian.org/bookworm/poppler-utils/pdftotext.1.en.html>
   (the reserved `@beep/poppler` PDF-diagnostics seam).
7. Docling supported formats —
   <https://docling-project.github.io/docling/usage/supported_formats/> (first
   later OCR/layout candidate).
8. Marker — <https://github.com/datalab-to/marker> (opt-in only; GPL + commercial
   restrictions per the note's licensing caution).

## 4. In-repo capability references

The `@beep/*` bricks this packet composes (from bundle `secondaryTargets` +
`alreadyCovered` and the packet's own inventory).

| Capability | Package path | Disposition |
| --- | --- | --- |
| `@beep/file-processing` (Artifact / Operation / Extraction / Strategy / Service) | `packages/foundation/capability/file-processing` | **reuse + extend** — `Strategy` hosts the pure gates/scorers; `Artifact` intake hosts MIME repair + hash normalization; `Extraction` IR hosts the encoding cascade, mojibake pass, and `extracted_by_ocr` flag |
| `@beep/tika` | `packages/drivers/tika` | **reuse** — text-layer extraction; OCR is a sibling driver, two-pass orchestration wraps it |
| `@beep/libpff` | `packages/drivers/libpff` | **reuse** — PST export scaffold; unaffected, active P3 phase |
| `@beep/schema` (`MimeType` + `FileExtension`) | `packages/foundation/.../schema` | **extend** — target for `doctor#6` content-sniffing MIME repair |
| `@beep/provenance` (TextAnchor / EvidenceSpan) | `packages/foundation/modeling/provenance` | **extend** — home for the `extracted_by_ocr` lineage flag (`doctor#11`) and license-tagged source-artifact record (`judge-pics#1`) |
| `@beep/observability` | `packages/foundation/capability/observability` | **reuse** — Effect-native log spans already cover `doctor#12`'s upload-lifecycle decorator |
| `@beep/langextract` + epistemic claim/evidence gate | `goals/langextract-capability`, `packages/foundation/capability/langextract` | **downstream consumer** — `harvest-mcp#7` quality gate + `doctor#3` confidence suppression feed the pre-extraction quality wall |
| Future OCR / diagnostics driver (new `@beep/ocr` / `@beep/poppler` / Tesseract) | NET-NEW (reserved seam) | **NET-NEW** — home for Tesseract / pdfplumber engine wrappers per SPEC's deferred strategy |

## 5. Cross-links & provenance

- **Cluster id / route:** *"Layout-aware PDF extraction + OCR-need gating"* →
  `extend-goal` → `goals/file-processing-capability` (wave P2). Bundle `crossref`
  is empty (single-packet cluster).
- **Sibling / downstream:** `goals/langextract-capability` and the epistemic
  claim/evidence gate consume the quality wall (`harvest-mcp#7`, `doctor#3`,
  `legalmind-ai#2`); no nugget is shared-owned with a sibling packet.
- **This packet's own research:**
  [`research/gold-intake-ocr-pdf-diagnostics.md`](./gold-intake-ocr-pdf-diagnostics.md)
  (the integration mapping) and
  [`research/engine-selection.md`](./engine-selection.md) (the V1/later driver
  matrix). This packet carries no `DECISIONS.md`; the locked decisions
  (`ocr-deferred`, `driver-boundaries`) live in
  [`ops/manifest.json`](../ops/manifest.json) and [`SPEC.md`](../SPEC.md).
- **Gold-intake source:**
  [`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../../../explorations/_gold-intake/GOLD_SYNTHESIS.md)
  → "Gold catalog by theme" → "Legal / court / patent data ingestion"
  (*Layout-aware PDF extraction + OCR-need heuristic + quality gate* L196-207;
  *Robust MIME/extension detection* L209-218; *Encoding cascade + mojibake
  repair* L220-229) plus the "Provenance & evidence" entries; routing in
  [`explorations/_gold-intake/routing.json`](../../../explorations/_gold-intake/routing.json).
