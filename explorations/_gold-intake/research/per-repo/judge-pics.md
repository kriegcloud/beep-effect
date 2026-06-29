# judge-pics  `[T3]`

- **Purpose:** Free Law Project library that maps judge names / CourtListener person IDs to hosted judicial portrait image URLs at multiple sizes.
- **Stack:** Python; requests, fuzzywuzzy (fuzzy name matching), climage; JSON data file; packaged for PyPI.
- **Size / shape:** ~773 LOC across ~8 Python files plus a people.json data manifest; PyPI library + scrapers/uploaders.
- **License:** BSD-2-Clause
- **Maturity:** Last commit 2025-05-29; actively maintained Free Law Project repo.

**Notes:** Niche image-lookup utility; not core to Prose-to-Proof. Mild reuse value in its provenance record shape and fuzzy-vs-authoritative ID resolution pattern. Links to CourtListener person IDs (beep already has a CourtListener driver skeleton).

## Gold nuggets (2)

### 1. Per-image provenance record schema (source/hash/license)
`provenance-evidence` · relevance: **adjacent** · adjusted

Each judge portrait carries a small provenance record: source URL, sha256 hash, license string, artist, date, and a CourtListener person ID. A clean minimal asset-with-provenance data model and license-tagging convention beep can mirror for ingested source artifacts. Adjacent to beep's CourtListener driver (links person IDs).

- **Source:** `judge_pics/data/people.json:2-10`
- **beep-target:** @beep/provenance source-artifact record (source URL + content hash + license)

```
{
    "artist": null,
    "date_created": null,
    "hash": "592de8796414bca11573de3ef594c38df2327515e8a92b1ca357187377d77c7b",
    "license": "Work of Federal Government",
    "path": "vadas-nandor",
    "person": 10156,
    "source": "http://www.cand.uscourts.gov/njv"
  }
```

### 2. Fuzzy name-to-entity resolution with confidence threshold + CourtListener ID fallback
`legal-nlp` · relevance: **adjacent** · adjusted

query()/portrait() resolve free-text names via fuzzywuzzy token_sort_ratio, returning a ranked list above threshold and short-circuiting on >95 confidence; integer input bypasses fuzzy matching as an authoritative CourtListener person-ID lookup. A pattern for beep's candidate (fuzzy/fallible) vs authoritative (exact ID) resolution when linking extracted names to graph entities.

- **Source:** `judge_pics/search.py:31-67`
- **beep-target:** agents/nlp entity-resolution: fuzzy candidate match vs exact CourtListener ID authority

```
m = fuzz.token_sort_ratio(matching_path, search_str.lower())
        xlist.append((path, m))
        if m > 95:
            return [f"https://portraits.free.law/v2/{size}/{path}.jpeg"]
    xlist.sort(key=lambda y: -y[1])
```
