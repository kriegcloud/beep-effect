/**
 * Event and dependency tag occurrence shapes.
 *
 * @packageDocumentation
 * @category models
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { nameField, optionalDesc, optionalName } from "./_fields.ts";

const $I = $RepoUtilsId.create("JSDoc/models/tag-values/EventDependencyTagValues");

/**
 * Schema-backed value for a parsed `fires` tag occurrence: documents an event a symbol emits.
 *
 * **Example** (Create FiresValue instance)
 *
 * ```ts
 * import { FiresValue } from "@beep/repo-utils/JSDoc/models/tag-values/EventDependencyTagValues"
 *
 * const tag = FiresValue.make({
 *   name: "repo:changed",
 *   description: "Parsed tag text."
 * })
 * const tagName: "fires" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FiresValue extends S.Opaque<FiresValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("fires", { ...optionalName, ...optionalDesc }).pipe(
    $I.annoteSchema("FiresValue", {
      description: "Occurrence shape for @fires — documents an event a symbol emits.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `listens` tag occurrence: documents an event a symbol listens for.
 *
 * **Example** (Create ListensValue instance)
 *
 * ```ts
 * import { ListensValue } from "@beep/repo-utils/JSDoc/models/tag-values/EventDependencyTagValues"
 *
 * const tag = ListensValue.make({
 *   name: "repo:changed",
 *   description: "Parsed tag text."
 * })
 * const tagName: "listens" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ListensValue extends S.Opaque<ListensValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("listens", { ...optionalName, ...optionalDesc }).pipe(
    $I.annoteSchema("ListensValue", {
      description: "Occurrence shape for @listens — documents an event a symbol listens for.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `event` tag occurrence: documents an event.
 *
 * **Example** (Create EventValue instance)
 *
 * ```ts
 * import { EventValue } from "@beep/repo-utils/JSDoc/models/tag-values/EventDependencyTagValues"
 *
 * const tag = EventValue.make({
 *   name: "repo:changed",
 *   description: "Parsed tag text."
 * })
 * const tagName: "event" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EventValue extends S.Opaque<EventValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("event", { ...optionalName, ...optionalDesc }).pipe(
    $I.annoteSchema("EventValue", {
      description: "Occurrence shape for @event — documents an event.",
    })
  )
) {}

/**
 * Schema-backed value for a parsed `requires` tag occurrence: documents a dependency.
 *
 * **Example** (Create RequiresValue instance)
 *
 * ```ts
 * import { RequiresValue } from "@beep/repo-utils/JSDoc/models/tag-values/EventDependencyTagValues"
 *
 * const tag = RequiresValue.make({ name: "effect" })
 * const tagName: "requires" = tag._tag
 * console.log(tagName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RequiresValue extends S.Opaque<RequiresValue, { readonly brand: unique symbol }>()(
  S.TaggedStruct("requires", { ...nameField }).pipe(
    $I.annoteSchema("RequiresValue", {
      description: "Occurrence shape for @requires — documents a dependency.",
    })
  )
) {}
