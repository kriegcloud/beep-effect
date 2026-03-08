# Conceptualizer Review: Energy News Ontology v0.3.0

Date: 2026-02-26
Scope: Post-gap-analysis structural and BFO alignment review

---

## 1. BFO Alignment Audit (23 classes)

### Correctly Aligned (19 classes)

| Class | BFO Category | Rationale | Status |
|-------|-------------|-----------|--------|
| Article | GDC (0000031) | Information content (news article) | OK |
| Post | GDC (0000031) | Information content (social media post) | OK |
| AuthorAccount | GDC (0000031) | Digital identity artifact | OK |
| Feed | GDC (0000031) | Curated information stream | OK |
| Publication | Object (0000030) | Organization per BFO 2020 convention | OK |
| Organization | Object (0000030) | Organization per BFO 2020 | OK |
| GeographicEntity | Site (0000029) | Bounded immaterial region | OK |
| EnergyTopic | GDC (0000031) | SKOS concept = information entity | OK |
| SocialMediaPlatform | GDC (0000031) | Platform as abstract entity | OK |
| EnergyEvent | Process (0000015) | Occurrent with temporal extent | OK |
| GridZone | Site (0000029) via GeographicEntity | Bounded grid region | OK |
| RegulatoryBody | Object (0000030) via Organization | Institutional body | OK |
| EnergyTechnology | GDC (0000031) | Technology specification/design | OK |
| PolicyInstrument | GDC (0000031) | Codified regulatory information | OK |
| CapacityMeasurement | GDC (0000031) | Data item (measurement datum) | OK |
| MarketInstrument | GDC (0000031) | Financial construct (social artifact) | OK |
| PriceDataPoint | GDC (0000031) | Data item (price datum) | OK |
| EmbeddedExternalLink | GDC (0000031) | Digital information entity | OK |
| MediaAttachment | GDC (0000031) | Multimedia information entity | OK |

### Issues Found (4 classes)

#### ISSUE 1 (Critical): PowerPlant — Anti-Pattern #3 (Process-Object Confusion)

**Current**: `PowerPlant rdfs:subClassOf EnergyProject` (→ BFO:Process)

**Problem**: A power plant is a physical facility. It persists through time, has
a location, can be touched, and has mass. In BFO, this is clearly a Material
Entity → Object (BFO_0000030), not a Process.

The corpus evidence confirms the facility reading:
- "Louisiana approved plan to **build** three new gas-fired **plants**"
- "Peaker **plants** emit more pollution when they **run**"
- "NIPSCO plans 3 GW of new gas-powered **generation**"

Plants are *results of* projects, not *kinds of* projects. A plant *participates
in* a construction project, then *exists independently* after completion.

**Recommendation**: Reparent as `PowerPlant rdfs:subClassOf obo:BFO_0000030`
(Object). Add property `developedThrough some EnergyProject` to link facility
to its development process.

#### ISSUE 2 (Critical): RenewableInstallation — Same Anti-Pattern #3

**Current**: `RenewableInstallation rdfs:subClassOf EnergyProject` (→ BFO:Process)

**Problem**: Identical to PowerPlant. A solar array, wind farm, or geothermal
plant is a physical installation — a Material Entity, not a Process.

**Recommendation**: Reparent as `RenewableInstallation rdfs:subClassOf obo:BFO_0000030`
(Object). Add same `developedThrough` property.

#### ISSUE 3 (Moderate): EnergyProject — Ambiguous Alignment

**Current**: `EnergyProject rdfs:subClassOf obo:BFO_0000015` (Process)

**Assessment**: "Project" is genuinely ambiguous in the energy domain:
- As an ACTIVITY: "the construction project" → Process (correct)
- As an ENTITY: "the 500MW solar project" → often refers to the facility itself

With PowerPlant and RenewableInstallation correctly reparented as Objects, the
remaining EnergyProject class becomes unambiguously the *development process*:
planning, permitting, constructing, commissioning. This resolves the ambiguity.

**Recommendation**: Keep as Process, but update definition to clarify it refers
exclusively to the development activity, not the resulting facility.

#### ISSUE 4 (Low): ProjectStatus — Value Partition Candidate

**Current**: `ProjectStatus rdfs:subClassOf obo:BFO_0000031` (GDC, standalone class)

