# Effect v4 Migration

## Overview

This spec tracks the migration of the beep-effect2 repository to Effect v4, including:
- Complete package/app restructure with clean slate approach
- New folder structure and naming conventions
- Robust tooling development
- Repository configuration updates

## Status

**Phase:** Design & Planning
**Started:** 2026-02-18
**Branch:** `effect-v4-migration`

## Context

The Effect v4 beta introduces breaking changes significant enough to warrant a clean slate migration. The legacy codebase is preserved in `.repos/beep-effect` (git subtree) for reference while we rebuild with:
- Stricter folder structure
- Enhanced naming conventions
- More robust tooling (starting with `@beep/repo-cli`)

## Structure

- `design-discussions/` - Chronological design decisions and discussions
- `implementation-plans/` - Detailed implementation plans for specific components
- `migration-notes/` - Notes on migrating specific patterns from v3 to v4

## Key Decisions

### Repository Tooling Strategy

**Decision:** Start with `@beep/repo-cli` tooling before agent configurations
**Rationale:**
- CLI tools can bootstrap package creation with correct conventions
- Tools can validate conventions automatically
- Agent configs depend on having a stable structure first

### First Command: `create-package`

**Decision:** First command will be `create-package` for bootstrapping new packages
**Naming:** Chose `create-package` to align with existing `create-slice` pattern
**Location:** `tooling/cli` as package `@beep/repo-cli`

See `design-discussions/001-create-package-command.md` for detailed design.

## Reference

- Legacy CLI: `.repos/beep-effect/tooling/cli`
- Effect v4 Beta: https://effect.website
