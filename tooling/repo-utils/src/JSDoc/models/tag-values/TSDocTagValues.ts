/**
 * TSDoc-specific tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/TSDocTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class AlphaValue extends S.TaggedClass<AlphaValue>($I`AlphaValue`)(
  "alpha",
  empty,
  $I.annote("AlphaValue", {
    description: "Occurrence shape for @alpha — marks a symbol as alpha-quality.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class BetaValue extends S.TaggedClass<BetaValue>($I`BetaValue`)(
  "beta",
  empty,
  $I.annote("BetaValue", {
    description: "Occurrence shape for @beta — marks a symbol as beta-quality.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ExperimentalValue extends S.TaggedClass<ExperimentalValue>($I`ExperimentalValue`)(
  "experimental",
  empty,
  $I.annote("ExperimentalValue", {
    description: "Occurrence shape for @experimental — marks a symbol as experimental.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class InternalValue extends S.TaggedClass<InternalValue>($I`InternalValue`)(
  "internal",
  empty,
  $I.annote("InternalValue", {
    description: "Occurrence shape for @internal — marks a symbol as internal.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SealedValue extends S.TaggedClass<SealedValue>($I`SealedValue`)(
  "sealed",
  empty,
  $I.annote("SealedValue", {
    description: "Occurrence shape for @sealed — marks a class as sealed.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class VirtualValue extends S.TaggedClass<VirtualValue>($I`VirtualValue`)(
  "virtual",
  empty,
  $I.annote("VirtualValue", {
    description: "Occurrence shape for @virtual — marks a method as virtual.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class PrivateRemarksValue extends S.TaggedClass<PrivateRemarksValue>($I`PrivateRemarksValue`)(
  "privateRemarks",
  { ...optionalDesc },
  $I.annote("PrivateRemarksValue", {
    description: "Occurrence shape for @privateRemarks — non-public remarks.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class PackageDocumentationValue extends S.TaggedClass<PackageDocumentationValue>($I`PackageDocumentationValue`)(
  "packageDocumentation",
  empty,
  $I.annote("PackageDocumentationValue", {
    description: "Occurrence shape for @packageDocumentation — marks file as package entry.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class LabelValue extends S.TaggedClass<LabelValue>($I`LabelValue`)(
  "label",
  { ...nameField },
  $I.annote("LabelValue", {
    description: "Occurrence shape for @label — a reference label for cross-referencing.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DecoratorValue extends S.TaggedClass<DecoratorValue>($I`DecoratorValue`)(
  "decorator",
  { ...optionalDesc },
  $I.annote("DecoratorValue", {
    description: "Occurrence shape for @decorator — documents a decorator.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class EventPropertyValue extends S.TaggedClass<EventPropertyValue>($I`EventPropertyValue`)(
  "eventProperty",
  empty,
  $I.annote("EventPropertyValue", {
    description: "Occurrence shape for @eventProperty — marks a property as an event.",
  })
) {}
