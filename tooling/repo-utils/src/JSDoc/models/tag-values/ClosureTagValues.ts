/**
 * Google Closure-specific tag occurrence shapes.
 *
 * @category models
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, optionalDesc, optionalType } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/ClosureTagValues");

/**
 *
 * @example
 * ```ts
 * import { DefineValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void DefineValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DefineValue extends S.TaggedClass<DefineValue>($I`DefineValue`)(
  "define",
  { ...optionalType, ...optionalDesc },
  $I.annote("DefineValue", {
    description: "Occurrence shape for @define — defines a compile-time constant.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { DictValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void DictValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DictValue extends S.TaggedClass<DictValue>($I`DictValue`)(
  "dict",
  empty,
  $I.annote("DictValue", {
    description: "Occurrence shape for @dict — marks an object as a dictionary.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { ImplicitCastValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void ImplicitCastValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ImplicitCastValue extends S.TaggedClass<ImplicitCastValue>($I`ImplicitCastValue`)(
  "implicitCast",
  empty,
  $I.annote("ImplicitCastValue", {
    description: "Occurrence shape for @implicitCast — allows implicit type casts.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { StructValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void StructValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StructValue extends S.TaggedClass<StructValue>($I`StructValue`)(
  "struct",
  empty,
  $I.annote("StructValue", {
    description: "Occurrence shape for @struct — marks an object as a struct.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { UnrestrictedValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void UnrestrictedValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UnrestrictedValue extends S.TaggedClass<UnrestrictedValue>($I`UnrestrictedValue`)(
  "unrestricted",
  empty,
  $I.annote("UnrestrictedValue", {
    description: "Occurrence shape for @unrestricted — marks an object as unrestricted.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { SuppressValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void SuppressValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SuppressValue extends S.TaggedClass<SuppressValue>($I`SuppressValue`)(
  "suppress",
  { ...optionalDesc },
  $I.annote("SuppressValue", {
    description: "Occurrence shape for @suppress — suppresses compiler warnings.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { ExternsValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void ExternsValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ExternsValue extends S.TaggedClass<ExternsValue>($I`ExternsValue`)(
  "externs",
  empty,
  $I.annote("ExternsValue", {
    description: "Occurrence shape for @externs — declares external definitions.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { NoaliasValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void NoaliasValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NoaliasValue extends S.TaggedClass<NoaliasValue>($I`NoaliasValue`)(
  "noalias",
  empty,
  $I.annote("NoaliasValue", {
    description: "Occurrence shape for @noalias — prevents aliasing.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { NocompileValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void NocompileValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NocompileValue extends S.TaggedClass<NocompileValue>($I`NocompileValue`)(
  "nocompile",
  empty,
  $I.annote("NocompileValue", {
    description: "Occurrence shape for @nocompile — excludes from compilation.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { NosideeffectsValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void NosideeffectsValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NosideeffectsValue extends S.TaggedClass<NosideeffectsValue>($I`NosideeffectsValue`)(
  "nosideeffects",
  empty,
  $I.annote("NosideeffectsValue", {
    description: "Occurrence shape for @nosideeffects — marks a function as pure.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { PolymerValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void PolymerValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PolymerValue extends S.TaggedClass<PolymerValue>($I`PolymerValue`)(
  "polymer",
  empty,
  $I.annote("PolymerValue", {
    description: "Occurrence shape for @polymer — Polymer element marker.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { PolymerBehaviorValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void PolymerBehaviorValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PolymerBehaviorValue extends S.TaggedClass<PolymerBehaviorValue>($I`PolymerBehaviorValue`)(
  "polymerBehavior",
  empty,
  $I.annote("PolymerBehaviorValue", {
    description: "Occurrence shape for @polymerBehavior — Polymer behavior marker.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { RecordValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void RecordValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RecordValue extends S.TaggedClass<RecordValue>($I`RecordValue`)(
  "record",
  empty,
  $I.annote("RecordValue", {
    description: "Occurrence shape for @record — marks a type as a record.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { NocollapseValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void NocollapseValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NocollapseValue extends S.TaggedClass<NocollapseValue>($I`NocollapseValue`)(
  "nocollapse",
  empty,
  $I.annote("NocollapseValue", {
    description: "Occurrence shape for @nocollapse — prevents property collapsing.",
  })
) {}

/**
 *
 * @example
 * ```ts
 * import { NoinlineValue } from "@beep/repo-utils/JSDoc/models/tag-values/ClosureTagValues"
 *
 * void NoinlineValue
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NoinlineValue extends S.TaggedClass<NoinlineValue>($I`NoinlineValue`)(
  "noinline",
  empty,
  $I.annote("NoinlineValue", {
    description: "Occurrence shape for @noinline — prevents inlining.",
  })
) {}
