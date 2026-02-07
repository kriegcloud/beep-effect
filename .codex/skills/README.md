# Codex Skills

This directory tracks parity mapping for structured `.claude` skills.

## Denominator policy

- Canonical parity denominator: `37` structured `SKILL.md` files.
- Top-level `.claude/skills` entries without `SKILL.md` are auxiliary docs and excluded from denominator scoring.

## Contents

- `skill-index.md`: complete 37-item structured skill inventory.
- `ports/`: selected portable skill ports copied for Codex-first usage.

## Selected ports

- `domain-modeling.SKILL.md`
- `layer-design.SKILL.md`
- `schema-composition.SKILL.md`

Selection rationale: tool-agnostic Effect patterns with no required Claude runtime hook wiring.
