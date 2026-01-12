# JSDoc Analysis Report: @beep/types

> **Generated**: 2026-01-11T23:49:12.542Z
> **Package**: packages/common/types
> **Status**: 477 exports need documentation

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
    * import { MyThing } from "@beep/types"
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

- [ ] `src/all-extend.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/all-extend.ts:13` — **AllExtendOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/all-union-fields.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/and.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/array-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/array-slice.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/array-splice.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/array-tail.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/async-return-type.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/asyncify.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/basic.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/camel-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/camel-case.ts:9` — **CamelCaseOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: CamelCase options.

- [ ] `src/camel-case.ts:18` — **_DefaultCamelCaseOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/camel-cased-properties-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/camel-cased-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/conditional-except.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/conditional-keys.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/conditional-pick-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/conditional-pick-deep.ts:27` — **ConditionalPickDeepOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: ConditionalPickDeep options.

- [ ] `src/conditional-pick.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/delimiter-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/delimiter-case.ts:7` — **_DefaultDelimiterCaseOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/delimiter-cased-properties-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/delimiter-cased-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/distributed-omit.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/distributed-pick.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/empty-object.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/entries.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/entry.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/entry.ts:4` — **_ArrayEntry** (type)
  - Missing: @category, @example, @since

- [ ] `src/entry.ts:5` — **_MapEntry** (type)
  - Missing: @category, @example, @since

- [ ] `src/entry.ts:6` — **_ObjectEntry** (type)
  - Missing: @category, @example, @since

- [ ] `src/entry.ts:7` — **_SetEntry** (type)
  - Missing: @category, @example, @since

- [ ] `src/exact.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/except.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/except.ts:34` — **ExceptOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/exclude-rest-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/exclusify-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/extends-strict.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/extract-rest-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/fixed-length-array.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/get.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/get.ts:8` — **GetOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/greater-than-or-equal.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/greater-than.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/has-optional-keys.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/has-readonly-keys.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/has-required-keys.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/has-writable-keys.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if-any.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if-empty-object.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if-never.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if-null.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if-unknown.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/if.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/includes.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/index.ts:31` — **export type * from "./built-in";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./built-in needs documentation

- [ ] `src/index.ts:46` — **export type * from "./characters";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./characters needs documentation

- [ ] `src/index.ts:61` — **export type * from "./common";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./common needs documentation

- [ ] `src/index.ts:76` — **export type * from "./deep-non-nullable";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./deep-non-nullable needs documentation

- [ ] `src/index.ts:91` — **export type * as LiteralTypes from "./literal.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./literal.types needs documentation

- [ ] `src/index.ts:107` — **export type * as ModelTypes from "./model.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./model.types needs documentation

- [ ] `src/index.ts:122` — **export type * as MutTypes from "./mut.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./mut.types needs documentation

- [ ] `src/index.ts:123` — **export * from "./non-empty-object";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./non-empty-object needs documentation

- [ ] `src/index.ts:137` — **export type * as Or from "./or.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./or.types needs documentation

- [ ] `src/index.ts:151` — **export type * from "./primitive.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./primitive.types needs documentation

- [ ] `src/index.ts:165` — **export type * as PromiseTypes from "./promise.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./promise.types needs documentation

- [ ] `src/index.ts:179` — **export type * as RecordTypes from "./record.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./record.types needs documentation

- [ ] `src/index.ts:193` — **export type * as SchemaTypes from "./schema.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./schema.types needs documentation

- [ ] `src/index.ts:207` — **export type * as StringTypes from "./string.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./string.types needs documentation

- [ ] `src/index.ts:222` — **export type * as StructTypes from "./struct.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./struct.types needs documentation

- [ ] `src/index.ts:236` — **export type * as TagTypes from "./tag.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./tag.types needs documentation

- [ ] `src/index.ts:237` — **export * from "./thunk.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./thunk.types needs documentation

- [ ] `src/index.ts:251` — **export type * as UnsafeTypes from "./unsafe.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./unsafe.types needs documentation

- [ ] `src/index.ts:266` — **export type * as UtilTypes from "./util.types";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./util.types needs documentation

- [ ] `src/index.ts:15` — **LiteralTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:15` — **ModelTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:17` — **MutTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:17` — **Or** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:17` — **PromiseTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **RecordTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **SchemaTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **StringTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:15` — **StructTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:15` — **TagTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **UnsafeTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:15` — **UtilTypes** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:38` — **RequiredKeys** (type)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **Thunk** (type)
  - Missing: @category, @example, @since

- [ ] `src/int-closed-range.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/int-range.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/invariant-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-integer.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-literal.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-literal.ts:119` — **_IsStringLiteral** (type)
  - Missing: @category, @example, @since

- [ ] `src/is-lowercase.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-nullable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-optional-key-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-optional.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-readonly-key-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-required-key-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-tuple.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-tuple.ts:10` — **IsTupleOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/is-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-unknown.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-uppercase.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/is-writable-key-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/join.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/jsonifiable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/jsonify.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/kebab-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/kebab-cased-properties-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/kebab-cased-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/keys-of-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/less-than-or-equal.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/less-than.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/literal-to-primitive-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/literal-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/literal-union.ts:3` — **_LiteralStringUnion** (type)
  - Missing: @category, @example, @since

- [ ] `src/merge-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/merge-deep.ts:325` — **MergeDeepOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: MergeDeep options.

- [ ] `src/merge-exclusive.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/merge.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/multidimensional-array.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/multidimensional-readonly-array.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/non-empty-object.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/non-empty-object.ts:38` — **RequiredKeys** (type)
  - Missing: @category, @example, @since

- [ ] `src/numeric.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/numeric.ts:4` — **_Numeric** (type)
  - Missing: @category, @example, @since

- [ ] `src/omit-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/opaque.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/opaque.ts:1` — **export type * from "./tagged";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./tagged needs documentation

