# Strict Implementation Prompt Template

## Usage
Use this when you want the higher-enforcement implementation variant of the default template.

Replace every placeholder, delete any line that does not apply, and keep the task tightly scoped.

## Copy/Paste Prompt
```text
Work from the repository root of the current workspace.

Treat this as a strict implementation task. Do not stop at analysis unless blocked by a real ambiguity or failing pre-existing state.

Replace every `{{PLACEHOLDER}}` before starting.

Non-negotiable repo contract:

1. Use `$effect-first-development`.
2. This repo uses Effect v4. Treat `.repos/effect-v4` as the only source of truth for Effect APIs and syntax.
3. Before changing any Effect code, verify the exact APIs you plan to use against local Effect v4 source, docs, or tests in `.repos/effect-v4`.
4. Reuse existing repo patterns before inventing new ones.
5. Use `bun` for all repo commands. For package-local work, prefer `bun run --filter=@beep/{{PACKAGE_NAME}} <script>`.
6. Add or update JSDoc for every touched export in a module, following `.patterns/jsdoc-documentation.md`.
7. Run narrow, relevant quality commands as soon as each file or module is coherent.
8. Do not finish with failing `check`, `lint`, `test`, or `docgen` unless you clearly prove the failure is pre-existing.
9. Do not use unverified Effect APIs, skip regression coverage for changed behavior, or widen the edit scope before the current area is stable.

Required startup:

1. Query Graphiti memory first if available, using the `beep-dev` group.
2. If the wrapper expects `group_ids` as a string, pass `"[\"beep-dev\"]"`.
3. Read the target files, nearby implementations, nearby tests, and any spec or pattern docs relevant to this task.
4. If Effect APIs are involved, inspect `.repos/effect-v4` before editing.
5. Identify the narrowest initial verification command before making edits.

Task summary:

- Title: `{{TASK_TITLE}}`
- Objective: `{{TASK_OBJECTIVE}}`
- Success criteria: `{{SUCCESS_CRITERIA}}`
- Behavior that must stay stable: `{{BEHAVIOR_TO_PRESERVE}}`
- Out of scope: `{{OUT_OF_SCOPE}}`

Task context:

- Target files:
  - `{{TARGET_FILES}}`
- Allowed edit scope:
  - `{{ALLOWED_EDIT_SCOPE}}`
- Package scope:
  - `{{PACKAGE_SCOPE}}`
- Local references to read first:
  - `{{LOCAL_REFERENCES}}`
- Existing repo patterns to mirror:
  - `{{EXISTING_PATTERNS_TO_REUSE}}`
- Additional constraints:
  - `{{CONSTRAINTS}}`

Implementation workflow:

1. Gather evidence before editing:
   - read the target modules
   - inspect adjacent modules and tests
   - inspect package scripts if package-scoped verification is needed
   - inspect local Effect v4 source for every non-obvious Effect API
2. Briefly summarize the existing patterns you intend to mirror.
3. Implement the smallest consistent change that satisfies the task.
4. Preserve runtime behavior unless the task explicitly requires a behavior change.
5. If behavior changes, add or update focused regression tests before claiming completion.
6. If the task touches code without nearby tests, add the closest practical verification coverage unless the task is purely mechanical and explicitly low-risk.
7. After each meaningful file or module is coherent, run the narrowest relevant quality command before expanding scope.
8. Do not create more files or broaden the refactor until the current area is stable or you have a concrete reason to batch the work.
9. If a quality command fails, fix it before moving on unless the failure is clearly pre-existing and documented with evidence.
10. If the task crosses package boundaries, verify the directly affected dependents or explain why narrower verification is sufficient.

Verification expectations:

- Preferred package-scoped commands:
  - `bun run --filter=@beep/{{PACKAGE_NAME}} check`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} lint`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} test`
  - `bun run --filter=@beep/{{PACKAGE_NAME}} docgen`
- Use workspace-level commands only if the task is cross-package or package scoping is not correct:
  - `bun run check`
  - `bun run lint`
  - `bun run test`
  - `bun run docgen`
- Replace `{{PACKAGE_NAME}}` only when package-scoped execution is valid for this task.

Deliverables:

- Primary deliverable(s):
  - `{{DELIVERABLES}}`
- Required tests or verification targets:
  - `{{REQUIRED_TESTS_OR_CHECKS}}`
- Final response expectations:
  - `{{FINAL_OUTPUT_EXPECTATIONS}}`

Final response contract:

1. List the exact commands you ran and whether each passed or failed.
2. Classify any failure as pre-existing or introduced.
3. List the exact local Effect v4 files you used as API evidence.
4. List the repo-local patterns you reused.
5. Call out any intentional deviation from existing patterns and why it was necessary.
6. State what regression coverage was added, updated, or intentionally omitted.
```
