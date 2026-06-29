# court-reporter-citation-crosswalk

Scope: the court->reporter Bluebook crosswalk (courts-db `citation_string`/`name_abbreviation`) + reporter-type taxonomy (reporters-db `cite_type`) as deterministic inputs to citation-grounding-hallucination-guard, with the SHACL/logic-vs-NLP classification decision and CAFC as the IP-domain anchor.

## Findings

### The two FLP datasets are the canonical, license-clean crosswalk sources

- The court->Bluebook crosswalk is owned by **courts-db**: each court record carries `citation_string` ("string identifying the string used in a citation to refer to the court", e.g. "Mass.") and `name_abbreviation` ("court name abbreviations"), alongside `id` (CourtListener court id), `regex`, `examples`, `name`, `dates`, `system`, `level`, `location`, `type`, `notes` — 13 fields total, split across `courts.json` (data) + `variables.json` (reusable regex templates). Source: <https://github.com/freelawproject/courts-db> README. courts-db covers ~2,809 courts (CAPTURE nugget `courts-db#1`).
- The reporter-type taxonomy is owned by **reporters-db** (a *separate* dataset from courts-db): each reporter entry carries `cite_type` with exactly these string values — `state | federal | neutral | specialty | specialty_west | specialty_lexis | state_regional | scotus_early` — plus `editions` (a dict mapping each citation abbreviation to `{start, end, regexes}` date-bounded publication spans), `variations`, `examples`, `mlz_jurisdiction`, `name`, `notes`, `href`, `publisher`. JSON files: `reporters.json`, `regexes.json`, `state_abbreviations.json`, `case_name_abbreviations.json`. Source: <https://github.com/freelawproject/reporters-db> README (verbatim cite_type string and entry template). As of **v3.2.41 (released 2024-02-09)**: 1,167 reporters, 2,102 name variations (same source). NOTE: today is 2026-06; re-check PyPI <https://pypi.org/project/reporters-db/> for the current pinned version at ingest time.
- Both datasets are **BSD-2-Clause** (permissive, attribution-only). courts-db `LICENSE`: "Copyright (c) 2020, Free Law Project" <https://github.com/freelawproject/courts-db/blob/main/LICENSE>; reporters-db is "BSD-2-Clause license" per <https://github.com/freelawproject/reporters-db>. This confirms the CAPTURE `cautions` posture: safe to vendor the data tables WITH attribution.

### CAFC (the IP-domain anchor) is verified two independent ways

- `cafc -> citation_string "Fed. Cir."` is confirmed against the **live CourtListener REST API v4** (independent of the CAPTURE snippet): `id="cafc"`, `citation_string="Fed. Cir."`, `short_name="Federal Circuit"`, `full_name="Court of Appeals for the Federal Circuit"`, `jurisdiction="F"` (Federal Appellate). Source: <https://www.courtlistener.com/api/rest/v4/courts/cafc/>. This matches CAPTURE nugget `courts-db#8`.
- The Federal Circuit is the *only* federal appellate court hearing patent appeals (created 1982 by merging the CCPA + Court of Claims) and hears appeals directly from the USPTO's PTAB. Source: <https://law.justia.com/cases/federal/appellate-courts/cafc/> and the IPO standards-of-review brief <https://ipo.org/wp-content/uploads/2014/07/CAFC_Rev_of_PTAB.pdf>. So `cafc` is the correct single court-vocabulary anchor for patent-appeal grounding.
- Bluebook Table T1 / Indigo Book Table T1 give "Fed. Cir." as the court parenthetical abbreviation; because the court has nationwide jurisdiction the "Fed. Cir." designation is mandatory to distinguish it from the regional circuits. Source: <https://libguides.uakron.edu/bluebook/federalabbreviations>, <https://guides.law.sc.edu/LRAWSpring/LRAW/citingfedcases>.

### "court->reporter" is actually TWO joins — do not collapse them

