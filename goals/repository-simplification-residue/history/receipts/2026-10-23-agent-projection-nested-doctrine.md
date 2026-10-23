# S44: specialist projection and nested doctrine probes (2026-10-23)

Refs #1862. Scope: F-AGENT-PROJECTION and F-NESTED-DOCTRINE only.

Base revision: `6f25dd7c4d44dc6a765cdfd0068cda2dddef22e1`.

## Specialist projection

Run `python3 goals/repository-simplification-residue/ops/probe-agent-projection.py`.
All seven invocations exited 0. The script parses each native TOML, compares
its name, description, and developer instructions against its canonical Claude
agent source, then
activates the decoded native `developer_instructions` through `codex exec`.
Every invocation uses `--model gpt-6.1-sol`,
`-c 'model_reasoning_effort="medium"'`, `--ephemeral`, a read-only sandbox,
a host `timeout 180`, and stdin from `/dev/null`. The role and three constraints
returned by each invocation were inspected against the corresponding source.

[Per-role results and native hashes](2026-10-23-agent-projection-results.json)
record all seven responses. Each native file still has the same SHA-256 after
the invocation. The probe preserves every native field and does not rewrite
TOML, agent metadata, skills, home configuration, hooks, or client defaults.

The deterministic comparison normalizes only these existing equivalences:

- Root `CLAUDE.md` resolves to root `AGENTS.md`.
- `.agents/skills` resolves to `.claude/skills`.
- The Effect implementer's longer source wording names the same `.repos/effect`
  reference as its shorter native wording. Neither relies on training priors.

No arbitrary instruction differences are ignored. This qualifies the current
source/native body equivalence and native developer-instruction activation;
it does not prove a new generation writer, agent-selector discovery, tool-policy
parity between clients, or representative implementation/review task outcomes.
The native TOMLs remain retained. Source frontmatter tool restrictions are
client-specific and are not silently converted into Codex sandbox settings.

## Nested doctrine activation

Exactly twenty missing links were added, all relative `CLAUDE.md -> AGENTS.md`.
No instruction body or pre-existing link changed. Run
`python3 goals/repository-simplification-residue/ops/probe-nested-doctrine.py`.
For each owner this starts a probe with that package as its working directory,
loads `package.json`, checks the literal relative link target and resolved
identity, reads the instructions through `CLAUDE.md`, and verifies byte equality
with `AGENTS.md`. All twenty probes exited 0. The hashes below also match the
pre-link instruction hashes.

This is a package-scoped instruction-read witness. It establishes correct local
activation paths, not a measured Claude native session or IDE discovery claim.

| Owner | Instruction SHA-256 | Result |
| --- | --- | --- |
| `packages/agents/tables` | `0d8a464267d34fc062c9e9f55ad8d15b16f62b6e36f98b8900a4aed48874120c` | pass |
| `packages/documents/domain` | `3fe7eab2d96fcf183cb591126fd9b337cf4ce6745e6bfb9d878219e417cd13cb` | pass |
| `packages/documents/server` | `a0b0f9ab9dad16ce462ed0a3b2ae93e2dcecc282e033c9c94b76834670cb5199` | pass |
| `packages/documents/tables` | `196dbcc5ef1055455668a321381a5d3c6b23e66be57b3c9f33945443bf8a3734` | pass |
| `packages/documents/use-cases` | `558086763c88a38502ee4f2d9f404773a426efa9ef78289e19d3c3e1c8bb960e` | pass |
| `packages/drivers/cosmos` | `632a5d98c34e700ffc3eb2402b6e9b02f918fa41f4236ddfa6eac855331a58aa` | pass |
| `packages/drivers/n3` | `cd8e57b686e3f60aac0ed1bffe6d5f0bedd0776e795e5e9a6fc113c1141c8ffb` | pass |
| `packages/drivers/oxigraph` | `9a81dc1d4fc8014290aaddaaf9fe9c20b56d611074d325871bd619a39c7c88d0` | pass |
| `packages/drivers/shacl` | `3e903c8521ee8610fa224dc580f289210f77b90e5a2354dbffc4dbbef7a26f43` | pass |
| `packages/epistemic/client` | `3b7c8dbe5573c69e2368f399ee95c07ea464e317392b892b87e4957a3eb51817` | pass |
| `packages/epistemic/config` | `ab523482343f1ec3a9cc86ad04e00bc807f1796a82eb4d67932a282c00a079ee` | pass |
| `packages/epistemic/ui` | `e7fade568464fa63e72de734ce8c9407b2c53f1092c370191ae4e8a05292349b` | pass |
| `packages/law-practice/tables` | `0828a2cd7ac92fc300ac39d73f8840427d54744b22ae863a6b119428b29d6dd9` | pass |
| `packages/ontology/client` | `db1f78e1418f8a91a59294338b94cc3f3db750a9a1d7ea4fa1272996ce8a1168` | pass |
| `packages/ontology/config` | `66b90725d14c438a32a6ebd8ec81136b3f646a6b03fc01d4e97ec5320e366989` | pass |
| `packages/ontology/domain` | `37f72ade1076868559f372f3838342c63607b681cf1c546d72f19f0ae2bf110c` | pass |
| `packages/ontology/server` | `83693a0b5d41a944d59d3ea5a70adab6a6b006249f652c17d79f76e58b5efe41` | pass |
| `packages/ontology/ui` | `5ed4342ce1c9d0a43395aae68e92c3e6144ff0154fbe7a522780e015618a4c20` | pass |
| `packages/ontology/use-cases` | `cd7c6e54c0c83ee357209d8696a6277eaf16cc1a8efed1a2bdf90b480890ec07` | pass |
| `packages/shared/use-cases` | `f7dfb3f389481684590e1e78717098876a00401fbf4948473f47122aaf42e03e` | pass |

