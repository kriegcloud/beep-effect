/**
 * Documentation content tag occurrence shapes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { optionalDesc } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/DocumentationTagValues");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DescriptionValue extends S.TaggedClass<DescriptionValue>($I`DescriptionValue`)(
  "description",
  { ...optionalDesc },
  $I.annote("DescriptionValue", {
    description: "Occurrence shape for @description — the main description body.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SummaryValue extends S.TaggedClass<SummaryValue>($I`SummaryValue`)(
  "summary",
  { ...optionalDesc },
  $I.annote("SummaryValue", {
    description: "Occurrence shape for @summary — a short summary.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class RemarksValue extends S.TaggedClass<RemarksValue>($I`RemarksValue`)(
  "remarks",
  { ...optionalDesc },
  $I.annote("RemarksValue", {
    description: "Occurrence shape for @remarks — additional remarks.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ExampleValue extends S.TaggedClass<ExampleValue>($I`ExampleValue`)(
  "example",
  { ...optionalDesc },
  $I.annote("ExampleValue", {
    description: "Occurrence shape for @example — a usage example.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class DeprecatedValue extends S.TaggedClass<DeprecatedValue>($I`DeprecatedValue`)(
  "deprecated",
  { ...optionalDesc },
  $I.annote("DeprecatedValue", {
    description: "Occurrence shape for @deprecated — marks a symbol as deprecated.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SeeValue extends S.TaggedClass<SeeValue>($I`SeeValue`)(
  "see",
  { ...optionalDesc },
  $I.annote("SeeValue", {
    description: "Occurrence shape for @see — a reference to related resources.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class SinceValue extends S.TaggedClass<SinceValue>($I`SinceValue`)(
  "since",
  { ...optionalDesc },
  $I.annote("SinceValue", {
    description: "Occurrence shape for @since — the version when the symbol was introduced.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class VersionValue extends S.TaggedClass<VersionValue>($I`VersionValue`)(
  "version",
  { ...optionalDesc },
  $I.annote("VersionValue", {
    description: "Occurrence shape for @version — the current version of the symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class AuthorValue extends S.TaggedClass<AuthorValue>($I`AuthorValue`)(
  "author",
  { ...optionalDesc },
  $I.annote("AuthorValue", {
    description: "Occurrence shape for @author — the author of the symbol.",
  })
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class TodoValue extends S.TaggedClass<TodoValue>($I`TodoValue`)(
  "todo",
  { ...optionalDesc },
  $I.annote("TodoValue", {
    description: "Occurrence shape for @todo — a pending task.",
  })
) {}
