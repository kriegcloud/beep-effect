# USPTO Office-Action Domain — Grounding for the Law-Practice Model

> Synthesis artifact for the `baseline-synthesis` exploration packet.
> Date: 2026-06-17 · Scope: deep-research grounding of the **USPTO patent
> office-action domain** to seed the BESPOKE Effect-Schema law-practice model
> (`goals/law-practice-office-action-spike`) and the rung-0 office-action review
> loop. This is **domain grounding**, not a spec: it translates examination law
> into a concrete domain vocabulary (entities + fields + relationships).
> Authority for the product model is
> `goals/agentic-professional-runtime/SPEC.md` +
> `docs/data-model-law-practice.md`. The 7-source IP-law ontology grounding is
> **DEFERRED** per locked decisions; below, `@source` hints are JSDoc-light only.

Every external/legal claim is cited to a primary or near-primary source with a
URL and an as-of date. The MPEP (Manual of Patent Examining Procedure) and 35
U.S.C. are the controlling primary sources; the cited MPEP sections are the
November 2024 (Ninth Edition, Rev. 01.2024) revision, the current version as of
2026-06-17.

---

## 0. Why this exists (the loop it serves)

The rung-0 loop is the OFFICE-ACTION REVIEW loop, walked once, embarrassingly
shallow: a fixture office-action document → span-grounded extraction → Handoff
IR → IR→law-entity mapping → `CandidateClaim` + `Evidence(char-span)` → SHACL
gate + `ClaimLifecycle` → in-memory projection → trivial ask. This document
supplies the **right half** of the IR→law mapping: *what a USPTO office action
actually contains*, so the bespoke schema models the real artifact and the
"distinction" work product the attorney produces in response.

The core attorney work product the loop targets is the **DISTINCTION** — the
argument that a claim is patentably distinguishable from a cited prior-art
reference. Everything below exists to make that object well-typed and
span-grounded.

---

## 1. The document — anatomy of a USPTO office action

An **office action** is the examiner's official written communication on the
merits of a patent application; it details the grounds (rejections, objections,
requirements) the applicant must overcome before allowance (MPEP 707, "Examiner's
Letter or Action", https://www.uspto.gov/web/offices/pac/mpep/s707.html ,
as-of 2026-06-17).

### 1.1 Physical structure (forms)

| Part | Carrier / form | Content |
|---|---|---|
| Cover / summary | **PTOL-326 "Office Action Summary"** (first page; PTOL-90 may be a coversheet for address + mail date) | Status of every claim (pending / rejected / objected / allowed / withdrawn), period for reply, attachments list |
| Detailed action | Examiner narrative body | Grounds of rejection, objections, requirements, allowable subject matter, response to arguments |
| References cited | **PTO-892 "Notice of References Cited"** | Each applied prior-art reference: patent/publication number, dates, patentee/author, country (for foreign) |
| Applicant's own art | **PTO/SB/08** (IDS, applicant-supplied) | References the applicant disclosed; examiner-initialed when considered |
| Closing | Form paragraph **¶ 7.100 / 7.101 / 7.102** | Examiner contact block (name, phone, hours, supervisor, interview info) |

