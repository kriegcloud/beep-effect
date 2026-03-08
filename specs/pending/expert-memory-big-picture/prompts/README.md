# Prompt Template Library

## Usage
Use these as reusable prompt templates for agent runs in this repo.

Each template is self-contained:
- short `Usage` section
- one fenced `text` block
- `{{UPPER_SNAKE_CASE}}` placeholders to replace before sending

## Choose a Template
- [base-prompt.md](./base-prompt.md)
  Default medium-weight prompt for most repo work.
- [implementation-strict-prompt.md](./implementation-strict-prompt.md)
  Strict implementation prompt for code-writing, migrations, and refactors with stronger verification and regression-test pressure.
- [everyday-short-prompt.md](./everyday-short-prompt.md)
  Minimal daily-use bootstrap with only the repo rules that matter most.
- [prompt-creator-prompt.md](./prompt-creator-prompt.md)
  Use when you want an agent to create or improve prompts for you.
- [spec-creator-prompt.md](./spec-creator-prompt.md)
  Use when you want an agent to create a new spec or spec package.
- [effect-v4-exploration-prompt.md](./effect-v4-exploration-prompt.md)
  Use for Effect v4 API exploration, migration research, and local-source-grounded explanations.
- [brainstorm-prompt.md](./brainstorm-prompt.md)
  Use for idea generation that still needs repo grounding and concrete tradeoffs.

## Best Defaults for Common Tasks
- Creating prompts for you: start with [prompt-creator-prompt.md](./prompt-creator-prompt.md).
- Creating new specs: start with [spec-creator-prompt.md](./spec-creator-prompt.md).
- Doing Effect v4 exploration: start with [effect-v4-exploration-prompt.md](./effect-v4-exploration-prompt.md).
- Brainstorming ideas: start with [brainstorm-prompt.md](./brainstorm-prompt.md).
- Everyday repo work: start with [everyday-short-prompt.md](./everyday-short-prompt.md) if you want speed, or [base-prompt.md](./base-prompt.md) if you want a bit more structure.
- High-stakes implementation or migrations: start with [implementation-strict-prompt.md](./implementation-strict-prompt.md).

## Notes
- All repo-work templates assume this repo is Effect-first and that `.repos/effect-v4` is the only trustworthy Effect v4 source of truth.
- The existing [IRI_RFC3987_IMPLEMENTATION_PROMPT.md](./IRI_RFC3987_IMPLEMENTATION_PROMPT.md) is a concrete task prompt, not a general template.