- [ ] `src/opaque.ts:4` — **TagContainer** (type)
  - Missing: @category, @example, @since

- [ ] `src/opaque.ts:1` — **tag** (const)
  - Missing: @category, @example, @since

- [ ] `src/optional-keys-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/or.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/or.ts:82` — **_Or** (type)
  - Missing: @category, @example, @since

- [ ] `src/override-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/partial-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/partial-deep.ts:7` — **PartialDeepOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/partial-on-undefined-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/partial-on-undefined-deep.ts:9` — **PartialOnUndefinedDeepOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/pascal-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/pascal-cased-properties-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/pascal-cased-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/paths.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/paths.ts:20` — **PathsOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: Paths options.

- [ ] `src/pick-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/readonly-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/readonly-deep.ts:114` — **_ReadonlyObjectDeep** (type)
  - Missing: @category, @example, @since
  - Context: Same as `ReadonlyDeep`, but accepts only `object`s as inputs. Internal helper for `ReadonlyDeep`.

- [ ] `src/readonly-keys-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/readonly-tuple.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/remove-prefix.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/remove-prefix.ts:9` — **RemovePrefixOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/replace.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/replace.ts:3` — **ReplaceOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/require-all-or-none.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/require-at-least-one.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/require-exactly-one.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/require-one-or-none.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/required-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/required-keys-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/schema.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/schema.ts:10` — **SchemaOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see

- [ ] `src/screaming-snake-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-field-type.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-field-type.ts:4` — **SetFieldTypeOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/set-non-nullable-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-optional.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-parameter-type.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-readonly.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-readonly.ts:35` — **_SetReadonly** (type)
  - Missing: @category, @example, @since

- [ ] `src/set-required-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-required.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/set-return-type.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/shared-union-fields-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/shared-union-fields-deep.ts:20` — **SharedUnionFieldsDeepOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: SharedUnionFieldsDeep options.

- [ ] `src/shared-union-fields.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/simplify-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/single-key-object.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/snake-case.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/snake-cased-properties-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/snake-cased-properties.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/split-on-rest-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/split-on-rest-element.ts:81` — **_SplitOnRestElement** (type)
  - Missing: @category, @example, @since
  - Context: Deconstructs an array on its rest element and returns the split portions.

- [ ] `src/split.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/split.ts:11` — **SplitOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: Split options.

- [ ] `src/spread.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/string-repeat.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/string-slice.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/structured-cloneable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/subtract.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/sum.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tagged.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tagged.ts:261` — **export type { default as tag } from "tagged-tag";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from tagged-tag needs documentation

- [ ] `src/tagged.ts:4` — **TagContainer** (type)
  - Missing: @category, @example, @since

- [ ] `src/tagged.ts:1` — **tag** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.types.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/thunk.types.ts:1` — **Thunk** (type)
  - Missing: @category, @example, @since

- [ ] `src/trim.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tuple-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/tuple-to-object.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/undefined-on-partial-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/union-to-tuple.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/words.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/words.ts:17` — **WordsOptions** (type)
  - Missing: @category, @example, @since
  - Has: @see
  - Context: Words options.

- [ ] `src/words.ts:37` — **_DefaultWordsOptions** (type)
  - Missing: @category, @example, @since

- [ ] `src/writable-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/writable-deep.ts:67` — **_WritableObjectDeep** (type)
  - Missing: @category, @example, @since
  - Context: Same as `WritableDeep`, but accepts only `object`s as inputs. Internal helper for `WritableDeep`.

- [ ] `src/writable-keys-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/writable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/xor.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/globals/index.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

- [ ] `src/globals/index.ts:1` — **export type * from "./observable-like";** (re-export)
  - Missing: @category, @example, @since
  - Context: Re-export from ./observable-like needs documentation

- [ ] `src/globals/observable-like.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Context: Module is missing fileoverview JSDoc comment

### Medium Priority (Missing some tags)

- [ ] `src/all-extend.ts:101` — **AllExtend** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category
  - Context: Returns a boolean for whether every element in an array type extends another type.

- [ ] `src/all-union-fields.ts:71` — **AllUnionFields** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @see, @category, @category
  - Context: Create a type with all fields from a union of object types.

- [ ] `src/and.ts:79` — **And** (type)
  - Missing: @category, @since
  - Has: @example, @example, @example, @see, @see
  - Context: Returns a boolean for whether two given types are both true.

- [ ] `src/array-element.ts:41` — **ArrayElement** (type)
  - Missing: @since
  - Has: @example, @see, @see, @category
  - Context: Extracts the element type of an array or tuple.

- [ ] `src/array-indices.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/array-indices.ts:22` — **ArrayIndices** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: Provides valid indices for a constant array or tuple.

- [ ] `src/array-slice.ts:59` — **ArraySlice** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Returns an array slice of a given range, just like `Array#slice()`.

- [ ] `src/array-splice.ts:81` — **ArraySplice** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a new array type by adding or removing elements at a specified index range in the original array.

- [ ] `src/array-tail.ts:54` — **ArrayTail** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Extract the type of an array or tuple minus the first element.

- [ ] `src/array-values.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/array-values.ts:22` — **ArrayValues** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: Provides all values for a constant array or tuple.

- [ ] `src/arrayable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/arrayable.ts:26` — **Arrayable** (type)
  - Missing: @since
  - Has: @see, @example, @category
  - Context: Create a type that represents either the value or an array of the value.

- [ ] `src/async-return-type.ts:28` — **AsyncReturnType** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Unwrap the return type of a function that returns a `Promise`.

- [ ] `src/asyncify.ts:23` — **Asyncify** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create an async version of the given function type, by boxing the return type in `Promise` while keeping the same parameter types.

