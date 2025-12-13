# JSDoc Analysis Report: @beep/shared-infra

> **Generated**: 2025-12-12T23:33:06.825Z
> **Package**: packages/shared/infra
> **Status**: 19 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ````typescript
   /**
    * Brief description of what this does.
    *
    * @example
    * ```typescript
    * import { MyThing } from "@beep/shared-infra"
    *
    * const result = MyThing.make({ field: "value" })
    * console.log(result)
    * // => { field: "value" }
    * ```
    *
    * @category Constructors
    * @since 0.1.0
    */
   ````

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/Db.ts:46` — **export * from "./db/index";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./db/index needs documentation

- [ ] `src/Db.ts:1` — **Db** (const)
  - Missing: @category, @example, @since

- [ ] `src/Db.ts:6` — **SharedDb** (const)
  - Missing: @category, @example, @since

- [ ] `src/Email.ts:24` — **export * from "./internal/email";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./internal/email needs documentation

- [ ] `src/Email.ts:1` — **Email** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **export * from "./repos";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./repos needs documentation

- [ ] `src/index.ts:6` — **SharedRepos** (const)
  - Missing: @category, @example, @since

- [ ] `src/Repo.ts:1` — **Repo** (const)
  - Missing: @category, @example, @since

- [ ] `src/Upload.ts:24` — **export * from "./internal/upload";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./internal/upload needs documentation

- [ ] `src/Upload.ts:94` — **UploadService** (class)
  - Missing: @category, @example, @since

- [ ] `src/db/index.ts:18` — **export * from "./Db";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Db needs documentation

- [ ] `src/db/index.ts:6` — **SharedDb** (const)
  - Missing: @category, @example, @since

- [ ] `src/repos/index.ts:18` — **export * from "./File.repo.ts";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./File.repo.ts needs documentation

- [ ] `src/repos/index.ts:34` — **export * as SharedRepos from "./repositories.ts";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./repositories.ts needs documentation

- [ ] `src/repos/index.ts:6` — **SharedRepos** (const)
  - Missing: @category, @example, @since

- [ ] `src/repos/repositories.ts:74` — **export * from "./File.repo.ts";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./File.repo.ts needs documentation

- [ ] `src/repos/repositories.ts:87` — **export * from "./Folder.repo.ts";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Folder.repo.ts needs documentation

- [ ] `src/db/Db/index.ts:15` — **export * as SharedDb from "./Db";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Db needs documentation

- [ ] `src/db/Db/index.ts:6` — **SharedDb** (const)
  - Missing: @category, @example, @since

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 41 |
| Fully Documented | 22 |
| Missing Documentation | 19 |
| Missing @category | 19 |
| Missing @example | 19 |
| Missing @since | 19 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/shared/infra
```

If successful, delete this file. If issues remain, the checklist will be regenerated.