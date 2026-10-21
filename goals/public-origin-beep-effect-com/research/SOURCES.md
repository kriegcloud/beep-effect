# Single public origin beep-effect.com — Sources & Provenance

- **Source exploration:** none. The goal was opened directly from an operator
  brief after a grilling session on 2026-10-20; see
  [`../history/2026-10-20-operator-brief.md`](../history/2026-10-20-operator-brief.md).

## 1. Mined source corpus

| Source | Title | Upstream (repo) | Location (`file:line`) | Theme | Disposition |
|--------|-------|-----------------|------------------------|-------|-------------|
| Operator brief | Single public origin, D1 to D6 | this repo | `goals/public-origin-beep-effect-com/history/2026-10-20-operator-brief.md` | Decisions | Normative (SPEC Decision Log) |
| identity-as-iri decisions | 2026-07-02 authority host entry and its 2026-10-20 supersession | this repo | `explorations/identity-as-iri/DECISIONS.md` | Identity authority | Superseded by D1 |
| knowledge-endgame decisions | Park entry and reopen triggers | this repo | `explorations/knowledge-endgame/DECISIONS.md` | Training-data flywheel | Context; stays parked |
| Retired Effect paths law | Model for the new law | this repo | `packages/tooling/tool/cli/src/commands/Laws/RetiredEffectPaths.model.ts` | Law shape | Pattern for `retired-iri-authorities` |
| Changeset policy | Private release-note reset | this repo | `.changeset/README.md` | Release notes | Basis for I8 |

## 2. Upstream repositories & licenses

None. The work is repo-internal.

## 3. External research sources

- RFC 6761, special-use domain names: the `.test` TLD used for fake example
  IRIs (I15).

## 4. In-repo capability references

- `@beep/identity` composers (`$I`, `$EpistemicId`, `$QaId`,
  `$SkillContractId`, `$SemanticaId`) mint every IRI under the authority.
- `@beep/public-site` owns the public origin and the reserved route table.

## 5. Cross-links & provenance

- Architecture decision: `standards/architecture/DECISIONS.md`, entry of
  2026-10-20.
- Binding rule: `standards/ARCHITECTURE.md`, core principle 8.
- Probe evidence (2026-10-20, from the brief): nothing durable is persisted
  under the old root; corpus hits are practice-kg sitting transcripts and QA
  logs, and workstation cache hits are regenerable.