- [ ] `src/basic.ts:7` — **Class** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches a [`class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

- [ ] `src/basic.ts:17` — **Constructor** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

- [ ] `src/basic.ts:28` — **AbstractClass** (interface)
  - Missing: @example, @since
  - Has: @category, @privateRemarks
  - Context: Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/2/classes.html#abstract-classes-and-members).

- [ ] `src/basic.ts:38` — **AbstractConstructor** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches an [`abstract class`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-2.html#abstract-construct-signatures) constructor.

- [ ] `src/camel-case.ts:80` — **CamelCase** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Convert a string literal to camel-case.

- [ ] `src/camel-cased-properties-deep.ts:57` — **CamelCasedPropertiesDeep** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to camel case recursively.

- [ ] `src/camel-cased-properties.ts:35` — **CamelCasedProperties** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to camel case but not recursively.

- [ ] `src/characters.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/characters.ts:17` — **UppercaseLetter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Matches any uppercase letter in the basic Latin alphabet (A-Z).

- [ ] `src/characters.ts:59` — **LowercaseLetter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any lowercase letter in the basic Latin alphabet (a-z).

- [ ] `src/characters.ts:101` — **DigitCharacter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any digit as a string ('0'-'9').

- [ ] `src/characters.ts:117` — **Alphanumeric** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any lowercase letter (a-z), uppercase letter (A-Z), or digit ('0'-'9') in the basic Latin alphabet.

- [ ] `src/conditional-except.ts:42` — **ConditionalExcept** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Exclude keys from a shape that matches the given `Condition`.

- [ ] `src/conditional-keys.ts:52` — **ConditionalKeys** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Extract the keys from a type where the value type of the key extends the given `Condition`.

- [ ] `src/conditional-pick-deep.ts:98` — **ConditionalPickDeep** (type)
  - Missing: @since
  - Has: @see, @example, @category
  - Context: Pick keys recursively from the shape that matches the given condition.

- [ ] `src/conditional-pick.ts:41` — **ConditionalPick** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Pick keys from the shape that matches the given `Condition`.

- [ ] `src/conditional-simplify-deep.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/conditional-simplify-deep.ts:67` — **ConditionalSimplifyDeep** (type)
  - Missing: @since
  - Has: @example, @example, @see, @category
  - Context: Recursively simplifies a type while including and/or excluding certain types from being simplified.

- [ ] `src/conditional-simplify.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/conditional-simplify.ts:44` — **ConditionalSimplify** (type)
  - Missing: @since
  - Has: @example, @example, @see, @category
  - Context: Simplifies a type while including and/or excluding certain types from being simplified.

- [ ] `src/delimiter-case.ts:63` — **DelimiterCase** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category
  - Context: Convert a string literal to a custom string delimiter casing.

- [ ] `src/delimiter-cased-properties-deep.ts:60` — **DelimiterCasedPropertiesDeep** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to delimiter case recursively.

- [ ] `src/delimiter-cased-properties.ts:36` — **DelimiterCasedProperties** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to delimiter case but not recursively.

- [ ] `src/distributed-omit.ts:91` — **DistributedOmit** (type)
  - Missing: @since
  - Has: @ts-expect-error, @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Omits keys from a type, distributing the operation over a union.

- [ ] `src/distributed-pick.ts:87` — **DistributedPick** (type)
  - Missing: @since
  - Has: @ts-expect-error, @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Pick keys from a type, distributing the operation over a union.

- [ ] `src/empty-object.ts:32` — **EmptyObject** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @ts-expect-error, @category
  - Context: Represents a strictly empty plain object, the `{}` value.

- [ ] `src/empty-object.ts:49` — **IsEmptyObject** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: Returns a `boolean` for whether the type is strictly equal to an empty plain object, the `{}` value.

- [ ] `src/entries.ts:57` — **Entries** (type)
  - Missing: @since
  - Has: @see, @example, @category, @category, @category, @category
  - Context: Many collections have an `entries` method which returns an array of a given object's own enumerable string-keyed property [key, value] pairs. The `Entries` type will return the type of that collection's entries.

- [ ] `src/entry.ts:60` — **Entry** (type)
  - Missing: @since
  - Has: @see, @example, @category, @category, @category, @category
  - Context: Many collections have an `entries` method which returns an array of a given object's own enumerable string-keyed property [key, value] pairs. The `Entry` type will return the type of that collection's entry.

- [ ] `src/exact.ts:59` — **Exact** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @example, @ts-expect-error, @category
  - Context: Create a type that does not allow extra properties, meaning it only allows properties that are explicitly declared.

- [ ] `src/except.ts:104` — **Except** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Create a type from an object type without certain keys.

- [ ] `src/exclude-rest-element.ts:30` — **ExcludeRestElement** (type)
  - Missing: @since
  - Has: @example, @see, @see, @category
  - Context: Create a tuple with the [`rest`](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) element removed.

- [ ] `src/exclude-strict.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/exclude-strict.ts:41` — **ExcludeStrict** (type)
  - Missing: @since
  - Has: @example, @example, @ts-expect-error, @ts-expect-error, @category
  - Context: A stricter version of {@link Exclude<T, U>} that ensures every member of `U` can successfully exclude something from `T`.

- [ ] `src/exclusify-union.ts:94` — **ExclusifyUnion** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @example, @ts-expect-error, @example, @category, @category
  - Context: Ensure mutual exclusivity in object unions by adding other members’ keys as `?: never`.

- [ ] `src/extends-strict.ts:35` — **ExtendsStrict** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: A stricter, non-distributive version of `extends` for checking whether one type is assignable to another.

- [ ] `src/extract-rest-element.ts:28` — **ExtractRestElement** (type)
  - Missing: @since
  - Has: @example, @see, @see, @category
  - Context: Extract the [`rest`](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) element type from an array.

- [ ] `src/extract-strict.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/extract-strict.ts:41` — **ExtractStrict** (type)
  - Missing: @since
  - Has: @example, @example, @ts-expect-error, @ts-expect-error, @category
  - Context: A stricter version of {@link Extract<T, U>} that ensures every member of `U` can successfully extract something from `T`.

- [ ] `src/find-global-type.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/find-global-type.ts:22` — **FindGlobalType** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Tries to find the type of a global with the given name.

- [ ] `src/find-global-type.ts:63` — **FindGlobalInstanceType** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Tries to find one or more types from their globally-defined constructors.

- [ ] `src/fixed-length-array.ts:92` — **FixedLengthArray** (type)
  - Missing: @since
  - Has: @example, @example, @ts-expect-error, @example, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @category
  - Context: Create a type that represents an array of the given type and length. The `Array` prototype methods that manipulate its length are excluded from the resulting type.

- [ ] `src/get.ts:201` — **Get** (type)
  - Missing: @since
  - Has: @example, @category, @category, @category
  - Context: Get a deeply-nested property from an object using a key path, like Lodash's `.get()` function.

- [ ] `src/global-this.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/global-this.ts:22` — **GlobalThis** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Declare locally scoped properties on `globalThis`.

- [ ] `src/greater-than-or-equal.ts:20` — **GreaterThanOrEqual** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether a given number is greater than or equal to another number.

- [ ] `src/greater-than.ts:24` — **GreaterThan** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether a given number is greater than another number.

- [ ] `src/has-optional-keys.ts:21` — **HasOptionalKeys** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents `true` or `false` depending on whether the given type has any optional fields.

- [ ] `src/has-readonly-keys.ts:21` — **HasReadonlyKeys** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents `true` or `false` depending on whether the given type has any readonly fields.

- [ ] `src/has-required-keys.ts:59` — **HasRequiredKeys** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents `true` or `false` depending on whether the given type has any required fields.

- [ ] `src/has-writable-keys.ts:21` — **HasWritableKeys** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents `true` or `false` depending on whether the given type has any writable fields.

- [ ] `src/if-any.ts:24` — **IfAny** (type)
  - Missing: @since
  - Has: @deprecated, @see, @example, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given type is `any`.

- [ ] `src/if-empty-object.ts:24` — **IfEmptyObject** (type)
  - Missing: @since
  - Has: @deprecated, @see, @example, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given type is `{}`.

- [ ] `src/if-never.ts:24` — **IfNever** (type)
  - Missing: @since
  - Has: @deprecated, @see, @example, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given type is `never`.

- [ ] `src/if-null.ts:24` — **IfNull** (type)
  - Missing: @since
  - Has: @deprecated, @see, @example, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given type is `null`.

- [ ] `src/if-unknown.ts:24` — **IfUnknown** (type)
  - Missing: @since
  - Has: @deprecated, @see, @example, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given type is `unknown`.

- [ ] `src/if.ts:95` — **If** (type)
  - Missing: @since
  - Has: @example, @example, @example, @example, @ts-expect-error, @category, @category
  - Context: An if-else-like type that resolves depending on whether the given `boolean` type is `true` or `false`.

- [ ] `src/includes.ts:17` — **Includes** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Returns a boolean for whether the given array includes the given item.

- [ ] `src/index.ts:17` — **UppercaseLetter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Matches any uppercase letter in the basic Latin alphabet (A-Z).

- [ ] `src/index.ts:59` — **LowercaseLetter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any lowercase letter in the basic Latin alphabet (a-z).

- [ ] `src/index.ts:101` — **DigitCharacter** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any digit as a string ('0'-'9').

- [ ] `src/index.ts:117` — **Alphanumeric** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches any lowercase letter (a-z), uppercase letter (A-Z), or digit ('0'-'9') in the basic Latin alphabet.

- [ ] `src/index.ts:36` — **NonEmptyObject** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @see, @category
  - Context: Represents an object with at least 1 non-optional key.

- [ ] `src/int-closed-range.ts:45` — **IntClosedRange** (type)
  - Missing: @category, @since
  - Has: @example, @example, @see
  - Context: Generate a union of numbers.

- [ ] `src/int-range.ts:45` — **IntRange** (type)
  - Missing: @category, @since
  - Has: @example, @example, @see
  - Context: Generate a union of numbers.

- [ ] `src/invariant-of.ts:83` — **InvariantOf** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @example, @ts-expect-error, @category
  - Context: Create an [invariant type](https://basarat.gitbook.io/typescript/type-system/type-compatibility#footnote-invariance), which is a type that does not accept supertypes and subtypes.

- [ ] `src/is-any.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-any.ts:29` — **IsAny** (type)
  - Missing: @since
  - Has: @link, @example, @category, @category
  - Context: Returns a boolean for whether the given type is `any`.

- [ ] `src/is-equal.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-equal.ts:27` — **IsEqual** (type)
  - Missing: @since
  - Has: @link, @link, @example, @category, @category
  - Context: Returns a boolean for whether the two given types are equal.

- [ ] `src/is-float.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-float.ts:33` — **IsFloat** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given number is a float, like `1.5` or `-1.5`.

- [ ] `src/is-integer.ts:49` — **IsInteger** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given number is an integer, like `-5`, `1.0`, or `100`.

- [ ] `src/is-literal.ts:112` — **IsStringLiteral** (type)
  - Missing: @since
  - Has: @example, @example, @category, @category
  - Context: Returns a boolean for whether the given type is a `string` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

- [ ] `src/is-literal.ts:170` — **IsNumericLiteral** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is a `number` or `bigint` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

- [ ] `src/is-literal.ts:210` — **IsBooleanLiteral** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is a `true` or `false` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

- [ ] `src/is-literal.ts:245` — **IsSymbolLiteral** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is a `symbol` [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

- [ ] `src/is-literal.ts:299` — **IsLiteral** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types).

- [ ] `src/is-lowercase.ts:20` — **IsLowercase** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether the given string literal is lowercase.

- [ ] `src/is-never.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-never.ts:54` — **IsNever** (type)
  - Missing: @since
  - Has: @link, @link, @link, @example, @example, @category, @category
  - Context: Returns a boolean for whether the given type is `never`.

- [ ] `src/is-null.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-null.ts:20` — **IsNull** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is `null`.

- [ ] `src/is-nullable.ts:28` — **IsNullable** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type includes `null`.

- [ ] `src/is-optional-key-of.ts:43` — **IsOptionalKeyOf** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given key is an optional key of type.

- [ ] `src/is-optional.ts:26` — **IsOptional** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type includes `undefined`.

- [ ] `src/is-readonly-key-of.ts:44` — **IsReadonlyKeyOf** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given key is a readonly key of type.

- [ ] `src/is-required-key-of.ts:45` — **IsRequiredKeyOf** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given key is a required key of type.

- [ ] `src/is-tuple.ts:70` — **IsTuple** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category
  - Context: Returns a boolean for whether the given array is a tuple.

- [ ] `src/is-undefined.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/is-undefined.ts:20` — **IsUndefined** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given type is `undefined`.

- [ ] `src/is-union.ts:17` — **IsUnion** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether the given type is a union.

- [ ] `src/is-unknown.ts:35` — **IsUnknown** (type)
  - Missing: @since
  - Has: @link, @example, @category
  - Context: Returns a boolean for whether the given type is `unknown`.

- [ ] `src/is-uppercase.ts:20` — **IsUppercase** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether the given string literal is uppercase.

- [ ] `src/is-writable-key-of.ts:45` — **IsWritableKeyOf** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a boolean for whether the given key is a writable key of type.

- [ ] `src/iterable-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/iterable-element.ts:59` — **IterableElement** (type)
  - Missing: @since
  - Has: @example, @example, @example, @example, @category
  - Context: Get the element type of an `Iterable`/`AsyncIterable`. For example, `Array`, `Set`, `Map`, generator, stream, etc.

- [ ] `src/join.ts:59` — **Join** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Join an array of strings and/or numbers using the given string as a delimiter.

- [ ] `src/json-value.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category
  - Context: Module fileoverview missing @since tag

- [ ] `src/json-value.ts:8` — **JsonObject** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches a JSON object.

- [ ] `src/json-value.ts:15` — **JsonArray** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches a JSON array.

- [ ] `src/json-value.ts:22` — **JsonPrimitive** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches any valid JSON primitive value.

- [ ] `src/json-value.ts:31` — **JsonValue** (type)
  - Missing: @example, @since
  - Has: @see, @category
  - Context: Matches any valid JSON value.

- [ ] `src/jsonifiable.ts:37` — **Jsonifiable** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Matches a value that can be losslessly converted to JSON.

- [ ] `src/jsonify.ts:96` — **Jsonify** (type)
  - Missing: @since
  - Has: @remarks, @example, @ts-expect-error, @ts-expect-error, @example, @link, @category
  - Context: Transform a type to one that is assignable to the `JsonValue` type.

- [ ] `src/kebab-case.ts:41` — **KebabCase** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Convert a string literal to kebab-case.

- [ ] `src/kebab-cased-properties-deep.ts:60` — **KebabCasedPropertiesDeep** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to kebab case recursively.

- [ ] `src/kebab-cased-properties.ts:37` — **KebabCasedProperties** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to kebab case but not recursively.

- [ ] `src/key-as-string.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/key-as-string.ts:25` — **KeyAsString** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Get keys of the given type as strings.

- [ ] `src/keys-of-union.ts:40` — **KeysOfUnion** (type)
  - Missing: @since
  - Has: @link, @example, @category
  - Context: Create a union of all keys from a given type, even those exclusive to specific union members.

- [ ] `src/last-array-element.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/last-array-element.ts:22` — **LastArrayElement** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Extract the type of the last element of an array.

- [ ] `src/less-than-or-equal.ts:20` — **LessThanOrEqual** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether a given number is less than or equal to another number.

- [ ] `src/less-than.ts:20` — **LessThan** (type)
  - Missing: @category, @since
  - Has: @example
  - Context: Returns a boolean for whether a given number is less than another number.

- [ ] `src/literal-to-primitive-deep.ts:63` — **LiteralToPrimitiveDeep** (type)
  - Missing: @since
  - Has: @see, @example, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @category, @category
  - Context: Like `LiteralToPrimitive` except it converts literal types inside an object or array deeply.

- [ ] `src/literal-to-primitive.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/literal-to-primitive.ts:22` — **LiteralToPrimitive** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Given a [literal type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) return the {@link Primitive | primitive type} it belongs to, or `never` if it's not a primitive.

- [ ] `src/literal-union.ts:34` — **LiteralUnion** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.

- [ ] `src/merge-deep.ts:495` — **MergeDeep** (type)
  - Missing: @since
  - Has: @example, @example, @example, @example, @experimental, @see, @category, @category, @category
  - Context: Merge two objects or two arrays/tuples recursively into a new type.

- [ ] `src/merge-exclusive.ts:40` — **MergeExclusive** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Create a type that has mutually exclusive keys.

- [ ] `src/merge.ts:44` — **Merge** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Merge two types into a new type. Keys of the second type overrides keys of the first type.

- [ ] `src/multidimensional-array.ts:32` — **MultidimensionalArray** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents a multidimensional array of the given type and dimension.

- [ ] `src/multidimensional-readonly-array.ts:32` — **MultidimensionalReadonlyArray** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Creates a type that represents a multidimensional readonly array that of the given type and dimension.

- [ ] `src/non-empty-object.ts:36` — **NonEmptyObject** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @see, @category
  - Context: Represents an object with at least 1 non-optional key.

- [ ] `src/non-empty-string.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/non-empty-string.ts:30` — **NonEmptyString** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Matches any non-empty string.

- [ ] `src/non-empty-tuple.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/non-empty-tuple.ts:22` — **NonEmptyTuple** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @see, @category
  - Context: Matches any non-empty tuple.

- [ ] `src/numeric.ts:19` — **PositiveInfinity** (type)
  - Missing: @example, @since
  - Has: @see, @category
  - Context: Matches the hidden `Infinity` type.

- [ ] `src/numeric.ts:32` — **NegativeInfinity** (type)
  - Missing: @example, @since
  - Has: @see, @category
  - Context: Matches the hidden `-Infinity` type.

- [ ] `src/numeric.ts:51` — **Finite** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: A finite `number`.

- [ ] `src/numeric.ts:100` — **Integer** (type)
  - Missing: @since
  - Has: @example, @example, @see, @see, @category
  - Context: A `number` that is an integer.

- [ ] `src/numeric.ts:124` — **Float** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: A `number` that is not an integer.

- [ ] `src/numeric.ts:141` — **NegativeFloat** (type)
  - Missing: @example, @since
  - Has: @see, @see, @category
  - Context: A negative (`-∞ < x < 0`) `number` that is not an integer.

- [ ] `src/numeric.ts:153` — **Negative** (type)
  - Missing: @example, @since
  - Has: @see, @see, @category
  - Context: A negative `number`/`bigint` (`-∞ < x < 0`)

- [ ] `src/numeric.ts:168` — **NegativeInteger** (type)
  - Missing: @example, @since
  - Has: @see, @see, @category
  - Context: A negative (`-∞ < x < 0`) `number` that is an integer.

- [ ] `src/numeric.ts:187` — **NonNegative** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category
  - Context: A non-negative `number`/`bigint` (`0 <= x < ∞`).

- [ ] `src/numeric.ts:209` — **NonNegativeInteger** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category
  - Context: A non-negative (`0 <= x < ∞`) `number` that is an integer.

- [ ] `src/numeric.ts:226` — **IsNegative** (type)
  - Missing: @since
  - Has: @see, @example, @category
  - Context: Returns a boolean for whether the given number is a negative number.

- [ ] `src/omit-deep.ts:94` — **OmitDeep** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Omit properties from a deeply-nested object.

- [ ] `src/omit-index-signature.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/omit-index-signature.ts:88` — **OmitIndexSignature** (type)
  - Missing: @since
  - Has: @ts-expect-error, @example, @see, @category
  - Context: Omit any index signatures from the given object type, leaving only explicitly defined properties.

- [ ] `src/opaque.ts:71` — **Tagged** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @example, @category
  - Context: Attach a "tag" to an arbitrary type. This allows you to create distinct types, that aren't assignable to one another, for distinct concepts in your program that should not be interchangeable, even if their runtime values have the same type. (See examples.)

- [ ] `src/opaque.ts:100` — **GetTagMetadata** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Given a type and a tag name, returns the metadata associated with that tag on that type.

- [ ] `src/opaque.ts:131` — **UnwrapTagged** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Revert a tagged type back to its original type by removing all tags.

- [ ] `src/opaque.ts:216` — **Opaque** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category, @deprecated
  - Context: Note: The `Opaque` type is deprecated in favor of `Tagged`.

- [ ] `src/opaque.ts:254` — **UnwrapOpaque** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category, @deprecated
  - Context: Note: The `UnwrapOpaque` type is deprecated in favor of `UnwrapTagged`.

- [ ] `src/optional-keys-of.ts:36` — **OptionalKeysOf** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Extract all optional keys from the given type.

- [ ] `src/or.ts:80` — **Or** (type)
  - Missing: @category, @since
  - Has: @example, @example, @example, @see, @see
  - Context: Returns a boolean for whether either of two given types is true.

- [ ] `src/override-properties.ts:31` — **OverrideProperties** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Override existing properties of the given type. Similar to `Merge`, but enforces that the original type has the properties you want to override.

- [ ] `src/partial-deep.ts:97` — **PartialDeep** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category, @category, @category
  - Context: Create a type from another type with all keys and nested keys set to optional.

- [ ] `src/partial-on-undefined-deep.ts:55` — **PartialOnUndefinedDeep** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a deep version of another type where all keys accepting `undefined` type are set to optional.

- [ ] `src/pascal-case.ts:44` — **PascalCase** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Convert a string literal to pascal-case.

- [ ] `src/pascal-cased-properties-deep.ts:57` — **PascalCasedPropertiesDeep** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to pascal case recursively.

- [ ] `src/pascal-cased-properties.ts:36` — **PascalCasedProperties** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to pascal case but not recursively.

- [ ] `src/paths.ts:198` — **Paths** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category, @category
  - Context: Generate a union of all possible paths to properties in the given object.

- [ ] `src/pick-deep.ts:80` — **PickDeep** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Pick properties from a deeply-nested object.

- [ ] `src/pick-index-signature.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/pick-index-signature.ts:46` — **PickIndexSignature** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: Pick only index signatures from the given object type, leaving out all explicitly defined properties.

- [ ] `src/primitive.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category
  - Context: Module fileoverview missing @since tag

- [ ] `src/primitive.ts:6` — **Primitive** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches any [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

- [ ] `src/promisable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/promisable.ts:25` — **Promisable** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that represents either the value or the value wrapped in `PromiseLike`.

- [ ] `src/readonly-deep.ts:72` — **ReadonlyDeep** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @ts-expect-error, @category, @category, @category, @category
  - Context: Convert `object`s, `Map`s, `Set`s, and `Array`s and all of their keys/elements into immutable structures recursively.

- [ ] `src/readonly-keys-of.ts:28` — **ReadonlyKeysOf** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Extract all readonly keys from the given type.

- [ ] `src/readonly-tuple.ts:32` — **ReadonlyTuple** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @deprecated, @category
  - Context: Create a type that represents a read-only tuple of the given type and length.

- [ ] `src/remove-prefix.ts:112` — **RemovePrefix** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category
  - Context: Remove the specified prefix from the start of a string.

- [ ] `src/replace.ts:64` — **Replace** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Represents a string with some or all matches replaced by a replacement.

- [ ] `src/require-all-or-none.ts:42` — **RequireAllOrNone** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that requires all of the given keys or none of the given keys. The remaining keys are kept as is.

- [ ] `src/require-at-least-one.ts:28` — **RequireAtLeastOne** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that requires at least one of the given keys. The remaining keys are kept as is.

- [ ] `src/require-exactly-one.ts:35` — **RequireExactlyOne** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that requires exactly one of the given keys and disallows more. The remaining keys are kept as is.

- [ ] `src/require-one-or-none.ts:37` — **RequireOneOrNone** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that requires exactly one of the given keys and disallows more, or none of the given keys. The remaining keys are kept as is.

- [ ] `src/required-deep.ts:45` — **RequiredDeep** (type)
  - Missing: @since
  - Has: @example, @category, @category, @category, @category, @category
  - Context: Create a type from another type with all keys and nested keys set to required.

- [ ] `src/required-keys-of.ts:33` — **RequiredKeysOf** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Extract all required keys from the given type.

- [ ] `src/schema.ts:90` — **Schema** (type)
  - Missing: @since
  - Has: @example, @see, @category
  - Context: Create a deep version of another object type where property values are recursively replaced into a given value type.

- [ ] `src/screaming-snake-case.ts:23` — **ScreamingSnakeCase** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Convert a string literal to screaming-snake-case.

- [ ] `src/set-field-type.ts:56` — **SetFieldType** (type)
  - Missing: @since
  - Has: @see, @example, @category
  - Context: Create a type that changes the type of the given keys.

- [ ] `src/set-non-nullable-deep.ts:58` — **SetNonNullableDeep** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Create a type that makes the specified keys non-nullable (removes `null` and `undefined`), supports deeply nested key paths, and leaves all other keys unchanged.

- [ ] `src/set-non-nullable.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/set-non-nullable.ts:35` — **SetNonNullable** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that makes the given keys non-nullable, where the remaining keys are kept as is.

- [ ] `src/set-optional.ts:30` — **SetOptional** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that makes the given keys optional. The remaining keys are kept as is. The sister of the `SetRequired` type.

- [ ] `src/set-parameter-type.ts:118` — **SetParameterType** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a function that replaces some parameters with the given parameters.

- [ ] `src/set-readonly.ts:30` — **SetReadonly** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that makes the given keys readonly. The remaining keys are kept as is.

- [ ] `src/set-required-deep.ts:43` — **SetRequiredDeep** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that makes the given keys required. You can specify deeply nested key paths. The remaining keys are kept as is.

- [ ] `src/set-required.ts:37` — **SetRequired** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type that makes the given keys required. The remaining keys are kept as is. The sister of the `SetOptional` type.

- [ ] `src/set-return-type.ts:20` — **SetReturnType** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a function type with a return type of your choice and the same parameters as the given function type.

- [ ] `src/shared-union-fields-deep.ts:99` — **SharedUnionFieldsDeep** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category
  - Context: Create a type with shared fields from a union of object types, deeply traversing nested structures.

- [ ] `src/shared-union-fields.ts:67` — **SharedUnionFields** (type)
  - Missing: @since
  - Has: @example, @see, @see, @category, @category
  - Context: Create a type with shared fields from a union of object types.

- [ ] `src/simplify-deep.ts:109` — **SimplifyDeep** (type)
  - Missing: @since
  - Has: @example, @example, @see, @category
  - Context: Deeply simplifies an object type.

- [ ] `src/simplify.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/simplify.ts:59` — **Simplify** (type)
  - Missing: @since
  - Has: @example, @example, @ts-expect-error, @link, @see, @category
  - Context: Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.

- [ ] `src/single-key-object.ts:23` — **SingleKeyObject** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Create a type that only accepts an object with a single key.

- [ ] `src/snake-case.ts:42` — **SnakeCase** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Convert a string literal to snake-case.

- [ ] `src/snake-cased-properties-deep.ts:60` — **SnakeCasedPropertiesDeep** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to snake case recursively.

- [ ] `src/snake-cased-properties.ts:37` — **SnakeCasedProperties** (type)
  - Missing: @since
  - Has: @see, @see, @example, @category, @category, @category
  - Context: Convert object properties to snake case but not recursively.

- [ ] `src/split-on-rest-element.ts:63` — **SplitOnRestElement** (type)
  - Missing: @since
  - Has: @example, @see, @see, @category
  - Context: Splits an array into three parts, where the first contains all elements before the rest element, the second is the [`rest`](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) element itself, and the third contains all elements after the rest element.

- [ ] `src/split.ts:62` — **Split** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category
  - Context: Represents an array of strings split using a given character or character set.

- [ ] `src/spread.ts:67` — **Spread** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Mimic the type inferred by TypeScript when merging two objects or two arrays/tuples using the spread syntax.

- [ ] `src/string-repeat.ts:28` — **StringRepeat** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Returns a new string which contains the specified number of copies of a given string, just like `String#repeat()`.

- [ ] `src/string-slice.ts:29` — **StringSlice** (type)
  - Missing: @since
  - Has: @see, @example, @category
  - Context: Returns a string slice of a given range, just like `String#slice()`.

- [ ] `src/stringified.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/stringified.ts:23` — **Stringified** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a type with the keys of the given type changed to `string` type.

- [ ] `src/structured-cloneable.ts:78` — **StructuredCloneable** (type)
  - Missing: @since
  - Has: @see, @example, @ts-expect-error, @category
  - Context: Matches a value that can be losslessly cloned using `structuredClone`.

- [ ] `src/subtract.ts:38` — **Subtract** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Returns the difference between two numbers.

- [ ] `src/sum.ts:35` — **Sum** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Returns the sum of two numbers.

- [ ] `src/tagged-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/tagged-union.ts:46` — **TaggedUnion** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a union of types that share a common discriminant property.

- [ ] `src/tagged.ts:71` — **Tagged** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @example, @category
  - Context: Attach a "tag" to an arbitrary type. This allows you to create distinct types, that aren't assignable to one another, for distinct concepts in your program that should not be interchangeable, even if their runtime values have the same type. (See examples.)

- [ ] `src/tagged.ts:100` — **GetTagMetadata** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Given a type and a tag name, returns the metadata associated with that tag on that type.

- [ ] `src/tagged.ts:131` — **UnwrapTagged** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @category
  - Context: Revert a tagged type back to its original type by removing all tags.

- [ ] `src/tagged.ts:216` — **Opaque** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category, @deprecated
  - Context: Note: The `Opaque` type is deprecated in favor of `Tagged`.

- [ ] `src/tagged.ts:254` — **UnwrapOpaque** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category, @deprecated
  - Context: Note: The `UnwrapOpaque` type is deprecated in favor of `UnwrapTagged`.

- [ ] `src/trim.ts:27` — **Trim** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Remove leading and trailing spaces from a string.

- [ ] `src/tuple-of.ts:70` — **TupleOf** (type)
  - Missing: @since
  - Has: @example, @example, @example, @example, @example, @category
  - Context: Create a tuple type of the specified length with elements of the specified type.

- [ ] `src/tuple-to-object.ts:41` — **TupleToObject** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Transforms a tuple into an object, mapping each tuple index to its corresponding type as a key-value pair.

- [ ] `src/tuple-to-union.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/tuple-to-union.ts:52` — **TupleToUnion** (type)
  - Missing: @since
  - Has: @example, @example, @ts-expect-error, @category
  - Context: Convert a tuple/array into a union type of its elements.

- [ ] `src/typed-array.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category
  - Context: Module fileoverview missing @since tag

- [ ] `src/typed-array.ts:6` — **TypedArray** (type)
  - Missing: @example, @since
  - Has: @category
  - Context: Matches any [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), like `Uint8Array` or `Float64Array`.

- [ ] `src/undefined-on-partial-deep.ts:44` — **UndefinedOnPartialDeep** (type)
  - Missing: @category, @since
  - Has: @example, @ts-expect-error
  - Context: Create a deep version of another type where all optional keys are set to also accept `undefined`.

- [ ] `src/union-to-intersection.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/union-to-intersection.ts:18` — **UnionToIntersection** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Convert a union type to an intersection type using [distributive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).

- [ ] `src/union-to-tuple.ts:50` — **UnionToTuple** (type)
  - Missing: @since
  - Has: @example, @example, @category
  - Context: Convert a union type into an unordered tuple type of its elements.

- [ ] `src/unknown-array.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/unknown-array.ts:25` — **UnknownArray** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Represents an array with `unknown` value.

- [ ] `src/unknown-map.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/unknown-map.ts:24` — **UnknownMap** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Represents a map with `unknown` key and value.

- [ ] `src/unknown-record.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/unknown-record.ts:31` — **UnknownRecord** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Represents an object with `unknown` value. You probably want this instead of `{}`.

- [ ] `src/unknown-set.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/unknown-set.ts:24` — **UnknownSet** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Represents a set with `unknown` value.

- [ ] `src/value-of.ts:1` — **<module fileoverview>** (module-fileoverview)
  - Missing: @since
  - Has: @category, @example
  - Context: Module fileoverview missing @since tag

- [ ] `src/value-of.ts:22` — **ValueOf** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Create a union of the given object's values, and optionally specify which keys to get the values from.

- [ ] `src/words.ts:74` — **Words** (type)
  - Missing: @since
  - Has: @example, @category, @category
  - Context: Split a string (almost) like Lodash's `_.words()` function.

- [ ] `src/writable-deep.ts:32` — **WritableDeep** (type)
  - Missing: @since
  - Has: @example, @see, @category, @category, @category, @category
  - Context: Create a deeply mutable version of an `object`/`ReadonlyMap`/`ReadonlySet`/`ReadonlyArray` type. The inverse of `ReadonlyDeep<T>`. Use `Writable<T>` if you only need one level deep.

- [ ] `src/writable-keys-of.ts:29` — **WritableKeysOf** (type)
  - Missing: @since
  - Has: @example, @category
  - Context: Extract all writable keys from the given type.

- [ ] `src/writable.ts:59` — **Writable** (type)
  - Missing: @since
  - Has: @example, @ts-expect-error, @ts-expect-error, @category
  - Context: Create a type that strips `readonly` from the given type. Inverse of `Readonly<T>`.

- [ ] `src/xor.ts:81` — **Xor** (type)
  - Missing: @category, @since
  - Has: @example, @example, @example, @see, @see
  - Context: Returns a boolean for whether only one of two given types is true.

- [ ] `src/globals/index.ts:19` — **Unsubscribable** (type)
  - Missing: @example, @since
  - Has: @remarks, @see, @see, @see, @category

- [ ] `src/globals/index.ts:42` — **Observer** (type)
  - Missing: @example, @since
  - Has: @category

- [ ] `src/globals/index.ts:72` — **ObservableLike** (type)
  - Missing: @since
  - Has: @example, @remarks, @see, @see, @see, @category
  - Context: Matches a value that is like an [Observable](https://github.com/tc39/proposal-observable).

- [ ] `src/globals/observable-like.ts:19` — **Unsubscribable** (type)
  - Missing: @example, @since
  - Has: @remarks, @see, @see, @see, @category

- [ ] `src/globals/observable-like.ts:42` — **Observer** (type)
  - Missing: @example, @since
  - Has: @category

- [ ] `src/globals/observable-like.ts:72` — **ObservableLike** (type)
  - Missing: @since
  - Has: @example, @remarks, @see, @see, @see, @category
  - Context: Matches a value that is like an [Observable](https://github.com/tc39/proposal-observable).

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 541 |
| Fully Documented | 64 |
| Missing Documentation | 477 |
| Missing @category | 87 |
| Missing @example | 93 |
| Missing @since | 477 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/types
```

If successful, delete this file. If issues remain, the checklist will be regenerated.