# courts-db  `[T1]`

- **Purpose:** Open dataset + Python library mapping court name strings (current and historical, US federal/state/tribal) to canonical CourtListener court IDs via regex, with date- and bankruptcy-based disambiguation.
- **Stack:** Python 3.9+ (single-package library, no runtime deps); data as JSON + per-jurisdiction placename .txt files; uv/setuptools build; ruff lint.
- **Size / shape:** Tiny code surface (~737 LOC of .py across 3 modules) but large data payload: courts.json holds 2,809 court entities, plus variables.json regex-template dictionary and ~30 placename gazetteer files. Kind: data package + resolver library.
- **License:** BSD-2-Clause
- **Maturity:** Last commit 2026-05-18; version 0.10.27; "Production/Stable" classifier; actively maintained by Free Law Project.

**Notes:** courts-db is the data backbone behind CourtListener's court identifiers, so it partially overlaps beep's existing CourtListener driver skeleton — but as a standalone, BSD-2 taxonomy it is independently valuable: a 2,809-entry court vocabulary with citation strings, hierarchy, and temporal validity that beep can vendor directly rather than re-derive. Highest-value items are the court entity schema (courts.json), the citation_string crosswalk (CAFC is the patent appeals court), and the span-gated fuzzy resolver. No OWL/SHACL/MCP/Effect code here (pure Python regex+JSON); the effect-ts/kg nuggets are pattern analogies, not transplantable code.

## Web enrichment
- **Status:** courts-db (freelawproject/courts-db) is ACTIVE and healthy as of 2026-06. Latest PyPI release is 0.10.27 (2026-03-25); supports Python 3.9-3.13, zero runtime deps, data shipped as JSON + per-jurisdiction placename .txt files. Free Law Project's own description cites "over 700 court identifiers" and "over 2,100 hand-crafted regular expressions" tested against ~16M court strings — note the local nugget's "2,809 courts" count likely reflects expanded variant/regex rows, not distinct CourtListener court IDs (~700-900). The library is a pure local dataset+regex resolver and makes NO network calls, so it is unaffected by any API decommission. The companion consumer is CourtListener (courtlistener.com); its REST API is at v4.4 and NOT deprecated (FLP explicitly says no plans to retire older versions but urges v4 migration). Court IDs produced by courts-db are the same canonical IDs used as the CourtListener `court` field/PK, so any @beep/driver-courtlistener lookup should target v4 endpoints. Sibling library reporters-db provides the reporter/citation crosswalk; eyecite is the FLP citation parser that consumes both courts-db and reporters-db.</statusNotes>
<deprecations>["CourtListener Supreme Court Visualization API is largely deprecated as of late 2025 (still create/update/delete via API but no longer renders on-site) — irrelevant to court-ID resolution but avoid building on it.","CourtListener retired the experimental Core API in favor of Swagger/OpenAPI; use REST v4 (currently v4.4). No courts-db-specific deprecations.","courts-db itself has no API/auth surface and no runtime deps — no decommission risk; only caution is keeping the pinned data version fresh since court IDs/regexes change between releases."]</deprecations>
<upstreamDocs>[{"url":"https://github.com/freelawproject/courts-db","note":"Canonical repo: data model (courts.json), regex variable templating, and resolution API (find_court, gather_regexes)."},{"url":"https://free.law/projects/courts-db/","note":"FLP project page stating ~700 court IDs, ~2,100 regexes, tested vs ~16M strings — authoritative counts to reconcile against local nugget."},{"url":"https://pypi.org/project/courts-db/","note":"Release/version-of-record (0.10.27, 2026-03-25); Python 3.9-3.13, no runtime deps."},{"url":"https://www.courtlistener.com/help/api/rest/","note":"CourtListener REST API v4.4 reference; court IDs from courts-db match the API `court` identifier."},{"url":"https://www.courtlistener.com/help/api/rest/v4/migration-guide/","note":"v4 migration guide — older versions not yet deprecated but v4 recommended for any court-ID driver."},{"url":"https://github.com/freelawproject/reporters-db","note":"Sibling dataset for court<->reporter/citation crosswalk consumed alongside courts-db (relevant to CAFC patent citation mapping)."}]</upstreamDocs>
<corrections>[{"nuggetTitle":"Canonical court entity schema (2,809 courts) with CourtListener IDs","correction":"Verify the count: Free Law Project publicly states courts-db has ~700+ canonical court identifiers (with ~2,100+ regexes). The '2,809' figure likely counts expanded entries/regex rows or variant records rather than distinct CourtListener court IDs. Frame the schema as ~700-900 canonical courts with many name variants, and treat each `id` as identical to the CourtListener API v4 `court` primary key."},{"nuggetTitle":"citation_string + name_abbreviation: court-to-reporter mapping","correction":"The reporter side of this crosswalk lives in the sibling library reporters-db, and the runtime consumer that joins courts-db + reporters-db is eyecite (FLP's citation parser). For the CAFC/patents path, map via these three FLP libs rather than treating courts-db as self-contained for reporters."},{"nuggetTitle":"gather_regexes: compiled court matchers carrying id/name/type/location/parent","correction":"Confirmed accurate against upstream; note courts-db is a pure offline resolver (no network/auth) so this index has no API-decommission exposure. Pin the courts-db data version since regexes/IDs evolve per release (current 0.10.27)."}]</corrections>
</invoke>


