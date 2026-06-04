# GOAL: Build the ontology modeling foundation

Repo: `/home/elpresidank/YeeBois/projects/beep-effect`.

Outcome: create domain-safe `@beep/rdf` and `@beep/ontology` foundation
modeling packages, promote the scratch ontology builder into `@beep/ontology`,
and keep `@beep/semantic-web` compatibility re-exports intact.

This is a compact `/goal` launcher. Treat the packet files as the detailed
contract:

- `goals/ontology-modeling-foundation/README.md`
- `goals/ontology-modeling-foundation/SPEC.md`
- `goals/ontology-modeling-foundation/PLAN.md`
- `goals/ontology-modeling-foundation/research/package-home.md`
- `goals/ontology-modeling-foundation/ops/manifest.json`

Read those first, then read `AGENTS.md`, `CLAUDE.md`, and the architecture
standards named by `SPEC.md`. Higher-priority repo standards outrank packet
prose when they conflict.

Scope:

- In: `@beep/rdf`, `@beep/ontology`, semantic-web compatibility re-exports,
  identity/config/generated surfaces touched by scaffolding, and scratchpad
  ontology examples/tests.
- Out: legal-domain ontology packages, PROV/evidence migration, semantic-web
  services/adapters migration, SHACL/SPARQL/OWL engine work, app/runtime wiring,
  and removal of existing semantic-web pure-value import paths.

Workflow:

1. Preserve unrelated dirty worktree changes.
2. Scaffold `rdf` and `ontology` with `create-package` after dry-runs.
3. Move pure IRI/URI/RDF/JSON-LD/vocab values into `@beep/rdf`.
4. Promote the scratch ontology builder into `@beep/ontology`.
5. Leave scratchpad as a thin package-consumer example.
6. Keep decisions tied to repo files, tests, docs, and command output.

Acceptance:

- [ ] `SPEC.md` acceptance criteria are satisfied.
- [ ] Required verification commands pass, or unrelated failures are reproduced
      and recorded separately.
- [ ] No unrelated refactors or formatting churn.

Verification:

```sh
test "$(wc -m < goals/ontology-modeling-foundation/GOAL.md)" -le 4000
jq . goals/ontology-modeling-foundation/ops/manifest.json
rg -n "ontology-modeling-foundation|GOAL.md|agentLaunchers|packetAnchorDocument" goals/ontology-modeling-foundation
git diff --check -- goals/ontology-modeling-foundation
bun run --filter=@beep/rdf check test lint
bun run --filter=@beep/ontology check test lint
bunx tsgo -p scratchpad/tsconfig.json
bunx tsc -p scratchpad/tsconfig.json --noEmit --pretty false
bunx vitest run --config scratchpad/vitest.config.ts
```

Done only when acceptance passes and verification is complete, or when a
blocker is reported with file/command evidence.
