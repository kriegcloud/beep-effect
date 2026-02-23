# JSDoc Analysis Report: @beep/contract

> **Generated**: 2025-12-06T05:22:05.962Z
> **Package**: packages/common/contract
> **Status**: 3 exports need documentation

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
    * import { MyThing } from "@beep/contract"
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

- [ ] `src/Contract.ts:21` — **Contract** (const)
  - Missing: @category, @example, @since

- [ ] `src/ContractError.ts:6` — **ContractError** (const)
  - Missing: @category, @example, @since

- [ ] `src/ContractKit.ts:19` — **ContractKit** (const)
  - Missing: @category, @example, @since

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 3 |
| Fully Documented | 0 |
| Missing Documentation | 3 |
| Missing @category | 3 |
| Missing @example | 3 |
| Missing @since | 3 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/contract
```

If successful, delete this file. If issues remain, the checklist will be regenerated.