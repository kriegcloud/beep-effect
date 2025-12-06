# JSDoc Analysis Report: @beep/utils

> **Generated**: 2025-12-06T09:02:33.879Z
> **Package**: packages/common/utils
> **Status**: 197 exports need documentation

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
    * import { MyThing } from "@beep/utils"
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

- [ ] `src/browser-apis.ts:4` — **isNavigatorDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:5` — **isNavigatorUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:7` — **isWindowDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:8` — **isWindowUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:10` — **isDocumentDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:11` — **isDocumentUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:13` — **isNavigatorAndWindowDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:14` — **isNavigatorAndWindowUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:16` — **IS_IOS** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:21` — **IS_APPLE** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:23` — **IS_ANDROID** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:25` — **IS_FIREFOX** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:27` — **IS_WEBKIT** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:30` — **IS_EDGE_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:32` — **IS_CHROME** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:36` — **IS_CHROME_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:38` — **IS_ANDROID_CHROME_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:42` — **IS_FIREFOX_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:46` — **IS_UC_MOBILE** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:49` — **IS_WECHATBROWSER** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:61` — **HAS_BEFORE_INPUT_SUPPORT** (const)
  - Missing: @category, @example, @since

- [ ] `src/browser-apis.ts:68` — **IS_MOBILE** (const)
  - Missing: @category, @example, @since

- [ ] `src/coerce.ts:1` — **CoercedTrue** (type)
  - Missing: @category, @example, @since

- [ ] `src/coerce.ts:2` — **CoercedFalse** (type)
  - Missing: @category, @example, @since

- [ ] `src/coerce.ts:4` — **coerceTrue** (const)
  - Missing: @category, @example, @since

- [ ] `src/coerce.ts:8` — **coerceFalse** (const)
  - Missing: @category, @example, @since

- [ ] `src/deep-remove-null.ts:8` — **deepRemoveNull** (function)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:28` — **AutosuggestHighlight** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **RemoveAccents** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **TopoSort** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:4` — **isNavigatorDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:5` — **isNavigatorUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:7` — **isWindowDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:8` — **isWindowUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:10` — **isDocumentDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:11` — **isDocumentUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:13` — **isNavigatorAndWindowDefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:14` — **isNavigatorAndWindowUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:16` — **IS_IOS** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:21` — **IS_APPLE** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:23` — **IS_ANDROID** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:25` — **IS_FIREFOX** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:27` — **IS_WEBKIT** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:30` — **IS_EDGE_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:32` — **IS_CHROME** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:36` — **IS_CHROME_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:38` — **IS_ANDROID_CHROME_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:42` — **IS_FIREFOX_LEGACY** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:46` — **IS_UC_MOBILE** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:49` — **IS_WECHATBROWSER** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:61` — **HAS_BEFORE_INPUT_SUPPORT** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:68` — **IS_MOBILE** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:1` — **CoercedTrue** (type)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:2` — **CoercedFalse** (type)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:4` — **coerceTrue** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:8` — **coerceFalse** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:143` — **dedent** (const)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:8` — **deepRemoveNull** (function)
  - Missing: @category, @example, @since

- [ ] `src/index.ts:3` — **randomHexString** (const)
  - Missing: @category, @example, @since

- [ ] `src/random-hex-string.ts:3` — **randomHexString** (const)
  - Missing: @category, @example, @since

- [ ] `src/sqids.ts:17` — **defaultBlocklist** (const)
  - Missing: @category, @example, @since

- [ ] `src/sqids.ts:580` — **defaultOptions** (const)
  - Missing: @category, @example, @since

- [ ] `src/sqids.ts:826` — **default** (class)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:6` — **thunkEmtpyRecord** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:7` — **thunkEmptyArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:8` — **thunkEmptyStr** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:9` — **thunkZero** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:10` — **thunkTrue** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:11` — **thunkFalse** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:12` — **thunkNull** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:13` — **thunkUndefined** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:15` — **thunkVoid** (const)
  - Missing: @category, @example, @since

- [ ] `src/thunk.ts:16` — **thunk** (const)
  - Missing: @category, @example, @since

- [ ] `src/uint8-array-to-array-buffer.ts:36` — **FileReadError** (class)
  - Missing: @category, @example, @since

- [ ] `src/uint8-array-to-array-buffer.ts:45` — **readFileArrayBuffer** (const)
  - Missing: @category, @example, @since

