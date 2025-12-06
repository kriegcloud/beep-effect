# JSDoc Analysis Report: @beep/identity

> **Generated**: 2025-12-06T05:34:37.877Z
> **Package**: packages/common/identity
> **Status**: 64 exports need documentation

---

## Instructions for Agent

You are tasked with adding missing JSDoc documentation to this package. Follow these rules:

1. **Required Tags**: Every public export must have:
   - `@category` - Hierarchical category (e.g., "Constructors", "Models/User", "Utils/String")
   - `@example` - Working TypeScript code example with imports
   - `@since` - Version when added (use `0.1.0` for new items)

2. **Example Format**:
   ```typescript
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
   ```

3. **Workflow**:
   - Work through the checklist below in order
   - Mark items complete by changing `[ ]` to `[x]`
   - After completing all items, delete this file

---

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/Identifier.ts:255` — **TaggedAccessor** (type)
  - Missing: @category, @example, @since

- [ ] `src/Identifier.ts:257` — **TaggedComposer** (type)
  - Missing: @category, @example, @since

- [ ] `src/Identifier.ts:287` — **TaggedModuleRecord** (type)
  - Missing: @category, @example, @since

- [ ] `src/Identifier.ts:299` — **TaggedComposerResult** (type)
  - Missing: @category, @example, @since

- [ ] `src/Identifier.ts:313` — **BaseIdentity** (type)
  - Missing: @category, @example, @since

- [ ] `src/Identifier.ts:316` — **__internal** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **Identifier** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:12` — **modules** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **$I** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:12` — **types** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:14` — **$I** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:28` — **$SharedUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:29` — **$SharedSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:30` — **$RepoScriptsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:31` — **$IamInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:32` — **$DocumentsTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:33` — **$UiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:34` — **$InvariantId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:35` — **$WebId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:36` — **$SchemaId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:37` — **$DocumentsDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:38` — **$ContractId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:39` — **$RuntimeServerId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:40` — **$IamSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:41` — **$IamUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:42` — **$SharedInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:43` — **$IdentityId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:44` — **$UtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:45` — **$IamDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:46` — **$RuntimeClientId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:47` — **$ScratchpadId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:48` — **$SharedTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:49` — **$MockId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:50` — **$UiCoreId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:51` — **$ErrorsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:52` — **$TypesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:53` — **$BuildUtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:54` — **$DocumentsSdkId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:55` — **$DocumentsUiId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:56` — **$ConstantsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:57` — **$TestkitId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:58` — **$ToolingUtilsId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:59` — **$RepoCliId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:60` — **$NotesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:61` — **$DocumentsInfraId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:62` — **$ScraperId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:63` — **$SharedDomainId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:64` — **$DbAdminId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:65` — **$ServerId** (const)
  - Missing: @category, @example, @since

- [ ] `src/packages.ts:66` — **$IamTablesId** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:4` — **ModuleCharacters** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:9` — **ModuleLeadingAlpha** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:16` — **Segment** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:27` — **SegmentType** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:29` — **ModuleSegment** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:38` — **ModuleSegmentType** (type)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:40` — **BaseSegment** (const)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:52` — **InvalidSegmentError** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:64` — **InvalidModuleSegmentError** (class)
  - Missing: @category, @example, @since

- [ ] `src/schema.ts:76` — **InvalidBaseError** (class)
  - Missing: @category, @example, @since

- [ ] `src/types.ts:165` — **ModuleSegmentValue** (type)
  - Missing: @category, @example, @since

- [ ] `src/types.ts:175` — **ModuleAccessor** (type)
  - Missing: @category, @example, @since

- [ ] `src/types.ts:177` — **ModuleRecord** (type)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)

- [ ] `src/Identifier.ts:243` — **make** (const)
  - Missing: @category, @since
  - Has: @example
  - Context: Build the root `$<Base>Id` composer for the given base segment(s).

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 72 |
| Fully Documented | 8 |
| Missing Documentation | 64 |
| Missing @category | 64 |
| Missing @example | 63 |
| Missing @since | 64 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/identity
```

If successful, delete this file. If issues remain, the checklist will be regenerated.