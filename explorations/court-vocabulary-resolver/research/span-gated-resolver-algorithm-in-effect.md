# span-gated-resolver-algorithm-in-effect

Scope: porting the freelawproject/courts-db court-string resolver (compiled regex index + span gating + parent/child reduction + exact-name fallback + token_sort_ratio fuzzy) to an Effect-first, schema-first module that emits `@beep/langextract` `GroundedExtraction.span`.

## Findings

### Source project: courts-db (the thing being ported)

- courts-db is the canonical Free Law Project resolver: "take an unstructured string describing a court and convert it to an identifier you can trust," over 700 court identifiers and over 2,100 hand-crafted regexes, split across `courts.json` (bulk data) + `variables.json` (regex templates). https://github.com/freelawproject/courts-db , https://free.law/projects/courts-db/
- Current release **0.10.27, published 2026-03-25, license `BSD-2-Clause`** (verified on the PyPI project page). https://pypi.org/project/courts-db/ — BSD-2 is permissive/attribution-friendly, consistent with the CAPTURE caution to **reimplement-don't-copy the logic and re-derive (not copy) the data tables** via `goals/official-data-sync-foundation`.
- COUNT DISCREPANCY (flag): marketing/README says "over 700 court identifiers" while the gold-intake CAPTURE counted ~2,809 entries in `courts.json`. Both can hold — `courts.json` rows are date-split / parent-child variants that reuse a smaller set of CourtListener IDs — but the *authoritative ID cardinality* should be measured from the vendored dataset at ingest time, not from marketing copy. https://free.law/2020/03/10/courts-db-a-new-open-database/

### The resolver pipeline (verbatim, two-source verified)

- `find_court()` signature and order of operations, quoted from source: `def find_court(court_str, bankruptcy=None, date_found=None, strict_dates=False, location=None, allow_partial_matches=False) -> list[str]`. Body order: `strip_punc` → `find_court_ids_by_name(court_str, bankruptcy, location, allow_partial_matches)` → `filter_courts_by_bankruptcy` → `filter_courts_by_date` → `_filter_parents_from_list`. https://github.com/freelawproject/courts-db/blob/main/courts_db/__init__.py , https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- **Partial-match span gating (verbatim, confirmed against the GitHub blob):**
  ```python
  match = re.search(regex, court_str)
  if match:
      if (not allow_partial_matches
          and len(court_str) != match.span()[1] - match.span()[0]):
          continue
  ```
  The gate rejects any match whose span length != the full input length. Because `re.search` matches a substring within `court_str`, "span length == len(court_str)" forces `start==0 && end==len`, i.e. a **full-string match**. JS/Effect port equivalent: with a global/exec match, require `m.index === 0 && m[0].length === courtStr.length` (or wrap each ported pattern as `^(?:…)$`). https://github.com/freelawproject/courts-db/blob/main/courts_db/__init__.py
