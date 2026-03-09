---
title: Project Setup
description: "Install the Effect Language Service and strict project defaults"
order: 1
group: Setup
---

# Project Setup

This guide covers:
1. **Effect Language Service**: Editor diagnostics and build-time type checking
2. **Reference Repositories**: Local reference repositories for AI assistance

For a well-configured Effect project, install the Effect Language Service and set up local context for AI-assisted development.

## Effect Language Service

The [Effect Language Service](https://github.com/Effect-TS/language-service) provides editor diagnostics and compile-time type checking. This guide covers installation and setup.

### Installation

```bash
bun add -d @effect/language-service
```

Add the plugin to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@effect/language-service"
      }
    ]
  }
}
```

### VS Code Setup

For VS Code or any VS Code fork (Cursor, etc.):

1. Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

2. Press F1 → "TypeScript: Select TypeScript version"
3. Choose "Use workspace version"

### Enable Build-Time Diagnostics

Patch TypeScript to get Effect diagnostics during compilation:

```bash
bunx effect-language-service patch
```

Add to `package.json` to persist across installs:

```json
{
  "scripts": {
    "prepare": "effect-language-service patch"
  }
}
```

## Reference Repositories

We recommend cloning the Effect repository (and other complex dependencies you work with often) locally. Your AI agent can then grep through real source code, patterns, and documentation to resolve complex problems.

Clone it wherever makes sense for you: a dedicated open source directory, or a shared location like `~/.local/share/effect-solutions/effect` (which the agent-guided setup uses to share across projects).

Once cloned, add a reference in `CLAUDE.md` or `AGENTS.md`:
```markdown
## Local Effect Source

The Effect repository is cloned to `~/.local/share/effect-solutions/effect` for reference. 
Use this to explore APIs, find usage examples, and understand implementation 
details when the documentation isn't enough.
```

Your agent can now search the actual Effect source code for implementation patterns, API usage examples, and detailed type definitions.

## TypeScript Configuration

Effect projects benefit from strict TypeScript configuration for safety and performance.

**See:** [TypeScript Configuration](./02-tsconfig.md)