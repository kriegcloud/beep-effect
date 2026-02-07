# Codex Skills

This directory tracks parity mapping for structured `.claude` skills.

## Denominator policy

- Canonical parity denominator: `37` structured `SKILL.md` files.
- Top-level `.claude/skills` entries without `SKILL.md` are auxiliary docs and excluded from denominator scoring.

## Contents

- `skill-index.md`: complete 37-item structured skill inventory.
- Selected portable skill ports (Codex-loadable):
  - `domain-modeling/SKILL.md`
  - `layer-design/SKILL.md`
  - `schema-composition/SKILL.md`

Selection rationale: tool-agnostic Effect patterns with no required Claude runtime hook wiring.

## Skill Format (Codex)

Codex skills must be directories with a `SKILL.md` file. In Codex CLI, the default skill root is `$CODEX_HOME/skills/` (typically `~/.codex/skills/`). This repo keeps `.codex/skills/` in the same directory-based format so it can be used as a skill source without reshaping.

```
.codex/skills/<skill-name>/SKILL.md
```

`SKILL.md` must start with YAML frontmatter (required keys: `name`, `description`):

```md
---
name: my-skill
description: One sentence saying when to use this skill.
---
```

Notes:
- Keep `name` hyphen-case (lowercase + digits + hyphens).
- Quote strings when in doubt (especially if they contain `@`, `:`, or other punctuation).
- Prefer only these top-level frontmatter keys: `name`, `description`, `license`, `allowed-tools`, `metadata`.

## Validation

Use the repo skill validator:

```sh
python3 .agents/skills/skill-creator/scripts/quick_validate.py .codex/skills/<skill-name>
```
