# deterministic-legal-regex-prior-art

> Scope: survey OSS deterministic legal doc-structure/entity extractors (LexNLP, Blackstone, eyecite, courts-db, reporters-db) for the patterns this packet needs — defined terms, Section/Article/Exhibit cross-refs, corporate-suffix parties+roles, amendment recitals, statute/case/court catalogs — and decide reuse-vs-reimplement per pattern under char-offset/provenance, the "a miss is an absent row, never a wrong fact" guarantee, versioned re-extraction, and licensing constraints, coordinating with `@beep/nlp` PatternParsers.

## Findings

### Library inventory, license, jurisdiction, maintenance (the reuse gate)

- **LexNLP (LexPredict/ContraxSuite)** — Python NLP/IE library for unstructured legal text; segments documents, identifies titles/section headings, and extracts 18+ structured fact types plus named entities. Dual-licensed: **AGPLv3 by default** + commercial. Latest release **2.3.0 (2022-11-30)**, Python 3.8, ~789 stars; no releases since late 2022 → **reduced/dormant maintenance**. Source copyright "2015-2021, ContraxSuite, LLC." (https://github.com/LexPredict/lexpredict-lexnlp, https://lexpredict-lexnlp.readthedocs.io/en/latest/about.html, https://arxiv.org/abs/1806.03688) — AGPL is a copyleft trap for a service: **cannot vendor**, must clean-room reimplement the patterns.
- **Blackstone (ICLR&D)** — a **spaCy pipeline + statistical model** (not pure regex) for long-form legal text; NER labels CASENAME, CITATION, INSTRUMENT, PROVISION, COURT, JUDGE; textcat tags axioms/issues/conclusions. **Apache-2.0**. Trained on **England & Wales** case law; "experimental research project," v0.0.1. **Last commit 2021-01-31 → unmaintained ~5 years.** (https://github.com/ICLRandD/Blackstone, https://github.com/ICLRandD/Blackstone/commits/master, https://research.iclr.co.uk/blackstone) — wrong jurisdiction (UK), ML-model (non-deterministic), and abandoned → **reference only, do not port.**
- **eyecite (Free Law Project)** — high-performance legal **citation** extractor; tested against 50M+ citations; powers CourtListener + Caselaw Access Project. **BSD-2-Clause**, **actively maintained** (~716 commits, recent CI), latest PyPI line 2.6.x. Uses tuned regular expressions (Hyperscan tokenizer option) over a citation database. (https://github.com/freelawproject/eyecite, https://free.law/projects/eyecite/) — permissive license + active = **strongest reuse candidate.**
- **eyecite-js (beshkenadze)** — **TypeScript/JavaScript port of eyecite**, **BSD-2-Clause**, claims **full parity with Python eyecite v2.7.6** (354 passing tests, "Production Ready"); latest **v2.7.6-alpha.28 (2025-08-21)**; citation objects expose `span()` and `fullSpan()` → `[start,end]` offsets; published to npm as `@beshkenadze/eyecite`. (https://github.com/beshkenadze/eyecite-js) — a permissive TS port already exists; alpha-tagged but full-parity → **adapt rather than re-port from Python.**
- **courts-db (Free Law Project)** — unified catalog of court names→identifiers: **700+ court IDs**, **2,100+ hand-crafted regexes**, tested vs 16M court strings; shipped as **JSON** (Python-native, language-portable). **BSD-2-Clause**. (https://github.com/freelawproject/courts-db, https://free.law/2020/03/10/courts-db-a-new-open-database/) — **reuse the JSON data directly** (no port needed).
- **reporters-db (Free Law Project)** — reporter catalog (v3.2.x: **1,167 reporters + 2,102 name variations**) with abbreviations and date ranges; **JSON**; **BSD-2-Clause**; eyecite's core dependency. (https://github.com/freelawproject/reporters-db, https://free.law/projects/reporters-db/) — **reuse the JSON data directly.**
- **doc-haus** (the CAPTURE gold-nugget source, `services/ingest/src/structure.ts`) is **not a discoverable public OSS repo** — no GitHub match for `doc-haus`/`structure.ts ingest`. Treat its `VERSION`/regex snippets in CAPTURE.md as the design seed, not a vendorable dependency. (search: https://github.com/search — no result) Comparable public contract extractors that DO surface ("ingest any contract → JSON parties/clauses/dates/governing-law with a confidence and **source on every field**", and **OpenContracts**, MIT, citation-graph DMS) confirm the "source/provenance on every field" pattern is an industry norm. (https://github.com/Open-Source-Legal/OpenContracts)

### Per-pattern coverage map (what each library actually gives us)

- **Defined terms** (`"X" means …` / quote-delimited capitalized terms) — **LexNLP only.** `get_definitions(return_coords=True)` yields `(name, text, (start, end))`; `get_definition_annotations()` yields `DefinitionAnnotation` objects with `coords/text/name`; default locator is `AnnotationLocatorType.RegexpBased` (deterministic) with an optional ML detector. (https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/definitions.py) — LexNLP is AGPL → **clean-room reimplement** the regex (doc-haus `TERM = ["…"]([A-Z][^"…]{0,60}?)["…"]` is the seed). eyecite/Blackstone/courts-db do **not** cover defined terms.
- **Section/Article/Exhibit cross-refs** — partial coverage: **LexNLP** segments sections/headings; **Blackstone** has a PROVISION entity ("section 1") but UK-shaped, ML, abandoned. No permissively-licensed deterministic contract cross-reference extractor found. → **reimplement** the multi-keyword regex (doc-haus `REF_RE = /\b(Section|Article|Clause|Exhibit|Schedule|Annex|Appendix)s?\s+…/g`). (https://lexpredict-lexnlp.readthedocs.io/en/latest/about.html, https://github.com/ICLRandD/Blackstone)
- **Corporate-suffix parties + roles** — **LexNLP** `lexnlp.extract.en.entities` extracts companies/organizations (corporate-form aware, e.g. LLC/Inc/Corp) with `get_companies`. AGPL → **clean-room reimplement.** eyecite/courts-db don't do parties. (https://lexpredict-lexnlp.readthedocs.io/en/latest/api/lexnlp.extract.en.html, https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/entities/nltk_maxent.py)
- **Amendment recitals** ("This Amendment No. 2 … amends the Agreement dated …") — **no OSS coverage found** in any surveyed library. → **NET-NEW** deterministic regex (repo-owned).
- **Statute / case / court catalogs** — fully covered by permissive FLP stack: **eyecite** (statutory + full/short/reference/supra/id case citations), **courts-db** (court→ID), **reporters-db** (reporter abbreviations). All **BSD-2-Clause**. (https://github.com/freelawproject/eyecite, https://github.com/freelawproject/courts-db, https://github.com/freelawproject/reporters-db) — **reuse.**

### Char-offset / provenance support (the provenance wall)

- **eyecite / eyecite-js**: every citation carries its source location via `span()` (and `fullSpan()` in the JS port) returning `[start,end]`; FLP warns the SAME cleaned text must be used for extraction and annotation or offsets drift. (https://github.com/freelawproject/eyecite, https://github.com/beshkenadze/eyecite-js)
- **LexNLP**: annotation objects carry a `coords`/`(start,end)` field across extractors (definitions confirmed; citations/entities use the same Annotation pattern). (https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/definitions.py)
- **Blackstone**: emits spaCy token `(start, end)` positions, but as token indices over a spaCy `Doc`, not raw-char spans on the original string. (https://github.com/ICLRandD/Blackstone)
- **courts-db / reporters-db**: pure catalogs; offsets come from applying their regexes — provenance is the caller's `match.index`. (https://github.com/freelawproject/courts-db)
- Verdict: char-offset/provenance is a solved, well-understood property in the permissive stack; LexNLP proves the same is achievable with deterministic regex. This maps cleanly onto `@beep/provenance` TextAnchor/EvidenceSpan targets (CAPTURE coordination note).

### "A miss is an absent row, never a wrong fact" guarantee

- This is **doc-haus's design invariant** (CAPTURE.md, `structure.ts`), not a documented feature term in any surveyed OSS library; it is a high-precision-over-recall, no-inference posture to **enforce in the reimplementation**, not import. (explorations/.../CAPTURE.md doc-haus#3)
- eyecite is empirical evidence the posture is reachable deterministically: it reports recognizing ~99.99% of citations via tuned regex (no model in the matching loop), so false-positive risk is dominated by pattern precision, not inference. (https://free.law/projects/eyecite/) — exact percentage is single-sourced; see Open/Unverified.
- LexNLP's default `RegexpBased` locator (vs. its optional ML detector) is the corroborating pattern: keep the deterministic regex path as the authority surface and quarantine any ML detector as candidate-only. (https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/definitions.py)

### Versioned re-extraction migrations

- No surveyed library exposes a "re-extraction migration" mechanism. The analog in the permissive stack is **semantic-versioned catalog/data releases** (eyecite 2.6.x, reporters-db 3.2.x, courts-db tagged JSON) that consumers pin and re-run against on bump. (https://github.com/freelawproject/reporters-db/releases)
- doc-haus's `export const VERSION = "2"` extractor-version constant + re-extraction migration is therefore **NET-NEW orchestration** the repo must own (stamp each emitted row with extractor version; re-extract + diff on bump). Pin reused FLP catalogs by version so the row's `extractorVersion` composes with the catalog version for reproducibility.

### Port path: Python/BAML → Effect/TS

- **eyecite (Python/BSD)** → a maintained **TS port already exists** (eyecite-js, BSD, full parity v2.7.6); options: (a) wrap/depend on `@beshkenadze/eyecite`, (b) re-port its TS into an Effect driver emitting Schema-validated spans. Avoid re-porting from Python. (https://github.com/beshkenadze/eyecite-js)
- **LexNLP (Python/AGPL)** → **clean-room reimplement** the regex families (definitions, sections, company suffixes) as `effect/Schema` decoders emitting char-offset rows; never copy AGPL source.
- **Blackstone (Python/spaCy ML)** → not portable as deterministic regex (it's a trained model); UK jurisdiction; abandoned → **drop.**
- **courts-db / reporters-db (BSD JSON)** → import the JSON directly; decode through `effect/Schema` into a `@beep/*` catalog. No code port needed.
- mike (AGPL) + harvest-mcp (license unknown) from CAPTURE → reimplement clean-room (unchanged).

### Coordination with `@beep/nlp` PatternParsers (avoid duplication)

- `@beep/nlp` `Core/Pattern` + `Core/PatternParsers` is **wink-NLP token-bracket pattern infra**: it parses bracket strings like `[ADJ|NOUN]` (POS), `[DATE|TIME]` (entity), `[Apple|Google]` (literal) into `PatternElement` schemas that match over **tokenized `Document`s**, not char-offset regex over raw document text. (packages/foundation/capability/nlp/src/Core/PatternParsers.ts, .../Core/Pattern.ts)
- Therefore the deterministic doc-structure extractor is a **different layer** (raw-text `RegExp.matchAll` → `[start,end]` spans), not a fit for wink's token-pattern API. Recommendation: build it as a sibling module that **reuses `@beep/nlp` conventions** (`$NlpId` identity composer, Schema-first `PatternElement`-style models, the `VERSION` discipline) and can optionally **feed** wink's `EntityPatternElement` layer downstream — but do **not** route raw-text regex through wink to avoid both duplication and an impedance mismatch. This matches CAPTURE's coordination note that `@beep/nlp` PatternParsers are "wink-NLP tooling, not a versioned char-offset contract-structure extractor."

### Reuse-vs-reimplement decision table

- Case/statute **citation** extraction → **REUSE** eyecite-js (BSD, TS, full-parity, span offsets); wrap as an Effect driver.
- **Court** catalog → **REUSE** courts-db JSON (BSD) directly.
- **Reporter** catalog → **REUSE** reporters-db JSON (BSD) directly.
- **Defined-term** extraction → **REIMPLEMENT** (LexNLP is AGPL; doc-haus `TERM` regex seed).
- **Section/Article/Exhibit cross-refs** → **REIMPLEMENT** (no permissive deterministic OSS; doc-haus `REF_RE` seed).
- **Corporate-suffix parties+roles** → **REIMPLEMENT** (LexNLP entities is AGPL).
- **Amendment recitals** → **NET-NEW** (no OSS coverage).
- **Versioned re-extraction migration** → **NET-NEW** (repo orchestration; pin FLP catalog versions).

## Sources

- LexNLP repo / license / version — https://github.com/LexPredict/lexpredict-lexnlp
- LexNLP about (capabilities, dual AGPL/commercial) — https://lexpredict-lexnlp.readthedocs.io/en/latest/about.html
- LexNLP paper (segmentation, 18+ fact types) — https://arxiv.org/abs/1806.03688
- LexNLP extract module list — https://lexpredict-lexnlp.readthedocs.io/en/latest/api/lexnlp.extract.en.html
- LexNLP definitions.py (coords/RegexpBased, license header) — https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/definitions.py
- LexNLP entities (companies) — https://github.com/LexPredict/lexpredict-lexnlp/blob/master/lexnlp/extract/en/entities/nltk_maxent.py
- Blackstone repo (Apache-2.0, NER labels, spaCy, UK) — https://github.com/ICLRandD/Blackstone
- Blackstone commit history (last commit 2021-01-31) — https://github.com/ICLRandD/Blackstone/commits/master
- Blackstone research page — https://research.iclr.co.uk/blackstone
- eyecite repo (BSD-2, span(), reporters-db dep) — https://github.com/freelawproject/eyecite
- eyecite project page (50M+ citations, reporters-db) — https://free.law/projects/eyecite/
- eyecite JOSS paper (authors, 2021-10-08, CC-BY) — https://joss.theoj.org/papers/10.21105/joss.03617
- eyecite-js TS port (BSD-2, parity v2.7.6, span/fullSpan, v2.7.6-alpha.28 2025-08-21) — https://github.com/beshkenadze/eyecite-js
- courts-db repo (BSD-2, 700+ IDs, 2,100+ regex, JSON) — https://github.com/freelawproject/courts-db
- courts-db announcement — https://free.law/2020/03/10/courts-db-a-new-open-database/
- reporters-db repo (BSD-2, JSON) — https://github.com/freelawproject/reporters-db
- reporters-db project page (1,167 reporters + 2,102 variations) — https://free.law/projects/reporters-db/
- reporters-db releases (semver catalog) — https://github.com/freelawproject/reporters-db/releases
- OpenContracts (MIT, citation-graph DMS, "source on every field" comparable) — https://github.com/Open-Source-Legal/OpenContracts
- In-repo: `@beep/nlp` PatternParsers/Pattern (wink token-bracket infra) — packages/foundation/capability/nlp/src/Core/PatternParsers.ts

## Open / Unverified

- **eyecite recognition rate "99.9977%"** appeared in a search snippet attributed to eyecite materials but I could not confirm the exact figure from a fetchable primary source (JOSS PDF was binary; project page only states "tested against 50M+ citations"). Treat the precise percentage as UNVERIFIED; the 50M+ test corpus and active maintenance are corroborated. (https://free.law/projects/eyecite/)
- **eyecite-js maturity** is **self-reported by the repo** (single primary source); npm page (`@beshkenadze/eyecite`) returned 403 to the fetcher, so I could not independently confirm download counts / publish cadence. "Production Ready" + alpha version tag is internally inconsistent — pin a specific version and run the bundled 354-test suite before depending on it.
- **LexNLP citations/entities char-offset coords** confirmed for definitions from source; the other extractors are asserted to share the same Annotation `coords` pattern but I verified only `definitions.py` directly. Spot-check `citations.py`/`entities` Annotation shape before relying on uniform offset support.
- **doc-haus** is treated as a private/non-public source repo (no OSS match found); its exact regexes/`VERSION` semantics are known only from CAPTURE.md snippets, not an inspectable repo.
- Whether **courts-db/reporters-db JSON** can be imported as-is into the repo's licensing posture (BSD-2 attribution requirement) vs. needing a vendored attribution NOTICE is a compliance detail to confirm with repo legal/licensing convention.
