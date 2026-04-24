Remaining findings: 4

1. High: Binding `P2` blocker still omits `.aiassistant`.
Why it matters: `SPEC.md` outranks the design docs and handoffs, but its blocking rule still allows `P2` to close while `.aiassistant` remains a canonical root. The rest of the current packet and the live repo config surfaces still model `.aiassistant` as an active legacy root that must be retired.
File references: `initiatives/repo-architecture-convergence/SPEC.md:201-205`; `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:197-201`; `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P2.md:48-50`, `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P2.md:66-67`, `initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P2.md:84-87`; `cspell.json:72-78`; `.markdownlint-cli2.jsonc:28-34`.
Concrete fix: add `.aiassistant` everywhere the binding `SPEC.md` defines the `P2` legacy-root blocker and required old-root audit set so the highest-authority gate matches the rest of the packet and the live repo.

2. High: The committed `.claude` decomposition matrix still leaves live skill-tree file classes unrouted.
Why it matters: the routing canon says agent routing is by file class and that `design/agent-runtime-decomposition-matrix.md` is the committed matrix, but the `.claude` section only routes `SKILL.md`, assets/references, top-level rules/patterns, hooks/scripts/tests, and the package shell. Current `.claude` content also contains cross-skill authoring docs, skill-local support docs, nested runtime descriptors, eval fixtures, skill-local rules, and article prose with no explicit destination rule, so `P0` and `P6` still do not have a file-class-complete current-state decomposition.
File references: `initiatives/repo-architecture-convergence/design/current-state-routing-canon.md:167-183`; `initiatives/repo-architecture-convergence/design/agent-runtime-decomposition-matrix.md:41-55`; `.claude/skills/CONVENTIONS.md:1-24`; `.claude/skills/shadcn/cli.md:1-20`; `.claude/skills/shadcn/agents/openai.yml:1-4`; `.claude/skills/shadcn/evals/evals.json:1-17`; `.claude/skills/shadcn/rules/base-vs-radix.md:1-18`; `.claude/skills/wide-events/Article.md:1-20`.
Concrete fix: extend the `.claude` matrix with the same file-class coverage already used for `.agents`: add explicit rows for `CONVENTIONS.md`, support docs, `rules/**`, `agents/*.yml|yaml`, `evals/**`, and article/reference files, each with a concrete destination or delete/archive outcome.

3. Medium: The design compatibility seed still states the wrong required live-ledger fields.
Why it matters: the seed's `Expected Live Fields` section omits mandatory governance data that the root packet and live `ops/compatibility-ledger.md` require. That leaves the current tracking structure internally inconsistent and makes the design seed unsafe as a `P1` reference.
File references: `initiatives/repo-architecture-convergence/design/compatibility-ledger.md:13-24`; `initiatives/repo-architecture-convergence/README.md:18-27`; `initiatives/repo-architecture-convergence/SPEC.md:35-42`; `initiatives/repo-architecture-convergence/ops/compatibility-ledger.md:13-20`.
Concrete fix: make the design seed's required field list match the live ledger exactly, including reason, issue, created phase, expiry or deletion phase, proof plan, removal evidence, and allowlist reference when applicable.

4. Medium: The design compatibility seed's validation queries cannot prove deletion across the consumers they claim to govern.
Why it matters: the seed rows for `@beep/runtime-protocol`, `@beep/runtime-server`, `@beep/shared-server`, `@beep/shared-tables`, and `@beep/editor-lexical` say they cover docs/tests or all imports reaching zero, but the listed queries only scan `apps packages tooling .agents .aiassistant .claude .codex`. Current consumers also live in root config and docgen mapping surfaces outside that scan set, so the seed can produce a false-zero deletion proof.
File references: `initiatives/repo-architecture-convergence/design/compatibility-ledger.md:28-36`; `tsconfig.json:83-92`; `packages/runtime/protocol/docgen.json:31-35`; `packages/runtime/server/docgen.json:31-32`; `apps/editor-app/docgen.json:36-37`.
Concrete fix: expand each validation query to include the root config and docgen surfaces it currently misses, or narrow the stated delete criteria so the query and the claimed proof scope are exactly the same.

Scope verdict: changes needed
