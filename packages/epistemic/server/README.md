# @beep/epistemic-server

Server tier for the epistemic slice: the thin live Layer surface
(`EpistemicServerLive`) that wires the `ClaimGate` over the bounded
`@beep/semantic-web` SHACL engine and the `ClaimLifecycle` transition, providing
`ShaclValidationServiceLive` once at the merge boundary.

Import the composed layer from `@beep/epistemic-server/layer`.
