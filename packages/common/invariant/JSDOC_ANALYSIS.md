# JSDoc Analysis Report: @beep/invariant

> **Generated**: 2025-12-06T05:49:31.460Z
> **Package**: packages/common/invariant
> **Status**: 0 exports need documentation

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
    * import { MyThing } from "@beep/invariant"
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

All exports are fully documented!

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 4 |
| Fully Documented | 4 |
| Missing Documentation | 0 |
| Missing @category | 0 |
| Missing @example | 0 |
| Missing @since | 0 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/invariant
```

If successful, delete this file. If issues remain, the checklist will be regenerated.