Sources: MPEP 707.05 & 2262 "Form and Content of Office Action"
( https://www.uspto.gov/web/offices/pac/mpep/s2262.html ); MPEP 707
( https://www.uspto.gov/web/offices/pac/mpep/s707.html ), as-of 2026-06-17.

### 1.2 Logical content (the body, in conventional order)

The detailed action is built from **MPEP form paragraphs** — standardized,
numbered boilerplate the examiner assembles and fills in (MPEP Form Paragraph
chapter, https://www.uspto.gov/web/offices/pac/mpep/mpep-9095-Form-Paragraph-Chapter.html ,
as-of 2026-06-17). Conventional ordering of grounds (MPEP 706,
https://www.uspto.gov/web/offices/pac/mpep/s706.html , as-of 2026-06-17):

1. **Objections** (drawings, specification, claim formalities) — form defects.
2. **§ 112 rejections** (the specification/claim-language statutory grounds).
3. **§ 101 rejection** (subject-matter eligibility / double patenting).
4. **§ 102 rejections** (anticipation / novelty).
5. **§ 103 rejections** (obviousness).
6. **Allowable subject matter** (claims indicated allowable, if any).
7. **Response to Arguments** (in 2nd/later actions — examiner rebuts the
   applicant's prior remarks).
8. **Conclusion + examiner contact** (¶ 7.100–7.102).

> Modeling note: the examiner may also use a "reasons for allowance" statement
> and "response to arguments" sub-sections. The action's authority designation
> is a single statutory clause: the examiner "must use the word 'reject'" and
> "designate the statutory basis ... by express reference to a section of 35
> U.S.C. in the opening sentence of each ground of rejection" (MPEP 706.01,
> 707.07; same URLs). That opening sentence is the natural span anchor for an
> extracted `Rejection`.

### 1.3 REJECTION vs. OBJECTION (a hard distinction the model must carry)

This is the single most important structural distinction, because it changes
both *what the thing asserts* and *the applicant's recourse* (MPEP 706.01,
https://www.uspto.gov/web/offices/pac/mpep/s706.html , as-of 2026-06-17):

| | **Rejection** | **Objection** |
|---|---|---|
| Targets | The **merits / patentability** of a **claim** | **Form / formalities** (drawings, specification wording, claim antecedent basis, informalities) — not patentability |
| Requires | Express **35 U.S.C. statutory basis** in the opening sentence, word "reject" | No statutory basis; "objected to" |
| Recourse | **Appeal** to the PTAB (after final / twice rejected) | **Petition** to the Director (not appealable to PTAB) |
| Domain mapping | `Rejection` entity (typed by §) | `Objection` entity (formal; lower priority for rung-0) |

For the rung-0 loop, **`Rejection` is the focus**; `Objection` is modeled but
can be a thin secondary entity.

### 1.4 NON-FINAL vs. FINAL

- **Non-final** (typically the first action on the merits): applicant has broad
  latitude — amend claims, add arguments, submit evidence — and the examiner
  must consider it as of right (MPEP 706.07,
  https://www.uspto.gov/web/offices/pac/mpep/s706.html ).
- **Final** (second or any subsequent action on the merits): "Second or any
  subsequent actions on the merits shall be final, except where the examiner
  introduces a new ground of rejection that is neither necessitated by
  applicant's amendment ... nor based on [a later-filed IDS]" (37 CFR 1.113;
  MPEP 706.07, 2271 "Final Action",
  https://www.uspto.gov/web/offices/pac/mpep/s2271.html , as-of 2026-06-17).
  After final, applicant's options narrow to: after-final amendment (37 CFR
  1.116, entry discretionary), **RCE** (37 CFR 1.114), or **appeal** (the final
  action concludes with ¶ 22.09 or ¶ 22.10).

> Domain mapping: a single boolean/enum `isFinal` (or
> `OfficeActionKind = "non_final" | "final" | "advisory" | ...`) on
> `OfficeAction`. It gates the applicant's available `ResponseStrategy`.

---

## 2. The statutory REJECTION taxonomy

Each rejection type asserts a different defect and carries a different
burden-shifting structure: the **examiner** must establish a *prima facie* case;
the **applicant** then rebuts. The four families the loop must model are
§ 101, § 102, § 103, § 112. (Within the schema these are a discriminated union
keyed by `statute`/`section`.)

### 2.1 § 101 — Subject-matter eligibility (abstract idea / judicial exceptions)

**Statute:** processes, machines, manufactures, compositions of matter are
eligible; **abstract ideas, laws of nature, natural phenomena** are the
judicially-created exceptions (35 U.S.C. 101; USPTO Subject Matter Eligibility,
https://www.uspto.gov/patents/laws/examination-policy/subject-matter-eligibility ,
as-of 2026-06-17).

**Examiner must show (the Alice/Mayo two-step, as operationalized by the USPTO
flowchart, MPEP 2106; 2024 Guidance Update, Fed. Reg. 2024-15377, eff.
2024-07-17,
https://www.federalregister.gov/documents/2024/07/17/2024-15377/ , as-of
2026-06-17):**

- **Step 1** — claim falls in a statutory category (process/machine/etc.).
- **Step 2A Prong One** — claim *recites* a judicial exception. For abstract
  ideas, it must fall in one of three enumerated **groupings**: (a)
  **mathematical concepts**, (b) **certain methods of organizing human
  activity** (e.g., fundamental economic practices, commercial interactions,
  managing personal behavior), (c) **mental processes** (observation,
  evaluation, judgment, opinion).
- **Step 2A Prong Two** — whether the additional elements **integrate** the
  exception into a **practical application** (if yes → eligible).
- **Step 2B** — if not integrated, whether additional elements add
  **"significantly more"** (an *inventive concept*) beyond well-understood,
  routine, conventional activity.
- **Threshold (2025 reminder memo):** a § 101 rejection should be made only when
  "more likely than not" the claim is ineligible — preponderance of evidence,
  not mere uncertainty (USPTO 101 memo, 2025-08-04,
  https://www.uspto.gov/sites/default/files/documents/memo-101-20250804.pdf ,
  as-of 2026-06-17).

**Applicant argues back:** claim is not directed to an abstract idea (Prong One
miss); or the additional elements integrate it into a practical application /
improve a technology (Prong Two); or recite significantly more than conventional
activity (Step 2B); often paired with a narrowing **amendment**.

### 2.2 § 102 — Anticipation (novelty; prior art fully discloses)

**Examiner must show:** a **single** prior-art reference discloses **each and
every element** of the claim, **"arranged as in the claim,"** either expressly
or **inherently** (MPEP 2131 "Anticipation",
https://www.uspto.gov/web/offices/pac/mpep/s2131.html , as-of 2026-06-17). The
examiner cites the reference under the broadest reasonable interpretation and
identifies, limitation-by-limitation, where each appears. **Inherency:** a
characteristic "necessarily present" in the reference counts even if not
expressly stated (MPEP 2112,
https://www.uspto.gov/web/offices/pac/mpep/s2112.html ). The examiner bears the
initial burden of the prima facie case (MPEP 2131, 2112).

**One reference, all elements.** Multiple references are allowed only to show
the primary reference is enabled, to define a term, or to evidence an inherent
feature (MPEP 2131.01,
https://www.bitlaw.com/source/mpep/2131-01.html , as-of 2026-06-17).

**Applicant argues back (three classic paths):** (1) a claim **limitation is
missing** from the reference (the distinction); (2) attack the reference's prior-
art **status/date** (antedate / not prior art); (3) **amend** to add a limitation
the reference lacks. Note: "non-analogous art" and "teaches away" are *not
germane* to a § 102 rejection — those are § 103 arguments (MPEP 2131;
piersonpatentlaw.com sample wording, https://piersonpatentlaw.com/how-to-respond-to-a-35-usc-102-rejection-including-sample-wording/ ,
as-of 2026-06-17).

### 2.3 § 103 — Obviousness

**Examiner must show (Graham v. John Deere factual inquiries + KSR
reasoning, MPEP 2141/2143,
https://www.uspto.gov/web/offices/pac/mpep/s2141.html ,
https://www.uspto.gov/web/offices/pac/mpep/s2143.html , as-of 2026-06-17):**

- The **Graham factors**: (1) scope & content of the prior art; (2) differences
  between the prior art and the claims; (3) level of ordinary skill in the art;
  (4) objective indicia of non-obviousness ("secondary considerations").
- An **articulated reason to combine/modify** the references, with a **rational
  underpinning** (post-*KSR*, the rigid TSM test is not the sole test; "common
  sense," design need, and market forces are permitted — but "some articulated
  reasoning" is still required; not conclusory hindsight).
- A **reasonable expectation of success**.
- The USPTO recognizes **seven exemplary rationales** (MPEP 2143): (1) combine
  prior-art elements by known methods → predictable result; (2) simple
  substitution of one known element for another; (3) use of known technique to
  improve a similar device; (4) apply a known technique to a device ready for
  improvement; (5) "obvious to try" — a finite number of predictable solutions;
  (6) known work in one field prompting variation in another (design
  incentives/market forces); (7) explicit teaching/suggestion/motivation (TSM)
  in the art.

**Applicant argues back:** the references **don't teach/suggest** a limitation;
the prior art **teaches away** from the combination; **no motivation /
articulated reason** to combine (or impermissible hindsight); **no reasonable
expectation of success**; and/or **objective indicia** of non-obviousness
(unexpected results, commercial success, long-felt need, copying) — often via a
**Rule 132 declaration** (37 CFR 1.132; MPEP 716,
https://www.uspto.gov/web/offices/pac/mpep/s2141.html , as-of 2026-06-17).

> § 103 is **multi-reference**: a `Rejection` of type `§103` cites ≥1 prior-art
> references in a **combination**, with a `combinationRationale`. This is the
> key cardinality difference from § 102 (single reference).

### 2.4 § 112 — Specification & claim-language defects

§ 112 splits into distinct sub-grounds (MPEP 2161, 2174, 2175,
https://www.uspto.gov/web/offices/pac/mpep/s2161.html ,
https://www.uspto.gov/web/offices/pac/mpep/s2174.html , as-of 2026-06-17). These
are **non-prior-art** rejections — they cite the application's own
specification/claims, not external references:

| Sub-ground | Statute | Examiner must show | Applicant argues |
|---|---|---|---|
| **Written description** | § 112(a) | The spec doesn't show the inventor **possessed** the claimed invention at filing | Point to spec support; amend claim to track disclosure |
| **Enablement** | § 112(a) | A reasonable basis that a PHOSITA **couldn't make/use** the full claim scope without **undue experimentation** (Wands factors) | Show the disclosure enables the scope; narrow the claim |
| **Definiteness** | § 112(b) | A claim term is **indefinite** (fails to particularly point out & distinctly claim) | Clarify/amend the term; argue a PHOSITA understands it |
| **Means-plus-function** | § 112(f) | (Construction) functional claiming invokes corresponding structure in the spec | Identify corresponding structure / amend |

> Modeling note: § 112 rejections have **no `PriorArtReference`**; their
> "evidence" points into the *application's own* specification span. This is why
> `Rejection.citedReferences` must be **optional** (0..n) — § 112/§ 101 may cite
> none.

### 2.5 Cross-cutting: the prima-facie / burden-shift pattern

Across all four, the same shape recurs and should be a first-class modeled
field: **examiner's prima-facie showing** (a structured assertion) →
**burden shifts** → **applicant's rebuttal** (the distinction / amendment /
evidence). MPEP 2106 (§101), 2131/2112 (§102), 2142 (§103), 2164 (§112)
all express this burden-shift (URLs above; MPEP 2142,
https://www.uspto.gov/web/offices/pac/mpep/s2141.html , as-of 2026-06-17).

---

## 3. How rejections map to CLAIMS and cite PRIOR ART

### 3.1 Claim-by-claim mapping

Rejections are **per-claim**: "each rejected claim [is] specified," and the
examiner states all grounds applicable to each claim (MPEP 706,
https://www.uspto.gov/web/offices/pac/mpep/s706.html , as-of 2026-06-17). A
single `Rejection` typically lists a **set of claims** ("Claims 1–5 and 9 are
rejected under 35 U.S.C. 103 as ..."), and a single **claim can be hit by
multiple rejections** (e.g., claim 1 rejected under both § 102 and § 112). So the
`Rejection ↔ Claim` relationship is **many-to-many**.

Claims also carry **dependency structure** (independent claim 1; dependent claim
2 "wherein ..."). Examiners often reject an independent claim and its dependents
together, sometimes treating dependents separately ("Claim 3 is allowable if
rewritten in independent form"). The model should capture
`Claim.dependsOn: Option<ClaimRef>` and `Claim.kind = "independent" |
"dependent"`.

### 3.2 Prior-art citation inside a rejection

A `PriorArtReference` (the bibliographic entity, listed on PTO-892) is **cited
by** a rejection and **mapped element-by-element** to claim limitations. For
§ 102: one reference, all elements. For § 103: a combination
(`reference A in view of reference B`), with the examiner pointing to which
reference supplies which limitation, plus the combination rationale. The
limitation-level mapping is what the applicant attacks. So model an explicit
**`ElementMapping`** (claim limitation ↔ reference disclosure span) — this is the
unit a `Distinction` rebuts.

---

## 4. The applicant RESPONSE workflow (the § 132 reply)

When a claim is rejected, the Director notifies the applicant of the reasons; the
applicant may "persist ... with or without amendment," triggering reexamination —
this is the **§ 132 response** (35 U.S.C. 132,
https://www.law.cornell.edu/uscode/text/35/132 , as-of 2026-06-17). **No
amendment may introduce new matter** (§ 132(a)).

A response (a.k.a. "amendment and remarks") has two parts (MPEP 714,
https://www.uspto.gov/web/offices/pac/mpep/s714.html , as-of 2026-06-17):

1. **Amendments** — changes to the **claims** (and/or spec/drawings), usually
   **narrowing** to add a limitation that distinguishes over the art (MPEP 714).
2. **Remarks / Arguments** — the reply "must present arguments pointing out the
   specific distinctions believed to render the claims ... patentable over any
   applied references" (MPEP 714.02–714.03). **This sentence is the legal
   definition of the DISTINCTION** (see § 5).

### 4.1 The escalation ladder (high level)

```
Non-final OA ──► §132 response (amend + argue/distinguish)
   │                       │
   │              examiner persuaded? ──► Allowance
   ▼                       │ no
Final OA ──────────────────┘
   ├─► After-final amendment (37 CFR 1.116) — entry discretionary; Advisory Action
   ├─► RCE (37 CFR 1.114) — reopen prosecution; "submission" + fee (MPEP 706.07(h))
   └─► Appeal to PTAB (35 U.S.C. 134; any claim "twice rejected") — Notice of
        Appeal ──► Appeal Brief ──► Examiner's Answer ──► (Reply Brief) ──► PTAB decision
```

- **RCE** keeps the application pending after prosecution closes; "submission"
  includes an amendment, new arguments, or new evidence (37 CFR 1.114; MPEP
  706.07(h), https://www.bitlaw.com/source/mpep/706-07-h.html , as-of
  2026-06-17).
- **Appeal:** "any of whose claims has been twice rejected, may appeal ... to the
  Patent Trial and Appeal Board" (35 U.S.C. 134; MPEP 1204 "Notice of Appeal",
  https://www.uspto.gov/web/offices/pac/mpep/s1204.html , as-of 2026-06-17).
- **Rule 132 declaration** (37 CFR 1.132): factual evidence (unexpected results,
  comparative data) submitted to rebut a rejection — primarily § 103 (MPEP 716;
  Lexology/PTAB on Rule 132 pitfalls,
  https://www.lexology.com/library/detail.aspx?g=a37a9759-9452-48b5-8989-1dd5d990024c ,
  as-of 2026-06-17).

> Rung-0 scope: model the response shape (`Response` with `amendments[]` +
> `arguments[]/distinctions[]`) and the strategy enum, but the loop only needs to
> *produce a distinction*, not execute the full ladder. `ResponseStrategy =
> "argue" | "amend" | "amend_and_argue" | "rce" | "appeal" | "abandon"`.

---

## 5. The DISTINCTION — the targeted work product

A **distinction** (distinguishing argument) is the attorney's assertion that a
claim is **patentably distinguishable** from a specific cited reference (or
combination). The MPEP defines the obligation: the reply "must present arguments
pointing out the **specific distinctions** believed to render the claims ...
patentable over any applied references" (MPEP 714.02,
https://www.uspto.gov/web/offices/pac/mpep/s714.html , as-of 2026-06-17). An
applicant overcomes a prior-art rejection "by persuasively arguing that the
claims are patentably distinguishable from the prior art, or by amending the
claims to patentably distinguish over the prior art" (MPEP 2120 family,
https://www.uspto.gov/web/offices/pac/mpep/s2120.html , as-of 2026-06-17).

A distinction is typed by the *kind* of gap it asserts (these map cleanly onto
the rejection types in § 2):

| Distinction kind | Rebuts | Asserts |
|---|---|---|
| **Missing limitation** | § 102 / § 103 | Reference(s) don't disclose claim element X |
| **No motivation to combine** | § 103 | No articulated reason to combine A + B |
| **Teaches away** | § 103 | The art discourages the combination |
| **No reasonable expectation of success** | § 103 | PHOSITA wouldn't predict success |
| **Objective indicia** | § 103 | Unexpected results / commercial success (Rule 132) |
| **Not an abstract idea / practical application** | § 101 | Step 2A miss / integration |
| **Reference not prior art** | § 102 | Date/status attack (antedate) |
| **Adequate support / definite** | § 112 | Spec supports / term is clear |

> **Prosecution-history caution (model it as durable provenance):** statements
> made in a distinction become **prosecution-history estoppel / disavowal** —
> binding claim-scope surrender (Finnegan, Prosecution-History in Claim
> Interpretation, https://www.finnegan.com/en/insights/blogs/prosecution-first/part-1-prosecution-history-in-claim-interpretation.html ,
> as-of 2026-06-17). The distinction is therefore not throwaway text — it is a
> permanent, span-anchored claim about the record. This is exactly the
> "provenance everywhere / candidate-then-proven" invariant the epistemic slice
> enforces.

---

## 6. Synthesized DOMAIN VOCABULARY (seeds for bespoke Effect-Schema)

Bespoke Effect-Schema in `law-practice/domain`, following the binding sequencing
(schema → service contract → impl → verify). Fields below are a **starting
vocabulary**, not a final schema; `@source` hints are JSDoc-light (CPC/IPC for
classification, PROV-O for activity/derivation, SKOS for the controlled
vocabularies). All ids are minted/stable EntityIds; bibliographic locators
(application no., patent no.) are **properties, never identity** (per product
invariant C2/DMS).

### 6.1 `OfficeAction`
| Field | Type (intent) | Notes |
|---|---|---|
| `id` | OfficeActionId | minted |
| `applicationNumber` | string (property) | USPTO serial no. |
| `matterId` | MatterRef | the matter wall (federation invariant) |
| `kind` | `"non_final" \| "final" \| "advisory" \| "restriction"` | gates response options |
| `mailDate` / `replyDueDate` | Date | from PTOL-326 |
| `examiner` | { name, artUnit } | |
| `rejections` | `Rejection[]` | 0..n |
| `objections` | `Objection[]` | formal; thin |
| `citedReferences` | `PriorArtReference[]` | PTO-892 set |
| `allowableSubjectMatter` | ClaimRef[] (optional) | claims indicated allowable |
| `sourceDocRef` | DocumentRef + char-span | provenance to the fixture PDF |

### 6.2 `Claim`
| Field | Type | Notes |
|---|---|---|
| `id` | ClaimId | |
| `number` | int | as filed |
| `kind` | `"independent" \| "dependent"` | |
| `dependsOn` | `Option<ClaimRef>` | dependency tree |
| `text` | string (+ char-span evidence) | the claim language |
| `limitations` | `ClaimLimitation[]` | the elements a rejection maps to |
| `status` | `"pending" \| "rejected" \| "objected" \| "allowed" \| "withdrawn" \| "canceled"` | from PTOL-326 |

### 6.3 `Rejection` (discriminated union on `statute`)
| Field | Type | Notes |
|---|---|---|
| `id` | RejectionId | |
| `statute` | `"§101" \| "§102" \| "§103" \| "§112"` | the discriminant |
| `subGround` | (§112) `"written_description" \| "enablement" \| "definiteness" \| "112f"`; (§101) `"abstract_idea" \| "law_of_nature" \| "natural_phenomenon"` | |
| `rejectedClaims` | `ClaimRef[]` | **many-to-many** with Claim |
| `citedReferences` | `PriorArtReference[]` (0..n) | §102: exactly 1; §103: ≥1 combo; §101/§112: 0 |
| `primaFacieAssertion` | structured text + span | examiner's showing |
| `elementMappings` | `ElementMapping[]` | limitation ↔ reference-disclosure span (§102/§103) |
| `combinationRationale` | Option<{ rationale, motivation }> | §103 only; one of the 7 KSR rationales |
| `eligibilityAnalysis` | Option<{ step1, step2aProng1Grouping, step2aProng2, step2b }> | §101 only |
| `isFinal` | boolean | inherited from OfficeAction.kind |
| `sourceSpan` | char-span | the "reject ... under 35 U.S.C. §" opening sentence |

### 6.4 `Objection`
`{ id, target: "drawing" | "specification" | "claim_formalities", description, objectedClaims?: ClaimRef[], sourceSpan }` — formal defect; recourse is petition, not appeal.

### 6.5 `PriorArtReference`
| Field | Type | Notes |
|---|---|---|
| `id` | PriorArtId | minted |
| `kind` | `"us_patent" \| "us_publication" \| "foreign_patent" \| "npl"` | |
| `documentNumber` | string (property) | patent/pub no. |
| `inventors` / `assignee` | string[] | |
| `publicationDate` / `effectiveDate` | Date | the §102 date attack target |
| `classification` | CPC/IPC codes (optional) | `@source` CPC/IPC |
| `disclosedFeatures` | span[] | what the examiner says it teaches |

### 6.6 `Distinction` (the work product; discriminated on `kind`)
| Field | Type | Notes |
|---|---|---|
| `id` | DistinctionId | |
| `kind` | see § 5 table (`missing_limitation`, `no_motivation`, `teaches_away`, `no_reasonable_expectation`, `objective_indicia`, `not_abstract`, `practical_application`, `reference_not_prior_art`, `adequate_support`) | |
| `rebuts` | RejectionRef | which rejection |
| `targetClaim` | ClaimRef | |
| `targetReference` | Option<PriorArtRef> | the cited art being distinguished |
| `targetLimitation` | Option<ClaimLimitationRef> | the element asserted missing |
| `argumentText` | string (+ span into the response/spec) | the prose |
| `lifecycleState` | from epistemic `ClaimLifecycle` | **candidate → shape-valid → ... → admitted** |
| `evidence` | `Evidence[]` (char-span) | grounds the argument in the OA / claim / spec |

> The `Distinction` is the object that flows through the epistemic
> `CandidateClaim` + `ClaimLifecycle` gate. Its `evidence` uses the ported v3
> EvidenceSpan char-offset primitive. The `lifecycleState` is **owned by the
> epistemic slice**; law-practice composes it via epistemic's public surface.

### 6.7 `Response` (envelope; rung-0 may stub)
`{ id, respondsTo: OfficeActionRef, strategy: ResponseStrategy, amendments: ClaimAmendment[], distinctions: Distinction[], filedDate }`.

### 6.8 Relationship summary
```
Matter 1──n OfficeAction 1──n Rejection n──n Claim
                         │              │ 1──n ElementMapping n──1 ClaimLimitation
                         │              └──n PriorArtReference (0..n)
                         └──n Objection
Rejection 1──n Distinction n──1 Claim
Distinction n──1 PriorArtReference (opt)  ·  Distinction 1──n Evidence(char-span)
Claim 1──n ClaimLimitation  ·  Claim dependsOn 0..1 Claim
Response 1──1 OfficeAction  ·  Response 1──n {Distinction, ClaimAmendment}
```

---

## 7. Modeling decisions this grounding forces (hand-off to the spike)

1. **`Rejection` is a discriminated union**, not a flat record — §-type changes
   cardinality (refs 0/1/n) and which sub-structure is present
   (`eligibilityAnalysis` vs `combinationRationale` vs `subGround`).
2. **`citedReferences` is optional** — §101/§112 cite none; the schema must not
   require prior art on every rejection.
3. **`Rejection ↔ Claim` is many-to-many**; **`Claim.dependsOn`** captures the
   dependency tree.
4. **`Distinction.kind` mirrors the rebuttal taxonomy** and is the loop's payload
   into the epistemic gate; its `lifecycleState` is epistemic-owned.
5. **Rejection/Objection split is load-bearing** (appeal vs petition) — keep them
   distinct entities, not a flag.
6. **Provenance is the durable invariant**: the distinction is prosecution-history
   estoppel — every assertion must be span-grounded, matching the
   candidate→proven epistemic discipline and the matter-wall federation
   invariant.
7. **`@source` hints stay JSDoc-light** (CPC/IPC, PROV-O, SKOS) — the 7-source
   ontology grounding remains DEFERRED; bespoke Effect-Schema is the TBox.

---

## Confidence & Caveats

**High confidence (primary / near-primary sourced this session):**
- Office-action structure, forms (PTOL-326, PTO-892), rejection-vs-objection,
  non-final-vs-final, conventional ordering, form paragraphs — MPEP 706, 707,
  2262, 2271 (Nov-2024 revision), fetched/searched 2026-06-17.
- §102 anticipation test ("each and every element, single reference, arranged as
  in the claim," inherency) — MPEP 2131/2131.01/2112, fetched 2026-06-17.
- §103 Graham factors + the seven KSR rationales + reasonable-expectation-of-
  success — MPEP 2141/2143, fetched 2026-06-17.
- §112 sub-grounds (written description / enablement / definiteness / 112(f)) —
  MPEP 2161/2174/2175, searched 2026-06-17.
- §132 response / new-matter bar / RCE / appeal ("twice rejected") / Rule 132 —
  35 U.S.C. 132 & 134 (Cornell LII), MPEP 714/706.07(h)/1204, 2026-06-17.
- The DISTINCTION definition (MPEP 714.02 "specific distinctions ... patentable
  over any applied references") — searched/confirmed 2026-06-17.

**Medium confidence (synthesized; verify before locking schema):**
- The §101 two-step detail (Step 2A Prong One groupings, Prong Two, Step 2B, the
  "more likely than not" threshold) came via the search summary of the **2024
  Guidance Update (Fed. Reg. 2024-15377, eff. 2024-07-17)** and the
  **2025-08-04 USPTO 101 memo**; the federalregister.gov direct fetch was
  **blocked by a redirect to unblock.federalregister.gov and NOT fetched**. The
  groupings and prongs are well-established MPEP 2106 doctrine, but the precise
  current wording should be re-verified against MPEP 2106 directly before the
  schema's §101 sub-structure is frozen.
- Exact form-paragraph numbers (¶ 7.100–7.102 contact; ¶ 22.09/22.10 final) are
  from the search/fetch summaries, not from opening the Form Paragraph chapter
  in full; treat numbers as indicative.

**Out of scope / DEFERRED (per locked decisions):**
- The 7-source IP-law ontology grounding (CPC/IPC, FOLIO, PROV-O, SKOS, etc.) —
  referenced as `@source` hints only; `goals/ip-law-knowledge-graph` stays
  PENDING.
- Trademark office actions (this artifact is **patent**-only, matching the
  fixture/loop). Trademark OAs differ (likelihood-of-confusion §2(d),
  descriptiveness §2(e)) and are not modeled here.
- Double-patenting, restriction/election, and reissue/reexam nuances — noted but
  not modeled at rung 0.

### Verification (2026-06-17)

Independent skeptical spot-check of the load-bearing statutory citations against
USPTO MPEP primary sources (fetched this session):

- **§102 (MPEP 2131):** CONFIRMED. The MPEP states a claim is anticipated when
  "each and every element as set forth in the claim is found, either expressly or
  inherently described, in a single prior art reference," elements "arranged as
  required by the claim" (explicitly "not an *ipsissimis verbis* test"). The
  file's §2.2 wording is accurate, including inherency.
- **§103 (MPEP 2143):** CONFIRMED. The seven KSR rationales (A–G) match the file's
  §2.3 list one-to-one; rationale **(G) IS the TSM rationale** (the file correctly
  lists TSM as the 7th), and the list is expressly "not all-inclusive." Accurate.
- **§101 (MPEP 2106):** CONFIRMED — the previously medium-confidence detail checks
  out. Step 2A Prong One (recites a judicial exception), Prong Two (integration
  into a practical application), Step 2B ("significantly more" / inventive
  concept), and the three abstract-idea groupings (mathematical concepts; certain
  methods of organizing human activity — incl. fundamental economic practices,
  commercial/legal interactions, managing personal behavior; mental processes) are
  all stated as in the file's §2.1. The §2.1 detail can be **upgraded from medium
  to high confidence** for the framework/groupings; the "more likely than not"
  threshold memo was not re-fetched and stays as-is.
- **§112 (MPEP 2174):** CONFIRMED in substance. 2174 governs the 112(a) vs 112(b)
  relationship; the file's collective citation of 2161/2174/2175 for the
  written-description / enablement / definiteness / 112(f) sub-grounds is sound.

No outright errors found in this file; no content Edits required. The §101
sub-structure is now safe to freeze against MPEP 2106.

**Not independently verifiable here:** the precise fixture office action the loop
will use (no fixture inspected); field names are a *proposed vocabulary* for the
spike's P0 schema phase, to be reconciled with
`goals/agentic-professional-runtime/docs/data-model-law-practice.md` (which
already includes an `OfficeAction`) during decomposition.
