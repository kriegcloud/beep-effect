# Opportunities and friction receipts — attorney-question-loop

Receipts recorded at the moment friction happens (AGENTS.md "Friction is a first-class output").
They are redacted: no secrets, no absolute home paths, no session ids.

## 2026-10-14 — an unqueued vitest run grew to about 35 GB RSS

- **Doing:** P2. An agent ran the two new test files in one combined vitest invocation without
  `beep-heavy`.
- **Evidence:** the process grew to about 35 GB RSS before it was killed. The same run under
  `beep-heavy` passed in seconds, and the blow-up did not reproduce.
- **Cost:** one killed run and a memory-pressure risk for every other session on the workstation.
- **Would have prevented it:**
  - An RSS cap on direct `bunx vitest` invocations.
  - A shell guard that routes multi-file vitest runs through `beep-heavy` automatically.
  - Without either, agent briefs must say to run every test command through `beep-heavy`.