## Gold nuggets (9)

### 1. Canonical court entity schema (2,809 courts) with CourtListener IDs
`ip-domain-models` · relevance: **direct** · verified

courts.json is the per-court data model used by CourtListener: id, name, name_abbreviation, citation_string (Bluebook reporter abbrev), jurisdiction, system (federal/state/tribal), type (trial/appellate/bankruptcy), level, location, parent (hierarchy), dates[{start,end}], and regex[] name variants. Confirmed 2,809 entries. This is a ready-made jurisdiction/court taxonomy seed for beep's law-practice slice and a direct lookup table for the CourtListener driver. Reusable as effect/Schema definitions and as the controlled vocabulary for grounding court references in OfficeAction/Matter provenance.

- **Source:** `courts_db/data/courts.json:1-27`
- **beep-target:** law-practice court taxonomy + @beep/driver-courtlistener court-id lookup

```
"id": "alacirct",
"jurisdiction": "A.L.",
"level": "gjc",
"location": "Alabama",
"name": "Alabama Circuit Courts",
"name_abbreviation": null,
"regex": [ "Alabama Circuit Courts" ],
"system": "state",
"type": "trial",
"dates": [ { "end": null, "start": null } ]
```

### 2. Regex-template variable dictionary for court-name normalization
`legal-nlp` · relevance: **adjacent** · verified

variables.json maps short keys (md, wd, sd, ed, nd, usa, coa, ...) to fuzzy regex fragments tolerating OCR/abbreviation variation ('S(o)?(ur?th?erh?n)? ?D(ist(r?ict)?)?'). Court regexes in courts.json reference these via $-templates. Confirmed at lines 1-15. This is a reusable normalization vocabulary for resolving messy legal entity strings; directly applicable to beep's legal-NLP candidate-extraction layer where court/jurisdiction mentions in source text must be canonicalized before becoming candidate claims.

- **Source:** `courts_db/data/variables.json:1-13`
- **beep-target:** @beep/langextract court-mention normalization vocab

```
"md": "M(id(dle)?)? ?D(ist)?((r?ict)?)? ?(((of|for|to|if) ?){1,2})? ?",
"sd": "S(o)?(ur?th?erh?n)? ?D(ist(r?ict)?)? ?(((of|for|to|if) ?){1,2})? ?",
"usa": "(((U\\.? ?S\\.? ?)|(Unite(d|s)? State(s|d)?)) ?)",
```

### 3. Court-string resolver with partial-match span gating
`legal-nlp` · relevance: **direct** · verified

find_court_ids_by_name runs every court regex against the input and, when allow_partial_matches is False, rejects matches whose span length != full string length (match.span()[1]-match.span()[0]). This span-based gating is exactly the kind of character-offset logic beep needs for GroundedExtraction.span; the algorithm shows how to turn fuzzy NL court mentions into candidate IDs while tracking the matched substring. Falls back to exact name comparison when no regex hits. Confirmed at lines 78-97.

- **Source:** `courts_db/__init__.py:78-97`
- **beep-target:** epistemic CandidateClaim extraction + GroundedExtraction.span

```
match = re.search(regex, court_str)
if match:
    if (
        not allow_partial_matches
        and len(court_str) != match.span()[1] - match.span()[0]
    ):
        continue
    m = (match.group(0), court_id, parent_court)
    matches.append(m)
```

### 4. Temporal validity filtering of courts by date_found
`kg-ontology-reasoning` · relevance: **adjacent** · verified

filter_courts_by_date keeps only courts whose [start,end] interval contains the document date, with a strict_dates mode controlling how null/open-ended intervals are handled (defaults to 1600-01-01 .. 2100-01-01 sentinels). Confirmed at lines 130-169. This is a concrete pattern for temporal-validity reasoning over historical legal entities — relevant for beep's KG where court/jurisdiction facts must hold as-of a filing date and for OWL temporal scoping.

- **Source:** `courts_db/__init__.py:150-167`
- **beep-target:** kg temporal-validity scoping for court/jurisdiction facts

```
if not strict_dates:
    if date_start is None:
        date_start = "1600-01-01"
    if date_end is None:
        date_end = "2100-01-01"
...
date_start = datetime.strptime(date_start, "%Y-%m-%d")
date_end = datetime.strptime(date_end, "%Y-%m-%d")
if date_start <= date_found <= date_end:
    filtered_results.append(result["id"])
```

### 5. Parent/child court disambiguation (reduce to most-specific node)
`kg-ontology-reasoning` · relevance: **adjacent** · verified

