---
"@beep/schema": patch
"@beep/provenance": patch
"@beep/identity": patch
"@beep/epistemic-domain": patch
"@beep/shared-domain": patch
"@beep/law-practice-domain": patch
"@beep/law-practice-use-cases": patch
"@beep/law-practice-server": patch
---

Graduate the `law-practice` slice to minimum-viable (domain → use-cases → server) and land the rung-0 office-action review loop, plus the foundation/shared substrate it consumes. No package releases required (all touched packages are private, `0.0.0`).

- **Foundation:** new `@beep/provenance` (`TextAnchor`) and `@beep/schema` `UnitInterval` domain-agnostic primitives; refactored epistemic `EvidenceSpan` to wrap them.
- **Shared-kernel:** promoted `ClaimLifecycle` (+ `ClaimLifecycleTransition`) to `@beep/shared-domain` with a promotion record; re-pointed epistemic.
- **Doctrine:** `DECISIONS.md` ADR for cross-slice consumption of the epistemic boundary; `GLOSSARY` provenance-anchor term; epistemic span renamed to snake_case.
- **law-practice:** `@beep/law-practice-domain` (OfficeAction/Claim/Rejection §102/PriorArtReference/Distinction), `@beep/law-practice-use-cases` (`IrToLaw` consuming span-bearing `GroundedExtraction[]`, `OfficeActionReview`), and `@beep/law-practice-server` (`LawPracticeServerLive` composing `EpistemicServerLive`). The domain tier imports only foundation + shared-kernel; the epistemic mechanism is composed via its public surface at the use-cases/server tiers (documented bounded exception).
