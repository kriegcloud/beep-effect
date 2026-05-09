# Discriminated Union Modeling Plan

This plan executes [SPEC.md](./SPEC.md) as a doctrine plus low-risk proof
batch.

## A. Establish Doctrine

- Add the initiative packet and list it from `initiatives/README.md`.
- Update the architecture standard and rich-domain model guidance with the
  finite-state / case-payload rule.
- Add a 2026-05-09 architecture decision explaining why this is doctrine.
- Update Effect-first and schema-first skill guidance without claiming hard
  scanner enforcement.

## B. Convert The Proof Batch

- Convert `BeepPackageMetadata` to the repo-preferred
  `LiteralKit + mapMembers + Tuple.evolve + S.toTaggedUnion("family")` pattern.
- Convert existing `_tag` response/notification unions to real tagged schema
  unions.
- Convert existing semantic-web discriminator unions to `S.toTaggedUnion(...)`.
- Use generated `.match` helpers at nearest direct branch sites where the
  conversion makes the branch clearer and exhaustive.
- Preserve public discriminator values and encoded wire shapes.

## C. Record Deferred Work

- Document higher-risk candidates in `DEFERRED-CANDIDATES.md`.
- Classify generated-schema, recursive-AST, SSE, docgen result, provenance, and
  UI/client state work as future targeted batches.

## Required Checks

- `bun --cwd packages/tooling/library/repo-utils run check`
- `bun --cwd packages/tooling/library/repo-utils run test`
- `bun --cwd packages/tooling/library/repo-utils run lint`
- `bun --cwd packages/drivers/xai run check`
- `bun --cwd packages/drivers/xai run test`
- `bun --cwd packages/drivers/xai run lint`
- `bun --cwd packages/drivers/acp run check`
- `bun --cwd packages/drivers/acp run test`
- `bun --cwd packages/drivers/acp run lint`
- `bun --cwd packages/foundation/capability/semantic-web run check`
- `bun --cwd packages/foundation/capability/semantic-web run test`
- `bun --cwd packages/foundation/capability/semantic-web run lint`
- `bun run check`
- `bun run lint`
- `bash scripts/run-github-checks.sh quality`

If a root gate is blocked by unrelated pre-existing state, record the exact
failure and the focused gates that passed.
