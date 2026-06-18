# 51 — Office-Action Data Formats & Minimal-Ontology Reality-Check

_Synthesis date: 2026-06-17 · Packet: `atlas-synthesis` · Scope: two decomposition
de-risk questions for the rung-0 office-action review loop._

This artifact deep-researches two questions that gate the
`law-practice-office-action-spike` packet's **fixture-ingestion path** and the
`law-practice/domain` **TBox decision** (bespoke Effect-Schema vs. off-the-shelf
ontology). It validates two already-locked decisions with primary-source
evidence and seeds the `@source` JSDoc annotations.

Both decisions under test are **CONFIRMED**:

1. **Structured office-action data is real but bounded** — the USPTO exposes
   document-level *rejection metadata* (statute flags, claim arrays, Alice/Mayo
   indicators) via API and a bulk research dataset, but **only for issued-and-
   public applications, lagging 6 months, ending coverage mid-2017 for the bulk
   set**, and never as the kind of privileged, current, span-rich artifact the
   loop needs. The **practical fixture path is a sample PDF/DOCX through
   `@beep/file-processing` + `@beep/tika`**, exactly as the locked decision says.
2. **No published ontology cleanly models patent claims / office-actions /
   statutory rejections** — confirmed by re-checking the IP-ontology landscape
   against this *specific* scope. Bespoke Effect-Schema is correct; the genuinely
   usable published vocabularies are narrow and orthogonal (CPC/IPC for
   classification, PROV-O for provenance, SKOS for concept-scheme wrappers).

---

## Part 1 — Office-Action Data Formats

### 1.0 The landscape (post-2025 consolidation)

