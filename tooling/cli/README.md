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

## License

MIT
