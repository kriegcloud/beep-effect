You are enforcing the documentation strategy for @beep/utils. Follow these steps exactly:

  1. Review Strategy Docs
      - Read packages/common/schema-v2/DOCUMENTATION_STRATEGY.md.
      - Note required JSDoc shape (summary, @example, @category, @since) and analyzer expectations.
  2. Audit Package Surface
      - Inspect src/ exports.
      - Ensure each export has the full JSDoc block. Include runnable @examples that do NOT rely on declare statements—prefer simple assignments (const example: MyType = ...; void
        example;).
      - Avoid void (undefined as Type); TS examples should type-check without casting.
  3. Check Namespaces & Imports
      - Add a high-level JSDoc at the top of each module describing its purpose, with an example referencing namespace usage (import type * as FooTypes from "@beep/types/foo.types";).
      - Respect Effect import guardrails (namespace imports, no default Schema imports).
  4. Docgen Config Verification
      - Open the package’s docgen.json.
      - Confirm srcLink, exclude, and paths entries cover all dependent aliases (e.g., @beep/utils/*). Add explicit path mappings when docgen errors indicate missing modules.
      - Ensure homepage exists in package.json (docgen requires it).
  5. Run Targeted Analyzer First
      - Execute bun run docs:lint:file -- <comma-separated src files> at repo root.
      - If analyzer reports “Unknown argument,” quote the comma-separated list.
      - Fix missing tags until command passes cleanly (look at jsdoc-analysis-results.json for hints).
  6. Package Docgen First
      - Run bunx docgen inside the package to confirm examples compile before invoking root bun run docgen.
      - If TypeScript errors mention missing modules, patch docgen.json paths; if they mention example re-declarations, rewrite @examples to introduce unique local bindings.
  7. Repo-Level Docgen & Docs Site
      - Once individual docgen succeeds, run bun run docgen from repo root.
      - If other packages aren’t ready (e.g., schema-v2 dependencies), either patch shared configs (like schema-v2/docgen.json) or coordinate with owners.
  8. Summarize Findings
      - Document any config adjustments (e.g., why extra path aliases were added).
      - Provide exact analyzer/docgen outputs (success or failure messages) so reviewers can trust the state.
  9. Edge Cases to Watch
      - Analyzer treats comma-separated --file values literally; wrap paths in quotes.
      - @example code must be executable TypeScript—use actual values, not declare.
      - If docgen pulls in additional workspaces unintentionally, trim root scripts (tooling/repo-scripts/package.json) so only target packages run.

  Following this checklist prevents the rework we hit (missing homepage, invalid examples, unresolved path aliases) and keeps the doc pipeline predictable.