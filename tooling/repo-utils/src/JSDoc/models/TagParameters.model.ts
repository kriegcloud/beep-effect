import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("JSDoc/models/TagParameters.model");
/**
 * Structured description of what arguments a tag accepts.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TagParameters extends S.Class<TagParameters>($I`TagParameters`)(
  {
    /** Short syntax template, e.g. "@param {Type} name - description" */
    syntax: S.String.annotateKey({
      description: `Short syntax template, e.g. "@param {Type} name - description"`,
    }),
    /** Whether a type expression is accepted/required */
    acceptsType: S.Boolean.annotateKey({
      description: "Whether a type expression is accepted/required",
    }),
    /** Whether a name/identifier is accepted/required */
    acceptsName: S.Boolean.annotateKey({
      description: "Whether a name/identifier is accepted/required",
    }),
    /** Whether free-text description is accepted */
    acceptsDescription: S.Boolean.annotateKey({
      description: "Whether free-text description is accepted",
    }),
    /** For tags with constrained values, the allowed options */
    allowedValues: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
      description: "For tags with constrained values, the allowed options",
    }),
  },
  $I.annote("TagParameters", {
    description: "Structured description of what arguments a tag accepts",
  })
) {}
