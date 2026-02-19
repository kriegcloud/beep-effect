# @beep/repo-utils Package Documentation

**Date:** 2026-02-19
**Status:** 📋 Ready for Implementation
**Location:** `tooling/repo-utils/` (to be created)

---

## Overview

This directory contains complete planning and handoff documentation for implementing the `@beep/repo-utils` package - a from-scratch Effect v4 reimplementation of monorepo utilities.

**Package Purpose:**
- Effect-based filesystem operations
- Repository root and workspace discovery
- Dependency extraction and analysis
- Sophisticated graph algorithms (topological sort, cycle detection)
- TypeScript configuration discovery

**Why This Package?**
- Foundation for `@beep/repo-cli` and other tooling
- Essential primitives for monorepo automation
- Type-safe, composable, testable utilities

---

## Documents in This Directory

### 1. Legacy Inventory (`repo-utils-legacy-inventory.md`)

**Purpose:** Comprehensive analysis of legacy `@beep/tooling-utils` package

**What's Inside:**
- Inventory of 30+ utilities with descriptions
- Functionality breakdown by module
- Complexity analysis and time estimates
- Migration recommendations (Tier 1/2/3 priorities)
- Implementation complexity table
- Testing strategy
- Success criteria

**When to Read:** First - to understand what utilities exist and why they're valuable

**Key Sections:**
- High-Priority Utilities (Tier 1) - Core functionality
- Implementation Complexity Analysis - Time estimates
- Migration Recommendations - Phased approach

---

### 2. Implementation Plan (`repo-utils-implementation-plan.md`)

**Purpose:** Detailed technical plan for implementation

**What's Inside:**
- Complete package structure
- 4-phase implementation plan with tasks
- Module-by-module implementation guides
- Code examples and patterns
- Testing strategy
- Documentation requirements
- Dependencies and catalog additions
- Success criteria for each phase

**When to Read:** Second - before starting implementation

**Key Sections:**
- Phase 1: Foundation (15-20 hours) - Basic operations
- Phase 2: Dependency Analysis (10-12 hours) - Dep extraction
- Phase 3: Advanced Analysis (12-16 hours) - Graph algorithms
- Phase 4: Polish (5-8 hours) - Additional utilities

---

### 3. Handoff Prompt (`repo-utils-handoff-prompt.md`)

**Purpose:** Complete handoff document for another Claude instance to implement

**What's Inside:**
- Mission statement and context
- Effect v4 patterns to follow
- Step-by-step implementation workflow
- Critical implementation details with code
- Testing guidelines with examples
- Documentation standards
- Common pitfalls and how to avoid them
- Success checklist
- Quick reference for Effect v4 APIs

**When to Read:** Third - when actually implementing (or handing off to another agent)

**Key Sections:**
- Your Mission - What to build
- Effect v4 Patterns to Follow - Code examples
- Step-by-Step Workflow - Concrete steps
- Critical Implementation Details - Full implementations
- Common Pitfalls to Avoid - What NOT to do

---

## Quick Start Guide

### For Review and Planning

1. **Read the Inventory** (`repo-utils-legacy-inventory.md`)
   - Understand what utilities are most valuable
   - See time estimates and complexity
   - Review migration recommendations

2. **Read the Implementation Plan** (`repo-utils-implementation-plan.md`)
   - See detailed phase breakdown
   - Understand dependencies needed
   - Review testing and documentation requirements

3. **Decide on Approach**
   - Implement yourself following the plan
   - Hand off to another Claude instance using handoff prompt
   - Hire a developer with these specs

### For Implementation

If implementing yourself:
1. Read all three documents thoroughly
2. Start with Phase 1 from the Implementation Plan
3. Use Handoff Prompt as reference for code examples
4. Test thoroughly after each module
5. Follow the Success Checklist

If handing off to another Claude instance:
1. Provide the Handoff Prompt document
2. Point to Inventory and Implementation Plan as reference
3. Ask them to read context documents first
4. Let them work through phases independently
5. Review their work after each phase

---

## Key Information Summary

### Time Estimates

| Phase | Focus | Hours |
|-------|-------|-------|
| Phase 1 | Foundation (FsUtils, Root, Workspaces, Schemas) | 15-20 |
| Phase 2 | Dependency Analysis | 10-12 |
| Phase 3 | Graph Algorithms & TsConfig | 12-16 |
| Phase 4 | Polish (optional) | 5-8 |
| **Total** | | **37-53** |

### Priorities

**Must Have (Phase 1):**
- FsUtils (glob, readJson, writeJson, modifyFile)
- Root discovery (findRepoRoot)
- PackageJson schema
- Workspace resolution

