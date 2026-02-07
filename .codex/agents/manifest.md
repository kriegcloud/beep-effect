# Agent Delegation Manifest (Codex-Adapted)

Source artifacts:
- `.claude/agents-manifest.yaml`
- `.claude/agents/*.md`

This is a tool-agnostic adaptation. It avoids Claude-specific tool tokens (for example `Glob`, `Grep`, `Read`, `Write`, `Edit`, `Bash`) and uses execution verbs.

## Capability verbs

- `read`: inspect code/docs and gather evidence
- `edit`: change source/docs/tests
- `execute`: run checks, builds, tests, scripts
- `research`: query external or library documentation
- `report`: synthesize findings into auditable outputs

## Phase suitability

- Discovery (P0/P1): favor `read`, `research`, `report`
- Evaluation (P1/P3): favor `read`, `report`
- Implementation (P2/P4): require `edit`; optionally `execute`
- Validation (P3): require `execute`, `report`

## Role matrix

| Role | Primary verbs | Typical outputs | Preferred phases |
|------|---------------|-----------------|------------------|
| codebase-researcher | read, report | architecture/context summary | P0, P1 |
| mcp-researcher / effect-researcher | research, report | API/pattern findings | P1 |
| web-researcher | research, report | external references | P1 |
| architecture-pattern-enforcer | read, report | boundary compliance report | P0, P2, P3 |
| code-reviewer | read, report | severity-ordered findings | P2, P3, P4 |
| spec-reviewer | read, report | spec quality report | P1, P3 |
| doc-writer / doc-maintainer | edit, report | docs and handoff updates | P2, P4 |
| domain-modeler / effect-expert / schema-expert | edit, report | source implementation | P2, P4 |
| test-writer | edit, execute, report | tests + results | P2, P3, P4 |
| package-error-fixer | edit, execute, report | error remediation | P2, P4 |
| reflector / prompt-refiner | read, report, edit | reflection + prompt updates | P3, P4 |

## Usage rule

Choose the minimal role set needed for the requested task. For each delegated track, require:
- scoped objective
- expected artifact path
- verification command(s)
- clear stop condition
