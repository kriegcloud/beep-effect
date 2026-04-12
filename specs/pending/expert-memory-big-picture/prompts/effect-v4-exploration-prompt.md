# Effect v4 Exploration Prompt Template

## Usage
Use this for Effect v4 exploration, migration research, API-shape verification, or local-source-grounded explanation work.

This template is research-oriented by default. Replace every placeholder before sending.

## Copy/Paste Prompt
```text
Work from the repository root of the current workspace.

This task is for Effect v4 exploration. Default to research and explanation unless the task explicitly asks for code changes.

Replace every `{{PLACEHOLDER}}` before starting.

Non-negotiable rules:

1. Treat `.repos/effect-v4` as the only trustworthy source of truth for Effect v4 APIs.
2. Do not rely on training data, `node_modules`, or web docs for Effect v4 answers.
3. If local docs and local source disagree, source and tests win.
4. Query Graphiti memory first if available, using the `beep_dev` group.
5. Search this repo for existing usages of the Effect area under discussion before concluding anything.

Exploration request:

- Title: `{{TASK_TITLE}}`
- Questions to answer:
  - `{{QUESTIONS_TO_ANSWER}}`
- Effect modules or APIs to inspect:
  - `{{EFFECT_MODULES_TO_INSPECT}}`
- Repo files or packages to compare:
  - `{{REPO_FILES_TO_COMPARE}}`
- Expected output:
  - `{{EXPECTED_OUTPUT}}`
- Constraints:
  - `{{CONSTRAINTS}}`

Exploration workflow:

1. Read the relevant `.repos/effect-v4` docs, source files, and tests.
2. Inspect local repo usages of the same APIs or patterns.
3. Separate verified facts from inference.
4. Call out missing evidence instead of guessing.
5. If the task involves migration guidance, explicitly map current or old patterns to verified local v4 replacements.
6. If code changes are requested later, use this exploration as evidence before editing.

Final response expectations:

- answer each requested question directly
- cite the exact local Effect v4 files consulted
- cite the repo files compared
- separate verified facts, inferences, and open questions
- call out likely pitfalls or migration risks
```
