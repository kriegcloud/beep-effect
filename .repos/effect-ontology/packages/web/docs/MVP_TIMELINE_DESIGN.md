# MVP Timeline Design: Austere & Minimal

## Design Philosophy

**Aesthetic Direction: Industrial Brutalism**
- Monochrome palette with single accent color (cyan)
- No decorative elements, no gradients, no shadows
- Data-dense, newspaper-like information hierarchy
- Keyboard-first interaction
- Typography as the primary design element

**What makes this unforgettable**: Raw data clarity. Every pixel serves the data. The interface disappears, leaving only knowledge.

---

## Single View Architecture

One page. One purpose. **Timeline with inline ontology exploration.**

```
┌─────────────────────────────────────────────────────────────────────┐
│  effect-ontology                                    [status] [kbd?] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TIMELINE                                              [filters ▾]  │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  2024-12-19 ───────────────────────────────────────────────────────│
│                                                                     │
│  ┌─ claim ──────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Bruce Harrell  →  holdsPosition  →  Mayor of Seattle        │  │
│  │  ────────────────────────────────────────────────────────────│  │
│  │  Person                          Position                    │  │
│  │  ▸ see ontology: schema:Person   ▸ schema:GovernmentRole     │  │
│  │                                                               │  │
│  │  ○ preferred   from: seattle-times-2024-001   conf: 0.94     │  │
│  │  valid: 2022-01-01 → present                                 │  │
│  │                                                               │  │
│  │  "...Bruce Harrell was inaugurated as the 57th Mayor..."     │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ claim ──────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │  Jenny Durkan  →  holdsPosition  →  Mayor of Seattle         │  │
│  │  ────────────────────────────────────────────────────────────│  │
│  │  Person                          Position                    │  │
│  │                                                               │  │
│  │  ○ deprecated  supersededBy: claim-xyz   conf: 0.91          │  │
│  │  valid: 2018-01-01 → 2021-12-31                              │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  ONTOLOGY                                                          │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ▾ schema:Person                                                   │
│    ├─ schema:name          rdfs:Literal                            │
│    ├─ schema:birthDate     xsd:date                                │
│    └─ ex:holdsPosition     → schema:Role                           │
│                                                                     │
│  ▸ schema:Organization                                             │
│  ▸ schema:Role                                                     │
│  ▸ schema:Place                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Header (Minimal)
```
effect-ontology                              ● online    [?]
```
- Logo text only, no icons
- Single status dot (green/red)
- Keyboard shortcut hint `[?]`

### 2. Timeline Section

**Date Dividers**
```
2024-12-19 ─────────────────────────────────────────────────
```
- ISO date, left-aligned
- Horizontal rule extending full width
- Groups claims by assertion date

**Claim Cards**
```
┌─ claim ──────────────────────────────────────────────────┐
│                                                          │
│  Subject  →  Predicate  →  Object                        │
│  ──────────────────────────────────────────────────────  │
│  [Type]                   [Type]                         │
│                                                          │
│  ○ rank   source: article-id   confidence: 0.XX         │
│  valid: YYYY-MM-DD → YYYY-MM-DD                         │
│                                                          │
│  "evidence text snippet..."                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Rank Indicators (Text-only)**
- `○ preferred` — Current truth
- `○ normal` — Supporting claim
- `○ deprecated` — Superseded (strikethrough subject→predicate→object)

**Inline Type Links**
- Click type to scroll to ontology section
- Hover shows full IRI

### 3. Ontology Browser (Collapsible Tree)

```
▾ schema:Person
  ├─ schema:name          rdfs:Literal
  ├─ schema:birthDate     xsd:date
  └─ ex:holdsPosition     → schema:Role

▸ schema:Organization
▸ schema:Role
```

- Collapsible class hierarchy
- Properties listed under each class
- Range types shown (linked if class)
- `▾` expanded, `▸` collapsed
- Click class name to filter timeline by type

---

## Interactions

### Keyboard Navigation
| Key | Action |
|-----|--------|
| `j` / `k` | Next/previous claim |
| `o` | Toggle ontology panel |
| `f` | Focus filter input |
| `enter` | Expand selected claim |
| `esc` | Clear selection/close |
| `?` | Show keyboard shortcuts |