Reversal: remove only the twenty links listed above. Keep all `AGENTS.md` bodies
and pre-existing links. The probe scripts and receipts can be reverted through
the PR; no native or home rollback is required.

## Validation

- `bun install`: pass, Bun 1.4.4.
- Seven pinned headless specialist probes: pass.
- Twenty package-scoped instruction probes: pass.
- `bun run lint:oxlint`: pass, zero findings.
- `bun run beep quality changeset-graph`: pass (zero missing references).
- `bun run beep knowledge refs --check`: pass (zero live gated observations).
- Full package audits and docgen: pass for all twenty touched packages.
- No TypeScript, tests, or exported code changed. `test-tsgo` and
  `docgen:local` are not triggered; package verification includes docgen.

Full `bun run beep quality package-verify <package>` results:

| Package | Audit | Docgen |
| --- | --- | --- |
| `@beep/agents-tables` | pass (14.9s) | pass (4.5s) |
| `@beep/documents-domain` | pass (9.8s) | pass (9.6s) |
| `@beep/documents-server` | pass (16.2s) | pass (14.3s) |
| `@beep/documents-tables` | pass (9.8s) | pass (8.5s) |
| `@beep/documents-use-cases` | pass (10.5s) | pass (11.8s) |
| `@beep/cosmos` | pass (7.4s) | pass (3.2s) |
| `@beep/n3` | pass (6.6s) | pass (4.7s) |
| `@beep/oxigraph` | pass (8.5s) | pass (4.9s) |
| `@beep/shacl` | pass (7.6s) | pass (3.2s) |
| `@beep/epistemic-client` | pass (9.6s) | pass (4.7s) |
| `@beep/epistemic-config` | pass (7.2s) | pass (4.7s) |
| `@beep/epistemic-ui` | pass (10.8s) | pass (4.9s) |
| `@beep/law-practice-tables` | pass (9.7s) | pass (8.5s) |
| `@beep/ontology-client` | pass (12.3s) | pass (8.1s) |
| `@beep/ontology-config` | pass (5.6s) | pass (2.0s) |
| `@beep/ontology-domain` | pass (8.0s) | pass (2.8s) |
| `@beep/ontology-server` | pass (13.9s) | pass (4.4s) |
| `@beep/ontology-ui` | pass (11.8s) | pass (9.2s) |
| `@beep/ontology-use-cases` | pass (7.9s) | pass (4.8s) |
| `@beep/shared-use-cases` | pass (7.1s) | pass (3.0s) |

## Left open

#1862 remains open. F-DOCKER, F-CLAUDE, F-NATIVE-LINKS, F-JUNIE, F-CURSOR,
F-GROK-COMPAT and F-CLAUDEM retain their existing owner/native/home/account gates.
No retained capability is removed and no S31 baseline or inventory grows.
