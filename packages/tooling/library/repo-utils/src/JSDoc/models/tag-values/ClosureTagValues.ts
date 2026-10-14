/**
 * Google Closure-specific tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, optionalDesc, optionalType } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/ClosureTagValues");

/**
 * Schema-backed value for a parsed `define` tag occurrence: defines a compile-time constant.
 *
 * **Example** (Making a define tag)
 *
 * ```ts
 * import { DefineValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = DefineValue.make({
 *   type: "boolean",
 *   description: "Build-time flag."
 * })
 * const tagName: "define" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DefineValue extends S.Opaque<DefineValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("define", { ...optionalType, ...optionalDesc }).pipe(
    $I.annoteSchema("DefineValue", {
      description: "Occurrence shape for @define — defines a compile-time constant.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `dict` tag occurrence: marks an object as a dictionary.
 *
 * **Example** (Making a dict tag)
 *
 * ```ts
 * import { DictValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = DictValue.make({})
 * const tagName: "dict" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DictValue extends S.Opaque<DictValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("dict", empty).pipe(
    $I.annoteSchema("DictValue", {
      description: "Occurrence shape for @dict — marks an object as a dictionary.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `implicitCast` tag occurrence: allows implicit type casts.
 *
 * **Example** (Making an implicitCast tag)
 *
 * ```ts
 * import { ImplicitCastValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = ImplicitCastValue.make({})
 * const tagName: "implicitCast" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ImplicitCastValue extends S.Opaque<ImplicitCastValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("implicitCast", empty).pipe(
    $I.annoteSchema("ImplicitCastValue", {
      description: "Occurrence shape for @implicitCast — allows implicit type casts.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `struct` tag occurrence: marks an object as a struct.
 *
 * **Example** (Making a struct tag)
 *
 * ```ts
 * import { StructValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = StructValue.make({})
 * const tagName: "struct" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StructValue extends S.Opaque<StructValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("struct", empty).pipe(
    $I.annoteSchema("StructValue", {
      description: "Occurrence shape for @struct — marks an object as a struct.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `unrestricted` tag occurrence: marks an object as unrestricted.
 *
 * **Example** (Making an unrestricted tag)
 *
 * ```ts
 * import { UnrestrictedValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = UnrestrictedValue.make({})
 * const tagName: "unrestricted" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UnrestrictedValue extends S.Opaque<UnrestrictedValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("unrestricted", empty).pipe(
    $I.annoteSchema("UnrestrictedValue", {
      description: "Occurrence shape for @unrestricted — marks an object as unrestricted.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `suppress` tag occurrence: suppresses compiler warnings.
 *
 * **Example** (Making a suppress tag)
 *
 * ```ts
 * import { SuppressValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = SuppressValue.make({ description: "checkTypes" })
 * const tagName: "suppress" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SuppressValue extends S.Opaque<SuppressValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("suppress", { ...optionalDesc }).pipe(
    $I.annoteSchema("SuppressValue", {
      description: "Occurrence shape for @suppress — suppresses compiler warnings.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `externs` tag occurrence: declares external definitions.
 *
 * **Example** (Making an externs tag)
 *
 * ```ts
 * import { ExternsValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = ExternsValue.make({})
 * const tagName: "externs" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExternsValue extends S.Opaque<ExternsValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("externs", empty).pipe(
    $I.annoteSchema("ExternsValue", {
      description: "Occurrence shape for @externs — declares external definitions.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `noalias` tag occurrence: prevents aliasing.
 *
 * **Example** (Making a noalias tag)
 *
 * ```ts
 * import { NoaliasValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = NoaliasValue.make({})
 * const tagName: "noalias" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NoaliasValue extends S.Opaque<NoaliasValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("noalias", empty).pipe(
    $I.annoteSchema("NoaliasValue", {
      description: "Occurrence shape for @noalias — prevents aliasing.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `nocompile` tag occurrence: excludes from compilation.
 *
 * **Example** (Making a nocompile tag)
 *
 * ```ts
 * import { NocompileValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = NocompileValue.make({})
 * const tagName: "nocompile" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NocompileValue extends S.Opaque<NocompileValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("nocompile", empty).pipe(
    $I.annoteSchema("NocompileValue", {
      description: "Occurrence shape for @nocompile — excludes from compilation.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `nosideeffects` tag occurrence: marks a function as pure.
 *
 * **Example** (Making a nosideeffects tag)
 *
 * ```ts
 * import { NosideeffectsValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = NosideeffectsValue.make({})
 * const tagName: "nosideeffects" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NosideeffectsValue extends S.Opaque<NosideeffectsValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("nosideeffects", empty).pipe(
    $I.annoteSchema("NosideeffectsValue", {
      description: "Occurrence shape for @nosideeffects — marks a function as pure.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `polymer` tag occurrence: Polymer element marker.
 *
 * **Example** (Making a polymer tag)
 *
 * ```ts
 * import { PolymerValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = PolymerValue.make({})
 * const tagName: "polymer" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PolymerValue extends S.Opaque<PolymerValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("polymer", empty).pipe(
    $I.annoteSchema("PolymerValue", {
      description: "Occurrence shape for @polymer — Polymer element marker.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `polymerBehavior` tag occurrence: Polymer behavior marker.
 *
 * **Example** (Making a polymerBehavior tag)
 *
 * ```ts
 * import { PolymerBehaviorValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = PolymerBehaviorValue.make({})
 * const tagName: "polymerBehavior" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PolymerBehaviorValue extends S.Opaque<PolymerBehaviorValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("polymerBehavior", empty).pipe(
    $I.annoteSchema("PolymerBehaviorValue", {
      description: "Occurrence shape for @polymerBehavior — Polymer behavior marker.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `record` tag occurrence: marks a type as a record.
 *
 * **Example** (Making a record tag)
 *
 * ```ts
 * import { RecordValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = RecordValue.make({})
 * const tagName: "record" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RecordValue extends S.Opaque<RecordValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("record", empty).pipe(
    $I.annoteSchema("RecordValue", {
      description: "Occurrence shape for @record — marks a type as a record.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `nocollapse` tag occurrence: prevents property collapsing.
 *
 * **Example** (Making a nocollapse tag)
 *
 * ```ts
 * import { NocollapseValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = NocollapseValue.make({})
 * const tagName: "nocollapse" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NocollapseValue extends S.Opaque<NocollapseValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("nocollapse", empty).pipe(
    $I.annoteSchema("NocollapseValue", {
      description: "Occurrence shape for @nocollapse — prevents property collapsing.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `noinline` tag occurrence: prevents inlining.
 *
 * **Example** (Making a noinline tag)
 *
 * ```ts
 * import { NoinlineValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * const tag = NoinlineValue.make({})
 * const tagName: "noinline" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NoinlineValue extends S.Opaque<NoinlineValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("noinline", empty).pipe(
    $I.annoteSchema("NoinlineValue", {
      description: "Occurrence shape for @noinline — prevents inlining.",
    })
  )
) {}