### Filters (Minimal Dropdown)
```
[filters ▾]
  ○ All claims
  ○ Preferred only
  ○ With conflicts
  ──────────────
  Type: [          ]
  Subject: [       ]
```

### Click Interactions
- **Claim** → Expand to show full evidence text
- **Type badge** → Filter by type + scroll to ontology
- **Source link** → Open article detail (modal or navigate)
- **Ontology class** → Filter timeline by instances

---

## Color Palette

```css
:root {
  --bg: #0a0a0a;           /* Near black */
  --bg-card: #111111;      /* Slightly lighter */
  --border: #222222;       /* Subtle borders */
  --text: #e0e0e0;         /* Primary text */
  --text-muted: #666666;   /* Secondary text */
  --accent: #00d4ff;       /* Cyan - links, focus */
  --success: #22c55e;      /* Green - preferred */
  --warning: #eab308;      /* Yellow - normal */
  --error: #ef4444;        /* Red - deprecated */
}
```

---

## Typography

**Font**: JetBrains Mono (keep existing)

**Hierarchy**:
- Page title: 14px, uppercase, letter-spacing: 0.1em
- Date dividers: 12px, muted
- Claim subject/object: 16px, bold
- Claim predicate: 14px, accent color
- Metadata: 11px, muted
- Evidence: 13px, italic

---

## Data Requirements

### Timeline API
```typescript
GET /api/v1/timeline/claims
  ?limit=50
  &offset=0
  &rank=preferred|normal|deprecated
  &type=schema:Person
  &subject=iri
  &after=2024-01-01
  &before=2024-12-31
```

Response:
```typescript
interface TimelineClaim {
  id: string
  subjectIri: string
  subjectLabel: string
  subjectTypes: string[]
  predicateIri: string
  predicateLabel: string
  objectValue: string
  objectTypes?: string[]
  rank: "preferred" | "normal" | "deprecated"
  confidence: number | null
  validFrom: string | null
  validTo: string | null
  assertedAt: string
  source: {
    id: string
    headline: string
    publishedAt: string
  }
  evidenceText: string | null
}
```

### Ontology API
```typescript
GET /api/v1/ontology/classes
  ?ontologyUri=gs://bucket/ontology.ttl

Response:
interface OntologyClass {
  iri: string
  label: string
  comment?: string
  superClasses: string[]
  properties: {
    iri: string
    label: string
    range: string
    rangeLabel: string
  }[]
  instanceCount: number
}
```

---

## Implementation Phases

### Phase 1: Static Timeline (1 week)
- [ ] Create `TimelinePage.tsx` with hardcoded mock data
- [ ] Implement `ClaimCard` component
- [ ] Implement date dividers
- [ ] Basic rank styling (preferred/normal/deprecated)
- [ ] Wire up keyboard navigation (j/k)

### Phase 2: Ontology Browser (3 days)
- [ ] Create `OntologyTree` component
- [ ] Collapsible class nodes
- [ ] Property listing
- [ ] Click to filter timeline

### Phase 3: API Integration (1 week)
- [ ] Implement `/api/v1/timeline/claims` endpoint
- [ ] Implement `/api/v1/ontology/classes` endpoint
- [ ] React Query for data fetching
- [ ] Infinite scroll for timeline

### Phase 4: Polish (3 days)
- [ ] Filter dropdown
- [ ] Evidence expansion
- [ ] Source linking
- [ ] Keyboard shortcut modal

---

## What We're NOT Building (Simplified Scope)

- ~~Split-pane layouts~~ → Single scrolling view
- ~~Cytoscape graph visualization~~ → Text-based ontology tree
- ~~Vis.js timeline chart~~ → Simple date-grouped list
- ~~Complex conflict resolution UI~~ → Just show deprecated claims
- ~~Article full-text view~~ → Link to source only
- ~~Admin tools~~ → Defer to later
- ~~SPARQL query interface~~ → Defer to later

---

## Success Criteria

1. **Load time**: < 500ms to first meaningful paint
2. **Data density**: 10+ claims visible above fold
3. **Keyboard**: Full navigation without mouse
4. **Clarity**: Any user can understand claim structure in < 5 seconds
5. **Minimalism**: No element exists without purpose
