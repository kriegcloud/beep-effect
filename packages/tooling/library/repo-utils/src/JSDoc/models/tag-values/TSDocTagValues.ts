/**
 * TSDoc-specific tag occurrence shapes.
 *
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TSDocTagValues");

/**
 * @example
 * ```ts
 * import { AlphaValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void AlphaValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class AlphaValue extends S.TaggedClass<AlphaValue>($I`AlphaValue`)(
  "alpha",
  empty,
  $I.annote("AlphaValue", {
    description: "Occurrence shape for @alpha — marks a symbol as alpha-quality.",
  })
) {}

/**
 * @example
 * ```ts
 * import { BetaValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void BetaValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class BetaValue extends S.TaggedClass<BetaValue>($I`BetaValue`)(
  "beta",
  empty,
  $I.annote("BetaValue", {
    description: "Occurrence shape for @beta — marks a symbol as beta-quality.",
  })
) {}

/**
 * @example
 * ```ts
 * import { ExperimentalValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void ExperimentalValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class ExperimentalValue extends S.TaggedClass<ExperimentalValue>($I`ExperimentalValue`)(
  "experimental",
  empty,
  $I.annote("ExperimentalValue", {
    description: "Occurrence shape for @experimental — marks a symbol as experimental.",
  })
) {}

/**
 * @example
 * ```ts
 * import { InternalValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void InternalValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class InternalValue extends S.TaggedClass<InternalValue>($I`InternalValue`)(
  "internal",
  empty,
  $I.annote("InternalValue", {
    description: "Occurrence shape for @internal — marks a symbol as internal.",
  })
) {}

/**
 * @example
 * ```ts
 * import { SealedValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void SealedValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class SealedValue extends S.TaggedClass<SealedValue>($I`SealedValue`)(
  "sealed",
  empty,
  $I.annote("SealedValue", {
    description: "Occurrence shape for @sealed — marks a class as sealed.",
  })
) {}

/**
 * @example
 * ```ts
 * import { VirtualValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void VirtualValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class VirtualValue extends S.TaggedClass<VirtualValue>($I`VirtualValue`)(
  "virtual",
  empty,
  $I.annote("VirtualValue", {
    description: "Occurrence shape for @virtual — marks a method as virtual.",
  })
) {}

/**
 * @example
 * ```ts
 * import { PrivateRemarksValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void PrivateRemarksValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class PrivateRemarksValue extends S.TaggedClass<PrivateRemarksValue>($I`PrivateRemarksValue`)(
  "privateRemarks",
  { ...optionalDesc },
  $I.annote("PrivateRemarksValue", {
    description: "Occurrence shape for @privateRemarks — non-public remarks.",
  })
) {}

/**
 * @example
 * ```ts
 * import { PackageDocumentationValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void PackageDocumentationValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class PackageDocumentationValue extends S.TaggedClass<PackageDocumentationValue>($I`PackageDocumentationValue`)(
  "packageDocumentation",
  empty,
  $I.annote("PackageDocumentationValue", {
    description: "Occurrence shape for @packageDocumentation — marks file as package entry.",
  })
) {}

/**
 * @example
 * ```ts
 * import { LabelValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void LabelValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class LabelValue extends S.TaggedClass<LabelValue>($I`LabelValue`)(
  "label",
  { ...nameField },
  $I.annote("LabelValue", {
    description: "Occurrence shape for @label — a reference label for cross-referencing.",
  })
) {}

/**
 * @example
 * ```ts
 * import { DecoratorValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void DecoratorValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class DecoratorValue extends S.TaggedClass<DecoratorValue>($I`DecoratorValue`)(
  "decorator",
  { ...optionalDesc },
  $I.annote("DecoratorValue", {
    description: "Occurrence shape for @decorator — documents a decorator.",
  })
) {}

/**
 * @example
 * ```ts
 * import { EventPropertyValue } from "@beep/repo-utils/JSDoc/models/tag-values/TSDocTagValues"
 * void EventPropertyValue
 * ```
 * @category models
 * @since 0.0.0
 */
export class EventPropertyValue extends S.TaggedClass<EventPropertyValue>($I`EventPropertyValue`)(
  "eventProperty",
  empty,
  $I.annote("EventPropertyValue", {
    description: "Occurrence shape for @eventProperty — marks a property as an event.",
  })
) {}