- The phrase conflates two distinct keys. **(1) Court parenthetical**: `court.citation_string` (e.g. "Fed. Cir.") — what appears in `(Fed. Cir. 2021)`; this is a property of the *court* (courts-db). **(2) Volume reporter**: e.g. `F.3d`/`F.4th`/`F. App'x` — a property of the *citation*, drawn from reporters-db, not the court. CAFC opinions publish into the Federal Reporter (`F.`/`F.2d`/`F.3d`/`F.4th`, `cite_type=federal`) and unpublished ones into the Federal Appendix (`F. App'x`); PTAB decisions have no official reporter at all. Sources: <https://guides.law.sc.edu/LRAWSpring/LRAW/citingfedcases>, <https://law.justia.com/cases/federal/appellate-courts/F3/>.
- Consequence for the crosswalk: court<->reporter is **many-to-many over time** (a reporter spans many courts; a court's opinions appear across reporter series and date ranges). The clean join is at the *citation* level, where a parsed cite carries `{volume, reporter, page}` + a court parenthetical. This is exactly the model **eyecite** implements (next finding). The deliverable should therefore be two lookup tables (court_id -> citation_string/name_abbreviation from courts-db; reporter_abbrev -> cite_type from reporters-db), not a single court->reporter map.

### eyecite is the reference architecture — and it is deterministic, not NLP

- **eyecite** (FLP) is "built atop Courts-DB and Reporters-DB, which provide the data that lets Eyecite know which strings are valid case citations and what courts published the opinions at each citation." It tokenizes with **Hyperscan + a regex database**, then extracts metadata — explicitly a deterministic regex/automaton pipeline, tested against 50M+ citations and used in production by CourtListener + Caselaw Access Project. Sources: <https://github.com/freelawproject/eyecite>, <https://free.law/projects/eyecite/>, whitepaper <https://free.law/pdf/eyecite-whitepaper.pdf>. eyecite is **BSD-2-Clause** as well. This is the canonical "reimplement-don't-copy" target for the span-gated resolver (CAPTURE nuggets `courts-db#3/#5/#7`).

### Reporter-type classification = deterministic lookup, NOT NLP (and only optionally SHACL)

- Recommendation (decision the subtopic asks for): **reporter-type classification is a deterministic table lookup, not an NLP/ML task.** `cite_type` is a *static property of each reporter* stored in reporters-db; once you have the reporter abbreviation (e.g. "F.3d"), the type ("federal") is a pure join against the static dataset. No inference is required. NLP/regex is needed only *upstream*, to extract the `{volume, reporter, page}` token + court parenthetical from free text — and that extraction is itself best done deterministically (Hyperscan/regex, the eyecite model), reserving any LLM/NLP for ambiguous OCR cleanup, not for the type assignment. This matches the repo's general rule-based guidance: rule-based systems are "preferable when you need deterministic, consistent outputs and can define all rules upfront," whereas ML "excels with incomplete or probabilistic data." Source: <https://www.rapidcanvas.ai/guides/guide-to-the-difference-between-rule-based-and-machine-learning-based-decision-systems>.
- SHACL is a *viable, but heavier* expression of the same deterministic rule, justified **only if** the crosswalk lives in the RDF/`@beep/semantic-web` graph: SHACL operates under the closed-world assumption ("when a fact does not follow from the data, it is assumed to be false"), which fits a closed, fully-enumerable vocabulary like `cite_type`, and SHACL rules can do "general purpose rule-based inferencing" for classification. Sources: <https://spinrdf.org/shacl-and-owl.html>, <https://henrietteharmse.com/2018/03/15/classification-with-shacl-rules/>, <https://arxiv.org/pdf/2309.02723>. Net: for a TypeScript/Effect ingest path a static `reporter_abbrev -> cite_type` table + `Schema`/`Match` is sufficient and simpler; a SHACL rule only earns its keep if reporter-type must be *derived inside the KG* (ip-law-knowledge-graph) for downstream reasoning. OWL classification (open-world) is the wrong tool here.

### The reporters-db string taxonomy != CourtListener's integer enum (real gotcha)

- CourtListener's `BaseCitation` model (primary source, `cl/search/models.py`) stores citation type as a `SmallIntegerField` with a **9-value** integer enum, verified verbatim: `FEDERAL=1` ("federal reporter"), `STATE=2`, `STATE_REGIONAL=3`, `SPECIALTY=4`, `SCOTUS_EARLY=5`, `LEXIS=6` ("Lexis system, e.g. 5 LEXIS 55"), `WEST=7` ("WestLaw system, e.g. 5 WL 55"), `NEUTRAL=8`, `JOURNAL=9` ("law journal citation"). Source: <https://raw.githubusercontent.com/freelawproject/courtlistener/main/cl/search/models.py> (confirms CAPTURE nugget `courtlistener#8`).
- Crosswalk divergence to watch when ingesting: reporters-db has **8 string** cite_types and CourtListener has **9 integers**. The names do NOT line up 1:1 — reporters-db `specialty_west`/`specialty_lexis` vs CourtListener `WEST`/`LEXIS`, and CourtListener adds `JOURNAL=9` which is not a reporters-db `cite_type` (journals are a separate dataset). Pick ONE canonical taxonomy for `@beep` (recommend the reporters-db string enum as the source of truth, since it ships with the reporter records) and treat the CourtListener integer enum as a downstream encoding, not an authority.

### Licensing posture for the Bluebook layer is clean

- Bluebook citation abbreviations are **facts, not copyrightable** ("clearly facts that could only be expressed in one way ... devoid of creativity"); the underlying citation *system* "belongs to everyone." The **Indigo Book** is a CC0 ("No Rights Reserved") public-domain reimplementation of that system, including Table T1 reporter/court abbreviations. Sources: <https://law.resource.org/pub/us/code/blue/IndigoBook.html>, <https://indigobook.github.io/versions/indigobook-2.0.html>. So the crosswalk can rely on courts-db/reporters-db (BSD-2) data + Indigo Book (CC0) as a cross-check, with zero exposure to Bluebook's copyrighted compilation, provided we re-derive rather than copy the proprietary book and keep AGPL CourtListener *server* code out of the port (CAPTURE `cautions`).

## Sources

- courts-db (repo + schema): <https://github.com/freelawproject/courts-db>
- courts-db LICENSE (BSD-2, FLP 2020): <https://github.com/freelawproject/courts-db/blob/main/LICENSE>
- courts-db project page: <https://free.law/projects/courts-db/>
- reporters-db (repo + cite_type + entry template + BSD-2 + v3.2.41): <https://github.com/freelawproject/reporters-db>
- reporters-db PyPI (version check): <https://pypi.org/project/reporters-db/>
- reporters-db project page: <https://free.law/projects/reporters-db/>
- CourtListener BaseCitation enum (primary, models.py): <https://raw.githubusercontent.com/freelawproject/courtlistener/main/cl/search/models.py>
- CourtListener cafc court record (live API, citation_string=Fed. Cir.): <https://www.courtlistener.com/api/rest/v4/courts/cafc/>
- eyecite (repo): <https://github.com/freelawproject/eyecite>
- eyecite project page: <https://free.law/projects/eyecite/>
- eyecite whitepaper: <https://free.law/pdf/eyecite-whitepaper.pdf>
- Bluebook federal court abbreviations (Akron): <https://libguides.uakron.edu/bluebook/federalabbreviations>
- Citing federal cases / Federal Reporter + F. App'x (USC): <https://guides.law.sc.edu/LRAWSpring/LRAW/citingfedcases>
- F.3d Federal Reporter 3rd (Justia): <https://law.justia.com/cases/federal/appellate-courts/F3/>
- CAFC case law / patent jurisdiction (Justia): <https://law.justia.com/cases/federal/appellate-courts/cafc/>
- CAFC review of PTAB (IPO): <https://ipo.org/wp-content/uploads/2014/07/CAFC_Rev_of_PTAB.pdf>
- Indigo Book (CC0, Table T1): <https://law.resource.org/pub/us/code/blue/IndigoBook.html>, <https://indigobook.github.io/versions/indigobook-2.0.html>
- SHACL closed-world / classification rules: <https://spinrdf.org/shacl-and-owl.html>, <https://henrietteharmse.com/2018/03/15/classification-with-shacl-rules/>, <https://arxiv.org/pdf/2309.02723>
- Rule-based vs ML decision systems: <https://www.rapidcanvas.ai/guides/guide-to-the-difference-between-rule-based-and-machine-learning-based-decision-systems>

## Open / Unverified

- **UNVERIFIED — exact reporters-db `cite_type` string -> CourtListener integer mapping function.** The CourtListener models.py excerpt did not expose a `map_reporter_db_cite_type`-style converter. The naming hints (label "Lexis system" for `LEXIS=6`, "WestLaw system" for `WEST=7`) suggest `specialty_lexis`->`LEXIS`/`specialty_west`->`WEST`, but this could equally collapse into `SPECIALTY=4`; do NOT assume the 1:1 mapping until the import code (likely in CourtListener's citation import/management command) is read. Recommend pinning the reporters-db string enum as canonical and deriving any integer encoding explicitly.
- **Version drift.** reporters-db README states v3.2.41 (2024-02-09); an earlier search returned v3.2.32. As of 2026-06 the current published version must be re-pinned from PyPI before ingest; courts-db version/court-count (~2,809) likewise should be re-counted from the pinned tag, not assumed.
- **Not fetched (deferred to ingest packet):** the literal `cafc` record block in `courts.json` (regex array + `${uscoa}` template expansion) and the literal `F.3d`/`F. App'x` entries in `reporters.json` — confirmed by field schema + live API + CAPTURE snippet, but the exact regex/edition byte-content should be vendored under `official-data-sync-foundation` from the pinned source, not transcribed here.
- **PTAB / USPTO reporter gap (IP-specific, open design question).** PTAB decisions lack an official reporter, so the reporter dimension is null for many patent-appeal-adjacent documents; how citation-grounding-hallucination-guard grounds a PTAB cite (docket/IPR number vs a reporter join) is unresolved and out of scope for this dataset crosswalk.
- **courts-db `name_abbreviation` is frequently null** (CAPTURE `courts-db#1` example shows `"name_abbreviation":null` for trial courts); `citation_string` is the reliable Bluebook key, `name_abbreviation` is sparse — verify coverage before relying on it as a join column.
