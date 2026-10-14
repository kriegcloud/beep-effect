---
"@beep/ai-sync": minor
"@beep/schema": patch
---

Model `SKILL.md` frontmatter after the Agent Skills specification: `AgentSkillFrontmatter` now carries the spec's name grammar, description and compatibility bounds, string-only `metadata`, and `allowed-tools`, plus Claude Code's native extension keys, with strict parse options that reject anything else. `SlugChecks` is exported from `@beep/schema` so the skill name reuses the slug grammar.
