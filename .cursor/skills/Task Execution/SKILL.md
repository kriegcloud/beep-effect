---
name: Task Execution
description: Debug (parallel diagnosis + consensus), Explore (decompose question into parallel tracks), and Write Test (Effect tests with @beep/testkit). Use when investigating bugs, exploring codebase questions, or writing Effect-based tests (equivalent to /debug, /explore, /write-test in Claude/Codex).
---

# Task Execution Skill

Use this skill for three workflows: **Debug** (bug diagnosis with consensus), **Explore** (parallel codebase investigation), and **Write Test** (Effect tests). Cursor has no `/debug`, `/explore`, or `/write-test` commands; invoke by describing the task (e.g. "Debug this failure", "Explore how auth is wired", "Write tests for UserService").

---

## Debug Workflow

**When:** Investigating a reported bug; need root cause and proposed fix.

1. **Parallel analysis** — Investigate the bug along 4 independent angles (e.g. data flow, error handling, types, integration). Each track: search codebase, identify root cause, propose fix with file:line evidence.
2. **Consensus** — Compare conclusions: 4/4 → high confidence; 3/4 → note dissent and proceed; 2/2 or scattered → investigate further before changing code.
3. **Resolution** — Report consensus to the user; implement fix only after explicit approval.

Reference: `.claude/commands/debug.md`.

---

## Explore Workflow

**When:** Answering a broad codebase or design question.

1. **Decompose** — Split the question into 3–6 independent tracks (orthogonal aspects). Each track: name, focus, approach, deliverable.
2. **Execute in parallel** — For each track: gather context, investigate with file:line evidence, synthesize findings. Use `/modules`, `/module`, grep/docs as needed.
3. **Aggregate** — Merge findings: unified answer, nuances, open questions, confidence. Present to user.

Optional: for complex Effect/codebase modules, add module-specialist review (usage patterns, missed conveniences, anti-patterns). Reference: `.claude/commands/explore.md`.

---

## Write Test Workflow

**When:** Adding or expanding tests for Effect-based or pure code.

- **Effect-based code:** Use `@beep/testkit` only. Use `effect`, `scoped`, `layer`, etc. from testkit; assertions: `strictEqual`, `deepStrictEqual`, `assertSome`, `assertLeft`, etc. Use `TestClock` for time. No `Effect.runSync`, no `expect()` inside `effect()`, no native `array.map`/`string.split` in tests.
- **Pure functions:** Use `bun:test` with `expect()`.
- **Layout:** Tests under `./test` mirroring `./src`; use `@beep/*` imports, not relative.
- **Reference:** `.claude/commands/patterns/effect-testing-patterns.md` and `.claude/commands/write-test.md`.

Quick checks: tests in `test/`; imports from `@beep/testkit` and `@beep/*`; no forbidden patterns (see Write Test doc).
