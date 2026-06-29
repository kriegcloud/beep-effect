# legal-citation-parser-landscape

Scope: survey the eyecite / reporters-db / courts-db / CiteURL citation-parsing landscape, settle the AGPL-vs-permissive licensing reality, and fix the citation forms, tokenizer strategy, and `{volume,reporter,page}` + exact-char-span candidate shape for an Effect-first TS reimplementation.

## Findings

### Licensing reality — the headline correction to CAPTURE

- **CAPTURE.md's premise is partly wrong: eyecite is NOT AGPL.** eyecite's `LICENSE` file is verbatim "BSD 2-Clause License / Copyright (c) 2020, Free Law Project / All rights reserved." (https://raw.githubusercontent.com/freelawproject/eyecite/main/LICENSE). PyPI confirms the package license is `BSD-2-Clause` (https://pypi.org/pypi/eyecite/json).
- **The data packages are also permissive BSD-2-Clause.** Both `reporters-db` and `courts-db` are "available under the permissive BSD license, making it easy and safe to incorporate in your own libraries" (https://github.com/freelawproject/reporters-db , https://github.com/freelawproject/courts-db). PyPI lists them as BSD-2-Clause.
- **Only CourtListener (the `cl/` Django app) is AGPL.** "All materials in the CourtListener repository are copyright Free Law Project under the Affero GPL" — AGPL-3.0-only per its `pyproject.toml` (https://github.com/freelawproject/courtlistener/blob/main/pyproject.toml). The CAPTURE nuggets that cite `cl/citations/api_views.py`, `cl/citations/models.py` (UnmatchedCitation), and `cl/citations/annotate_citations.py` ARE the AGPL surface — but they are thin web-app wrappers around the BSD eyecite library, which itself exposes `get_citations`, `resolve_citations`, and `annotate_citations`.
- **Strategy implication:** the citation *algorithm* and the reporter/court *data* are both BSD-2-Clause and can be (a) vendored/ported with attribution, or (b) cleanly reimplemented from spec — the choice is engineering preference (TS-native, Effect-first, no native deps), NOT a license obligation. The only thing that legally MUST be reimplemented-from-spec rather than copied is CourtListener's AGPL app glue: the lookup HTTP view, the `UnmatchedCitation` status model, and CL's annotation wrapper. Mirror BSD eyecite's algorithm freely; rebuild CL's request/response/status lifecycle from behavior. (BSD-2-Clause still requires retaining the copyright + license text if you port code verbatim.)
- **Existing BSD-licensed TS precedent:** `eyecite-js` (beshkenadze) is BSD-2-Clause and claims "Full parity with Python eyecite v2.7.6" (https://github.com/beshkenadze/eyecite-js , https://raw.githubusercontent.com/beshkenadze/eyecite-js/main/README.md). It is a viable reference/seed for a TS port without touching AGPL code.
- **Declarative MIT alternative:** CiteURL (raindrum) is MIT-licensed, latest 12.0.3, a YAML-template citation parser covering 130+ US sources (https://pypi.org/pypi/citeurl/json , https://github.com/raindrum/citeurl).

### Citation forms to support

- **eyecite recognizes six top-level forms** (JOSS paper Summary, https://www.theoj.org/joss-papers/joss.03617/10.21105.joss.03617.pdf): full case (`Bush v. Gore, 531 U.S. 98, 99-100 (2000)`), short case (`531 U.S., at 99`), statutory/law (`Mass. Gen. Laws ch. 1, § 2`), law journal (`1 Minn. L. Rev. 1`), supra (`Bush, supra, at 100`), and id (`Id., at 101`).
- **Class hierarchy** (https://freelawproject.github.io/eyecite/models.html): `CitationBase` → `ResourceCitation` → `FullCitation` → {`FullCaseCitation`, `FullLawCitation`, `FullJournalCitation`}; `CaseCitation` → {`FullCaseCitation`, `ShortCaseCitation`}; plus siblings `IdCitation`, `SupraCitation`, `ReferenceCitation`, `UnknownCitation`. `eyecite-js` adds `IdLawCitation` and `DOLOpinionCitation` (https://github.com/beshkenadze/eyecite-js).
- **For the hallucination-guard the load-bearing set is: FullCaseCitation, ShortCaseCitation, IdCitation, SupraCitation, ReferenceCitation** — these are exactly the back-reference forms whose resolution depends on document order. "The ordering of citation lists is important for reconstructing the references of the ShortCaseCitation, SupraCitation, and IdCitation and ReferenceCitation objects" (https://freelawproject.github.io/eyecite/find.html). Statutory/journal forms are optional V1 scope.
- **Pincites are metadata, not a separate class.** `IdCitation(metadata=Metadata(pin_cite='at 3'))`, `SupraCitation(metadata=Metadata(antecedent_guess='Foo', pin_cite='at 5'))`, and `FullCaseCitation` pin cites like `pin_cite='3-4'` (https://github.com/freelawproject/eyecite). The JOSS Figure-1 metadata fields are: PLAINTIFF, DEFENDANT, VOLUME, REPORTER, PAGE, PINCITE PAGE, YEAR, PARENTHETICAL.

### The `{volume, reporter, page}` candidate shape + exact char spans

- **`groups` dict carries the regex captures**: for case citations `{volume, reporter, page}`; for law `{reporter, chapter, section}` (https://freelawproject.github.io/eyecite/models.html , https://freelawproject.github.io/eyecite/find.html). This is the canonical shape for the netNew #1 candidate.
- **`metadata` object** carries `pin_cite`, `year`, `court`, `plaintiff`, `defendant`, `parenthetical`, `antecedent_guess` (supra), `publisher` (law) (https://freelawproject.github.io/eyecite/find.html , JOSS paper Functionality section).
- **`ResourceCitation` adds normalized resolution fields**: `exact_editions`, `variation_editions`, `all_editions` (Edition sequences), `edition_guess` (resolved Edition), and `year` as int (https://freelawproject.github.io/eyecite/models.html). This is where reporter-string → canonical-reporter normalization lands.
- **Three span methods give exact char offsets — pick deliberately** (https://freelawproject.github.io/eyecite/models.html):
  - `span()` → start/stop offsets of the *matched citation text only* (`span_start`/`span_end`, falling back to `token.start`/`token.end`).
  - `span_with_pincite()` → extends to cover the pin cite: `min(pin_cite_span_start, span_start, token.start)` .. `max(pin_cite_span_end, token.end, span_end)`.
  - `full_span()` → the entire citation context including plaintiff/defendant/post-citation (`full_span_start`/`full_span_end`).
- **Annotation must choose span vs full_span per form to avoid corrupting markup.** CourtListener's annotator (the AGPL nugget `cl/citations/annotate_citations.py`) uses `full_span()` for Id/Supra and `span_with_pincite()` otherwise so that re-inserted HTML stays balanced (CAPTURE courtlistener#3). Replicate this *rule* (it is behavior, not copyrightable expression) in the TS guard.

### Tokenizer / regex vs hyperscan tradeoffs

- **Three-step pipeline** (JOSS Figure 1, https://www.theoj.org/joss-papers/joss.03617/10.21105.joss.03617.pdf): (1) consume raw, cleaned text; (2) tokenize into discrete tokens using Hyperscan + the regex DB; (3) extract metadata per token, returning a unified citation object. Token subclasses: `CitationToken` (matches a reporter regex from reporters.json), `SectionToken`, `SupraToken`, `IdToken`, `ParagraphToken`, `StopWordToken`, `PlaceholderCitationToken`, `CaseReferenceToken` (https://freelawproject.github.io/eyecite/models.html).
- **Default tokenizer = `AhocorasickTokenizer`** (not Hyperscan): it "uses the pyahocorasick library to filter down eyecite's list of extractor regexes" then runs Python's built-in `re`/`regex` (https://raw.githubusercontent.com/freelawproject/eyecite/main/README.rst). I.e. a literal-anchor prefilter that selects only the candidate regexes whose anchor strings occur in the text, avoiding running ~thousands of regexes blindly.
- **`HyperscanTokenizer` = optional fast path**: "compiles all extraction regexes into a hyperscan database so they can be extracted in a single pass ... far faster than the default tokenizer" (README; JOSS). Hyperscan (Wang et al., NSDI 2019, "Hyperscan: A Fast Multi-pattern Regex Matcher for Modern CPUs") was built to scan network traffic against large regex blacklists; it is a native C library, x86-centric (vectorscan is the ARM fork) — a heavy, platform-bound dependency.
- **Throughput / recall figures (JOSS footnotes)**: "eyecite can parse typical legal text on the order of approximately 10MB/second, though this depends on the density of citations" and "can currently recognize 99.9977% of these citations." The regex DB was tuned against 55M citations from Caselaw Access Project, CourtListener, the Cardiff Index to Legal Abbreviations, the Indigo Book tables, and LexisNexis/Westlaw.
- **For a TS/Bun/Effect reimplementation: skip native Hyperscan; use a literal-substring prefilter + per-extractor `RegExp`.** `eyecite-js` proves this works with zero native deps — its `AhocorasickTokenizer` is just `String.includes()` over a map of anchor-strings → extractors (case-sensitive and case-insensitive maps), running RegExp only for matched extractors (https://raw.githubusercontent.com/beshkenadze/eyecite-js/main/src/tokenizers/default.ts). Upgrade path if profiling demands it: a pure-JS Aho-Corasick automaton for the prefilter, or RE2 (linear-time) for the per-extractor regexes. A combined alternation `RegExp` is the wrong default — it loses per-reporter group structure and is ReDoS-prone.
- **ReDoS / untrusted-input caution (JOSS Limitations)**: "eyecite does not offer worst-case performance guarantees, and both the citation extraction and annotation tools use libraries that may take exponentially long on worst-case inputs. It is therefore recommended to externally impose time limits if running eyecite on potentially malicious inputs." This dovetails with the guard's "documents are untrusted data" stance (CAPTURE doc-haus#4): wrap the parse in an `Effect` with a timeout/interrupt, and/or use a linear-time engine (RE2 / `re2`) so pathological reporter regexes can't hang the worker.

### reporters-db data shape (BSD — directly ingestible)

- **Files** (https://github.com/freelawproject/reporters-db): `reporters.json` (main), `regexes.json` (named templates), `laws.json`, `journals.json`, plus `state_abbreviations.json` and `case_name_abbreviations.json`.
- **`reporters.json` entry**: keyed by canonical abbreviation; fields `cite_type` (e.g. `"state"`, `"federal"`, `"neutral"`, `"specialty"`), `editions` (dict of edition-name → `{start, end, regexes?}`), `variations` (alt-abbreviation → canonical), `name`, `mlz_jurisdiction`, `examples`, plus optional `notes`/`href`/`publisher`.
- **`regexes.json`**: reusable named templates substituted into reporter patterns via Python `string.Template` `$identifier` syntax (e.g. `$volume`, `$page`) — so reporter patterns are composed, not hand-written per reporter.
- **Scale**: as of v3.2.32, "1,167 reporters and 2,102 name variations"; eyecite 2.7.7 pins `reporters-db>=3.2.53` (https://pypi.org/pypi/eyecite/json). courts-db organizes "all courts current and historical" for string→court resolution (https://github.com/freelawproject/courts-db).
- **Reuse plan:** ingest the BSD JSON as a static dataset (the repo already has `goals/official-data-sync-foundation` as the static-dataset ingest home, per the live-tree snapshot) and compile `reporters.json` + `regexes.json` into the TS extractor table. No reimplementation of the *data* is needed or wanted.

### Annotation / offset-mapping already exists BSD-clean

- eyecite's own `annotate_citations(plain_text, annotations, source_text=..., unbalanced_tags="unchecked"|"skip"|"wrap", use_dmp=..., annotator=..., offset_updater=...)` maps plain-text spans back into source markup via a `SpanUpdater` that computes char-level diffs (`fast-diff-match-patch` when `use_dmp=True`, else `difflib`), calling `update(start, bisect_right)` / `update(end, bisect_left)` to translate offsets, and handles insert/delete/replace transparently (https://freelawproject.github.io/eyecite/annotate.html). `unbalanced_tags="skip"` drops annotations that would produce invalid HTML; `"wrap"` repairs them. This is the plain↔markup mapping the CAPTURE attributes to AGPL `cl/citations/annotate_citations.py`, but it lives BSD-clean in eyecite — and the repo's `@beep/langextract` Alignment already does normalized→raw offset mapping, so prefer extending that over porting either.

### CourtListener hosted lookup API — the network alternative (operational facts)

- The hosted Citation Lookup & Verification API has two throttles: **60 valid citations/minute** and **250 citations/request** (past 250 are parsed but not matched; status 429) (https://www.courtlistener.com/help/api/rest/citation-lookup/ , https://github.com/freelawproject/courtlistener/discussions/6895).
- **Text size cap is 64,000 characters/request** per current docs — note this contradicts CAPTURE us-legal-tools#6's "10k char cap" (likely older-SDK/version drift; treat 64,000 as current). The API returns `normalized_citations` with `start_index`/`end_index` char spans (CAPTURE courtlistener#1/#7). As of 2026-05-07 full API access is membership-gated (https://free.law/2026/05/07/api-included-in-memberships/).
- The server is AGPL; calling it over HTTP imposes no AGPL obligation, but it leaks document text off-box — unacceptable for privileged legal text. **Run the parser locally** (BSD data + clean-room TS) for the privilege-safe path; reserve the hosted API for non-privileged enrichment/verification only.

## Sources

- eyecite repo + README: https://github.com/freelawproject/eyecite
- eyecite LICENSE (BSD-2-Clause): https://raw.githubusercontent.com/freelawproject/eyecite/main/LICENSE
- eyecite README.rst (tokenizers, clean_text, resolve): https://raw.githubusercontent.com/freelawproject/eyecite/main/README.rst
- eyecite PyPI JSON (v2.7.7, license, deps): https://pypi.org/pypi/eyecite/json
- eyecite find API: https://freelawproject.github.io/eyecite/find.html
- eyecite models API (span/span_with_pincite/full_span, hierarchy, tokens): https://freelawproject.github.io/eyecite/models.html
- eyecite annotate API (SpanUpdater, unbalanced_tags): https://freelawproject.github.io/eyecite/annotate.html
- JOSS paper "eyecite: A tool for parsing legal citations" (Cushman, Dahl, Lissner 2021): https://www.theoj.org/joss-papers/joss.03617/10.21105.joss.03617.pdf
- reporters-db (BSD, data shape): https://github.com/freelawproject/reporters-db
- courts-db (BSD): https://github.com/freelawproject/courts-db
- CourtListener AGPL (pyproject.toml): https://github.com/freelawproject/courtlistener/blob/main/pyproject.toml
- CourtListener Citation Lookup API docs: https://www.courtlistener.com/help/api/rest/citation-lookup/
- CourtListener throttle discussion (60/min, 250/req): https://github.com/freelawproject/courtlistener/discussions/6895
- eyecite-js (BSD TS port, parity v2.7.6): https://github.com/beshkenadze/eyecite-js , https://raw.githubusercontent.com/beshkenadze/eyecite-js/main/README.md
- eyecite-js default tokenizer (String.includes prefilter, no native deps): https://raw.githubusercontent.com/beshkenadze/eyecite-js/main/src/tokenizers/default.ts
- CiteURL (MIT, YAML templates): https://github.com/raindrum/citeurl , https://pypi.org/pypi/citeurl/json
- Hyperscan paper (Wang et al., NSDI 2019): referenced in JOSS paper References

## Open / Unverified

- **eyecite-js maturity is UNVERIFIED beyond its own claims.** It self-reports "full parity with Python eyecite v2.7.6" but ships as an alpha (`2.7.6-alpha.24`); I did not independently run its test suite or compare span fidelity. Treat as a reference/seed, not a drop-in production dependency, until validated against a citation corpus.
- **Exact reporters.json edition-level schema** (whether `regexes` is per-edition or per-reporter, and the full `cite_type` enumeration) was summarized from the repo README, not byte-verified against a live `reporters.json` entry; confirm against the pinned `reporters-db>=3.2.53` file before building the extractor compiler.
- **CL text cap discrepancy (10k vs 64,000 chars)**: current CL docs say 64,000; CAPTURE us-legal-tools#6 said 10k. Unresolved which the cited SDK targeted — assume version drift, re-verify if the hosted API is actually used.
- **Throughput "~10MB/sec" and recall "99.9977%"** are the authors' own estimates (JOSS footnotes), not independently benchmarked here, and were measured for the Python+Hyperscan path; a TS literal-prefilter+RegExp port will differ (likely slower) — benchmark before relying on numbers.
- **ReDoS exposure of the specific reporter regexes** in a JS engine (vs Python `regex`) is UNVERIFIED; the JOSS authors only warn generally. A linear-time engine (RE2) or per-parse Effect timeout is recommended regardless, but the actual pathological inputs were not enumerated.
- **BFO/ontology and the UnmatchedCitation status enum** (NO_CITATION→FOUND→RESOLVED→FAILED_AMBIGUOUS/FAILED) come from AGPL `cl/citations/models.py`; the *state machine* is reusable as behavior but must be reimplemented, and was not cross-checked against eyecite's own resolution model (`resolve_citations` returns a resource→citations dict, with no status enum) — design decision deferred to the align stage.
</content>
</invoke>
