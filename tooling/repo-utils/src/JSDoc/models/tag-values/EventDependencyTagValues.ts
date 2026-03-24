/**
 * Event and dependency tag occurrence shapes.
 *
 * @category DomainModel
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { nameField, optionalDesc, optionalName } from "./_fields.js";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/EventDependencyTagValues");

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class FiresValue extends S.TaggedClass<FiresValue>($I`FiresValue`)(
  "fires",
  { ...optionalName, ...optionalDesc },
  $I.annote("FiresValue", {
    description: "Occurrence shape for @fires — documents an event a symbol emits.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class ListensValue extends S.TaggedClass<ListensValue>($I`ListensValue`)(
  "listens",
  { ...optionalName, ...optionalDesc },
  $I.annote("ListensValue", {
    description: "Occurrence shape for @listens — documents an event a symbol listens for.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class EventValue extends S.TaggedClass<EventValue>($I`EventValue`)(
  "event",
  { ...optionalName, ...optionalDesc },
  $I.annote("EventValue", {
    description: "Occurrence shape for @event — documents an event.",
  })
) {}

/**
 * @category DomainModel
 * @since 0.0.0
 */
export class RequiresValue extends S.TaggedClass<RequiresValue>($I`RequiresValue`)(
  "requires",
  { ...nameField },
  $I.annote("RequiresValue", {
    description: "Occurrence shape for @requires — documents a dependency.",
  })
) {}
