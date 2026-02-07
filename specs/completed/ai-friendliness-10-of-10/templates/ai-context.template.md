# ai-context.md Template

Use this template when generating ai-context.md files in Phase 1.

---

## Template

```markdown
---
path: [packages/slice/layer OR apps/name OR tooling/name]
summary: [One-line description for /modules listing - max 100 chars]
tags: [tag1, tag2, tag3, tag4]
---

# [Module Name]

[2-3 sentence overview of what this module does and its role in the system]

## Architecture

```
[ASCII diagram showing module structure and data flow]

Example:
┌─────────────────────────────────────────────────┐
│                   iam-client                     │
├─────────────────────────────────────────────────┤
│  Contracts/   │  Handlers/   │  Hooks/          │
│  ├─ Auth      │  ├─ SignIn   │  ├─ useSession   │
│  ├─ Session   │  ├─ SignUp   │  └─ useMember    │
│  └─ Member    │  └─ SignOut  │                  │
├─────────────────────────────────────────────────┤
│            better-auth React client              │
└─────────────────────────────────────────────────┘
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/[file].ts` | [What this file does] |
| `src/[dir]/` | [What this directory contains] |

## Usage Patterns

### [Primary Use Case]

```typescript
// Example code showing the main way to use this module
import { Something } from "@beep/[module]";

const example = Something.create();
```

### [Secondary Use Case]

```typescript
// Another common pattern
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| [Choice made] | [Why this choice was made] |

## Dependencies

**Internal**:
- `@beep/[dependency]` - [what it provides]

**External**:
- `[library]` - [what it's used for]

## Related

- **AGENTS.md** - Detailed contributor guidance for this package
- **Spec**: `specs/[related-spec]/` (if applicable)
```

---

## Guidelines

### Frontmatter Requirements

| Field | Required | Format |
|-------|----------|--------|
| `path` | Yes | Relative path from repo root |
| `summary` | Yes | Max 100 characters, searchable |
| `tags` | Yes | 3-5 lowercase tags |

### Summary Best Practices

**Good summaries** (searchable, informative):
- "Effect wrapper for Better Auth React client - typed contracts, session management"
- "PostgreSQL table definitions for IAM entities with RLS policies"
- "Shared domain models and EntityIds used across all slices"

**Bad summaries** (too vague):
- "Client code for IAM"
- "Domain stuff"
- "Tables"

### Tag Selection

Use consistent tags across the codebase:

| Category | Tags |
|----------|------|
| Layer | `domain`, `tables`, `server`, `client`, `ui` |
| Tech | `effect`, `schema`, `drizzle`, `react`, `better-auth` |
| Slice | `iam`, `documents`, `calendar`, `knowledge`, `comms` |
| Type | `contracts`, `handlers`, `hooks`, `services`, `models` |

### Architecture Diagrams

Use ASCII art for portability:
- Box drawings: `┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼`
- Arrows: `→ ← ↑ ↓ ↔`
- Keep width under 70 characters

### Length Guidelines

| Section | Target Length |
|---------|---------------|
| Overview | 2-3 sentences |
| Architecture | 10-20 lines |
| Core Modules | 5-10 rows |
| Usage Patterns | 1-2 examples |
| Design Decisions | 2-5 rows |
| Dependencies | 3-8 items |

**Total file**: 50-100 lines (concise for discovery)

---

## Differentiation from AGENTS.md

| Aspect | ai-context.md | AGENTS.md |
|--------|---------------|-----------|
| Purpose | Discovery, search | Contribution guidance |
| Audience | `/modules` command | Agents working in package |
| Length | 50-100 lines | 100-400 lines |
| Detail | Overview | Comprehensive |
| Examples | 1-2 patterns | All patterns |
| Guardrails | None | Full list |

**Rule**: ai-context.md links TO AGENTS.md for details.
