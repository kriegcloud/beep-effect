# UI/UX Research: Knowledge Graph Visualization for News/Politics Domain

**Date**: 2025-12-18
**Context**: Effect Ontology MVP - Seattle Mayor Timeline
**Scope**: Research on visualization patterns for claims-based knowledge graphs
**Status**: Research Summary

---

## Executive Summary

This document synthesizes UI/UX research for building a knowledge graph visualization tool focused on the Seattle politics domain. The system extracts claims from news articles using a Wikidata-style ranking system (preferred/normal/deprecated), tracks temporal validity, and handles conflicts between sources.

**Key Findings:**
1. **Dual-view architecture** (Timeline + Graph) is the proven pattern for temporal knowledge exploration
2. **Claim-based UI patterns** require specialized visualization for rank, evidence, and supersession chains
3. **React ecosystem** provides mature libraries for both graph (Cytoscape, React Flow) and timeline (Vis.js, D3) components
4. **Text annotation** aligned with W3C Web Annotation standard enables evidence linking
5. **Conflict visualization** requires visual differentiators for source disagreement

---

## Domain Context

### System Architecture (from ARCHITECTURAL_DECISIONS_MVP.md)

**Data Model:**
- Claims modeled as reified RDF statements (not RDF-star) with rank, confidence, temporal validity
- W3C ORG ontology for organizational structure (Person → Membership → Post → Organization)
- PROV-O for provenance tracking (statedIn, extractedAt, extractedBy)
- Web Annotation for evidence text spans (startOffset, endOffset)

**Storage:**
- **PostgreSQL**: Article metadata, timeline indexes, claim summaries (fast queries <100ms)
- **RDF Graphs (N3.js/GCS)**: Semantic triples, provenance, reasoning results (loaded on-demand)
- **Named Graphs**: Per-article isolation for conflict resolution

**Scale Estimates (MVP):**
- 100 articles/batch × 50 claims/article = 5,000 claims
- 10 triples/claim = 50,000 triples/batch
- Target: <100ms timeline queries, <500ms graph detail views

### Claims Ontology (from claims.ttl)

**Key Properties:**
```turtle
:Claim rdf:type owl:Class ;
    rdfs:subClassOf prov:Entity .

:claimSubject, :claimPredicate, :claimObject  # Reified triple
:rank → :ClaimRank (:Preferred, :Normal, :Deprecated)
:confidence → xsd:double (0.0-1.0)
:validFrom, :validUntil → xsd:dateTime  # Temporal validity
:supersedes, :supersededBy → :Claim  # Correction chains
:statedIn → foaf:Document
:hasEvidence → :Evidence

:Evidence rdfs:subClassOf oa:Annotation .
:evidenceText → xsd:string  # Exact quote
:startOffset, :endOffset → xsd:integer
```

**Example Use Case:**
```turtle
# Initial claim from article 1
:Claim_001 a claims:Claim ;
    claims:claimSubject seattle:TimBurgess ;
    claims:claimPredicate org:post ;
    claims:claimObject seattle:DeputyMayorPost ;
    claims:rank claims:Preferred ;
    claims:confidence 0.95 ;
    claims:validFrom "2025-01-01"^^xsd:date ;
    claims:statedIn :Article_PressRelease_001 ;
    claims:hasEvidence :Evidence_001 .

# Correction from article 2
:Claim_002 a claims:Claim ;
    claims:claimSubject seattle:TimBurgess ;
    claims:claimPredicate org:post ;
    claims:claimObject seattle:ChiefOfStaffPost ;  # Corrected role
    claims:rank claims:Preferred ;
    claims:confidence 0.98 ;
    claims:validFrom "2025-01-01"^^xsd:date ;
    claims:statedIn :Article_Correction_002 ;
    claims:supersedes :Claim_001 .  # Marks old claim as superseded

# Original claim now deprecated
:Claim_001 claims:rank claims:Deprecated ;
    claims:deprecatedAt "2025-01-15T10:00:00Z"^^xsd:dateTime ;
    claims:deprecationReason "Corrected by source" .
```

---

## 1. Ontology/Graph Visualization Patterns

### 1.1 Node-Link Graph Visualizations

**Research Findings:**

Node-link diagrams are the standard for knowledge graph visualization, displaying entities as nodes and relationships as labeled edges. Modern tools use **force-directed layouts** to organize complex networks spatially.

