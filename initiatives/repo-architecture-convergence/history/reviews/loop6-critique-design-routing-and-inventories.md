# Loop6 Critique - Design Routing And Inventories

## Scope

- `design/current-state-routing-canon.md`
- `design/agent-runtime-decomposition-matrix.md`
- `design/legacy-path-coupling-inventory.md`
- `design/non-slice-family-migration.md`
- `design/compatibility-ledger.md`
- `design/tooling-and-agent-cutover.md`
- residual drift check against `standards/ARCHITECTURE.md`

## Methodology

- Read the packet surfaces above plus the root initiative contract in
  `README.md`, `SPEC.md`, and the live `ops/compatibility-ledger.md` boundary.
- Ran targeted `rg`, `find`, and line-level spot checks against live repo
  surfaces the packet claims to route or inventory.
- Graphiti status was available, but targeted fact recall timed out, so this
  review is grounded in the current packet plus live repo evidence only.

## Findings

### High: Agent cutover still routes descriptor files without requiring path normalization away from legacy roots

- Affected files:
  `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:174`,
  `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:180`,
  `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:185`,
  `initiatives/repo-architecture-convergence/design/agent-runtime-decomposition-matrix.md:66`,
  `initiatives/repo-architecture-convergence/design/agent-runtime-decomposition-matrix.md:67`,
  `initiatives/repo-architecture-convergence/design/tooling-and-agent-cutover.md:50`,
  `initiatives/repo-architecture-convergence/design/tooling-and-agent-cutover.md:71`,
  `standards/ARCHITECTURE.md:483`,
  `standards/ARCHITECTURE.md:485`,
  `.codex/agents/effect-v4-quality-reviewer.toml:11`,
  `.codex/agents/effect-v4-quality-reviewer.toml:13`,
  `.claude/settings.json:3`,
  `.claude/settings.json:9`,
  `.aiassistant/patterns/README.md:143`,
  `.aiassistant/patterns/README.md:166`
- Why it matters:
  The design currently says runtime descriptors move to
  `agents/runtime-adapter/<runtime>`, but its normalization rule stops at file
  placement. The standard requires `policy-pack` references by skill
  ids/selectors and limits `runtime-adapter` to config/templates only.
  Current live descriptors and docs still hard-code `.agents` and `.claude`
  filesystem paths. If those files are only relocated, the old roots remain
  canonical by content even after the tree move, so the `P2`/`P6` zero-proof
  can be false-green.
- Concrete remediation:
  Add an explicit cutover rule that runtime descriptors and declarative agent
  docs must rewrite raw legacy filesystem references to canonical skill/policy
  ids, selectors, or tooling-owned wrapper entrypoints before old roots can be
  deleted, and require that rewrite proof in the agent cutover evidence.

### Medium: Path-coupling inventory still omits routed non-slice workspaces `infra` and `packages/_internal/db-admin`

- Affected files:
  `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:79`,
  `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:88`,
  `initiatives/repo-architecture-convergence/design/tooling-and-agent-cutover.md:22`,
  `initiatives/repo-architecture-convergence/design/tooling-and-agent-cutover.md:31`,
  `initiatives/repo-architecture-convergence/design/legacy-path-coupling-inventory.md:19`,
  `initiatives/repo-architecture-convergence/design/legacy-path-coupling-inventory.md:37`,
  `initiatives/repo-architecture-convergence/design/legacy-path-coupling-inventory.md:58`,
  `infra/docgen.json:2`,
  `infra/docgen.json:34`,
  `infra/tsconfig.json:16`,
  `infra/package.json:15`,
  `packages/_internal/db-admin/docgen.json:2`,
  `packages/_internal/db-admin/package.json:17`
- Why it matters:
  The routing canon and tooling cutover both commit `infra` and
  `packages/_internal/db-admin` to tooling migration, but the burn-down
  inventory neither scans them nor gives them ownership rows. Both already
  carry legacy path/tooling couplings. Omitting them leaves the inventory short
  of the packet's own "every non-slice workspace" standard and weakens `P2`/`P3`
  proof.
- Concrete remediation:
  Extend the scan template and inventory table to include `infra` and
  `packages/_internal/db-admin`, with representative files, rewrite owners,
  rewrite types, and compatibility policy.

### Medium: Compatibility-ledger seed validation commands are not reproducible as written

- Affected files:
  `initiatives/repo-architecture-convergence/design/compatibility-ledger.md:40`,
  `initiatives/repo-architecture-convergence/design/compatibility-ledger.md:54`,
  `initiatives/repo-architecture-convergence/design/compatibility-ledger.md:60`
- Why it matters:
  Each seed query appends `README.md`, but this repo root has no `README.md`.
  Running the command as written returns an `rg` path error instead of a stable
  proof command. That makes the seed unsafe as a promotion template for the live
  ledger.
- Concrete remediation:
  Replace `README.md` with actual repo-root files that exist, or drop it from
  the query set and align the command shape with the inventory packet's
  reproducible scan template.

## Scope Verdict

- Remaining grounded residuals exist; this surface is not yet clean for
  zero-findings certification.
