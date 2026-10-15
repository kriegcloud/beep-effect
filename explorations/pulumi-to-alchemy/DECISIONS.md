# Decisions

<!--
Stage 2. The grilling log. One entry per resolved branch-closing question,
newest last. Unresolved questions live in ops/manifest.json `openQuestions`
until they land here. Deferred questions get an entry too, marked DEFERRED
with the reason.
-->

## 2026-10-15 — migration target

**Question:** What does "done" mean for removing TypeScript 6, and should the
infra Pulumi stacks move to Alchemy? (Round 1 also offered: host stacks to
Effect CLI commands vs Alchemy custom providers; isolating the Vercel and
runner-module gaps; a credential-free Alchemy spike as the first slice.)

**Answer:** No Alchemy migration. Operator, verbatim: "We don't need a complete
migration to alchemy. Honestly If pulumi doesn't support ts7 then we can just
isolate it to infra." Pulumi stays; its TypeScript 6 requirement is confined to
`infra/` instead of being patched at the repository root.

**Rationale:** Research found Alchemy v2 still in beta (2.0.0-beta.83) with no
coverage for the Vercel projects, the Terraform-backed GitHub runner module,
KMS grants, Compute Optimizer enrollment or host-level SSH/systemd. A full
migration would mean custom providers for all of them, which is far larger than
the benefit of removing one TypeScript 6 copy. Isolation keeps every stack and
its state untouched. Rejected: the full migration, zero TS6 in the repo, and the
Alchemy spike. The recommendation offered was a TS7-only root with any
leftover Pulumi isolated; the operator's answer goes further and keeps all of
Pulumi.

## 2026-10-15 — packet outcome

**Question:** Graduate, park or kill this exploration?

**Answer:** Killed. Epitaph: Pulumi stays; Alchemy can't cover our providers
yet, and isolating Pulumi's TypeScript 6 need in `infra/` is enough.

**Rationale:** The isolation needs no goal packet. It is one follow-up PR in
the TS7 exit program: an infra-local preload makes Pulumi resolve infra's
nested `typescript` 6, which retires the root `@pulumi/pulumi` patch and its
syncpack hold. RESEARCH.md and research/SOURCES.md stay as provenance if Alchemy
coverage changes; reopen at research in that case.
