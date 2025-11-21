You are working in /home/elpresidank/YeeBois/projects/beep-effect2. Goal: fix docgen errors for {PACKAGE_NAME} and iterate until `bun run docgen --filter={PACKAGE_NAME}` passes.

  Constraints:
  - Read AGENTS.md at repo root and at package-specific paths (e.g., packages/common/identity/AGENTS.md). Follow Effect rules: namespace imports, no native array/string methods (use effect/Array via pipe, effect/String,
  etc.), honor branded types and JSDoc expectations.
  - Do not start long-running dev/infra commands; run targeted ones only when needed.
  - Use apply_patch for single-file edits when possible.
  - Keep ASCII; add concise comments only when code isn’t self-explanatory.

  Workflow:
  1) Run `bun run docgen --filter={PACKAGE_NAME}` to capture errors.
  2) Open the referenced files/examples and fix issues (e.g., missing exports, wrong imports in JSDoc examples, type mismatches), following package AGENTS guidance.
  3) Re-run `bun run docgen --filter={PACKAGE_NAME}` and repeat until it succeeds.
  4) Summarize changes and suggest any follow-up checks (e.g., `bun run lint --filter {PACKAGE_NAME}`), but don’t run heavy commands unless necessary.

  Deliverable: A brief recap of what changed (files/lines), confirmation docgen now passes, and suggested next steps.

  Replace {PACKAGE_NAME} with the target package scope (e.g., @beep/identity).