# Phase 5 Meeting Prep Quality Report

Generated at: 2026-02-15T05:23:26.021Z

## Deterministic Inputs

- Extraction report: `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- Curated documents: `/home/elpresidank/.cache/todox-test-data/enron/curated/documents.json`
- Curated threads: `/home/elpresidank/.cache/todox-test-data/enron/curated/threads.json`
- Scenario count: 4
- Bullets generated: 12
- Evidence items validated: 12
- Fully valid bullets: 12/12

## Scenario Selection

| Scenario | Use Case | Source Document | Thread | Categories | Query | Selection Rationale |
|---|---|---|---|---|---|---|
| scenario-1 | pre-meeting agenda/follow-up | Re: Senator Joe Dunn's Conference Call (email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a) | thread:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a | actionItems, multiParty, deepThread | `Conference Call` | Contains explicit scheduling and availability coordination for an upcoming call, including follow-up asks. |
| scenario-2 | deal/financial discussion | Re: Duke Exchange Deal (email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88) | thread:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88 | financial, actionItems, deepThread | `Duke Exchange Deal` | Includes deal/ticket references and monetary amounts tied to settlement and cashout workflow decisions. |
| scenario-3 | org-role/ownership change | Re: Re2: SCE Legislative Language (email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42) | thread:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42 | financial, actionItems, multiParty, deepThread | `Rod Wright` | Thread discusses shifting political/regulatory power centers (committee leadership and appointees) and ownership of outcomes. |
| scenario-4 | multi-party negotiation/action tracking | Re: Fuel Supply Agreement (email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607) | thread:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607 | actionItems, multiParty, deepThread | `Fuel Supply Agreement` | Shows cross-party contract negotiation with explicit action requests, execution sequencing, and dependency tracking. |

## Mismatch Modes

| Mode | Count |
|---|---|
| missingEvidence | 0 |
| wrongSpan | 0 |
| weakClaimSupport | 0 |
| crossThreadLeakage | 0 |

## Scenario Results

### scenario-1: pre-meeting agenda/follow-up

- Source: Re: Senator Joe Dunn's Conference Call (`email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a`)
- Query: `Conference Call`
- MeetingPrep ID: `meeting_prep__84db8c74-a641-494d-9533-10afe126aca6`
- Generated bullets: 3

| Bullet | Text | Evidence Reference(s) | Validation |
|---|---|---|---|
| 0 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000527 is supported by the cited source span. | email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a:857-877 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000527) | pass |
| 1 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000523 is supported by the cited source span. | email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a:633-654 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000523) | pass |
| 2 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000520 is supported by the cited source span. | email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a:407-429 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000520) | pass |

### scenario-2: deal/financial discussion

- Source: Re: Duke Exchange Deal (`email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88`)
- Query: `Duke Exchange Deal`
- MeetingPrep ID: `meeting_prep__3e68199c-2765-4d60-940c-f70c177a77b4`
- Generated bullets: 4

| Bullet | Text | Evidence Reference(s) | Validation |
|---|---|---|---|
| 0 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000346 is supported by the cited source span. | email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88:2591-2609 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000346) | pass |
| 1 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000342 is supported by the cited source span. | email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88:2130-2148 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000342) | pass |
| 2 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000337 is supported by the cited source span. | email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88:1456-1474 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000337) | pass |
| 3 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000334 is supported by the cited source span. | email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88:1289-1307 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000334) | pass |

### scenario-3: org-role/ownership change

- Source: Re: Re2: SCE Legislative Language (`email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42`)
- Query: `Rod Wright`
- MeetingPrep ID: `meeting_prep__23108687-5eec-4751-ba2b-05177b94d34a`
- Generated bullets: 1

| Bullet | Text | Evidence Reference(s) | Validation |
|---|---|---|---|
| 0 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000421 is supported by the cited source span. | email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42:681-691 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000421) | pass |

### scenario-4: multi-party negotiation/action tracking

- Source: Re: Fuel Supply Agreement (`email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607`)
- Query: `Fuel Supply Agreement`
- MeetingPrep ID: `meeting_prep__9d512345-25e5-4ec5-9177-6f8893c58879`
- Generated bullets: 4

| Bullet | Text | Evidence Reference(s) | Validation |
|---|---|---|---|
| 0 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000512 is supported by the cited source span. | email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607:1653-1674 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000512) | pass |
| 1 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000510 is supported by the cited source span. | email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607:1595-1616 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000510) | pass |
| 2 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000495 is supported by the cited source span. | email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607:474-495 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000495) | pass |
| 3 | Evidence-backed relationship: relation knowledge_relation__00000000-0000-7000-8000-000000000494 is supported by the cited source span. | email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607:419-440 (knowledge_relation_evidence__00000000-0000-7000-8000-000000000494) | pass |

## Quality Assessment

- Scenario coverage: all four required use-case categories were exercised with deterministic source document IDs.
- Briefing usefulness: evidence linkage is structurally reliable, but bullet text is generic relation metadata and not yet narrative/action-oriented for operator consumption.
- Evidence validity: citations resolved to real curated-source document bodies and UTF-16 spans; no missing references, span mismatches, or cross-thread leakage were observed in this run.

## Prioritized Remediation

1. P0: Replace relation-ID template bullet copy in `meetingprep_generate` with claim synthesis constrained to cited span semantics.
2. P1: Add scenario-scoped ranking in `relationEvidenceRepo.searchByText` to favor thread-local evidence when query terms are broad.
3. P1: Add an automated assertion in knowledge-server tests that every generated bullet has at least one resolvable `Evidence.List` item with exact span match.