- The matched tuple appended on a regex hit is `(match.group(0), court["id"], court.get("parent"))` — **the matched substring (group 0)** is what becomes the grounded span/`matchedText`; the id is the resolution target; parent feeds reduction. (CAPTURE nugget courts-db#3, line-confirmed in the same `__init__.py`.) https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- **Exact-name fallback (verbatim, confirmed):** when the regex pass yields nothing, fall back to a punctuation-stripped, lowercased name compare:
  ```python
  if not matches:
      for court in courts:
          if location and court_location != location:
              continue
          if strip_punc(court_str.lower()) == strip_punc(court["name"].lower()):
              matches.append((court_str, court["id"], court.get("parent")))
  ```
  https://github.com/freelawproject/courts-db/blob/main/courts_db/__init__.py
- **Parent/child reduce-to-most-specific (verbatim, confirmed):**
  ```python
  def reduce_court_list(court_list):
      parent_ids = {parent_id for _, _, parent_id in court_list}
      reduced_list = []
      for court in court_list:
          court_id = court[1]
          if court_id not in parent_ids:
              reduced_list.append(court)
      return reduced_list
  ```
  i.e. drop any match that is itself the parent of another match → keep only leaves. Note: `find_court` actually calls `_filter_parents_from_list(matches)` (same drop-the-parent logic over the match tuples); `reduce_court_list` is the standalone twin. Mirror as an `effect/Array` `A.filter` over a precomputed `parentIds` `HashSet`. https://github.com/freelawproject/courts-db/blob/main/courts_db/__init__.py

### Compiled regex matcher index (gather_regexes)

- `gather_regexes(courts)` returns a list of tuples `(compiled_regex, court_id, court_name, court_type, location, parent)`; each regex compiled with flags `re.I | re.U` (case-insensitive + Unicode); the candidate patterns per court are `court["regex"] + [court["name"]]`, and each `reg_str` is un-escaped with `reg_str.replace("\\\\", "\\")` before compiling (collapses JSON-doubled backslashes). https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/utils.py (CAPTURE nugget courts-db#7 quotes the loop verbatim)
- Data assembly is non-trivial (CAPTURE courts-db#6): `load_courts_db()` injects placename gazetteers from `data/places/*.txt`, expands `${start-end}` ordinal ranges ("first".."one hundredth", with hyphen/space variants), runs Python `string.Template` substitution against `variables.json`, then applies parent→child field inheritance (dates/type/location). This is *dataset-build* logic that belongs in the `official-data-sync-foundation` ingest, NOT in the runtime resolver — the resolver should consume an already-expanded, flat court table. https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/utils.py

### Fuzzy candidate→authoritative-ID resolution (the judge-pics pattern)

- The CAPTURE's fuzzy reference (judge-pics#2) uses `fuzz.token_sort_ratio(matching_path, search_str.lower())`, pushes `(path, score)` onto a list, **short-circuits when `score > 95`**, otherwise sorts the list descending and returns ranked candidates; an **integer input bypasses fuzzy entirely as an authoritative ID lookup**. Direct analog: a known CourtListener id skips fuzzy and resolves exactly; a free-text court name goes through ranked fuzzy.
- `token_sort_ratio` definition (primary docs): find all alphanumeric tokens, lowercase, **sort tokens alphabetically, join, then take the ratio of the joined strings** — so word order does not affect score (e.g. "fuzzy wuzzy was a bear" vs "wuzzy fuzzy was a bear" → 100). https://rapidfuzz.github.io/RapidFuzz/Usage/fuzz.html
- **CRITICAL GOTCHA — three different "ratio" definitions, do not assume they agree:**
  - fuzzywuzzy/thefuzz `ratio` (what judge-pics used) = `difflib.SequenceMatcher` (Ratcliff-Obershelp, `2*M/T`) or python-Levenshtein matching_blocks. https://github.com/rapidfuzz/RapidFuzz/blob/main/api_differences.md
  - rapidfuzz `ratio` = **Indel** similarity (insertions+deletions only, LCS-based), NOT full Levenshtein. https://github.com/rapidfuzz/RapidFuzz
  - The repo's existing `@beep/langextract` `similarity` helper (`packages/foundation/capability/langextract/src/Alignment/index.ts`) uses **full Levenshtein with substitution** — so it does NOT reproduce token_sort_ratio out of the box. Reusing it for the court-name fuzzy step changes the ranking; either preprocess (sort tokens) + accept the Levenshtein metric, or port the Indel/difflib metric explicitly.
- Canonical JS port: **fuzzball.js** (`fuzzball` on npm), MIT-licensed, "mostly a JavaScript port of TheFuzz (formerly fuzzywuzzy)", ships `token_sort_ratio`/`token_set_ratio`/`ratio`. By default its `ratio` = `((len1+len2)-distance)/(len1+len2)` with substitution cost 2 (= Indel/LCS), with an optional difflib `2*M/T` mode. https://github.com/nol13/fuzzball.js , https://www.npmjs.com/package/fuzzball — viable to vendor for the fuzzy tier; otherwise add token-sort preprocessing to the in-repo Levenshtein helper to stay dependency-free.

### Python→JS regex porting gotchas (the 2,100 patterns)

- Python `re` and JS `RegExp` are not source-compatible: named groups `(?P<name>…)` are Python-only syntax, Python inline flags like `(?a)`/`(?i)` have no direct JS equivalent, and `^`/`$` anchor/newline semantics differ (Python `$` matches before a trailing newline; JS does not). `re.I|re.U` maps roughly to JS flags `iu`, but the `u` flag changes escape/class semantics and can break otherwise-valid patterns → port-and-validate each pattern, do not blind-copy. https://docs.python.org/3/library/re.html , https://nemisj.com/python-regexp-javascript/
- Conversion tooling exists if mechanical translation is wanted: `pyre-to-regexp` (Python-re → JS RegExp) and `js-regex` (rewrites Python patterns to JS-equivalent behavior). https://github.com/jmchilton/pyre-to-regexp , https://pypi.org/project/js-regex/
- **ReDoS / catastrophic backtracking (security gotcha):** 2,100 hand-crafted patterns run against untrusted OCR'd document text is a denial-of-service surface — V8's native NFA RegExp can hang the Node event loop on a single crafted input (demonstrated: native RegExp locked the main thread >1m45s on a string RE2JS handled 30,000× in ~454ms). Node has no built-in per-regex timeout. Mitigations: run patterns through a linear-time engine (`re2js` pure-JS port of RE2, or `node-re2` native bindings), and/or audit the ported set with `safe-regex`/`recheck`. RE2 lacks backreferences/lookaround, so any ported pattern using those must be flagged. https://www.sonarsource.com/blog/vulnerable-regular-expressions-javascript/ , https://github.com/le0pard/re2js , https://github.com/uhop/node-re2

### Wiring into `@beep/langextract` GroundedExtraction.span (in-repo, verified by reading source)

- `GroundedExtraction` (`packages/foundation/capability/langextract/src/Extraction/index.ts:211`) carries `alignmentStatus`, optional `span`, optional `matchedText`, `label`, `text`, optional `attributes`/`confidence`. `span` is `Contract.Span` from `@beep/nlp/Handoff`.
- `Contract.Span` (`packages/foundation/capability/nlp/src/Handoff/Contract.ts:176`) is a **half-open `[start, end)` span of branded `NonNegativeInt`** with an invariant `start <= end` (decode-time filter). This is exactly the shape the courts-db `match.group(0)` substring maps to.
- `AlignmentStatus` (`Extraction/index.ts:118`) = `match_exact | match_lesser | match_fuzzy | unaligned`. Natural mapping for the resolver: full-string regex hit → `match_exact`; exact-name fallback → `match_exact`; token_sort fuzzy → `match_fuzzy`; no resolution → `unaligned`. The resolved `courtId` is not a field on `GroundedExtraction` → carry it in `attributes` (e.g. `{ courtId, jurisdiction, system }`) or extend the model in the goal packet.
- The existing `Alignment` module already provides the **canonical Effect-first shape to mirror** (pure, dependency-light, no `Effect` wrapper for CPU-only code): `spanFromMatch(start, matchedText)` builds a `Contract.Span` from an offset + matched substring; helpers use `effect/Array` (`A`), `effect/String` (`Str`), `dual` for data-first/data-last, `effect/Predicate`, and **fail-closed `MAX_*` bounds decoded up front** (`MAX_FUZZY_SOURCE_LENGTH`, etc.). The court resolver should reuse `spanFromMatch` directly and build its compiled matcher index once at module load, then iterate with `A.filterMap`/`A.reduce` and return `Option`/typed errors rather than throwing. `packages/foundation/capability/langextract/src/Alignment/index.ts:71`

### Effect/schema-first shaping notes (in-repo conventions)

- Court enums (`type`, `system`, `level`, reporter-type) → `LiteralKit([...])` (used throughout `Extraction/index.ts`, e.g. `AlignmentStatus`, `LangExtractErrorReason`); court IDs → branded `EntityId`/identity-composer per repo law (CAPTURE feeds "schema literals/codecs").
- Typed boundary errors via `TaggedErrorClass` + a sanitized reason `LiteralKit` (mirror `LangExtractError.fromReason`), not thrown exceptions. `Extraction/index.ts:79`
- The pure matcher loop need not be wrapped in `Effect`; follow the existing Alignment precedent (synchronous, bounded, deterministic). Reserve `Effect` for the I/O boundary (loading the vendored court table from the data-sync layer) and for emitting typed errors.

## Sources

- courts-db repo (source of truth for the algorithm): https://github.com/freelawproject/courts-db
- courts-db `__init__.py` (find_court, span gating, exact-name fallback, reduce_court_list): https://github.com/freelawproject/courts-db/blob/main/courts_db/__init__.py and raw https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/__init__.py
- courts-db `utils.py` (gather_regexes tuple shape, flags, data assembly): https://raw.githubusercontent.com/freelawproject/courts-db/main/courts_db/utils.py
- courts-db on PyPI (version 0.10.27, 2026-03-25, BSD-2-Clause, find_court examples): https://pypi.org/project/courts-db/
- Free Law Project courts-db page + launch announcement: https://free.law/projects/courts-db/ , https://free.law/2020/03/10/courts-db-a-new-open-database/
- RapidFuzz token_sort_ratio docs: https://rapidfuzz.github.io/RapidFuzz/Usage/fuzz.html
- RapidFuzz repo + api_differences (Indel vs difflib vs Levenshtein): https://github.com/rapidfuzz/RapidFuzz , https://github.com/rapidfuzz/RapidFuzz/blob/main/api_differences.md
- fuzzball.js (MIT JS port of fuzzywuzzy/thefuzz, token_sort_ratio): https://github.com/nol13/fuzzball.js , https://www.npmjs.com/package/fuzzball
- Python `re` docs + Python↔JS regex differences: https://docs.python.org/3/library/re.html , https://nemisj.com/python-regexp-javascript/
- Regex conversion tools: https://github.com/jmchilton/pyre-to-regexp , https://pypi.org/project/js-regex/
- ReDoS / linear-time engines: https://www.sonarsource.com/blog/vulnerable-regular-expressions-javascript/ , https://github.com/le0pard/re2js , https://github.com/uhop/node-re2
- In-repo (read directly): `packages/foundation/capability/langextract/src/Extraction/index.ts`, `.../langextract/src/Alignment/index.ts`, `packages/foundation/capability/nlp/src/Handoff/Contract.ts`

## Open / Unverified

- **Exact authoritative court-ID cardinality** in the current `courts.json` is UNVERIFIED (marketing "700+ IDs" vs CAPTURE "~2,809 entries"); resolve by counting distinct ids in the vendored dataset at ingest, not from docs.
- **`gather_regexes` exact line numbers and the precise tuple order** are taken from the CAPTURE gold-intake snippet (courts-db#7) plus a `utils.py` summary fetch; the WebFetch summarizer did not reproduce the loop byte-for-byte. The 6-tuple `(regex, id, name, type, location, parent)` and `re.I|re.U` flags are corroborated, but confirm verbatim against the pinned commit before porting.
- **Whether to vendor `fuzzball` vs extend the in-repo Levenshtein `similarity`** is an open design call — both reach the same short-circuit/ranked-list behavior, but they produce *different scores*, so a >95 threshold ported literally will not behave identically across the two metrics. Needs a small calibration test against known court-name pairs.
- **RE2 feature coverage**: UNVERIFIED how many of the 2,100 courts-db patterns use lookaround/backreferences (which RE2/RE2JS reject). If a meaningful subset does, a hybrid (RE2 fast-path + guarded native fallback with a worker/timeout) may be required — needs a scan of the ported pattern set.
- **`strip_punc` exact character class** (which punctuation it strips) was not fetched verbatim; needed to make the exact-name fallback byte-identical. Pull from `courts_db/utils.py` (or `text_utils`) at port time.
- courts-db `find_court_by_id` returns the full court dict (regex/name_abbreviation/dates/url/type/id/location/citation_string) per the PyPI page; the precise field set/shape of the vendored entity schema should be locked from the dataset itself during `official-data-sync-foundation` ingest.
