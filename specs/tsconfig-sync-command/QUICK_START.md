# tsconfig-sync-command Quick Start

> 5-minute guide to continue this specification.

---

## Current Status

**Phase 0: Scaffolding** - Complete
- README.md with full command design
- Research on existing CLI patterns complete

**Next**: Phase 1 - Design refinement and implementation

---

## Key Context

### Command Purpose
```bash
bun run repo-cli tsconfig-sync         # Sync all packages
bun run repo-cli tsconfig-sync --check # Validate without changes (CI)
bun run repo-cli tsconfig-sync --filter @beep/iam-server # Specific package
```

### Files to Create
```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts              # Command definition (@effect/cli)
├── handler.ts            # Effect orchestration
├── schemas.ts            # Input validation
├── errors.ts             # Tagged errors
└── utils/
    ├── dependency-graph.ts
    ├── reference-resolver.ts
    ├── tsconfig-updater.ts
    └── cycle-detector.ts
```

### Reference Patterns
- **ConfigUpdaterService**: `create-slice/utils/config-updater.ts` (jsonc-parser)
- **topo-sort.ts**: `commands/topo-sort.ts` (cycle detection)
- **Command pattern**: `create-slice/index.ts`

---

## Immediate Next Steps

1. **Launch effect-code-writer** to implement the command:
   ```
   Use effect-code-writer agent to implement tsconfig-sync command
   following the patterns in create-slice command.
   Start with index.ts command definition and handler.ts orchestration.
   ```

2. **Register command** in `tooling/cli/src/index.ts`

3. **Launch test-writer** for tests:
   ```
   Use test-writer agent to create tests for tsconfig-sync command
   covering: sync new dep, remove dep, circular detection, --check mode
   ```

---

## Success Criteria Checklist

- [ ] package.json deps → tsconfig references
- [ ] tsconfig.base.jsonc path alias updates
- [ ] Circular dependency detection
- [ ] `--check` mode (exit code 1 on drift)
- [ ] `--dry-run` mode
- [ ] `--filter` scope
- [ ] Comment preservation (jsonc-parser)
- [ ] Tests passing
- [ ] CLI CLAUDE.md updated

---

## Related Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Full design document |
| [create-slice](../../tooling/cli/src/commands/create-slice/) | Reference implementation |
| [CLI CLAUDE.md](../../tooling/cli/CLAUDE.md) | CLI patterns & registration |
