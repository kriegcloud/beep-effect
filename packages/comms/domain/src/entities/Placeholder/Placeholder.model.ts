/**
 * Placeholder entity model for Comms slice
 *
 * This is a starter entity to demonstrate the pattern.
 * Rename or replace with your actual domain entities.
 *
 * @module comms-domain/entities/Placeholder
 * @since 0.1.0
 */
import { $CommsDomainId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("entities/Placeholder");

/**
 * Placeholder model for the comms slice.
 *
 * Replace this with your actual domain entity model.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/comms-domain";
 *
 * const placeholder = Entities.Placeholder.Model.make({
 *   id: CommsEntityIds.PlaceholderId.make("placeholder__123"),
 *   name: "Example",
 *   createdAt: new Date(),
 *   updatedAt: new Date(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`PlaceholderModel`)(
  makeFields(CommsEntityIds.PlaceholderId, {
    name: S.NonEmptyTrimmedString.annotations({
      title: "Name",
      description: "The name of the placeholder entity",
    }),
    description: S.OptionFromNullOr(S.String).annotations({
      title: "Description",
      description: "Optional description of the placeholder entity",
    }),
  }),
  $I.annotations("PlaceholderModel", {
    description: "Placeholder model for the comms domain context.",
  })
) {
  static readonly utils = modelKit(Model);
}