- [ ] `src/autosuggest-highlight/index.ts:4` — **MatchOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options for the match function

- [ ] `src/autosuggest-highlight/index.ts:25` — **MatchRange** (type)
  - Missing: @category, @example, @since
  - Context: A match range represented as [startIndex, endIndex]

- [ ] `src/autosuggest-highlight/index.ts:30` — **ParsedSegment** (interface)
  - Missing: @category, @example, @since
  - Context: A parsed text segment with highlight information

- [ ] `src/autosuggest-highlight/types.ts:4` — **MatchOptions** (interface)
  - Missing: @category, @example, @since
  - Context: Options for the match function

- [ ] `src/autosuggest-highlight/types.ts:25` — **MatchRange** (type)
  - Missing: @category, @example, @since
  - Context: A match range represented as [startIndex, endIndex]

- [ ] `src/autosuggest-highlight/types.ts:30` — **ParsedSegment** (interface)
  - Missing: @category, @example, @since
  - Context: A parsed text segment with highlight information

- [ ] `src/dedent/dedent.ts:143` — **default** (const)
  - Missing: @category, @example, @since

- [ ] `src/dedent/dedent.ts:1` — **DedentOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/dedent/dedent.ts:7` — **CreateDedent** (type)
  - Missing: @category, @example, @since

- [ ] `src/dedent/dedent.ts:9` — **Dedent** (interface)
  - Missing: @category, @example, @since

- [ ] `src/dedent/index.ts:143` — **dedent** (const)
  - Missing: @category, @example, @since

- [ ] `src/dedent/types.ts:1` — **DedentOptions** (interface)
  - Missing: @category, @example, @since

- [ ] `src/dedent/types.ts:7` — **CreateDedent** (type)
  - Missing: @category, @example, @since

- [ ] `src/dedent/types.ts:9` — **Dedent** (interface)
  - Missing: @category, @example, @since

- [ ] `src/remove-accents/index.ts:1` — **removeAccents** (const)
  - Missing: @category, @example, @since

- [ ] `src/remove-accents/remove-accents.ts:481` — **removeAccents** (const)
  - Missing: @category, @example, @since
  - Context: Remove accents from a string, replacing accented characters with their ASCII equivalents.

- [ ] `src/remove-accents/remove-accents.ts:486` — **hasAccents** (const)
  - Missing: @category, @example, @since
  - Context: Check if a string contains any accented characters.

- [ ] `src/remove-accents/remove-accents.ts:491` — **remove** (const)
  - Missing: @category, @example, @since
  - Context: Alias for removeAccents - removes accents from a string.

- [ ] `src/remove-accents/remove-accents.ts:496` — **has** (const)
  - Missing: @category, @example, @since
  - Context: Alias for hasAccents - checks if a string has accents.

- [ ] `src/struct/get-none-fields.ts:15` — **GetNoneFields** (type)
  - Missing: @category, @example, @since

- [ ] `src/struct/get-none-fields.ts:17` — **getNoneFields** (const)
  - Missing: @category, @example, @since

- [ ] `src/struct/get-some-fields.ts:20` — **GetSomeFields** (type)
  - Missing: @category, @example, @since

- [ ] `src/struct/get-some-fields.ts:24` — **getSomeFields** (const)
  - Missing: @category, @example, @since

- [ ] `src/struct/index.ts:15` — **GetNoneFields** (type)
  - Missing: @category, @example, @since

- [ ] `src/struct/index.ts:17` — **getNoneFields** (const)
  - Missing: @category, @example, @since

- [ ] `src/struct/index.ts:20` — **GetSomeFields** (type)
  - Missing: @category, @example, @since

- [ ] `src/struct/index.ts:24` — **getSomeFields** (const)
  - Missing: @category, @example, @since

- [ ] `src/struct/index.ts:13` — **merge** (const)
  - Missing: @category, @example, @since

- [ ] `src/struct/merge.ts:13` — **merge** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:9` — **NodeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:10` — **NodeId** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:12` — **DirectedAcyclicGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:16` — **DirectedAcyclicGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:18` — **DependencyGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:19` — **DependencyGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:21` — **TaskList** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:22` — **TaskList** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/index.ts:110` — **toposortWithGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:9` — **NodeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:10` — **NodeId** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:12` — **DirectedAcyclicGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:16` — **DirectedAcyclicGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:18` — **DependencyGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:19` — **DependencyGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:21` — **TaskList** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:22` — **TaskList** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.graph.ts:110` — **toposortWithGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:8` — **NodeId** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:9` — **NodeId** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:11` — **DirectedAcyclicGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:15` — **DirectedAcyclicGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:17` — **DependencyGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:18` — **DependencyGraph** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:20` — **TaskList** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:21` — **TaskList** (type)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:88` — **toposort** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:139` — **toposortReverse** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:141` — **createDependencyGraph** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:143` — **addDependency** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:155` — **removeDependency** (const)
  - Missing: @category, @example, @since

