# Reflection Log

Cumulative learnings across all phases of the Palantir Ontology reverse-engineering project.

---

## Phase 0: Scaffolding (2026-02-20)

**What worked:**
- Explored completed shared-memories spec to establish conventions for handoffs, orchestrator prompts, and phase organization
- User interview surfaced clear goals and design decisions before writing began
- All 7 design questions answered upfront, preventing ambiguity in later phases

**What we learned:**
1. Palantir has ~190+ public blog posts covering their technology in depth — significant primary source material
2. 18 open-source repos provide direct code-level evidence of Ontology patterns (especially osdk-ts, foundry-platform-typescript)
3. Chrome session files can be mined for URLs without remote debugging (strings + grep approach)
4. Defining KG schema before data collection (P1 first) prevents retrofitting data to schema later

**Key decisions made:**
- AD-001 through AD-008 locked in README.md
- Phase structure: P0-P7 with P4 split into parallel P4a (docs) + P4b (repos)
- Two separate data schemas: WebResearchLink (web content) and RepoAnalysisResult (code repos)
- Implementation freedom: no repo coding standards for archival code

---
