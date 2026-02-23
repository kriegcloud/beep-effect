# Repo CLI Doc Tag Sync: Orchestrator Prompt

Copy-paste this prompt into a new Codex session.

---

You are executing the spec at:
`specs/pending/repo-cli-doc-tags-sync/README.md`

Your mission is to complete the spec phases in order:
1. Research
2. Design
3. Implementation plan
4. Implementation
5. Testing

## Hard Requirements
- Implement a new `@beep/repo-cli` command that autofills file-level `@module` tags from package-relative module path.
- Add `@since` sync behavior using package version + git diff changed lines.
- Support both check mode (CI/lint) and write mode (autofix).
- Use ts-morph for AST traversal and symbol mapping.
- Keep edits idempotent.

## Required Deliverables
- `specs/pending/repo-cli-doc-tags-sync/outputs/research.md`
- `specs/pending/repo-cli-doc-tags-sync/outputs/design.md`
- `specs/pending/repo-cli-doc-tags-sync/outputs/implementation-plan.md`
- Implementation and tests in `tooling/cli`

## Key References
- `tooling/cli/src/commands/root.ts`
- `tooling/cli/src/index.ts`
- `tooling/cli/test/codegen.test.ts`
- `tooling/repo-utils/src/Workspaces.ts`
- `tooling/repo-utils/src/Root.ts`
- `tooling/codebase-search/src/extractor/JsDocExtractor.ts`
- `.repos/effect-smol/packages/*/src`
- `.repos/beep-effect/tooling/cli/src/commands/*`

## Verification Gate
Before handoff completion, run:
```bash
bun run build
bun run check
bun run test
bun run lint:jsdoc
bun run lint
```

If command-specific scripts are added, run those too.
