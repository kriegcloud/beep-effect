<!-- SKILL-TEMPLATE.md — Copy this file to create a new SKILL.md -->
<!-- Replace all {placeholders} with actual values -->
<!-- Delete this comment block in the final SKILL.md -->

---
name: {skill-name}
description: >
  {One to three sentence description of the skill's purpose. Include
  keywords that trigger activation.}
---

# {Skill Title}

## Role Statement

{What this skill is, what it is responsible for, and what it is NOT
responsible for. 2-3 sentences.}

## When to Activate

- {Trigger condition 1: user keywords or phrases}
- {Trigger condition 2: pipeline stage or prerequisite}
- {Trigger condition 3: specific user intent}

## Shared Reference Materials

Read these files from `_shared/` before beginning work:

- `_shared/methodology-backbone.md` — lifecycle phase context
- `_shared/{relevant-reference}.md` — {why this skill needs it}
- `_shared/{relevant-reference}.md` — {why this skill needs it}

## Core Workflow

### Step 1: {Step Name}

{Description of what to do.}

```bash
{Concrete command example}
```

### Step 2: {Step Name}

{Description of what to do.}

### Step N: {Step Name}

{Description of what to do.}

## Tool Commands

{Concrete CLI and Python examples for every operation this skill performs.
Group by operation type. Include exact flags and arguments.}

### {Operation Category}

```bash
{command with real flags and arguments}
```

### {Operation Category}

```python
{Python snippet with imports and real function calls}
```

## Outputs

This skill produces:

| Artifact | Location | Format | Description |
|----------|----------|--------|-------------|
| {artifact name} | `{path/to/file}` | {format} | {what it contains} |

## Handoff

**Receives from**: {previous skill(s)} — {what artifacts are expected as input}

**Passes to**: {next skill(s)} — {what artifacts are produced for the next stage}

**Handoff checklist**:
- [ ] {Required artifact 1 exists and is valid}
- [ ] {Required artifact 2 exists and is valid}

## Anti-Patterns to Avoid

- {Anti-pattern 1}: {why it's wrong and what to do instead}
- {Anti-pattern 2}: {why it's wrong and what to do instead}

## Error Handling

| Error | Likely Cause | Recovery |
|-------|-------------|----------|
| {Error type} | {Common cause} | {What to do} |
