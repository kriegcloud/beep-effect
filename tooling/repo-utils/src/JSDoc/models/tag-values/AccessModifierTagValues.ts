/**
 * Access modifier tag occurrence shapes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { empty, nameField, optionalDesc, optionalName, optionalType } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/AccessModifierTagValues");

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class AccessValue extends S.TaggedClass<AccessValue>($I`AccessValue`)(
  "access",
  {
    level: S.Literals(["public", "private", "protected", "package"]),
  },
  $I.annote("AccessValue", {
    description: "Occurrence shape for @access — specifies the access level.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class PublicValue extends S.TaggedClass<PublicValue>($I`PublicValue`)(
  "public",
  empty,
  $I.annote("PublicValue", {
    description: "Occurrence shape for @public — marks a symbol as public.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class PrivateValue extends S.TaggedClass<PrivateValue>($I`PrivateValue`)(
  "private",
  empty,
  $I.annote("PrivateValue", {
    description: "Occurrence shape for @private — marks a symbol as private.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ProtectedValue extends S.TaggedClass<ProtectedValue>($I`ProtectedValue`)(
  "protected",
  empty,
  $I.annote("ProtectedValue", {
    description: "Occurrence shape for @protected — marks a symbol as protected.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class PackageValue extends S.TaggedClass<PackageValue>($I`PackageValue`)(
  "package",
  empty,
  $I.annote("PackageValue", {
    description: "Occurrence shape for @package — marks a symbol as package-private.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ReadonlyValue extends S.TaggedClass<ReadonlyValue>($I`ReadonlyValue`)(
  "readonly",
  empty,
  $I.annote("ReadonlyValue", {
    description: "Occurrence shape for @readonly — marks a symbol as read-only.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class AbstractValue extends S.TaggedClass<AbstractValue>($I`AbstractValue`)(
  "abstract",
  empty,
  $I.annote("AbstractValue", {
    description: "Occurrence shape for @abstract — marks a symbol as abstract.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class FinalValue extends S.TaggedClass<FinalValue>($I`FinalValue`)(
  "final",
  empty,
  $I.annote("FinalValue", {
    description: "Occurrence shape for @final — marks a symbol as final.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class OverrideValue extends S.TaggedClass<OverrideValue>($I`OverrideValue`)(
  "override",
  empty,
  $I.annote("OverrideValue", {
    description: "Occurrence shape for @override — marks a method as overriding a parent.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class StaticValue extends S.TaggedClass<StaticValue>($I`StaticValue`)(
  "static",
  empty,
  $I.annote("StaticValue", {
    description: "Occurrence shape for @static — marks a symbol as static.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ConstantValue extends S.TaggedClass<ConstantValue>($I`ConstantValue`)(
  "constant",
  { ...optionalType, ...optionalName },
  $I.annote("ConstantValue", {
    description: "Occurrence shape for @constant — marks a symbol as a constant.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class DefaultValue extends S.TaggedClass<DefaultValue>($I`DefaultValue`)(
  "default",
  { ...optionalDesc },
  $I.annote("DefaultValue", {
    description: "Occurrence shape for @default — documents the default value.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class DefaultValueValue extends S.TaggedClass<DefaultValueValue>($I`DefaultValueValue`)(
  "defaultValue",
  { ...optionalDesc },
  $I.annote("DefaultValueValue", {
    description: "Occurrence shape for @defaultValue — TSDoc default value annotation.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ExportsValue extends S.TaggedClass<ExportsValue>($I`ExportsValue`)(
  "exports",
  { ...nameField },
  $I.annote("ExportsValue", {
    description: "Occurrence shape for @exports — documents the exported module name.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ExportValue extends S.TaggedClass<ExportValue>($I`ExportValue`)(
  "export",
  { ...optionalType },
  $I.annote("ExportValue", {
    description: "Occurrence shape for @export — marks a symbol for export.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class SatisfiesValue extends S.TaggedClass<SatisfiesValue>($I`SatisfiesValue`)(
  "satisfies",
  { ...optionalType },
  $I.annote("SatisfiesValue", {
    description: "Occurrence shape for @satisfies — specifies a satisfies constraint.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ImportValue extends S.TaggedClass<ImportValue>($I`ImportValue`)(
  "import",
  { ...optionalType },
  $I.annote("ImportValue", {
    description: "Occurrence shape for @import — declares a type import.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ThisValue extends S.TaggedClass<ThisValue>($I`ThisValue`)(
  "this",
  { ...optionalType },
  $I.annote("ThisValue", {
    description: "Occurrence shape for @this — documents the this context type.",
  })
) {}
