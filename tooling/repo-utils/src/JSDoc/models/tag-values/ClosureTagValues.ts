/**
 * Google Closure-specific tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, optionalDesc, optionalType } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/ClosureTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DefineValue extends S.TaggedClass<DefineValue>($I`DefineValue`)(
  "define",
  { ...optionalType, ...optionalDesc },
  $I.annote("DefineValue", {
    description: "Occurrence shape for @define — defines a compile-time constant.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DictValue extends S.TaggedClass<DictValue>($I`DictValue`)(
  "dict",
  empty,
  $I.annote("DictValue", {
    description: "Occurrence shape for @dict — marks an object as a dictionary.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ImplicitCastValue extends S.TaggedClass<ImplicitCastValue>($I`ImplicitCastValue`)(
  "implicitCast",
  empty,
  $I.annote("ImplicitCastValue", {
    description: "Occurrence shape for @implicitCast — allows implicit type casts.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class StructValue extends S.TaggedClass<StructValue>($I`StructValue`)(
  "struct",
  empty,
  $I.annote("StructValue", {
    description: "Occurrence shape for @struct — marks an object as a struct.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class UnrestrictedValue extends S.TaggedClass<UnrestrictedValue>($I`UnrestrictedValue`)(
  "unrestricted",
  empty,
  $I.annote("UnrestrictedValue", {
    description: "Occurrence shape for @unrestricted — marks an object as unrestricted.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SuppressValue extends S.TaggedClass<SuppressValue>($I`SuppressValue`)(
  "suppress",
  { ...optionalDesc },
  $I.annote("SuppressValue", {
    description: "Occurrence shape for @suppress — suppresses compiler warnings.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ExternsValue extends S.TaggedClass<ExternsValue>($I`ExternsValue`)(
  "externs",
  empty,
  $I.annote("ExternsValue", {
    description: "Occurrence shape for @externs — declares external definitions.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NoaliasValue extends S.TaggedClass<NoaliasValue>($I`NoaliasValue`)(
  "noalias",
  empty,
  $I.annote("NoaliasValue", {
    description: "Occurrence shape for @noalias — prevents aliasing.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NocompileValue extends S.TaggedClass<NocompileValue>($I`NocompileValue`)(
  "nocompile",
  empty,
  $I.annote("NocompileValue", {
    description: "Occurrence shape for @nocompile — excludes from compilation.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NosideeffectsValue extends S.TaggedClass<NosideeffectsValue>($I`NosideeffectsValue`)(
  "nosideeffects",
  empty,
  $I.annote("NosideeffectsValue", {
    description: "Occurrence shape for @nosideeffects — marks a function as pure.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class PolymerValue extends S.TaggedClass<PolymerValue>($I`PolymerValue`)(
  "polymer",
  empty,
  $I.annote("PolymerValue", {
    description: "Occurrence shape for @polymer — Polymer element marker.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class PolymerBehaviorValue extends S.TaggedClass<PolymerBehaviorValue>($I`PolymerBehaviorValue`)(
  "polymerBehavior",
  empty,
  $I.annote("PolymerBehaviorValue", {
    description: "Occurrence shape for @polymerBehavior — Polymer behavior marker.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RecordValue extends S.TaggedClass<RecordValue>($I`RecordValue`)(
  "record",
  empty,
  $I.annote("RecordValue", {
    description: "Occurrence shape for @record — marks a type as a record.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NocollapseValue extends S.TaggedClass<NocollapseValue>($I`NocollapseValue`)(
  "nocollapse",
  empty,
  $I.annote("NocollapseValue", {
    description: "Occurrence shape for @nocollapse — prevents property collapsing.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class NoinlineValue extends S.TaggedClass<NoinlineValue>($I`NoinlineValue`)(
  "noinline",
  empty,
  $I.annote("NoinlineValue", {
    description: "Occurrence shape for @noinline — prevents inlining.",
  })
) {}
