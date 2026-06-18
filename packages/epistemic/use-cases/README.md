# @beep/epistemic-use-cases

Application-tier contracts and pure logic for the epistemic slice: the
`ClaimGate` service (a thin composition over the bounded `@beep/semantic-web`
SHACL engine), the `ClaimLifecycle` transition service, and the pure
`ClaimProjection` read-model fold.

- `@beep/epistemic-use-cases/public` — the client-safe surface (the pure
  `ClaimProjection`).
- `@beep/epistemic-use-cases/server` — the server-only service contracts
  (`ClaimGate`, `ClaimLifecycle`).

Service-port contracts use the `.ports.ts` / `.service.ts` role suffixes: the
gate is a service port, not a repository port, so it is not `.repository.ts`.
Live Layers that resolve `ShaclValidationService` live in `@beep/epistemic-server`,
never here — this tier owns contracts and pure logic only.