**Should Have (Phase 2):**
- Dependency extraction
- Dependency index
- Unique NPM deps

**Nice to Have (Phase 3):**
- Graph algorithms (topological sort, cycle detection)
- TsConfig discovery

**Optional (Phase 4):**
- Additional FsUtils functions
- Convenience service
- Additional schemas

### Dependencies Required

**Add to Root Catalog:**
```json
{
  "catalog": {
    "@effect/platform": "^4.0.0-beta.5",
    "glob": "^13.0.0"
  }
}
```

**Package Dependencies:**
```json
{
  "dependencies": {
    "effect": "catalog:",
    "@effect/platform": "catalog:",
    "@effect/platform-node": "catalog:",
    "glob": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@effect/vitest": "catalog:"
  }
}
```

### Module Structure

```
tooling/repo-utils/
├── src/
│   ├── index.ts                 # Main exports
│   ├── FsUtils.ts               # Filesystem service
│   ├── Root.ts                  # Root discovery
│   ├── Workspaces.ts            # Workspace resolution
│   ├── Dependencies.ts          # Dependency extraction
│   ├── DependencyIndex.ts       # Full repo index
│   ├── Graph.ts                 # Graph algorithms
│   ├── UniqueDeps.ts            # NPM collection
│   ├── TsConfig.ts              # TsConfig discovery
│   ├── schemas/
│   │   ├── PackageJson.ts
│   │   └── WorkspaceDeps.ts
│   └── errors/
│       ├── NoSuchFileError.ts
│       ├── DomainError.ts
│       └── CyclicDependencyError.ts
└── test/
    ├── FsUtils.test.ts
    ├── Root.test.ts
    ├── Workspaces.test.ts
    └── fixtures/
        └── mock-monorepo/       # Test fixtures
```

---

## Critical Design Decisions

### 1. Effect v4 Only
- NO Effect v3 APIs
- Use `Schema.Struct` not `Schema.struct`
- Use new Effect v4 patterns from effect-smol

### 2. Platform Abstractions
- NO direct Node.js fs module
- USE @effect/platform FileSystem and Path
- Ensures cross-platform compatibility

### 3. Service-Based Architecture
- Define services with Context.GenericTag
- Implement with Layer.effect
- Compose with Layer.provide

### 4. Strong Error Types
- Use Data.TaggedError for all errors
- Specific error types (NoSuchFileError, DomainError, etc.)
- Proper error propagation through Effect channel

### 5. Comprehensive Testing
- Use @effect/vitest for all tests
- Import test utils from @effect/vitest, not vitest
- Create mock monorepo fixtures
- Test with real monorepo for integration

### 6. Complete Documentation
- Module-level JSDoc with Mental model, Common tasks, Quickstart
- Function-level JSDoc with @since, @category, @example
- @since tags on ALL exports (including re-exports)
- README with usage examples

---

## Success Criteria

**Package is Ready When:**
- ✅ All Phase 1 utilities implemented and tested
- ✅ At least 80% test coverage
- ✅ API documentation complete with examples
- ✅ Successfully used by @beep/repo-cli
- ✅ No Effect v3 dependencies
- ✅ All linting and type checking passes
- ✅ All scripts work (build, check, test, docgen, lint)

---

## Next Steps

### Option 1: Implement Yourself
1. Read all three documents
2. Create package structure at `tooling/repo-utils/`
3. Start with Phase 1 tasks
4. Test thoroughly after each module
5. Move through phases sequentially

### Option 2: Hand Off to Another Agent
1. Spawn a new Claude instance (or use subagent)
2. Provide the Handoff Prompt document
3. Point to Inventory and Implementation Plan as reference
4. Let them work through phases independently
5. Review after each phase completion

### Option 3: Review and Iterate
1. Review the plan and provide feedback
2. Identify any missing utilities or requirements
3. Update documents as needed
4. Then proceed with Option 1 or 2

---

## Questions?

If anything is unclear:
1. Check the specific document (Inventory, Plan, or Handoff)
2. Look at `tooling/cli/` for package structure example
3. Check `.repos/effect-smol/packages/effect/` for Effect v4 patterns
4. Read `specs/pending/effect-v4-migration/design-discussions/005-lessons-learned-creating-repo-cli.md` for lessons learned

---

## Document Maintenance

These documents should be updated if:
- New utilities are identified as needed
- Implementation approach changes
- Effect v4 APIs change
- Patterns are refined during implementation
- Issues are discovered that need documentation

**Last Updated:** 2026-02-19
**Status:** Ready for Implementation
**Owner:** To be assigned
