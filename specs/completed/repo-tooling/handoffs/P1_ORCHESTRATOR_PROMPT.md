# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `create-package` overhaul spec.

### Context
The `beep create-package` CLI command currently generates 4 files (package.json, tsconfig.json, src/index.ts, test/.gitkeep). We are overhauling it to generate 13 files using Handlebars templates, including LICENSE, README.md, AGENTS.md, ai-context.md, CLAUDE.md (symlink), docgen.json, vitest.config.ts, dtslint/.gitkeep, and docs/index.md.

Research and design are complete. Template specifications and architecture decisions are documented.

### Your Mission
1. Add `handlebars` dependency to the catalog and cli package
2. Restructure `create-package.ts` into `create-package/handler.ts` + `templates/`
3. Write all 8 HBS templates per the template inventory
4. Refactor the handler to load templates, add `--description` flag, generate all 13 files, create CLAUDE.md symlink
5. Update tests to verify all generated files
6. Run full quality checks

### Critical Patterns
- Effect v4: `import { Effect, FileSystem } from "effect"`, `import { Command, Flag } from "effect/unstable/cli"`
- Use `Effect.fn` for all functions returning Effects
- Use `DomainError` for all error cases (never native Error)
- Use `Console.log` for CLI user-facing output
- Test with `@effect/vitest`, `TestConsole`, `Command.runWith`
- Run tests with `npx vitest run`, never `bun test`

### Reference Files
- `specs/completed/repo-tooling/outputs/create-package-template-inventory.md` - Complete template specs
- `specs/completed/repo-tooling/outputs/create-package-design.md` - Architecture decisions
- `specs/completed/repo-tooling/handoffs/HANDOFF_P1.md` - Full phase context

### Verification
After each task, run:
```bash
bun run build && bun run check && bun run test && bun run test:types && bun run lint:fix && bun run lint
```

### Success Criteria
- [ ] Handlebars installed and importable
- [ ] create-package is now a directory with handler.ts + templates/
- [ ] All 8 HBS templates exist and contain correct content
- [ ] Handler generates all 13 files (incl. CLAUDE.md symlink)
- [ ] --description flag works
- [ ] Dry-run lists all 13 files
- [ ] All tests pass (existing + new)
- [ ] Full quality checks pass

### Handoff Document
Read full context in: `specs/completed/repo-tooling/handoffs/HANDOFF_P1.md`
