# JSDoc Analysis Report: @beep/identity

> **Generated**: 2025-12-06T13:10:48.975Z
> **Package**: packages/common/identity
> **Status**: 50 exports need documentation

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
    * import { MyThing } from "@beep/identity"
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

- [ ] `src/index.ts:15` — **export * as Identifier from "./Identifier";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./Identifier needs documentation

- [ ] `src/index.ts:30` — **export * as modules from "./packages";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./packages needs documentation

- [ ] `src/index.ts:45` — **export { $I } from "./packages";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./packages needs documentation

- [ ] `src/index.ts:60` — **export * as types from "./types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./types needs documentation

- [ ] `src/index.ts:13` — **Identifier** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **modules** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:29` — **$I** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:12` — **types** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:29` — **$I** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:539` — **$SharedUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:540` — **$SharedSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:541` — **$RepoScriptsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:542` — **$IamInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:543` — **$DocumentsTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:544` — **$UiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:545` — **$InvariantId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:546` — **$WebId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:547` — **$SchemaId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:548` — **$DocumentsDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:549` — **$ContractId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:550` — **$RuntimeServerId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:551` — **$IamSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:552` — **$IamUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:553` — **$SharedInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:554` — **$IdentityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:555` — **$UtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:556` — **$IamDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:557` — **$RuntimeClientId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:558` — **$ScratchpadId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:559` — **$SharedTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:560` — **$MockId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:561` — **$UiCoreId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:562` — **$ErrorsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:563` — **$TypesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:564` — **$BuildUtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:565` — **$DocumentsSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:566` — **$DocumentsUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:567` — **$ConstantsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:568` — **$TestkitId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:569` — **$ToolingUtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:570` — **$RepoCliId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:571` — **$NotesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:572` — **$DocumentsInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:573` — **$ScraperId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:574` — **$SharedDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:575` — **$DbAdminId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:576` — **$ServerId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:577` — **$IamTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

### Medium Priority (Missing some tags)

- [ ] `src/Identifier.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 78 |
| Fully Documented | 28 |
| Missing Documentation | 50 |
| Missing @category | 48 |
| Missing @example | 48 |
| Missing @since | 50 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/identity
```

If successful, delete this file. If issues remain, the checklist will be regenerated.