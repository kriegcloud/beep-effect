# Base Codex Session Prompt Template

## Usage
Copy the `text` block below into a fresh Codex session, then replace the placeholders and delete any sections that do not apply.

This is the default medium-weight template in the local prompt library. Use it when you want more than a tiny bootstrap, but do not need the stricter implementation-only variant.

If you are choosing between templates, start with [README.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/expert-memory-big-picture/prompts/README.md).

## Copy/Paste Prompt
```text
Work in `/home/elpresidank/YeeBois/projects/beep-effect3`.

Delete any sections marked optional if they do not apply. Replace every `{{PLACEHOLDER}}` before starting.

You must follow this repo contract for the entire task:

1. Use `$effect-first-development` for this task.
2. This repository uses Effect v4. Do not trust training data for Effect APIs.
3. The local Effect v4 subtree at `/home/elpresidank/YeeBois/projects/beep-effect3/.repos/effect-v4` is the source of truth for Effect syntax, module layout, and API shape.
4. Before writing or changing Effect code, verify the exact APIs you plan to use against local Effect v4 source or docs in `.repos/effect-v4`. Do not rely on memory, `node_modules`, or web search.
5. Always try to find existing patterns in this repo and reuse them before inventing a new shape.
6. Keep scope tight. Do not do unrelated refactors.
7. Add or update JSDoc for every touched export in a module. JSDoc must follow `/home/elpresidank/YeeBois/projects/beep-effect3/.patterns/jsdoc-documentation.md` and remain docgen-clean.
8. Use `bun` for repo commands. For package-scoped work, prefer `bun run --filter=@beep/{{PACKAGE_NAME}} <script>`.
9. Run narrow, relevant quality commands as soon as a file or module is ready instead of waiting until the very end.
10. Do not finish with failing `check`, `lint`, `test`, or `docgen` commands unless you explicitly classify the failures as pre-existing and provide evidence.

Startup workflow:

1. Query Graphiti memory first if the tool is available.
2. Use the `beep-dev` memory group.
3. Important Graphiti wrapper gotcha:
   - if the MCP surface expects `group_ids` as a string, pass `"[\"beep-dev\"]"`
   - if it accepts native arrays, pass `["beep-dev"]`
   - never pass plain `"beep-dev"` because that fails validation
4. Search memory using a query tailored to this task before exploring files.
5. Explore local repo context before editing. Read the relevant target files, neighboring modules, tests, specs, and pattern docs first.

Task summary:

- Title: `{{TASK_TITLE}}`
- Objective: `{{TASK_OBJECTIVE}}`
- Success criteria: `{{SUCCESS_CRITERIA}}`
- Out of scope: `{{OUT_OF_SCOPE}}`

Task context:

- Target files or areas:
  - `{{TARGET_FILES_OR_AREAS}}`
- Package scope:
  - `{{PACKAGE_SCOPE}}`
- Local references to read first:
  - `{{LOCAL_REFERENCES}}`
- Existing repo patterns to mirror:
  - `{{EXISTING_PATTERNS_TO_REUSE}}`
- Additional hard constraints:
  - `{{CONSTRAINTS}}`

Execution requirements:

1. Start by gathering evidence:
   - read the target files
   - inspect adjacent implementations and tests
   - inspect package scripts if package-scoped verification is needed
   - inspect `.repos/effect-v4` before assuming any Effect API
2. Summarize the relevant existing patterns before making non-trivial changes.
3. If you touch Effect services, schemas, errors, layers, FiberRefs, Deferreds, or other Effect-heavy code, cite the exact local Effect v4 files you used as API evidence in the final report.
4. Prefer the smallest consistent change that matches repo conventions.
5. If there is no clear existing pattern, say so and choose the least surprising repo-consistent approach.
6. Keep runtime boundaries explicit and preserve existing behavior unless this task explicitly requires a behavior change.

Command conventions:

- Workspace-wide commands:
  - `bun run check`
  - `bun run lint`
  - `bun run test`
  - `bun run docgen`
- Package-scoped commands:
  - `bun run --filter=@beep/{{PACKAGE_NAME}} check`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} lint`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} test`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} docgen`
- Replace `{{PACKAGE_NAME}}` with the real package name suffix only when package-scoped execution is correct for this task.
- Prefer the narrowest command set that proves the touched area is correct.

Documentation contract:

1. Every touched export in a module must have JSDoc.
2. JSDoc examples must compile under docgen when examples are required by repo conventions.
3. Follow `/home/elpresidank/YeeBois/projects/beep-effect3/.patterns/jsdoc-documentation.md`.
4. Do not remove useful examples just to silence docgen failures. Fix the examples correctly.

Verification workflow:

1. Run focused checks after each meaningful unit of work once it is ready.
2. Re-run the relevant package or workspace quality commands after the implementation stabilizes.
3. In the final response, report:
   - exact commands run
   - whether each command passed or failed
   - whether any failure was pre-existing or introduced by this task
   - the exact local files consulted for Effect v4 API verification
   - the repo-local patterns reused

Deliverables:

- Primary deliverable(s):
  - `{{DELIVERABLES}}`
- Final response expectations:
  - `{{FINAL_OUTPUT_EXPECTATIONS}}`

Optional implementation mode block:

Keep this block only for code-writing tasks.

- Implement the change end-to-end instead of stopping at analysis.
- Add or update focused tests when behavior changes or regression risk is non-trivial.
- Run quality commands incrementally, especially after each module becomes coherent.

Optional review mode block:

Keep this block only for review tasks.

- Use a code review mindset.
- Prioritize findings, risks, regressions, and missing tests.
- Report findings first with file references and severity order.
- Keep summary secondary.

Optional research mode block:

Keep this block only for research or design tasks.

- Do not pretend unverified claims are facts.
- Distinguish clearly between local evidence, inference, and open questions.
- Ground recommendations in repo evidence before proposing broader changes.

Optional planning mode block:

Keep this block only for planning tasks.

- Produce a decision-complete plan.
- Ground the plan in the current repo structure, scripts, and patterns.
- Call out assumptions explicitly instead of hiding them.
```
