# Effect-vitest review of docs test filesystem provenance

The only remaining introduced detector row is EV010, `platform-filesystem-candidate`,
severity info, confidence 0.55, mechanization judgment. The fixture harness uses Effect
FileSystem and Path services. `docs-rules.test.ts` merges NodeFileSystem.layer and
NodePath.layer and supplies them once through `it.layer` with an explicit timeout.
This satisfies the proposed layer ownership. No per-test Effect.provide, resource leak,
manual runtime test driver, or unresolved assertion route remains.

The earlier EV006 predicate assertion was rewritten with assertTrue; no new non-review
finding is accepted. Refreshing the inventory baseline accepts only this reviewed
filesystem-provenance row and removes resolved rows from the retired docs cache tests.
