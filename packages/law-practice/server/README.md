# @beep/law-practice-server

Server tier for the law-practice slice: the live `Layer` surface that wires the
slice's use-case ports to real implementations.

- `@beep/law-practice-server/layer` — `LawPracticeServerLive`, composing the
  `IrToLaw` mapping and the `OfficeActionReview` loop over the epistemic server
  (`ClaimGate` + `ClaimTransition`, themselves over the bounded SHACL engine).

The review loop depends on the epistemic admission services, so this tier
provides `EpistemicServerLive` at the merge boundary. The cross-slice
`@beep/epistemic-*` dependency is the slice's documented bounded exception (per
the spike SPEC Exception Ledger + `DECISIONS.md`); the law-practice DOMAIN tier
stays clean.

This is a spike: source ingestion (`@beep/file-processing` +
`@beep/langextract` model-driven extraction) is stubbed by a fixed candidate set
inside the `OfficeActionReview` implementation, and entity id/audit fields come
from a spike shim rather than a real id generator / `Clock` / request context.