**Assessment**: Status values (Planning, Permitting, Construction, Operational,
Suspended, Decommissioned) form a closed enumeration. The Value Partition
pattern (axiom pattern #8) would be more precise: define status values as
individuals in a DisjointUnion, rather than having ProjectStatus as an open
class.

**Recommendation**: Low priority. Current modeling is functional. Consider
refactoring to value partition if status enumeration becomes formalized.

---

## 2. Anti-Pattern Scan Results

| # | Anti-Pattern | Status | Notes |
|---|-------------|--------|-------|
| 1 | Singleton Hierarchy | 2 found | Organization→RegulatoryBody, GeographicEntity→GridZone. Acceptable if future subclasses planned. |
| 2 | Role-Type Confusion | Clear | No roles modeled as subclasses |
| 3 | Process-Object Confusion | **2 violations** | PowerPlant, RenewableInstallation (see Issues 1-2) |
| 4 | Missing Disjointness | Clear | AllDisjointClasses covers 19 top-level classes; subclasses inherit |
| 5 | Circular Definition | Clear | No equivalence chains |
| 6 | Quality-as-Class | Clear | No quality values as classes |
| 7 | Information-Physical Conflation | Clear | Article/Post correctly modeled as GDC |
| 8 | Orphan Class | Clear | All enews classes have named BFO-aligned parents |
| 9 | Polysemy | Clear | No overloaded terms detected |
| 10 | Domain/Range Overcommitment | 2 noted | `hasTechnology` domain=RenewableInstallation (leaf), `operatedBy` domain=GridZone (leaf) |
| 11 | Individuals in TBox | Clear | All individuals in reference-individuals module |
| 16 | Class/Individual Mixing | Clear | Clean separation |

---

## 3. Taxonomy Structure Assessment

### Hierarchy Depth (from BFO)

```
BFO:Process (0000015)
├── EnergyProject
│   ├── PowerPlant          ← SHOULD BE under Object
│   └── RenewableInstallation  ← SHOULD BE under Object
└── EnergyEvent

BFO:Object (0000030)
├── Organization
│   └── RegulatoryBody
└── Publication

BFO:Site (0000029)
└── GeographicEntity
    └── GridZone

BFO:GDC (0000031)
├── Article
├── Post
├── AuthorAccount
├── Feed
├── EnergyTopic
├── SocialMediaPlatform
├── EnergyTechnology
├── PolicyInstrument
├── CapacityMeasurement
├── MarketInstrument
├── PriceDataPoint
├── ProjectStatus
├── EmbeddedExternalLink
└── MediaAttachment
```

### Corrected Hierarchy (Recommended)

```
BFO:Process (0000015)
├── EnergyProject (the development activity)
└── EnergyEvent

BFO:Object (0000030)
├── Organization
│   └── RegulatoryBody
├── Publication
├── PowerPlant              ← MOVED HERE
└── RenewableInstallation   ← MOVED HERE

BFO:Site (0000029)
└── GeographicEntity
    └── GridZone

BFO:GDC (0000031)
├── Article
├── Post
├── AuthorAccount
├── Feed
├── EnergyTopic
├── SocialMediaPlatform
├── EnergyTechnology
├── PolicyInstrument
├── CapacityMeasurement
├── MarketInstrument
├── PriceDataPoint
├── ProjectStatus
├── EmbeddedExternalLink
└── MediaAttachment
```

---

## 4. Property Design Notes

### Well-Designed Properties

Most properties follow naming conventions and have appropriate domain/range:
- `coversTopic`, `hasGeographicFocus`, `mentionsOrganization` — clean Article relations
- `hasCapacity`, `hasStatus` — clean EnergyProject relations
- `hasEmbed`, `hasMedia` — clean Post relations
- `jurisdiction` correctly omits domain (multi-class applicability)

### Properties Needing Attention

| Property | Issue | Recommendation |
|----------|-------|---------------|
| `hasTechnology` | Domain is leaf class (RenewableInstallation) | Broaden to EnergyProject or omit domain; PowerPlant also has technology |
| `operatedBy` | Domain is leaf class (GridZone) | Broaden or omit; PowerPlant can also be operated by an Organization |
| `hasStatus` | Domain is EnergyProject (Process) | After reparenting, also applicable to PowerPlant/RenewableInstallation (Objects) — consider broader domain |

---

## 5. Recommendations Summary

### Must Fix (before release)

1. **Reparent PowerPlant** → `rdfs:subClassOf obo:BFO_0000030` (Object)
2. **Reparent RenewableInstallation** → `rdfs:subClassOf obo:BFO_0000030` (Object)
3. **Add property** `developedThrough` (ObjectProperty, domain: PowerPlant|RenewableInstallation → range: EnergyProject)
4. **Update EnergyProject definition** to clarify it represents the development activity only
5. **Update AllDisjointClasses** to include PowerPlant and RenewableInstallation as top-level disjoint members

### Should Fix (before next version)

6. Broaden `hasTechnology` domain to include PowerPlant (or omit domain)
7. Broaden `operatedBy` domain to include PowerPlant (or omit domain)
8. Add SHACL shapes for 14 new classes
9. Create CQ test suite

### Consider (future iteration)

10. Add sibling subclasses to resolve singleton hierarchies
11. Refactor ProjectStatus as value partition with named individuals
12. Add `hasParticipant` property linking EnergyEvent to Organization/GeographicEntity