The USPTO consolidated its data surfaces in **2025**. The legacy Developer Hub
(`developer.uspto.gov`) is being phased out into the **Open Data Portal (ODP)**
at **`data.uspto.gov`**, launched **12 Feb 2025**
([USPTO Open Data Portal launch](https://www.uspto.gov/about-us/news-updates/uspto-launches-new-open-data-portal-easy-quick-access-data), as-of 2026-06-17).
The **Patent Examination Data System (PEDS)** — the prior bibliographic/status
bulk API — was **retired 14 Mar 2025**; its data folds into ODP's **Patent File
Wrapper (PFW)** feature
([PEDS Retirement notice](https://www.uspto.gov/system-status/20250212-patent-examination-data-system-peds-retirement), as-of 2026-06-17).
ODP coverage is **2001-present**; pre-2001 needs Bulk Data or Patent Center
([USPTO ODP FAQ](https://data.uspto.gov/support), as-of 2026-06-17).

There are **four distinct office-action data surfaces**, and they are not
interchangeable. The table below is the load-bearing finding of Part 1.

| Surface | What it gives | Format | Coverage | Granularity | Verdict for the loop |
|---|---|---|---|---|---|
| **OA Rejection API** | document-level rejection *metadata* (statute flags, claim arrays, Alice/Mayo) | JSON | mailed **2008–mid-2017** (legacy DS-API) and a **beta** refreshing **1 Jun 2018 → ~180 days ago** | per OA document × action | **Schema gold** — seeds the bespoke Rejection model; **not** a fixture source |
| **OA Text Retrieval API** | **full text** of public office actions | JSON (text body) | public OAs, ODP-migrated | per OA document | Useful later for span fixtures of *public* matters; not for Tom's privileged matters |
| **OA Citations API** | prior-art citation data (PTO-892 / PTO-1449 / OA text) | JSON | mailed **Oct 2017 → ~30 days ago** (beta); **2008–mid-2017** (legacy) — **legacy beta decommissioned 30 Jan 2026** | per citation | Seeds the `PriorArt` model fields; not a fixture |
| **OA Research Dataset** (`ptoffact`) | bulk parsed rejection + citation + bibliographic tables | **CSV + Stata `.dta`** | **4.4M OAs, 2008–Jun 2017, 2.2M apps** | document-action-pair | **Field dictionary gold**; frozen, academic, not a live or current feed |

Primary sources for the table:
[OA Rejection API (will-be-migrated)](https://developer.uspto.gov/api-catalog/uspto-office-action-rejection-api),
[OA Rejection API (beta)](https://developer.uspto.gov/api-catalog/uspto-office-action-rejection-api-beta),
[OA Text Retrieval API (ODP)](https://data.uspto.gov/apis/office-action-retrieval/search),
[OA Citations API beta — decommission 30 Jan 2026](https://developer.uspto.gov/api-catalog/uspto-office-action-citations-api-beta-will-be-decommissioned-january-30-2026),
[OA Research Dataset `ptoffact`](https://data.uspto.gov/bulkdata/datasets/ptoffact),
[Data.gov dataset record (2008–2017)](https://catalog.data.gov/dataset/patent-application-office-actions-research-dataset-for-academia-and-researchers-2008-2017)
(all as-of 2026-06-17).

### 1.1 The OA Rejection API / Research Dataset is structured — and its fields are a schema gift

The single most useful finding for the `law-practice` TBox: the USPTO already
*parses* office actions into a **document-level rejection record** whose fields
map almost one-to-one onto the bespoke `Rejection` schema the spike needs. From
the OA Rejection API JSON response, confirmed field names include:

- **`hasRej101`, `hasRej102`, `hasRej103`, `hasRej112`** — boolean statute flags
  (the §101/§102/§103/§112 axis the spike models as a `Rejection` tagged union).
- **`aliceIndicator`, `mayoIndicator`, `bilskiIndicator`** — §101 subject-matter-
  eligibility case-law sub-flags (Alice/Mayo/Bilski), i.e. the USPTO itself
  treats §101 as needing case-law subtyping — a strong signal that a flat
  "§101 rejection" literal is too coarse and the spike's bespoke union is right.
- **`actionTypeCategory`** — non-final vs. final vs. notice-of-allowance, etc.
- **`claimNumberArrayDocument`** — the array of claim numbers the action touches.
- **`patentApplicationNumber`**, **`legacyDocumentCodeIdentifier`**,
  **`legalSectionCode`**, **`paragraphNumber`** — bibliographic + form-paragraph
  linkage.

(Field names sourced from the ODP/Developer-Hub OA Rejection API response
example and Swagger surfaced via search;
[OA Rejection API](https://developer.uspto.gov/api-catalog/uspto-office-action-rejection-api),
[OA Rejections (ODP) search endpoint](https://data.uspto.gov/apis/office-action-rejections/search);
as-of 2026-06-17. The two endpoints' redirect to `data.uspto.gov` blocked a
direct field-by-field fetch this session — see Caveats.)

The **bulk Research Dataset** (`ptoffact`) is the canonical published schema
behind those flags. Its **rejections file** is keyed at the document-action-pair
level by **`ifw_number` + `action_type` + `action_subtype`**, and carries
"grounds for rejection raised, the claims in question, and pertinent prior art."
The dataset documentation (the **Variable Tables** and **Schema** PDFs, 2017
release) and its provenance paper are the field dictionary:
[Variable Tables v20171120 (USPTO)](https://www.uspto.gov/sites/default/files/documents/Variable%20tables_v20171120.pdf),
[Dataset Schema v20171120 (USPTO)](https://www.uspto.gov/sites/default/files/documents/dataset_schema_v20171120.pdf),
[Lu, Myers & Beliveau, "Unlocking Office Action Traits" (SSRN)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3024621)
(all as-of 2026-06-17). The USPTO itself flags that **§101 action-subtype
labels "should not be considered an authoritative classification"** — i.e. even
the agency's own parse is heuristic for the substance tier, reinforcing that the
*authority* must be the attorney-approved bespoke claim, not the scraped flag.

**Implication for the spike (P0 schema phase):** the OA Rejection API / Research
Dataset field set is the **empirical donor for the `Rejection` model's shape**
(statute-flag union + claim-number array + action-type + Alice/Mayo subtyping),
even though we will not *ingest* it at rung 0. Cite it as a `@source` for the
rejection-statute enumeration.

### 1.2 But structured OA data is the wrong fixture source — by design

Three independent reasons the locked "sample PDF/DOCX → file-processing → tika"
path is correct, not a fallback:

1. **Privilege wall (the binding one).** The product's non-negotiable is that
   real client/privileged matter must never enter the repo (`01-vision`, C-rules;
   `00-baseline-gap-map` §3). Tom's *actual* office actions for *live* matters are
   non-public prosecution correspondence. The USPTO APIs only expose
   **issued-and-public** applications, lagging 30–180 days. So the live product
   ingests from disk (the file is canonical, C2), and the **repo fixture** must be
   a **synthetic or already-public** sample OA — a PDF/DOCX, not an API pull.
2. **Coverage / freshness gaps.** The bulk Research Dataset ends **mid-2017**; the
   refreshing beta APIs lag **~180 days** and one legacy beta **decommissions
   30 Jan 2026**. None gives a *current* office action.
3. **The loop's deliverable is span-grounding, not metadata.** The rung-0 loop is
   `doc → langextract span-grounded extraction → Handoff IR → … → Evidence(char-
   span)`. The Evidence primitive is a **character offset into the source
   document's text** (the v3 `EvidenceSpan` being ported into epistemic). API JSON
   flags have **no char-spans into a document the user holds** — they are
   *about* a document, not *the* document. Only the file-through-tika path yields
   the text buffer that langextract aligns spans against.

### 1.3 The concrete fixture ingestion path (verified bricks)

The repo already has the bricks; this is composition, not net-new
(`00-baseline-gap-map` §4, `11-current-doc-processing`). Verified this session:

- **`@beep/tika`** — `packages/drivers/tika/src/{Tika.service.ts, Tika.tikaapp.ts,
  Tika.errors.ts}` (real Apache-Tika subprocess engine: PDF/DOCX → text).
- **`@beep/file-processing`** — `.../file-processing/src/{Artifact, Extraction,
  Operation, Service, Strategy}` (the contract + IR over the extractor drivers).
- **`@beep/langextract`** — `.../langextract/src/{Extraction, Alignment, Handoff,
  Target, Service}` (the span aligner; `Alignment` = exact/fuzzy/lesser; `Handoff`
  = the bridge to `@beep/nlp` Handoff IR).

Fixture path, end to end:

```
sample office-action.pdf|.docx   (synthetic or public; lives in spike fixtures/)
   └─> @beep/file-processing  (Strategy picks driver)
        └─> @beep/tika        (subprocess: bytes -> plain text + offsets)
             └─> @beep/langextract  (Extraction + Alignment: spans over the text)
                  └─> @beep/nlp Handoff IR   (via langextract/Handoff)
                       └─> (NET-NEW) IR -> law-entity mapping (law-practice/use-cases)
                            └─> CandidateClaim + Evidence(char-span)  (epistemic)
```

**Note on DOCX as a structured surface.** USPTO-filed DOCX is *not* opaque: the
USPTO converts filed DOCX to **WIPO Standard ST.96 XML** at intake, with
preliminary validation on upload
([USPTO DOCX filing](https://www.uspto.gov/patents/docx),
[IPWatchdog DOCX guide, Mar 2024](https://ipwatchdog.com/2024/03/11/mastering-uspto-docx-formats-ultimate-guide/);
as-of 2026-06-17). ST.96 is a *real* structured patent-XML standard (claims,
spec, abstract as typed elements). **Relevance to the spike is deferred but
noted:** office actions themselves are examiner correspondence (PDF), not ST.96
documents; ST.96 governs the *application* the OA examines. For rung 0, treat
DOCX as "another tika input"; record ST.96 as a `@source` for a *later* claim-
text structured-import path (the application's own claims), not the OA loop.

### 1.4 Part-1 verdict

Structured OA data **exists and is a schema donor**, but is **not the fixture
source**. The locked decision (sample PDF/DOCX → `@beep/file-processing` +
`@beep/tika` → langextract) is correct and uses only built bricks. The USPTO OA
Rejection API / Research Dataset field set (`hasRej101..112`, `aliceIndicator`,
`mayoIndicator`, `claimNumberArrayDocument`, `actionTypeCategory`) should be
**cited as `@source` for the bespoke `Rejection`/statute enumeration**, and a
later "public-OA / ST.96 structured import" lane should be filed as a deferred
follow-on, not built at rung 0.

---

## Part 2 — Minimal-Ontology Reality-Check

### 2.0 The question, narrowed to the rung-0 scope

The assessment (`20-external-ontology-stack` §6.1; `00-baseline-gap-map` §5
"Patent/TM IP-substance ontology gap") found that **no off-the-shelf ontology
models patent claims / office actions / statutory rejections / Nice classes /
docketing**. Part 2 re-tests that finding against the *exact* rung-0 vocabulary
the spike needs: `OfficeAction`, `Claim` (independent/dependent), `Rejection`
(§101/§102/§103/§112), `PriorArt`, `Distinction`.

**The finding is CONFIRMED — refuted nowhere, reinforced on the specifics.**

### 2.1 Direct search for a patent-claim / office-action ontology — negative

A targeted search for a *published, maintained, standard* ontology of patent
claims and office-action rejections surfaces only three categories, **none** of
which is a usable TBox:

1. **Academic ontology papers**, not deliverable/maintained ontologies — e.g. "A
   Construction Method of Ontology in Patent Domain Based on UML and OWL"
   ([ResearchGate](https://www.researchgate.net/publication/232627968_A_Construction_Method_of_Ontology_in_Patent_Domain_Based_on_UML_and_OWL),
   as-of 2026-06-17), and — importantly — **"Developing an ontology for the U.S.
   patent system"** (Taduri et al., 12th Intl. Digital Government Research Conf.,
   2011; [ACM](https://dl.acm.org/doi/10.1145/2037556.2037579), as-of 2026-06-17),
   which **does** propose an OWL ontology spanning the patent-document, court-case,
   and **file-wrapper** domains and **does** include a `Rejection` class (with
   restrictions, allowed/withdrawn claims, and arguments) — i.e. it reaches into
   the prosecution-rejection territory. But it is a **2011 conference paper**
   demonstrated on a single (erythropoietin) use case, with **no maintained
   artifact, no stable published IRI, no OBO/LOV registration, and no statutory
   subtyping** (§101/§102/§103/§112 grounds are not modeled). So it does **not**
   refute the negative — it does not give a usable, maintained TBox — but it does
   mean the honest claim is "no *maintained, standard, statute-aware* published
   ontology," not "no patent-rejection ontology has ever been described." These
   papers ship no maintained, citable artifact with a stable IRI.
2. **Proprietary patent-mapping patents** — a cluster of USPTO-granted patents on
   "patent claim mapping" / "patent mapping" that use *an* ontology of
   technology concepts internally
   ([e.g. US 11,294,910 "Patent claim mapping"](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11294910),
   as-of 2026-06-17). These are commercial systems, not open vocabularies, and
   they model *technology-concept scope*, not *statutory-rejection structure*.
3. **No W3C / ISO / OBO / LOV-registered, maintained patent-claim or office-action
   ontology** appears (the 2011 Taduri ontology in item 1 is the closest published
   description, but is unmaintained and unregistered). The IP ontologies that *do*
   exist and are citable (IPROnto, Copyright
   Ontology) are **copyright/DRM-scoped and ~2003-vintage**, and the legal-core
   set (LKIF-Core, JudO, LCBR) is **norms/judicial/case-law**, none touching
   prosecution claim-or-rejection semantics (verified in `20-external-ontology-
   stack` §2.5–2.6, §5; not re-litigated here).

**Conclusion:** the negative result holds. Bespoke Effect-Schema in
`law-practice/domain` is the correct authority for the IP-substance tier. This is
also consistent with the architecture's own stance — *Effect Schema is the typed
authority; ontology is design-time annotation + projection* (`20` §0, §4;
`01-vision` §4).

### 2.2 The genuinely-usable published vocabularies — narrow, orthogonal, real

For the rung-0 office-action scope, exactly **three** published vocabularies are
usable, and each only at a *narrow* facet. These seed the **light `@source`
JSDoc** the locked decision calls for.

| Vocabulary | Exact usable scope at OA rung-0 | What it does **not** cover | `@source` use |
|---|---|---|---|
| **CPC / IPC** | Classification *codes* a patent/application carries (the tech bucket). CPC is EPO+USPTO (~260k codes); IPC is WIPO (~74k). Current: **CPC 2026.05 in force; IPC 2026.01** (released 16 Dec 2025). | Claim *semantics*, rejection grounds, prior-art relations — none. It is a **bucket label**, not claim content. | `@source` for a `classification` field on `PatentAsset`/`Claim` context; **optional at rung 0** — the finite claim shape does not require it. |
| **PROV-O** | Provenance of every asserted fact: `Entity`/`Activity`/`Agent`, `wasGeneratedBy`/`wasDerivedFrom`/`wasAttributedTo`. Maps onto epistemic `Evidence`/`Activity`/`CandidateClaim`. W3C Rec, 30 Apr 2013. | Any IP/patent substance. It is pure provenance plumbing. | **Owned by epistemic slice**, not law-practice. `@source` on the Evidence/Activity link; **already live** in `@beep/semantic-web` + `@beep/rdf/Vocab/Prov.ts`. |
| **SKOS** | Lightweight concept-scheme wrapper: if CPC/IPC or a rejection-type taxonomy is later modeled as a controlled vocabulary, SKOS (`skos:Concept`, broader/narrower, prefLabel) is the wrapper. W3C Rec, 18 Aug 2009. | No domain content of its own. | `@source` only if/when a rejection-type or classification *concept scheme* is introduced; **not required at rung 0**. |

(Standards status/IRIs verified in `20-external-ontology-stack` §2.8–2.10, which
fetched W3C/WIPO primary sources this session; CPC/IPC cadence cross-checked
against [Cooperative Patent Classification](https://www.cooperativepatentclassification.org/)
and [WIPO IPC](https://www.wipo.int/en/web/classification-ipc), as-of 2026-06-17.)

One **honorable-mention** structured donor (not an ontology, a *standard*):
**WIPO ST.96 XML** (§1.3) is the only published *structured schema* that types
patent claim/spec/abstract elements. It is **document-markup, not an ontology**,
and applies to the *application*, not the *office action*. Record as a `@source`
for a future structured claim-import; **do not** treat it as the TBox.

### 2.3 The "7 sources" mapped to rung-0 office-action scope: apply vs. defer

The `ip-law-knowledge-graph` packet locks a 7-source ontology set. Mapped
against the *minimal office-action* scope, the result is stark — **all seven
DEFER**; none supplies the patent-claim/office-action/rejection vocabulary the
spike actually needs. This is the empirical justification for the locked
"DEFER the 7-source grounding; bespoke Effect-Schema + light `@source`" decision.

| # | Source | Domain it covers | Applies at OA rung-0? | Disposition |
|---|---|---|---|---|
| S1 | **LKIF-Core** | norms / rights / roles / actions / legal-reasoning primitives (frozen ~2008) | **No** — no patent claim or rejection concept; norms layer is above the spike's scope | **DEFER**; later `@source` for a generic `legalAct`/`right` framing, not now |
| S2 | **IPROnto / ALIS** | DRM / multimedia copyright rights (~2003, DMAG) | **No** — copyright/DRM, not patent prosecution | **DEFER** (and de-emphasize per `20` §6.4) |
| S3 | **Copyright Ontology** | copyright creation/rights/action (DMAG, WIPO-guided) | **No** — copyright, not patents | **DEFER** |
| S4 | **JudO** | judicial interpretation / case-law (extends LKIF-Core) | **No** — litigation/judicial, not prosecution | **DEFER** |
| S5 | **LCBR** | legal case-based-reasoning factors (~2008) | **No** — CBR/litigation | **DEFER** |
| S6 | **ESTRELLA** | the *project* that produced LKIF-Core (not a separate ontology) | **No** — parent of S1; not an artifact | **DEFER** (and note the S1/S6 double-count, `20` §5) |
| S7 | **WIPO IPC** | patent classification codes | **Partially** — only as an optional `classification` label (see §2.2 CPC/IPC) | **DEFER for substance; OPTIONAL** as a code field; not required for the finite claim shape |

**Net:** the 7-source set is a *litigation/copyright/norms/classification* stack.
The rung-0 office-action loop is *prosecution claim+rejection* substance — the
exact gap none of the seven fills. The bespoke `OfficeAction/Claim/Rejection/
PriorArt/Distinction` schema in `law-practice/domain` is **not a shortcut around
a usable ontology; it is the only option**, because the usable ontology does not
exist. `goals/ip-law-knowledge-graph` correctly stays PENDING/referenced.

### 2.4 What the bespoke schema should `@source`-annotate (seed)

Concrete, defensible `@source` annotations for the spike's P0 schema phase
(light JSDoc, design-time grounding only — no runtime ontology dependency):

- **`Rejection` statute union** (§101/§102/§103/§112) → `@source` the **USPTO OA
  Rejection API field set** (`hasRej101/102/103/112`, `aliceIndicator`,
  `mayoIndicator`, `bilskiIndicator`) and the **OA Research Dataset Variable
  Tables** — the empirical, agency-authored enumeration (§1.1). The statutes
  themselves are **35 U.S.C. §§101/102/103/112** (primary law; cite MPEP chapters
  2100/700 if a human-readable `@source` is wanted).
- **`Claim` (independent/dependent) + `claimNumber`** → `@source` the OA Rejection
  API `claimNumberArrayDocument` shape and, for claim-text structure, **WIPO
  ST.96** (§1.3) as the structured-markup reference.
- **`PriorArt`** → `@source` the OA **Citations** surface (PTO-892 / PTO-1449 /
  OA-text citation provenance, §1.0 table).
- **`actionType` (final/non-final/notice)** → `@source` OA Rejection API
  `actionTypeCategory`.
- **Evidence/provenance link** → `@source` **PROV-O** (epistemic-owned; already
  live).
- **`classification` (optional)** → `@source` **CPC/IPC** via **SKOS** wrapper, if
  introduced; not required at rung 0.

### 2.5 Part-2 verdict

The bespoke-Effect-Schema decision is **correct and confirmed**: no published
ontology models patent-claim/office-action/statutory-rejection semantics; the
only usable published vocabularies (CPC/IPC, PROV-O, SKOS) are narrow,
orthogonal, and at rung-0 either optional (CPC/IPC, SKOS) or already-owned by the
epistemic slice (PROV-O). All seven `ip-law-knowledge-graph` sources DEFER. The
single best *structured* (non-ontology) donor for claim/rejection *fields* is the
USPTO's own OA Rejection API / Research Dataset — used as `@source` evidence, not
as an ingested feed or a TBox.

---

## Cross-cutting: the two parts reinforce each other

The same conclusion lands from both directions. The USPTO **parses** office
actions into structured rejection metadata (Part 1) precisely **because no
ontology exists to do it declaratively** (Part 2) — the agency hand-built a flag
schema (`hasRej101..112`, Alice/Mayo) and a heuristic §101 subtyper, and even
**disclaims** its own §101 labels as non-authoritative. That is the strongest
possible external evidence that (a) the data shape the spike needs is real and
nameable, and (b) the authority for it must be **bespoke and approval-gated**,
not a borrowed vocabulary. The locked decisions — *file-through-tika fixture* and
*bespoke Effect-Schema with light `@source`* — are validated by, not merely
consistent with, the primary sources.

---

## Confidence & Caveats

**Verified via primary / authoritative sources this session (2026-06-17):**
- USPTO ODP launch (12 Feb 2025), PEDS retirement (14 Mar 2025), ODP coverage
  2001-present — USPTO.gov primary pages.
- Four OA data surfaces (Rejection / Text Retrieval / Citations / Research
  Dataset), their formats (JSON; CSV+Stata `.dta`), and coverage windows
  (bulk 2008–mid-2017, 4.4M OAs / 2.2M apps; rejection beta 1 Jun 2018→~180d;
  citations beta Oct 2017→~30d, legacy beta decommission **30 Jan 2026**) —
  USPTO developer-hub / data.uspto.gov / data.gov records.
- OA Rejection API field names (`hasRej101/102/103/112`, `aliceIndicator`,
  `mayoIndicator`, `bilskiIndicator`, `actionTypeCategory`,
  `claimNumberArrayDocument`, `patentApplicationNumber`, `legalSectionCode`,
  `paragraphNumber`) — surfaced from the API response example / Swagger via
  search.
- OA Research Dataset keyed by `ifw_number` + `action_type` + `action_subtype`;
  USPTO's own §101-subtype "not authoritative" disclaimer — USPTO Variable
  Tables / SSRN paper (Lu, Myers & Beliveau).
- DOCX→WIPO **ST.96 XML** conversion + on-upload validation (DOCX mandatory
  surcharge from 17 Jan 2024) — USPTO.gov + IPWatchdog.
- No published patent-claim/office-action ontology; only academic
  construction-method papers and proprietary patent-mapping patents — search +
  cross-ref to `20-external-ontology-stack` (which fetched W3C/WIPO/ALEA
  primaries this session).
- In-repo bricks present: `@beep/tika` (`Tika.service.ts`, `Tika.tikaapp.ts`),
  `@beep/file-processing` (`Artifact/Extraction/Operation/Service/Strategy`),
  `@beep/langextract` (`Extraction/Alignment/Handoff/Target/Service`) — `ls`
  verified.

**UNVERIFIED / could not fetch directly:**
- The exact, complete OA Rejection API and OA Text Retrieval response schemas:
  both `developer.uspto.gov` API-catalog pages **301-redirect to
  `data.uspto.gov`**, and the `data.uspto.gov` API search pages returned empty
  bodies to WebFetch (likely client-rendered/JS). Field names above are from
  search-surfaced response examples and the ODP Swagger reference, **not** a
  direct field-by-field fetch. Treat the field list as **high-confidence but not
  byte-exact**; confirm against the live ODP Swagger before P0 schema lock.
- The OA Research Dataset Variable-Tables PDF is binary/compressed and did not
  yield machine-readable field text this session; the `ifw_number`/`action_type`/
  `action_subtype` keying and §101-disclaimer are from the dataset abstract +
  SSRN paper, not a parsed table. The precise per-statute column names in the
  bulk `.dta`/CSV remain to be confirmed from the PDF directly.
- WIPO ST.96 version applicable to current USPTO DOCX intake not pinned to an
  exact ST.96 release this session.

**Relied-upon (not re-verified here):** the IP-ontology landscape findings
(IPROnto/Copyright/LKIF/JudO/LCBR/ESTRELLA scope, CPC/IPC/PROV-O/SKOS status and
IRIs) are carried from `20-external-ontology-stack.md`, which verified them
against primary sources on 2026-06-17; Part 2 re-tested only the *patent-claim/
office-action* negative and the rung-0 applicability mapping.

**NOT FOUND:** any published, *maintained, standard, statute-aware* ontology with
a stable IRI modeling patent claims, office actions, or statutory rejections — the
central negative that validates bespoke Effect-Schema. (One unmaintained 2011
academic OWL ontology — Taduri et al. — *does* describe a `Rejection` class over
the file-wrapper domain, but ships no maintained artifact / stable IRI and does
not model the §101/§102/§103/§112 statutory subtyping the spike needs; it narrows
but does not refute the negative.)

### Verification (2026-06-17)

Independent skeptical spot-check of the "no clean published ontology" claim and
the statutory-rejection citations:

- **"No published ontology" claim — MOSTLY CONFIRMED, but was OVERSTATED and is
  now corrected.** A targeted search surfaced **Taduri et al., "Developing an
  ontology for the U.S. patent system"** (12th Intl. Digital Government Research
  Conf., 2011, [ACM 10.1145/2037556.2037579](https://dl.acm.org/doi/10.1145/2037556.2037579)),
  which proposes an OWL ontology spanning patent-document, court-case, and
  **file-wrapper** domains and **explicitly includes a `Rejection` class** (with
  restrictions, allowed/withdrawn claims, arguments). That reaches into the
  prosecution-rejection territory the prior prose flatly denied. It does **not**
  refute the decision: it is a 2011 conference paper, single-use-case
  (erythropoietin), with no maintained artifact, no stable IRI, no OBO/LOV
  registration, and **no §101/§102/§103/§112 statutory subtyping**. Edits applied
  to §2.1 and the NOT FOUND caveat to scope the negative honestly to "no
  *maintained, standard, statute-aware* published ontology." Bespoke
  Effect-Schema remains the correct authority.
- **Statutory-rejection field claims (§1.1):** the §101/§102/§103/§112 axis and
  the Alice/Mayo/Bilski §101 subtyping are consistent with MPEP 2106/2131/2143
  (cross-verified in 50-office-action-domain's Verification block this session).
  The OA Rejection API field names remain "high-confidence, not byte-exact" per
  the existing caveat — not re-fetched (ODP pages still JS-rendered).
- **CPC/IPC/PROV-O/SKOS scoping:** unchanged; carried from `20-external-ontology-
  stack` and not re-litigated.

**Open follow-ons (deferred, not blocking rung 0):** (1) pull the live ODP
Swagger to byte-confirm OA Rejection field names before P0 lock; (2) decide
whether a *public-OA* (Text Retrieval API) sample is an acceptable repo fixture
vs. a fully synthetic OA; (3) file the "ST.96 structured claim import" and
"CPC/IPC-as-SKOS classification" lanes as explicit deferred follow-ons.