**Visual Encoding Best Practices** (from [datavid.com](https://datavid.com/blog/knowledge-graph-visualization)):
- **Classes as circles** (size proportional to instance count)
- **Object properties as arrows** with labeled edges
- **Datatype properties as rectangles** or badges
- **Color coding** by entity type (Person=blue, Organization=orange, Post=green)
- **Icon overlays** for class types (foaf:Person, org:Organization)

**Dedicated Ontology Notations:**

From existing research (ontology_web_vis_research.md):
- **VOWL** (Visual Notation for OWL): Formal visual language with circles for classes, rectangles for properties
- **Graffoo**: UML-style notation emphasizing logical relationships
- **Graphol**: Similar graphical modeling language

**Recommendation for MVP:**
- Use **simplified node-link graphs** rather than full ontology diagrams
- Focus on **instance-level visualization** (entities and their relationships)
- Reserve schema visualization (class hierarchies) for admin/debugging views

### 1.2 Entity Relationship Patterns

**Person-Organization-Role Pattern** (W3C ORG-based):

```
┌─────────────┐      org:member      ┌──────────────┐
│             │◄─────────────────────│              │
│   Person    │                      │  Membership  │
│ (Tim Burgess)                      │  (temporal)  │
└─────────────┘                      │              │
                                     │ memberDuring:│
                                     │  2025-01→∞   │
                    org:post         └──────┬───────┘
┌─────────────┐                            │
│    Post     │◄───────────────────────────┘
│ (Deputy     │
│  Mayor)     │      org:postIn
└──────┬──────┘                      ┌──────────────┐
       │                             │              │
       └─────────────────────────────►│ Organization │
                                     │ (Mayor's     │
                                     │  Office)     │
                                     └──────────────┘
```

**Visual Representation:**
- **Temporal edges**: Show org:memberDuring interval as edge label or timeline glyph
- **Nested containers**: Optionally group Posts inside Organization boxes
- **Hover tooltips**: Display full temporal interval, confidence, source article

### 1.3 Timeline-Based Entity State Changes

**State Timeline Visualization** (from [Grafana docs](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/state-timeline/)):

Visualize entity state changes over time using horizontal swim lanes:

```
Entity: Tim Burgess
─────────────────────────────────────────────────────────────►
        │     Chief of Staff     │   Deputy Mayor   │
        └────────────────────────┴──────────────────┴──────
        2024-11        2025-01               2025-06

Entity: Transportation Dept
─────────────────────────────────────────────────────────────►
                │    Led by: Alex Johnson    │
                └────────────────────────────┴──────────────
                2025-02                    (ongoing)
```

**Implementation Approach:**
- Each entity gets a horizontal swim lane
- State bars color-coded by rank (Preferred=green, Normal=yellow, Deprecated=red/strikethrough)
- Clicking state bar opens claim details with evidence
- validFrom/validUntil define bar boundaries

**React Libraries:**
- **Grafana State Timeline**: Mature pattern, requires adaptation from metrics to RDF
- **Vis.js Timeline**: Supports ranges, groups, styling
- **D3 Timeline (custom)**: Full control, higher implementation cost

### 1.4 Conflict Visualization

**Challenges** (from academic research on [knowledge graph users](https://arxiv.org/html/2304.01311v4)):

> "There is a lack of efficacy for node-link diagrams for KG Consumers, indicating a need for tailored domain-specific visualizations."

**Recommended Patterns for Conflicting Claims:**

**1. Side-by-Side Comparison View:**
```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│ Seattle Times (2025-01-10)      │  │ PubliCola (2025-01-12)          │
├─────────────────────────────────┤  ├─────────────────────────────────┤
│ Tim Burgess → Chief of Staff    │  │ Tim Burgess → Deputy Mayor      │
│ Confidence: 0.95                │  │ Confidence: 0.98                │
│ Rank: Deprecated                │  │ Rank: Preferred                 │
│ Evidence: "...serve as chief..."│  │ Evidence: "...deputy mayor..."  │
└─────────────────────────────────┘  └─────────────────────────────────┘
        ↓                                       ↑
    Superseded by ──────────────────────────────┘
```

**2. Visual Differentiators:**
- **Border styling**: Preferred (solid green), Normal (dashed gray), Deprecated (dotted red)
- **Badge icons**: ⭐ Preferred, ⚠ Deprecated, 🔗 Supersession link
- **Timeline markers**: Show claim lifecycle (extracted → preferred → deprecated)
- **Source badges**: Color-code by news outlet, show source reliability scores

**3. Conflict Aggregation Patterns** (from [Ground News](https://ground.news/)):

> Ground News shows 'Source bias' labels (center, left, moderate left) and overall 'Grade' score averaging four parameters: News Outlet quality, Author's expertise, quality of links and quotes, and tone of voice.

**Adapt for MVP:**
- Aggregate claims by subject-predicate pair
- Show count of sources supporting each value
- Visual "agreement meter" (3/5 sources agree on Deputy Mayor)
- Link to full claim provenance on click

---

## 2. Article/Text Visualization

### 2.1 Highlighting Extracted Claims in Source Text

**W3C Web Annotation Pattern** (from claims.ttl):

```turtle
:Evidence_123 a claims:Evidence ;
    rdfs:subClassOf oa:Annotation ;
    claims:evidenceText "Tim Burgess will serve as Deputy Mayor" ;
    claims:startOffset 245 ;
    claims:endOffset 287 ;
    claims:evidenceSource :Article_001 .
```

**UI Pattern: Inline Text Highlighting**

Original article text with highlights:
```
Seattle Mayor Katie Wilson announced her senior staff today.
[Tim Burgess will serve as Deputy Mayor], bringing decades
                ︿────────────────────────︿
                ✓ Preferred claim
                Confidence: 0.95
                Subject: Tim Burgess
                Predicate: org:post
                Object: Deputy Mayor
                Sources: 3 articles

of public service experience to the role. [Alex Johnson will
lead the Transportation Department]...
       ︿──────────────────────────︿
       ✓ Preferred claim
       Confidence: 0.92
```

**Interaction Model:**
- **Hover**: Tooltip shows claim summary (subject, predicate, object, rank, confidence)
- **Click**: Opens claim detail panel with full provenance
- **Highlight color**: Maps to claim rank (green=Preferred, yellow=Normal, red=Deprecated)
- **Multi-source overlay**: Show stacked highlights if multiple articles extract same span

**React Libraries:**

From research on [React text annotation](https://www.npmjs.com/package/react-text-annotate):

1. **react-text-annotate**: Interactive highlighting, callbacks for selection detection
2. **react-pdf-highlighter-extended**: Advanced PDF annotation (if articles are PDFs)
3. **react-selection-highlighter**: Backend persistence support

**Custom Implementation Requirements:**
- Must support **overlapping highlights** (multiple claims from same text span)
- **Multi-color layering** for rank visualization
- **Character offset mapping** from Evidence.startOffset/endOffset
- **W3C Annotation Data Model alignment** for export/interop

### 2.2 Evidence Linking (Claim → Source Text Span)

**Bidirectional Navigation Pattern:**

**Direction 1: Claim → Evidence Text**
```
Claim Detail Panel:
┌──────────────────────────────────────────┐
│ Tim Burgess → Deputy Mayor               │
│ Rank: Preferred ⭐                       │
│ Confidence: 0.95                         │
│ Valid From: 2025-01-01                   │
│                                          │
│ Evidence:                                │
│ ┌────────────────────────────────────┐   │
│ │ "Tim Burgess will serve as         │   │
│ │  Deputy Mayor"                     │   │
│ │                                    │   │
│ │ Source: Seattle Times              │   │
│ │ Published: 2025-01-10              │   │
│ │ [View in context →]                │   │ ← Click scrolls to highlighted text
│ └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Direction 2: Evidence Text → Claim**
```
Article Reader View:
...Seattle Mayor Katie Wilson announced her senior staff
today. [Tim Burgess will serve as Deputy Mayor], bringing...
       ︿──────────────────────────────────︿
       │
       └─► Sidebar shows:
           ✓ 1 Preferred claim extracted
           Subject: Tim Burgess
           Predicate: holds post
           Object: Deputy Mayor
           [View full claim details →]
```

**Implementation:**
- **ScrollTo API**: Jump from claim panel to article text at character offset
- **Highlight persistence**: Maintain highlight state across navigation
- **Multi-article evidence**: If claim has evidence from 3 articles, show tabs or list

### 2.3 Annotation Patterns for Multi-Source Aggregation

**Challenge**: One entity claim may have evidence from 5 different articles over time.

**Aggregation UI Pattern:**

```
Entity: Tim Burgess
Property: org:post
Current Value: Deputy Mayor (Preferred)

Evidence Timeline:
┌─────────────────────────────────────────────────────────────┐
│ 2025-01-10 │ Seattle Times        │ "...Deputy Mayor"      │
│ 2025-01-11 │ PubliCola            │ "...Deputy Mayor"      │
│ 2025-01-12 │ The Stranger         │ "...Chief of Staff" ⚠ │ ← Conflict!
│ 2025-01-15 │ Seattle Times        │ "Correction: Deputy..."│
│            │ (correction article) │                        │
└─────────────────────────────────────────────────────────────┘
           Agreement: 3/4 sources (75%) ──────────┐
                                                   ▼
                                         Confidence Meter: ███████▒▒▒
```

**Visual Components:**
- **Evidence list**: Chronological display of all supporting quotes
- **Source badges**: Outlet icons, publication dates
- **Conflict markers**: Highlight disagreeing evidence in red/yellow
- **Correction indicators**: Show supersession relationships

**Research Insight** (from [MIT Trustnet](https://news.mit.edu/2024/new-tool-trustnet-empowers-users-to-fight-online-misinformation-0516)):

> Decentralized approach puts power to decide what constitutes misinformation into hands of individual users rather than central authority.

**Adapt for MVP:**
- Let users **flag suspicious claims** for review
- Show **source reputation scores** (if available)
- Aggregate **community assessments** (future feature)

---

## 3. Knowledge Graph Exploration UX

### 3.1 Entity Detail Pages with Claim History

**Entity-Centric View Pattern:**

```
┌────────────────────────────────────────────────────────────────┐
│ Tim Burgess                                           foaf:Person │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Current Roles:                                                   │
│   • Deputy Mayor (City of Seattle)           2025-01-01 → ∞    │
│     Confidence: 0.95 | Sources: 3 articles                      │
│                                                                  │
│ Claim History (5 total claims):                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ✓ Deputy Mayor                   2025-01-01 → ∞          │   │
│ │   Preferred | Confidence: 0.95                           │   │
│ │   Sources: Seattle Times, PubliCola, Crosscut            │   │
│ │   [View evidence]                                        │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │ ⚠ Chief of Staff                 2025-01-01 → 2025-01-15 │   │
│ │   Deprecated | Superseded by claim above                 │   │
│ │   Source: The Stranger (later corrected)                 │   │
│ │   [View correction chain]                                │   │
│ ├──────────────────────────────────────────────────────────┤   │
│ │   Policy Director (Mayor's Office) 2024-11 → 2024-12    │   │
│ │   Normal | Historical role                               │   │
│ │   [View details]                                         │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ Related Entities:                                                │
│   • Katie Wilson (Mayor) - appointed Burgess                    │
│   • Mayor's Office (Organization) - current affiliation          │
│                                                                  │
│ Activity Timeline: [View timeline visualization →]              │
└────────────────────────────────────────────────────────────────┘
```

**Key Components:**

1. **Current State Summary**: Top card shows preferred claims only
2. **Claim History List**: All claims chronologically, styled by rank
3. **Temporal Validity Indicators**: Date ranges, ongoing status (→ ∞)
4. **Source Attribution**: Article count, source names
5. **Supersession Chains**: Visual links between correcting claims
6. **Related Entity Graph**: Contextual connections

**Implementation Notes:**
- Load entity details via SPARQL query: `SELECT * WHERE { ?claim claims:claimSubject <TimBurgess> }`
- Denormalize claim count to Postgres for fast card rendering
- Lazy-load full RDF graph on "View evidence" clicks

### 3.2 Search and Filtering

**Multi-Dimensional Filtering** (from existing research):

**Filters Required:**

1. **Time Filters:**
   - Published date range (article publishedAt)
   - Event time range (claim eventTime)
   - Temporal validity (claim validFrom/validUntil overlaps query range)
   - Bitemporal toggle: "Show as of date X" (rewind knowledge state)

2. **Entity Type Filters:**
   - foaf:Person
   - org:Organization
   - org:Post
   - Custom: PolicyInitiativeEvent, BudgetActionEvent (from seattle.ttl)

3. **Claim Rank Filters:**
   - Preferred only (default)
   - Include Normal
   - Show Deprecated (for audit/research)

4. **Source Filters:**
   - By outlet: Seattle Times, PubliCola, Crosscut, etc.
   - By source type: Press release, news article, correction
   - By confidence threshold: >0.9, >0.8, etc.

5. **Conflict Filters:**
   - Show only conflicting claims
   - Show claims with supersession relationships
   - Show claims with multiple sources

**Search UI Pattern:**

```
┌────────────────────────────────────────────────────────────────┐
│ Search: [transportation commissioner________]         [Search] │
├────────────────────────────────────────────────────────────────┤
│ Filters:                                                        │
│ Time Range:  [2025-01-01] to [2025-12-31]      [This year ▼]  │
│ Entity Type: [ ] Person [✓] Post [✓] Organization              │
│ Rank:        [✓] Preferred [✓] Normal [ ] Deprecated           │
│ Sources:     [✓] All  [ ] Seattle Times only                    │
│ Confidence:  [========●─────] >0.8                             │
└────────────────────────────────────────────────────────────────┘

Results (12 claims):
┌────────────────────────────────────────────────────────────────┐
│ ⭐ Alex Johnson → Transportation Commissioner                   │
│    2025-02-05 | Seattle Times | Confidence: 0.92               │
│    [View details] [Show in graph]                              │
├────────────────────────────────────────────────────────────────┤
│ ⭐ Transportation Department → Led by: Alex Johnson             │
│    2025-02-05 | PubliCola | Confidence: 0.89                   │
│    [View details] [Show in graph]                              │
└────────────────────────────────────────────────────────────────┘
```

**Backend Implementation:**
- **Postgres full-text search** for claim text (fast, indexed)
- **SPARQL queries** for complex graph patterns (on-demand)
- **Faceted search** via Postgres + RDF hybrid queries

**Research Insight** (from [Neo4j Bloom](https://neo4j.com/docs/bloom-user-guide/current/bloom-visual-tour/bloom-overview/)):

> Near-natural language querying without reliance on user knowledge of Cypher. Bloom will take relationship types, convert them to lower case and split out words (e.g., replacing underscores with spaces).

**Adapt for MVP:**
- Support queries like: "Who was appointed Deputy Mayor in January 2025?"
- Convert to SPARQL: `?person org:post seattle:DeputyMayorPost . FILTER (year(?date) = 2025)`
- Show query parsing feedback: "Searching for: Person with role Deputy Mayor between 2025-01-01 and 2025-01-31"

### 3.3 Correction Chain Visualization

**Supersession Relationship Pattern:**

Wikidata-style correction tracking requires showing how claims evolve:

```
Claim Evolution: Tim Burgess Role
──────────────────────────────────────────────────────────────────►
  2025-01-10          2025-01-12            2025-01-15
  ┌──────────┐        ┌──────────┐         ┌──────────┐
  │ Chief of │        │ Deputy   │         │ Deputy   │
  │  Staff   │────X──►│  Mayor   │─────────►  Mayor   │
  │          │        │          │         │          │
  │ Source:  │        │ Source:  │         │ Source:  │
  │ Stranger │        │ PubliCola│         │ SeaTimes │
  │          │        │          │         │ (confirms)│
  │ Normal   │        │ Preferred│         │ Preferred│
  └──────────┘        └──────────┘         └──────────┘
       ↑                    ↑                    ↑
       │                    │                    │
   supersededBy         supersededBy         CURRENT
  (deprecated)         (strengthened)        (3 sources)
```

**UI Components:**

1. **Horizontal Timeline Flow**: Left to right, chronological
2. **Claim Cards**: Show summary (predicate/object, source, rank)
3. **Supersession Arrows**:
   - Red X arrow for deprecated relationships
   - Green arrow for confirmations
   - Yellow arrow for amendments
4. **Rank Badges**: Color-coded (Preferred=green, Deprecated=red)
5. **Source Count Indicators**: "3 sources" badge on final claim

**Interaction:**
- Click claim card → expand to show full evidence
- Hover arrow → show deprecation reason
- Filter view: "Show only corrections" vs "Show all claim versions"

**Implementation:**
```sparql
# Query for supersession chain
PREFIX claims: <http://effect-ontology.dev/claims#>

SELECT ?claim ?rank ?source ?supersedes WHERE {
  ?claim claims:claimSubject seattle:TimBurgess ;
         claims:claimPredicate org:post ;
         claims:rank ?rank ;
         claims:statedIn ?source .
  OPTIONAL { ?claim claims:supersedes ?supersedes }
}
ORDER BY ?extractedAt
```

---

## 4. Reference Implementations

### 4.1 Wikidata UI Patterns

**Ranking Interface** (from [Wikidata Help:Ranking](https://www.wikidata.org/wiki/Help:Ranking)):

**Key Insights:**
- Default rank is "normal"
- Preferred ranks shown prominently (bold, larger text)
- Deprecated values kept for audit trail but visually de-emphasized
- Qualifiers provide editorial context: `reason for deprecated rank`, `reason for preferred rank`

**Wikidata UI Issues** (from community feedback at [Wikidata:UI redesign input](https://www.wikidata.org/wiki/Wikidata:UI_redesign_input)):

> Users noted that "the 'preferred value' doesn't really stick out." Reasonator was cited as doing a better job by making the preferred statement bold and larger print.

**Recommendation for MVP:**
- **Make rank differences prominent**: Large visual gap between Preferred and Deprecated
- **Use size hierarchy**: Preferred claims 18px, Normal 14px, Deprecated 12px with strikethrough
- **Add rank badges**: ⭐ Preferred, ➖ Normal, ⚠ Deprecated
- **Customizable styling**: Let advanced users customize via CSS (like Wikidata's common.css)

**Wikidata Query Service Pattern:**
- Interactive SPARQL editor with autocomplete
- Visual query builder for non-technical users
- "Truthy" queries use rank to filter results (Preferred + Normal, exclude Deprecated)

**Adapt for MVP:**
- Provide **simple query builder** for common patterns
- Default filters: Show Preferred only
- Advanced mode: SPARQL editor with ontology autocomplete

### 4.2 News Aggregator UIs

**Ground News Pattern** (from [Ground News](https://ground.news/)):

**Features:**
- **Source bias labels**: Center, Left, Moderate Left, etc.
- **Overall grade**: Averages outlet quality, author expertise, quote quality, tone
- **Diversity of sources**: Visual indicator of how many outlets covered story
- **Unique links**: Count of distinct sources cited

**AllSides Pattern** (from [AllSides](https://www.allsides.com/unbiased-balanced-news)):

> AllSides acknowledges that unbiased news coverage doesn't exist and uses technology and diverse perspectives to provide balance.

**Key Insight:** Rather than claiming objectivity, show multiple perspectives side-by-side.

**Adapt for Seattle Politics MVP:**

```
┌────────────────────────────────────────────────────────────────┐
│ Story: Tim Burgess Appointment                                 │
├────────────────────────────────────────────────────────────────┤
│ Coverage: 4 sources | Agreement: 75% (3/4 agree)               │
│                                                                  │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│ │ Seattle Times│  │  PubliCola   │  │  Crosscut    │          │
│ │ "Deputy      │  │ "Deputy      │  │ "Deputy      │          │
│ │  Mayor"      │  │  Mayor"      │  │  Mayor"      │          │
│ │ ✓ Agrees     │  │ ✓ Agrees     │  │ ✓ Agrees     │          │
│ └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│ ┌──────────────┐                                                │
│ │ The Stranger │                                                │
│ │ "Chief of    │                                                │
│ │  Staff"      │                                                │
│ │ ⚠ Disagrees  │  [Later corrected →]                          │
│ └──────────────┘                                                │
└────────────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Green checkmarks for agreeing sources
- Yellow warning for disagreements
- Timeline shows correction sequence
- Source count badge: "4 sources" with breakdown

### 4.3 Knowledge Graph Explorers

**Neo4j Bloom** (from [Neo4j Bloom guide](https://neo4j.com/docs/bloom-user-guide/current/)):

**Key UX Patterns:**

1. **Perspectives**: Business views of data
   - Sales perspective vs Marketing perspective
   - Adapt: "Current State" (Preferred only) vs "Audit Trail" (all ranks)

2. **Graph Pattern Searches**: Natural language-like
   - Example: `Episode -[:IN_SERIES] -> Series`
   - Adapt: `Person -[:org:post] -> Post -[:org:postIn] -> Organization`

3. **Scene Interactions**:
   - Click nodes to move manually
   - Right-click for context menus
   - Adapt: Right-click claim → "View evidence", "Show supersession chain"

4. **Auto-Generation**: Quick database scan for schema
   - Adapt: Auto-generate entity overview from RDF classes

**Implementation Tips** (from [Neo4j Bloom tips](https://medium.com/neo4j/tips-and-tricks-in-neo4j-bloom-41e4b3b1cc8f)):

> Bloom takes relationship types, converts them to lower case and splits out words (replacing underscores with spaces). This not only makes UX more friendly, but places emphasis on good data model.

**Adapt for RDF:**
- Convert `org:post` → "post"
- Convert `claims:supersedes` → "supersedes"
- Show rdfs:label values instead of IRIs where available

**GraphDB Workbench / Stardog Studio:**
- SPARQL query editor with visual results
- Graph exploration from query results
- Ontology schema visualization
- SHACL validation reports

**Adapt for MVP:**
- Provide **SPARQL query interface** for power users
- **Visual results**: Query results render as node-link graph
- **Validation reports**: Show SHACL constraint violations with context

---

## 5. Technology Recommendations

### 5.1 React Graph Visualization Libraries

Based on research ([React graph libraries comparison](https://npm-compare.com/cytoscape,graphlib,graphology,vis-network)):

**Recommended: Cytoscape.js + react-cytoscapejs**

**Pros:**
- **Mature ecosystem**: Created at University of Toronto, published in Oxford Bioinformatics
- **Large graph support**: Thousands of nodes/edges
- **Extensive layout algorithms**: Force-directed, hierarchical, circular, COSEBilkent
- **React integration**: `react-cytoscapejs` maintained by Plotly
- **RDF-friendly**: JSON data format maps cleanly to RDF triples
- **Styling flexibility**: CSS-like style sheets for nodes/edges

**Cons:**
- Steeper learning curve than vis-network
- Canvas rendering (vs React Flow's DOM rendering)

**Sample Integration:**
```typescript
import CytoscapeComponent from 'react-cytoscapejs'

const elements = [
  { data: { id: 'TimBurgess', label: 'Tim Burgess', type: 'Person' } },
  { data: { id: 'DeputyMayorPost', label: 'Deputy Mayor', type: 'Post' } },
  {
    data: {
      id: 'edge1',
      source: 'TimBurgess',
      target: 'DeputyMayorPost',
      label: 'org:post',
      rank: 'Preferred',
      confidence: 0.95
    }
  }
]

const stylesheet = [
  {
    selector: 'node[type="Person"]',
    style: { 'background-color': '#3b82f6', shape: 'ellipse' }
  },
  {
    selector: 'node[type="Post"]',
    style: { 'background-color': '#10b981', shape: 'rectangle' }
  },
  {
    selector: 'edge[rank="Preferred"]',
    style: { 'line-color': '#10b981', 'line-style': 'solid' }
  },
  {
    selector: 'edge[rank="Deprecated"]',
    style: { 'line-color': '#ef4444', 'line-style': 'dotted' }
  }
]

<CytoscapeComponent
  elements={elements}
  stylesheet={stylesheet}
  layout={{ name: 'cose' }}
  style={{ width: '100%', height: '600px' }}
/>
```

**Alternative: React Flow (XyFlow)**

**Pros:**
- HTML DOM rendering (easier custom node styling)
- Strong workflow/node-based UI focus
- Built-in drag-and-drop
- Better for hierarchical/directed flows

**Cons:**
- Less suitable for large, highly-connected graphs
- Fewer layout algorithms than Cytoscape

**Recommendation:**
- **Use Cytoscape** for entity relationship graph (main view)
- **Use React Flow** if building admin workflow builder (future)

**Alternative: Reagraph (WebGL)**

For very large graphs (>10,000 nodes):
- WebGL-based, high performance
- 3D graph option
- More complex integration

### 5.2 Timeline Visualization Libraries

**Recommended: Vis.js Timeline**

**Pros:**
- **Dual components**: Vis-timeline (events) + vis-network (graphs) designed to work together
- **Range support**: Perfect for claim validFrom/validUntil intervals
- **Grouping**: Swim lanes by entity
- **Zoom/pan**: Built-in navigation
- **Styling**: CSS customization

**Sample Integration:**
```typescript
import { Timeline } from 'vis-timeline/standalone'

const items = [
  {
    id: 1,
    content: 'Tim Burgess → Deputy Mayor',
    start: '2025-01-01',
    end: null, // Ongoing
    group: 'TimBurgess',
    className: 'preferred-claim',
    rank: 'Preferred'
  },
  {
    id: 2,
    content: 'Chief of Staff (deprecated)',
    start: '2025-01-10',
    end: '2025-01-15',
    group: 'TimBurgess',
    className: 'deprecated-claim',
    rank: 'Deprecated'
  }
]

const groups = [
  { id: 'TimBurgess', content: 'Tim Burgess' },
  { id: 'AlexJohnson', content: 'Alex Johnson' }
]

const timeline = new Timeline(container, items, groups, {
  editable: false,
  zoomable: true,
  stack: true,
  showCurrentTime: true
})
```

**Alternative: D3 Timeline (Custom)**

**Pros:**
- Full control over rendering
- Seamless integration with D3-based graph (if using D3 instead of Cytoscape)
- Custom interactions

**Cons:**
- Higher implementation cost
- Must build zoom/pan from scratch

**Recommendation:**
- **Use Vis.js Timeline** for MVP (faster implementation)
- **Migrate to D3** if custom interactions become critical

### 5.3 Text Annotation Libraries

**Recommended: react-text-annotate**

From research ([react-text-annotate](https://github.com/mcamac/react-text-annotate)):

**Pros:**
- Interactive highlighting
- Selection detection callbacks
- Supports overlapping annotations (critical for multi-claim text)
- MIT licensed

**Sample Integration:**
```typescript
import { TextAnnotator } from 'react-text-annotate'

const article = {
  text: "Seattle Mayor Katie Wilson announced her senior staff today. Tim Burgess will serve as Deputy Mayor, bringing decades of public service...",
  annotations: [
    {
      start: 63,
      end: 107,
      tag: 'CLAIM',
      claimId: 'Claim_001',
      rank: 'Preferred',
      confidence: 0.95
    }
  ]
}

<TextAnnotator
  content={article.text}
  value={article.annotations}
  onChange={(annotations) => console.log(annotations)}
  getSpan={(span) => ({
    ...span,
    style: {
      backgroundColor: span.rank === 'Preferred' ? '#10b981' : '#fbbf24'
    }
  })}
/>
```

**Enhancement: Custom Highlight Renderer**

Support overlapping claims:
```typescript
// Custom renderer for stacked highlights
const MultiClaimHighlight = ({ claims, text }) => {
  return (
    <span className="relative group">
      <span className="bg-green-200 border-b-2 border-green-600">
        {text}
      </span>
      <div className="hidden group-hover:block absolute z-10 bg-white shadow-lg p-2">
        <h4 className="font-bold">3 claims extracted:</h4>
        {claims.map(claim => (
          <div key={claim.id} className="border-l-4 border-green-600 pl-2">
            {claim.subject} → {claim.object}
            <span className="text-sm text-gray-600">
              ({claim.source}, {claim.confidence})
            </span>
          </div>
        ))}
      </div>
    </span>
  )
}
```

**Alternative: Recogito.js (if W3C Annotation compliance critical)**

Implements full W3C Web Annotation Data Model:
- oa:TextPositionSelector support
- Export to JSON-LD
- More complex API

**Recommendation:**
- **Use react-text-annotate** for MVP
- Add W3C export serializer separately if needed

### 5.4 UI Component Framework

**Recommended Stack:**

1. **React 18+** with TypeScript
2. **Tailwind CSS** for styling (from existing web package if present)
3. **Shadcn/ui** or **Radix UI** for accessible components (dropdowns, dialogs, tooltips)
4. **TanStack Query** (React Query) for data fetching/caching
5. **Zustand** or **Jotai** for client state (selected entities, UI filters)

**Rationale:**
- **Effect-TS integration**: Can wrap Effect programs in React Query mutations
- **Accessibility**: Radix primitives ensure WCAG compliance
- **Performance**: Tailwind JIT, TanStack Query caching
- **Developer experience**: TypeScript + Effect types end-to-end

**Sample Architecture:**
```typescript
// React Query wrapper for Effect program
import { useMutation } from '@tanstack/react-query'
import { Effect, Runtime } from 'effect'
import { BatchWorkflow } from '@core-v2/Workflow/BatchWorkflow'

const useExtractBatch = () => {
  return useMutation({
    mutationFn: async (articleUri: string) => {
      const program = BatchWorkflow.extractArticle(articleUri)
      const runtime = Runtime.defaultRuntime
      return Runtime.runPromise(runtime)(program)
    }
  })
}

// Component
const BatchExtractor = () => {
  const extract = useExtractBatch()

  return (
    <button
      onClick={() => extract.mutate('http://article/123')}
      disabled={extract.isPending}
    >
      {extract.isPending ? 'Extracting...' : 'Extract Claims'}
    </button>
  )
}
```

---

## 6. Wireframe Descriptions

### 6.1 Main Application Layout

```
┌────────────────────────────────────────────────────────────────┐
│ [Effect Ontology]  Search: [____________] [Filters ▼] [Login] │
├────────┬───────────────────────────────────────────────────────┤
│ Nav    │                                                        │
│        │  ┌─────────────────────────────────────────────────┐ │
│ • Home │  │         Timeline View (Top Panel)               │ │
│ • News │  │  ┌──────────────────────────────────────────┐   │ │
│ • Graph│  │  │ 2025-01-10 | Seattle Times               │   │ │
│ • Query│  │  │ Katie Wilson announces senior staff      │   │ │
│ • Admin│  │  │ 3 claims extracted | Confidence: 0.93    │   │ │
│        │  │  │ [View article] [Show in graph]           │   │ │
│        │  │  └──────────────────────────────────────────┘   │ │
│        │  │  ┌──────────────────────────────────────────┐   │ │
│        │  │  │ 2025-01-15 | The Stranger                 │   │ │
│        │  │  │ Correction: Burgess role clarified       │   │ │
│        │  │  │ 1 claim | Supersedes previous claim      │   │ │
│        │  │  └──────────────────────────────────────────┘   │ │
│        │  └─────────────────────────────────────────────────┘ │
│        │                                                        │
│        │  ┌─────────────────────────────────────────────────┐ │
│        │  │         Entity Graph (Bottom Panel)             │ │
│        │  │                                                  │ │
│        │  │      ┌─────────┐    org:post    ┌──────────┐   │ │
│        │  │      │  Tim    │◄────────────────│  Deputy  │   │ │
│        │  │      │ Burgess │                 │  Mayor   │   │ │
│        │  │      └─────────┘                 └────┬─────┘   │ │
│        │  │                                       │          │ │
│        │  │                                org:postIn        │ │
│        │  │                                       ↓          │ │
│        │  │      ┌─────────┐                ┌──────────┐   │ │
│        │  │      │  Katie  │─org:member────►│ Mayor's  │   │ │
│        │  │      │ Wilson  │                 │ Office   │   │ │
│        │  │      └─────────┘                └──────────┘   │ │
│        │  │                                                  │ │
│        │  │  [Layout: Force ▼] [Labels: Show ▼] [Export]   │ │
│        │  └─────────────────────────────────────────────────┘ │
│        │                                                        │
└────────┴────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Split-pane layout**: Timeline (top) + Graph (bottom)
- **Synchronized views**: Clicking timeline article highlights related entities in graph
- **Resizable panels**: Drag divider to adjust timeline/graph ratio
- **Responsive**: Collapse to tabs on mobile

### 6.2 Article Detail View with Evidence

```
┌────────────────────────────────────────────────────────────────┐
│ ← Back to Timeline                        [Share] [Export]     │
├────────────────────────────────────────────────────────────────┤
│ Seattle Times | Jan 10, 2025 | Katie Wilson announces staff   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Article Text (with highlights):                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Seattle Mayor Katie Wilson announced her senior staff    │  │
│ │ today. [Tim Burgess will serve as Deputy Mayor],         │  │
│ │         ︿──────────────────────────────────────︿         │  │
│ │         ✓ Preferred claim (click for details)            │  │
│ │                                                            │  │
│ │ bringing decades of public service experience to the     │  │
│ │ role. [Alex Johnson will lead the Transportation         │  │
│ │        ︿──────────────────────────────────────            │  │
│ │        ✓ Preferred claim                                  │  │
│ │                                                            │  │
│ │ Department], focusing on expanding light rail...         │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Extracted Claims (3):                                           │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ ⭐ Tim Burgess → Deputy Mayor                              │  │
│ │    Confidence: 0.95 | Evidence: chars 63-107             │  │
│ │    [Jump to text] [View in graph]                         │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ⭐ Alex Johnson → Transportation Commissioner              │  │
│ │    Confidence: 0.92 | Evidence: chars 180-235            │  │
│ │    [Jump to text] [View in graph]                         │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ⭐ Katie Wilson → Mayor                                    │  │
│ │    Confidence: 0.99 | Evidence: chars 0-25               │  │
│ │    [Jump to text] [View in graph]                         │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Hover highlight**: Tooltip shows claim summary
- **Click highlight**: Opens claim detail panel (right sidebar)
- **Jump to text**: Scrolls article to offset, animates highlight
- **View in graph**: Switches to graph view, focuses on entity

### 6.3 Entity Detail with Claim History

```
┌────────────────────────────────────────────────────────────────┐
│ Entity: Tim Burgess                              foaf:Person   │
│ ──────────────────────────────────────────────────────────     │
│ IRI: http://seattle/entity/TimBurgess                          │
├────────────────────────────────────────────────────────────────┤
│ Tabs: [Overview] [Claim History] [Timeline] [Related Entities]│
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Current Roles (Preferred claims only):                          │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ • Deputy Mayor (City of Seattle)                          │  │
│ │   Since: 2025-01-01 | Confidence: 0.95 | 3 sources       │  │
│ │   [View details]                                          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Claim History (Timeline view):                                  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Tim Burgess Roles                                         │  │
│ │ ─────────────────────────────────────────────────────────►│  │
│ │     2024-11         2025-01             2025-06           │  │
│ │        │─Policy Dir─│────Deputy Mayor────────────►        │  │
│ │                      │(Chief of Staff)│ ← Deprecated      │  │
│ │                                                            │  │
│ │ Legend: [──Preferred] [──Normal] [─⚠─Deprecated]          │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│ All Claims (5):                                                 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ ⭐ Deputy Mayor | 2025-01-01 → ∞                           │  │
│ │    Sources: Seattle Times, PubliCola, Crosscut (3)       │  │
│ │    Confidence: 0.95 | [View evidence]                     │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ⚠ Chief of Staff | 2025-01-10 → 2025-01-15 (deprecated)  │  │
│ │    Source: The Stranger                                   │  │
│ │    Superseded by: Deputy Mayor claim                      │  │
│ │    Reason: Source issued correction                       │  │
│ │    [View correction chain]                                │  │
│ ├──────────────────────────────────────────────────────────┤  │
│ │ ➖ Policy Director | 2024-11-01 → 2024-12-31 (normal)     │  │
│ │    Source: Mayor's Office press release                   │  │
│ │    Historical role | [View details]                       │  │
│ └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│ Related Entities:                                               │
│ • Katie Wilson (Mayor) - appointed Burgess                     │
│ • Mayor's Office (Organization) - current employer             │
│ • Deputy Mayor Post (Post) - current position                  │
│                                                                  │
│ [View full graph] [Export entity data] [Download RDF]          │
└────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Tabbed interface**: Overview, Claim History, Timeline, Related Entities
- **Temporal swim lane**: Visual claim evolution over time
- **Rank styling**: Preferred (green star), Normal (dash), Deprecated (warning icon + strikethrough)
- **Source aggregation**: "3 sources" with expandable list
- **Supersession links**: Navigate correction chains

### 6.4 Conflict Resolution Interface

```
┌────────────────────────────────────────────────────────────────┐
│ Conflict Detected: Tim Burgess Role (January 2025)            │
├────────────────────────────────────────────────────────────────┤
│ 4 sources, 2 distinct values:                                  │
│                                                                  │
│ Agreement Meter: ███████▒▒▒ 75% (3 of 4 sources agree)        │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ CONSENSUS (3 sources):                                    │   │
│ │ ⭐ Deputy Mayor                                            │   │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│ │ │Seattle Times│ │  PubliCola  │ │  Crosscut   │         │   │
│ │ │ 2025-01-10  │ │ 2025-01-11  │ │ 2025-01-12  │         │   │
│ │ │ Conf: 0.95  │ │ Conf: 0.93  │ │ Conf: 0.91  │         │   │
│ │ │ "...deputy  │ │ "...deputy  │ │ "...serve   │         │   │
│ │ │  mayor..."  │ │  mayor..."  │ │  as deputy" │         │   │
│ │ └─────────────┘ └─────────────┘ └─────────────┘         │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ CONFLICTING (1 source):                                   │   │
│ │ ⚠ Chief of Staff                                          │   │
│ │ ┌─────────────┐                                          │   │
│ │ │The Stranger │                                          │   │
│ │ │ 2025-01-12  │  ← LATER CORRECTED (2025-01-15)         │   │
│ │ │ Conf: 0.88  │  [View correction article →]            │   │
│ │ │ "...chief of│                                          │   │
│ │ │  staff..."  │                                          │   │
│ │ └─────────────┘                                          │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│ Resolution Timeline:                                            │
│ 2025-01-10    2025-01-11    2025-01-12    2025-01-15          │
│    ✓             ✓            ⚠             ✓                  │
│ SeaTimes     PubliCola    Stranger      Correction             │
│ Deputy        Deputy       Chief         Confirms              │
│ Mayor         Mayor        of Staff      Deputy Mayor          │
│                                                                  │
│ Current Status:                                                 │
│ ✓ Deputy Mayor (PREFERRED) - Supersedes conflicting claim     │
│ ⚠ Chief of Staff (DEPRECATED) - Corrected by source           │
│                                                                  │
│ [Accept consensus] [Flag for review] [View full history]       │
└────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Agreement visualization**: Percentage bar + source count
- **Side-by-side comparison**: Consensus vs conflicting claims
- **Source cards**: Outlet, date, confidence, evidence quote
- **Correction indicators**: Link to correction article
- **Resolution timeline**: Chronological sequence of claims
- **Action buttons**: Accept, flag, or review

---

## 7. MVP Implementation Recommendations

### 7.1 Phased Rollout

**Phase 1: Core Timeline + Article View (Weeks 1-3)**

Components:
- Timeline list (Postgres queries)
- Article detail with text highlighting
- Basic claim cards
- PostgreSQL full-text search

Tech Stack:
- React + TypeScript
- TanStack Query for data fetching
- react-text-annotate for highlights
- Tailwind CSS + Shadcn/ui components

**Phase 2: Entity Graph Visualization (Weeks 4-6)**

Components:
- Cytoscape.js graph rendering
- Entity detail pages
- Claim history timeline
- Basic SPARQL query interface

Tech Stack:
- react-cytoscapejs
- Vis.js Timeline for entity state changes
- Graph layout algorithms (COSEBilkent)

**Phase 3: Conflict Resolution + Advanced Features (Weeks 7-9)**

Components:
- Conflict detection UI
- Supersession chain visualization
- Multi-source aggregation
- Advanced filtering

Tech Stack:
- Custom conflict resolver
- Postgres + RDF hybrid queries
- Enhanced Cytoscape styling

**Phase 4: Admin Tools + Polish (Weeks 10-12)**

Components:
- Batch extraction UI
- SHACL validation reports
- User preferences (rank visibility, source filters)
- Export (CSV, JSON-LD, Turtle)

### 7.2 Critical UX Decisions

**1. Default View: Timeline or Graph?**

**Recommendation: Timeline-first**
- Rationale: News domain is inherently chronological
- Users familiar with "news feed" mental model
- Graph available as secondary view (tab or split panel)

**2. Claim Rank Visibility: Default to Preferred only?**

**Recommendation: Yes, with toggle**
- Default: Show Preferred claims only (cleanest UX)
- Advanced toggle: "Show all ranks" reveals Normal + Deprecated
- Audit mode: "Show deprecated only" for fact-checking

**3. Evidence Display: Inline or Panel?**

**Recommendation: Inline highlights with detail panel**
- Inline: Immediate visual context in article text
- Panel: Opens on click with full claim provenance
- Avoids clutter while preserving deep access

**4. Graph Layout: Force-directed or Hierarchical?**

**Recommendation: Force-directed with manual override**
- Force-directed (COSEBilkent) for general exploration
- Hierarchical option for org charts (Person → Post → Organization)
- Allow manual node dragging with position persistence

### 7.3 Accessibility Considerations

**WCAG 2.1 AA Compliance:**

1. **Color Contrast**: Rank colors must meet 4.5:1 ratio
   - Preferred: Green (#10b981) on white background ✓
   - Deprecated: Red (#ef4444) + strikethrough (not color alone) ✓

2. **Keyboard Navigation**:
   - Tab through timeline cards, graph nodes
   - Enter to expand/select
   - Escape to close modals

3. **Screen Reader Support**:
   - ARIA labels on graph nodes: `aria-label="Tim Burgess, Person, 2 claims"`
   - Announce claim rank: "Preferred claim" vs "Deprecated claim"
   - Timeline semantic HTML: `<article>`, `<time>`, `<h2>`

4. **Focus Indicators**: Visible focus rings on all interactive elements

5. **Alternative Text**: Provide text alternative for graph visualizations
   - Option: "View as list" converts graph to accessible table

### 7.4 Performance Targets

**Timeline View:**
- Initial load: <2s (Postgres index query)
- Scroll pagination: <500ms per page
- Full-text search: <1s

**Graph View:**
- Graph render (500 nodes): <3s
- Interaction (pan/zoom): 60fps
- Layout recalculation: <5s

**Article Detail:**
- Article text load: <1s
- Highlight rendering: <500ms
- RDF graph fetch: <2s (GCS + N3.js parse)

**Optimization Strategies:**
- Lazy-load RDF graphs (fetch on-demand)
- Virtualize timeline list (react-window)
- Debounce search input (300ms)
- Cache Cytoscape layouts (LocalStorage)

---

## 8. Open Questions and Future Research

### 8.1 Temporal Query UX

**Question**: How to support complex temporal queries like "Who held Deputy Mayor post during January 2025?"

**Options:**
1. Natural language query → SPARQL translation (LLM-powered)
2. Visual query builder with temporal predicates
3. Timeline scrubbing: "Rewind to date X"

**Recommendation**: Research Neo4j Bloom's near-natural language approach + timeline scrubbing for MVP.

### 8.2 Multi-Lingual Support

**Question**: If extracting from non-English sources, how to visualize translated claims?

**Options:**
1. Store rdfs:label in multiple languages
2. Translation service integration
3. Language toggle in UI

**Recommendation**: Defer to Phase 2; focus on English-only for Seattle MVP.

### 8.3 Collaborative Curation

**Question**: Should multiple users be able to curate claims (promote/deprecate ranks)?

**Options:**
1. Admin-only curation
2. Community voting (Reddit-style)
3. Expert review workflow

**Recommendation**: Start with admin-only; research Wikidata's curation model for future.

### 8.4 Real-Time Updates

**Question**: Should UI show live updates as new articles are extracted?

**Options:**
1. WebSocket for real-time timeline updates
2. Polling (every 30s)
3. Manual refresh

**Recommendation**: Polling for MVP; WebSocket for production if monitoring live news feeds.

---

## 9. References and Sources

### Research Papers
- [Knowledge Graphs in Practice: Characterizing Users, Challenges, and Visualization](https://arxiv.org/html/2304.01311v4)
- [Pattern-based Visualization of Knowledge Graphs](https://ar5iv.labs.arxiv.org/html/2106.12857)
- [Guidelines for Effective Usage of Text Highlighting](https://dl.acm.org/doi/10.1109/TVCG.2015.2467759)

### Tools and Platforms
- [Knowledge graph visualization guide](https://datavid.com/blog/knowledge-graph-visualization) - DataVid
- [Neo4j Bloom User Guide](https://neo4j.com/docs/bloom-user-guide/current/)
- [Neo4j Bloom tips and tricks](https://medium.com/neo4j/tips-and-tricks-in-neo4j-bloom-41e4b3b1cc8f)
- [Wikidata Help: Ranking](https://www.wikidata.org/wiki/Help:Ranking)
- [Wikidata UI redesign input](https://www.wikidata.org/wiki/Wikidata:UI_redesign_input)
- [Grafana State Timeline](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/state-timeline/)

### News Aggregators
- [Ground News](https://ground.news/) - Multi-source news aggregation
- [AllSides](https://www.allsides.com/unbiased-balanced-news) - Balanced news perspectives
- [MIT Trustnet](https://news.mit.edu/2024/new-tool-trustnet-empowers-users-to-fight-online-misinformation-0516) - Decentralized fact-checking

### React Libraries
- [React graph libraries comparison](https://npm-compare.com/cytoscape,graphlib,graphology,vis-network)
- [Cytoscape.js](https://js.cytoscape.org) - Graph visualization
- [react-cytoscapejs](https://github.com/plotly/react-cytoscapejs) - React wrapper
- [React Flow](https://reactflow.dev/) - Node-based UIs
- [Vis.js Timeline](https://visjs.org/) - Timeline visualization
- [react-text-annotate](https://github.com/mcamac/react-text-annotate) - Text highlighting
- [React Text Annotation (Medium-like)](https://pargles.com/posts/medium-like-text-highlighting-in-react)

### Web Standards
- [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-vocab/)
- [W3C Organization Ontology](https://www.w3.org/TR/vocab-org/)
- [PROV-O](https://www.w3.org/TR/prov-o/)

### Internal Documentation
- `/packages/@core-v2/docs/mvp/ontology_web_vis_research.md` - Existing visualization research
- `/packages/@core-v2/docs/mvp/ARCHITECTURAL_DECISIONS_MVP.md` - Architecture decisions
- `/ontologies/claims/claims.ttl` - Claims ontology specification
- `/ontologies/seattle/README.md` - Seattle domain ontology

---

## Appendix: Component Sketches

### A.1 Claim Card Component

```typescript
interface ClaimCardProps {
  claim: {
    id: string
    subject: string
    predicate: string
    object: string
    rank: 'Preferred' | 'Normal' | 'Deprecated'
    confidence: number
    validFrom: Date
    validUntil?: Date
    sources: Array<{ name: string; publishedAt: Date }>
    evidence: Array<{ text: string; offset: number }>
  }
  onViewEvidence: () => void
  onViewInGraph: () => void
}

const ClaimCard: React.FC<ClaimCardProps> = ({ claim, onViewEvidence, onViewInGraph }) => {
  const rankIcon = {
    Preferred: '⭐',
    Normal: '➖',
    Deprecated: '⚠'
  }[claim.rank]

  const rankColor = {
    Preferred: 'border-green-600 bg-green-50',
    Normal: 'border-gray-400 bg-gray-50',
    Deprecated: 'border-red-600 bg-red-50'
  }[claim.rank]

  return (
    <div className={`border-l-4 p-4 rounded ${rankColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-2xl mr-2">{rankIcon}</span>
          <span className="font-semibold">{claim.subject}</span>
          <span className="text-gray-600 mx-2">→</span>
          <span className="font-semibold">{claim.object}</span>
        </div>
        <span className="text-sm text-gray-600">
          Confidence: {(claim.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="mt-2 text-sm text-gray-700">
        <span>Valid from: {claim.validFrom.toLocaleDateString()}</span>
        {claim.validUntil && (
          <span> → {claim.validUntil.toLocaleDateString()}</span>
        )}
      </div>

      <div className="mt-2 text-sm">
        <span className="font-medium">Sources ({claim.sources.length}):</span>
        {claim.sources.map((s, i) => (
          <span key={i} className="ml-2 text-blue-600">
            {s.name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onViewEvidence}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View Evidence
        </button>
        <button
          onClick={onViewInGraph}
          className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
        >
          Show in Graph
        </button>
      </div>
    </div>
  )
}
```

### A.2 Timeline-Graph Sync Pattern

```typescript
const TimelineGraphView = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [graphEntities, setGraphEntities] = useState<string[]>([])

  // When article selected in timeline, load its entities into graph
  const handleArticleClick = async (articleUri: string) => {
    setSelectedArticle(articleUri)

    // Fetch claims from article
    const claims = await fetchClaimsForArticle(articleUri)

    // Extract unique entity IRIs
    const entities = new Set<string>()
    claims.forEach(claim => {
      entities.add(claim.subject)
      entities.add(claim.object)
    })

    setGraphEntities(Array.from(entities))
  }

  // When entity selected in graph, filter timeline to articles mentioning it
  const handleEntityClick = (entityIri: string) => {
    // Filter timeline to show only articles with claims about this entity
    // Implementation depends on timeline component API
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="h-1/2 border-b">
        <Timeline
          articles={articles}
          selectedArticle={selectedArticle}
          onArticleClick={handleArticleClick}
        />
      </div>
      <div className="h-1/2">
        <EntityGraph
          entities={graphEntities}
          onEntityClick={handleEntityClick}
        />
      </div>
    </div>
  )
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Status**: Research Complete - Ready for Implementation Planning
