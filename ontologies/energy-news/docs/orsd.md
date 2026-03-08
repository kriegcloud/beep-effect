# Ontology Requirements Specification Document (ORSD)

## Energy News Ontology

### 1. Purpose

Model the energy news media landscape as observed through Bluesky social media
to enable structured browsing, analysis, and comparison of energy news coverage
across topics, publications, authors, and geographies.

### 2. Scope

See `scope.md` for full in/out scope boundaries.

**In short**: Energy topic taxonomy (~55 SKOS concept individuals) + news media
entity classes (articles, publications, author accounts, posts, feeds) +
organizations + geography. Lightweight, ~8 OWL classes, ~55 topic individuals,
~12 properties.

### 3. Target Users

- Energy analysts and researchers
- Media researchers studying energy coverage
- Policy researchers tracking geographic coverage
- Industry analysts tracking organizations in energy news

### 4. Use Cases

5 use cases defined in `use-cases.yaml`:
- UC-001: Browse energy news by topic (must_have)
- UC-002: Analyze publication coverage patterns (must_have)
- UC-003: Map the energy news landscape (must_have)
- UC-004: Track organizations in energy news (should_have)
- UC-005: Explore geographic energy coverage (should_have)

### 5. Competency Questions

16 CQs defined in `competency-questions.yaml`:
- 10 Must-Have (CQ-001 through CQ-010)
- 6 Should-Have (CQ-011 through CQ-016)

### 6. Non-Functional Requirements

- OWL 2 DL profile
- Turtle serialization
- English labels
- Minimal BFO alignment (not forced)
- Must pass `robot reason` with ELK

### 7. Data Source

SkyGent Bluesky store: ~14.7K posts, 3.7K authors, 6.1K+ article links
from energy-focused feeds, author accounts, and network searches.

### 8. Pre-Glossary

See `pre-glossary.csv` — 8 candidate classes, 55 topic individuals,
12 candidate properties extracted from CQs.

### 9. Traceability

See `traceability-matrix.csv` — full chain from stakeholder need through
use case, CQ, ontology terms, to SPARQL test file.