reduce_court_list (lines 115-127) + _filter_parents_from_list (lines 194-209) collapse ambiguous multi-matches by dropping any court that is the 'parent' of another match, yielding the most specific court (e.g. 'CA Court of Appeal, First Appellate District' over its parent). This is a reusable hierarchy-resolution algorithm for beep's KG when an extraction matches multiple nodes in a subsumption hierarchy and only the leaf should be asserted.

- **Source:** `courts_db/__init__.py:115-127`
- **beep-target:** kg subsumption-aware match reduction (most-specific-wins)

```
parent_ids = {parent_id for _, _, parent_id in court_list}
reduced_list = []
for court in court_list:
    court_id = court[1]
    if court_id not in parent_ids:
        reduced_list.append(court)
return reduced_list
```

### 6. Data-loading: template substitution + ordinal expansion + field inheritance
`data-ingestion` · relevance: **adjacent** · verified

load_courts_db composes the dataset at load time: it injects placename gazetteers as regex alternations, expands ${1-56}-style ranges into spelled-out ordinal regexes (judicial districts), Template-substitutes variables.json, then performs parent->child field inheritance (dates/type/location). Confirmed at lines 126-179. A clean pattern for assembling a large derived taxonomy from modular source files — useful for how beep builds its court/jurisdiction reference data deterministically.

- **Source:** `courts_db/utils.py:140-177`
- **beep-target:** deterministic reference-data assembly for court taxonomy

```
for path in iglob(os.path.join(db_root, "data", "places", "*.txt")):
    with open(path, encoding="utf-8") as p:
        places = f"({'|'.join(p.read().splitlines())})"
        variables[path.split(os.path.sep)[-1].split(".txt")[0]] = places
...
ord_arrays = re.findall(r"\${(\d+)-(\d+)}", temp)
for ord in ord_arrays:
    re_ord = f"(({')|('.join(ordinals[int(ord[0]) - 1 : int(ord[1])])}))"
```

### 7. gather_regexes: compiled court matchers carrying id/name/type/location/parent
`legal-nlp` · relevance: **adjacent** · verified

gather_regexes builds the flat matcher list — each court's regex[] plus its literal name compiled with re.I|re.U, paired with (id, name, type, location, parent). Confirmed at lines 182-210. Demonstrates a compact 'compiled pattern + metadata tuple' index for entity resolution that beep could mirror (in Effect) to resolve jurisdiction/court mentions to graph IDs with the metadata needed for downstream filtering.

- **Source:** `courts_db/utils.py:194-209`
- **beep-target:** court/jurisdiction entity-resolution index

```
for court in courts:
    court_regexes = court["regex"] + [court["name"]]
    for reg_str in court_regexes:
        reg_str = reg_str.replace("\\\\", "\\")
        regex = re.compile(reg_str, (re.I | re.U))
        regexes.append((regex, court["id"], court["name"],
            court["type"], court.get("location"), court.get("parent")))
```

### 8. citation_string + name_abbreviation: court-to-reporter mapping
`provenance-evidence` · relevance: **direct** · adjusted

Each court carries citation_string (e.g. 'Fed. Cir.', '9th Cir.', 'Mass.') and name_abbreviation. This is the authoritative crosswalk between a court entity and its Bluebook citation form — directly useful for beep when parsing/generating legal citations and for grounding citation spans back to a canonical court node. The Federal Circuit ('cafc', 'Fed. Cir.') entry is especially relevant for patent appeals in the IP domain. NOTE: original line citation '1-30' was wrong — the cafc entry is at lines 68091-68113.

- **Source:** `courts_db/data/courts.json:68091-68113`
- **beep-target:** citation parsing/generation court<->reporter crosswalk (esp. CAFC for patents)

```
"citation_string": "Fed. Cir.",
"id": "cafc",
"name": "Court of Appeals for the Federal Circuit",
"regex": [
  "(^|\\s)((U\\. ?S\\.)|(United States)),? Court of Appeals(,|(,? for the))? Federal Circuit",
  "${uscoa} Federal Circuit"
]
```

### 9. Lazy module-attribute loading of heavy data structures
`effect-ts` · relevance: **serendipitous** · verified

__init__ uses module-level __getattr__ to lazily build the heavy 'courts', 'court_dict', and 'regexes' structures only on first access, caching back into globals(). Confirmed at lines 23-38. A lightweight pattern for deferring expensive reference-data construction; analogous in spirit to lazy Layer construction in Effect, and a reminder to gate the 2,809-entry regex compile behind first use.

- **Source:** `courts_db/__init__.py:23-38`
- **beep-target:** lazy reference-data Layer construction pattern

```
def __getattr__(name):
    """Lazy load data structures from loaders module."""
    if name == "courts":
        value = load_courts_db()
    elif name == "court_dict":
        from . import courts
        value = make_court_dictionary(courts)
    ...
    globals()[name] = value
    return value
```