- [ ] `src/topo-sort/topo-sort.ts:178` — **hasDependency** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:7` — **toHashMap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:29` — **toHashMapByKeyWith** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:46` — **toHashMapByKey** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:57` — **toArrayHashMapByKey** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:77` — **toHashMapByKeysWith** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:104` — **toHashMapByKeys** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/collect.ts:115` — **toArrayHashMapByKeys** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:7` — **toHashMap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:29` — **toHashMapByKeyWith** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:46` — **toHashMapByKey** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:57` — **toArrayHashMapByKey** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:77` — **toHashMapByKeysWith** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:104` — **toHashMapByKeys** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:115` — **toArrayHashMapByKeys** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:25` — **ArrayWithDefault** (class)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:27` — **wrap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:35` — **wrapNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:43` — **wrapEither** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:56` — **wrapEitherNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:69` — **wrapOption** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:80` — **wrapOptionNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:93` — **InferArray** (type)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:95` — **Infer** (type)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:97` — **toArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:98` — **getDefault** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:100` — **zip** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:124` — **zipArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:150` — **map** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:161` — **mapEffect** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:184` — **zipMap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:189` — **zipMapArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:196` — **replaceKeysFromHead** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/index.ts:231` — **replaceKeysFromHeadNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:25` — **ArrayWithDefault** (class)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:27` — **wrap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:35` — **wrapNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:43` — **wrapEither** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:56` — **wrapEitherNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:69` — **wrapOption** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:80` — **wrapOptionNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:93` — **InferArray** (type)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:95` — **Infer** (type)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:97` — **toArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:98` — **getDefault** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:100` — **zip** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:124` — **zipArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:150` — **map** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:161` — **mapEffect** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:184` — **zipMap** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:189` — **zipMapArray** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:196` — **replaceKeysFromHead** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/with-default.ts:231` — **replaceKeysFromHeadNonEmpty** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts:143` — **from** (const)
  - Missing: @category, @example, @since

- [ ] `src/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts:153` — **fromIterable** (const)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)

- [ ] `src/autosuggest-highlight/index.ts:238` — **match** (const)
  - Missing: @category, @since
  - Has: @param, @param, @param, @returns, @example
  - Context: Finds matching ranges in text based on a query string.

- [ ] `src/autosuggest-highlight/index.ts:52` — **parse** (const)
  - Missing: @category, @since
  - Has: @param, @param, @returns, @example
  - Context: Parses text into segments with highlight information based on match ranges.

- [ ] `src/autosuggest-highlight/match.ts:238` — **match** (const)
  - Missing: @category, @since
  - Has: @param, @param, @param, @returns, @example
  - Context: Finds matching ranges in text based on a query string.

- [ ] `src/autosuggest-highlight/parse.ts:52` — **parse** (const)
  - Missing: @category, @since
  - Has: @param, @param, @returns, @example
  - Context: Parses text into segments with highlight information based on match ranges.

- [ ] `src/struct/exact.ts:53` — **ExactResult** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Result type for `exact`. For each property:

- [ ] `src/struct/index.ts:53` — **ExactResult** (type)
  - Missing: @example
  - Has: @category, @since
  - Context: Result type for `exact`. For each property:

- [ ] `src/data/array.utils/NonEmptyReadonly/NonEmptyreadonly.ts:106` — **filter** (const)
  - Missing: @example
  - Has: @category, @since

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 322 |
| Fully Documented | 125 |
| Missing Documentation | 197 |
| Missing @category | 194 |
| Missing @example | 193 |
| Missing @since | 194 |

---

## Verification

After completing all documentation, run:

```bash
beep docgen analyze -p packages/common/utils
```

If successful, delete this file. If issues remain, the checklist will be regenerated.