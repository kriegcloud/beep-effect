# Loop 2 Re-review: Repo Reality And Routing

## Repo Reality Snapshot

- The packet now correctly closes the biggest routing ambiguities from loop 1:
  `use-cases/public` and `use-cases/server` are treated as export subpaths,
  `shared/server` and `shared/tables` have concrete destinations, and
  `runtime/protocol` is explicitly split between shared control-plane contracts
  and `repo-memory` contracts.
- The live repo still contains these active legacy roots:
  `packages/common/*`, `tooling/*`, `packages/runtime/*`,
  `packages/shared/providers/firecrawl`, `.agents`, `.claude`, and `.codex`.
- The updated packet now inventories most of the high-risk package and app
  couplings, especially `packages/runtime/server/src/main.ts`,
  `packages/editor/runtime/src/main.ts`, `packages/common/ui`, and
  `@beep/runtime-protocol`.
- The remaining routing risk is concentrated in the agent surfaces, where the
  repo still has direct `.agents/*` path consumers and some skill trees contain
  files that do not fit the canonical `agents/skill-pack` shape.

## Remaining Findings

### High

#### 1. `.agents` is still a live legacy root, but the path-coupling inventory does not track it

- Category: legacy root coverage / coupling inventory
- Evidence:
  - `design/legacy-path-coupling-inventory.md` contains `0` rows for `.agents`.
  - Live `.agents` path consumers exist in:
    - `.codex/agents/effect-v4-state-concurrency-guardian.toml`
    - `.codex/agents/effect-v4-persistence-runtime-architect.toml`
    - `.codex/agents/effect-v4-error-guardian.toml`
    - `.codex/agents/effect-v4-quality-reviewer.toml`
    - `.codex/agents/effect-v4-service-architect.toml`
    - `.codex/agents/effect-v4-repo-mapper.toml`
    - `.codex/agents/effect-v4-http-ai-boundary.toml`
    - `.codex/agents/effect-v4-schema-worker.toml`
    - `tooling/configs/test/effect-steering-guidance.test.ts:7`
  - The packet names `.agents` as a legacy root in
    `design/current-state-routing-canon.md`, but it does not burn down the
    actual filesystem-path consumers the way it now does for `.claude` and
    `.codex`.
- Why it matters:
  - P2 and P6 can miss real consumers if `.agents` is not tracked as a
    first-class coupling family.
  - The cutover could appear complete while `.codex` descriptors and tooling
    tests still hard-code `.agents/skills/...`, leaving a hidden second
    architecture in place.
- Concrete remediation:
  - Add `.agents` rows to `design/legacy-path-coupling-inventory.md` with hit
    counts, representative files, owners, rewrite type, and temporary
    compatibility rules.
  - Update the agent cutover docs and phase gates so `.codex/agents/*.toml`,
    tooling tests, and any other `.agents/*` consumers are rewritten to
    canonical `agents/*` package paths or stable `beep.json`/id-based
    references.
  - Add an explicit search gate requiring `.agents/` path references to reach
    zero before the final agent cutover closes, unless a temporary exception is
    ledgered.

### Medium

#### 2. The skill-pack routing still does not classify several real file types that exist inside current skill trees

- Category: agent routing completeness / package-shape compliance
- Evidence:
  - `design/agent-runtime-decomposition-matrix.md` classifies only:
    `SKILL.md`, `assets/**`, `references/**`, and `_shared/**` under
    `.claude/skills/**`.
  - Real files that exist today but are not classified by that matrix include:
    - `.claude/skills/CONVENTIONS.md`
    - `.claude/skills/shadcn/cli.md`
    - `.claude/skills/shadcn/customization.md`
    - `.claude/skills/shadcn/mcp.md`
    - `.claude/skills/shadcn/rules/*.md`
    - `.claude/skills/shadcn/agents/openai.yml`
    - `.claude/skills/shadcn/evals/evals.json`
    - `.agents/skills/effect-v4/README.md`
    - `.agents/skills/effect-v4/TASKS.md`
    - `.agents/skills/effect-v4/agents/openai.yaml`
    - `.agents/skills/effect-v4/.git/**`
  - `standards/ARCHITECTURE.md:528-530` allows `agents/skill-pack` only
    `SKILL.md` and `beep.json`, with optional `references/`, `assets/`, and
    `_shared/`.
- Why it matters:
  - The current packet can route whole skill trees directionally, but it still
    lacks a canonical destination rule for several real file classes.
  - Without that normalization step, the agent cutover risks moving invalid
    contents into `agents/skill-pack/*` or silently leaving non-canonical
    material in place.
- Concrete remediation:
  - Add a skill-tree normalization matrix for `.agents/skills/*` and
    `.claude/skills/*` that covers arbitrary markdown companions, embedded
    runtime descriptors under `agents/`, evaluation fixtures, and vendored
    metadata such as nested `.git/**`.
  - For each file class, choose one of: move into `references/`, move into
    `agents/runtime-adapter/*`, move into tooling-owned test/fixture surfaces,
    or delete as non-canonical baggage.
  - Add an explicit cleanup rule that nested VCS metadata is removed or
    intentionally vendored outside the final `agents/skill-pack/*` shape before
    initiative close.

## Clean Areas

- The route canon is now correct about `/public`, `/server`, `/secrets`,
  `/layer`, and `/test` being export subpaths rather than destination package
  kinds.
- `packages/shared/server` and `packages/shared/tables` are no longer left as
  open-ended shared-kernel guesses; they now have concrete extraction targets.
- `packages/runtime/protocol` is no longer treated as a monolith; the split
  between shared control-plane contracts and `repo-memory` contracts is
  explicit.
- `packages/editor/lexical -> packages/editor/ui` is now a concrete package
  creation step rather than a vague direction.
- The packet now tracks the high-risk app and package couplings around
  `packages/runtime/server/src/main.ts`, `packages/editor/runtime/src/main.ts`,
  `packages/common/ui`, `@beep/runtime-protocol`, and `@beep/editor-lexical`.

## Final Verdict

2 findings remain in the repo-reality and routing lens.

The packet is materially improved and mostly route-complete for package-family,
slice, and app-entrypoint migration. It is not fully clean yet because the
agent cutover still under-specifies the live `.agents` consumer surface and the
non-canonical contents inside existing skill trees.
