# SSSOM Mapping Quality Report — Energy News Ontology v0.3.0

**Date:** 2026-02-26
**Files evaluated:** 3
## Overall Summary

- **Total mapping files:** 3
- **Total mappings:** 30

**Aggregate predicate distribution:**

| Predicate | Count | % |
|-----------|-------|---|
| `skos:closeMatch` | 27 | 90% |
| `skos:broadMatch` | 2 | 7% |
| `skos:relatedMatch` | 1 | 3% |

**Aggregate confidence:** mean 0.84, range 0.70 – 0.92

**Transitivity risk:** None (no skos:exactMatch mappings used)


### enews-to-external.sssom.tsv

- **Mappings:** 11
- **Subject source:** http://example.org/ontology/energy-news
- **Object source:** N/A
- **License:** https://creativecommons.org/licenses/by/4.0/

**Predicate distribution:**

| Predicate | Count |
|-----------|-------|
| `skos:closeMatch` | 10 |
| `skos:broadMatch` | 1 |

**Confidence distribution:**

- Mean: 0.84
- Range: 0.70 – 0.92
- High (>=0.85): 6
- Medium (0.70-0.84): 5
- Low (<0.70): 0

**Justification methods:**

- `semapv:ManualMappingCuration`: 11

**Issues found:** None

### enews-to-oeo.sssom.tsv

- **Mappings:** 7
- **Subject source:** http://example.org/ontology/energy-news
- **Object source:** http://openenergy-platform.org/ontology/oeo/
- **License:** https://creativecommons.org/publicdomain/zero/1.0/

**Predicate distribution:**

| Predicate | Count |
|-----------|-------|
| `skos:closeMatch` | 6 |
| `skos:broadMatch` | 1 |

**Confidence distribution:**

- Mean: 0.84
- Range: 0.70 – 0.92
- High (>=0.85): 4
- Medium (0.70-0.84): 3
- Low (<0.70): 0

**Justification methods:**

- `semapv:ManualMappingCuration`: 7

**Issues found:** None

### enews-to-wikidata.sssom.tsv

- **Mappings:** 12
- **Subject source:** http://example.org/ontology/energy-news
- **Object source:** http://www.wikidata.org/entity/
- **License:** https://creativecommons.org/publicdomain/zero/1.0/

**Predicate distribution:**

| Predicate | Count |
|-----------|-------|
| `skos:closeMatch` | 11 |
| `skos:relatedMatch` | 1 |

**Confidence distribution:**

- Mean: 0.84
- Range: 0.70 – 0.90
- High (>=0.85): 9
- Medium (0.70-0.84): 3
- Low (<0.70): 0

**Justification methods:**

- `semapv:ManualMappingCuration`: 12

**Issues found:** None
