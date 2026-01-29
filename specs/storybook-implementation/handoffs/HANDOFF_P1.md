# Handoff: Spec Creation → Phase 1 (Research)

## Spec Summary

This spec orchestrates Storybook implementation for `@beep/ui` and `@beep/ui-editor` packages. The implementation requires MUI + Tailwind/shadcn support with theme integration from `@beep/ui-core`.

## Your Role

**YOU ARE AN ORCHESTRATOR.** You coordinate sub-agents but never:
- Read source files directly (delegate to `codebase-researcher`)
- Write code (delegate to `effect-code-writer`)
- Search documentation (delegate to `web-researcher`)

## Phase 1 Objectives

1. **Understand packages**: Structure, exports, dependencies
2. **Research patterns**: Storybook + MUI + Tailwind integration
3. **Inventory components**: Catalog what needs stories

## Sub-Agent Launches (In Order)

### 1. codebase-researcher (Package Analysis)

Launch with prompt from `AGENT_PROMPTS.md#codebase-researcher-p1`

Expected output: `outputs/codebase-context.md`

### 2. web-researcher (External Research)

Launch in parallel with step 1.

Prompt from `AGENT_PROMPTS.md#web-researcher-p1`

Expected output: `outputs/external-research.md`

### 3. codebase-researcher (Component Inventory)

Launch after step 1 completes.

Prompt from `AGENT_PROMPTS.md#component-inventory`

Expected output: `outputs/component-inventory.md`

## After Sub-Agents Complete

1. **Read outputs** (skim only, max 3 files):
   - `outputs/codebase-context.md`
   - `outputs/external-research.md`
   - `outputs/component-inventory.md`

2. **Synthesize key findings**:
   - Total component count per package
   - Key dependencies affecting Storybook
   - Recommended architecture pattern
   - Potential blockers or risks

3. **Update REFLECTION_LOG.md** with Phase 1 entry

4. **Create P2 handoffs**:
   - `handoffs/HANDOFF_P2.md`
   - `handoffs/P2_ORCHESTRATOR_PROMPT.md`

## Exit Criteria

- [ ] All 3 output files exist
- [ ] Outputs are ≤500 lines each (compressed)
- [ ] REFLECTION_LOG.md updated
- [ ] Both P2 handoff files created

## Reference Files

- `specs/storybook-implementation/README.md`
- `specs/storybook-implementation/MASTER_ORCHESTRATION.md`
- `specs/storybook-implementation/AGENT_PROMPTS.md`

## Critical Constraints

- Maximum 5 direct tool calls (not counting sub-agent launches)
- Read outputs only; never read source files
- Context budget: ≤4,000 tokens for handoffs

---

## Context Budget Verification

| Memory Type | Content | Est. Tokens | Budget |
|-------------|---------|-------------|--------|
| Working | Phase 1 objectives, exit criteria | ~400 | ≤2,000 |
| Episodic | Spec summary, role definition | ~300 | ≤1,000 |
| Semantic | Package names, file paths | ~200 | ≤500 |
| Procedural | Reference file links | ~100 | Links only |
| **Total** | | **~1,000** | **≤4,000** |

**Verification Method**: Word count (250 words) × 4 tokens/word
**Budget Compliance**: ✅ Under limit with ~3,000 token safety margin
**Document Lines**: 95 (under 150-line target for handoffs)
