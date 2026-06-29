# Phase 1 Audit — `agents` slice (14)

Thinnest slice (2 entities), but holds one rich value object. Citations
`file:line` under `packages/agents/domain/src/`.

## 1. Per-entity matrix

| Entity | Domain fields | Strengths | Gaps / proposed |
|---|---|---|---|
| `Agent` `entities/Agent/Agent.model.ts:33-37` | `mode: AgentMode`, `name:String`, `skillFixtureKey:String`, `fixtureKey` | has a `toTagged()` static (intent to make `mode` a tagged union, `:58-69`) | `AgentMode = ["deterministic_fixture"]` placeholder `Agent.values.ts:26`; `name`→`NonEmptyString`; `skillFixtureKey`→typed `SkillId` (and many-to-many?); **no `version` field even though `AgentPrincipal` carries `agentVersionId`** (kernel inconsistency); no `model`/`provider`, no `systemPrompt`, no `tools`/capabilities, no `status` |
| `Skill` `entities/Skill/Skill.model.ts:31-33` | `name:String`, `fixtureKey` | — | `name`→`NonEmptyString`; no `description`, no typed `input`/`output` schema, no `kind`, no `version`, no `uri` |

## 2. Rich value object (emulate) + one smell

`AssistantContent` `values/AssistantContent/AssistantContent.model.ts` — a
**stratified, non-recursive block→inline rich-text subset** for forced-tool
structured outputs, where field annotations become JSON-Schema descriptions that
steer generation (`TextInline`/`LinkInline` → `InlineNode` tagged union →
blocks). Strong schema-first modeling.

**Smell (confirmed):** annotation-key duplication — `S.optionalKey(S.Boolean.annotate({description}))`
**and** `.annotateKey({description})` with identical text (`:47-53`). A lint/codemod
target, not a new primitive (kernel R-list overlap).

## 3. Agents gaps (rubric-scored)

| # | Proposal | Strategy | Rubric (1/2/3/4) | Recommend |
|---|---|---|---|---|
| AG1 | `Agent` typed refs + real fields: `SkillId`, `version` (align to `AgentPrincipal.agentVersionId`), `model`/`provider`, `status` | identity composition + narrowing | ✔/✔/✔/✔ | **Adopt** |
| AG2 | Real `AgentMode`/agent-kind vocabulary (deterministic/llm/tool/hybrid) as tagged union (the `toTagged()` intent) | matchable variants | ✔/✔/✔/✔ | **Adopt** |
| AG3 | `Skill` richer: `description`, typed `input`/`output` schema refs, `kind`, `version` | schema-first | ✔/△/✔/✔ | **Adopt selectively** |
| AG4 | Fix `AssistantContent` annotation-key duplication (lint/codemod) | annotation hygiene | ✔/△/n-a/✔ | **Adopt (cheap)** |
| AG5 | `.errors.ts` for agent/skill domain failures | tagged errors | ✔/△/✔/✔ | **Adopt selectively** |

## 4. Open questions surfaced (→ `DECISIONS.md`)
- NEW: should agent/skill **versioning** be modeled as an entity field, a temporal
  validity mixin (kernel R3), or a separate `AgentVersion` entity? — `AgentPrincipal`
  already references `agentVersionId`, so the version concept exists but is unbacked.
- NEW: is `Skill` a domain entity here or a projection of the runtime's skill
  registry? (scope boundary.)
