# Pattern Compliance Remediation Specification

> Systematic remediation of Effect pattern violations across the beep-effect monorepo.

## Overview

This specification provides a structured approach to identifying and fixing pattern compliance violations. A prior AI-friendliness audit identified ~317 violations of the codebase's Effect-first patterns.

## Files

| File | Purpose |
|------|---------|
| `README.md` | This file - overview and quick start |
| `DISCOVERY_PROMPT.md` | Prompt for Claude to discover all violations and create PLAN.md |
| `ORCHESTRATION_TEMPLATE.md` | Template for the orchestration prompt (transformation reference) |
| `PLAN.md` | Generated checklist of all violations (created by discovery session) |
| `ORCHESTRATION_PROMPT.md` | Generated execution instructions (created by discovery session) |

## Quick Start

### Step 1: Run Discovery Session

Start a new Claude session and provide the contents of `DISCOVERY_PROMPT.md` as the initial prompt. This session will:

1. Run grep commands to find all pattern violations
2. Verify each violation (filter false positives)
3. Generate `PLAN.md` with checkboxed items
4. Generate `ORCHESTRATION_PROMPT.md` with execution instructions

### Step 2: Run Remediation Session

Start a new Claude session and provide the contents of the generated `ORCHESTRATION_PROMPT.md`. This session will:

1. Process packages one at a time
2. Apply fixes following the transformation reference
3. Validate after each package
4. Commit changes incrementally
5. Update checkboxes in PLAN.md

## Violation Categories

| Category | Severity | Example |
|----------|----------|---------|
| Native Array Methods | CRITICAL | `.map()`, `.filter()`, `.forEach()` |
| Native String Methods | CRITICAL | `.split()`, `.trim()`, `.toLowerCase()` |
| Native Date | HIGH | `new Date()`, `Date.now()` |
| Switch Statements | HIGH | `switch (x) { ... }` |
| Type Safety | CRITICAL | `: any`, `as any`, `@ts-ignore` |
| Object Methods | MEDIUM | `Object.keys()`, `Object.values()` |
| Inline No-ops | MEDIUM | `() => null`, `() => {}` |

## Expected Outcomes

After remediation:
- Zero native array method usage (use `effect/Array`)
- Zero native string method usage (use `effect/String`)
- Zero native Date usage (use `effect/DateTime`)
- Zero switch statements (use `effect/Match`)
- Minimal type safety violations

## Related Documentation

- `/AGENTS.md` - Root codebase guidelines
- `/documentation/EFFECT_PATTERNS.md` - Comprehensive pattern rules
- `/.claude/skills/forbidden-patterns.md` - Quick reference for forbidden patterns
- `/specs/ai-friendliness-audit/` - Original audit that identified these violations
