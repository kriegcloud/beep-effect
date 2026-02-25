# `@beep/repo-cli`

CLI tool for creating and managing packages in the beep-effect monorepo following Effect v4 standards.

## Requirements

- **TypeScript 5.9 or Newer**
- **Strict Type-Checking**
- **Bun 1.3.9 or Newer**

## Installation

This is a private workspace package. Use it via:

```bash
bunx @beep/repo-cli <command>
```

## Commands

### `create-package`

Create a new package following effect-smol patterns.

```bash
bunx @beep/repo-cli create-package <name> [--type=library|tool|app]
```

### `codegen`

Generate barrel file exports for a package.

```bash
bunx @beep/repo-cli codegen [package-dir]
```

### `docs`

Discover repository laws, skills, and policy gates through command-first output.

```bash
bunx @beep/repo-cli docs laws
bunx @beep/repo-cli docs skills
bunx @beep/repo-cli docs policies
bunx @beep/repo-cli docs find <topic>
```

### `kg`

AST knowledge graph indexing, publication, verification, parity, and replay operations.

```bash
# Index deterministic local artifacts
bunx @beep/repo-cli kg index --mode full
bunx @beep/repo-cli kg index --mode delta --changed packages/foo/src/index.ts

# Dual-write publish to Falkor, Graphiti, or both
bunx @beep/repo-cli kg publish --target both --mode full
bunx @beep/repo-cli kg publish --target both --mode delta --changed tooling/cli/src/commands/kg.ts

# Verify and parity checks
bunx @beep/repo-cli kg verify --target both --group beep-ast-kg --commit <sha>
bunx @beep/repo-cli kg parity --profile code-graph-functional --group beep-ast-kg

# Replay previously spooled envelopes
bunx @beep/repo-cli kg replay --from-spool tooling/ast-kg/.cache/graphiti-spool/<sha>.jsonl --target both
```

## License

MIT
