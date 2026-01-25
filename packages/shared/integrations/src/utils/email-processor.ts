import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SanitizeHtml } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("utils/email-processor");

export class ProcessEmailOptionsTheme extends BS.StringLiteralKit("light", "dark").annotations(
  $I.annotations("ProcessEmailOptionsTheme", {
    description: "The theme to use for the email processor",
  })
) {}

export declare namespace ProcessEmailOptionsTheme {
  export type Type = typeof ProcessEmailOptionsTheme.Type;
  export type Encoded = typeof ProcessEmailOptionsTheme.Encoded;
}

export class ProcessEmailOptions extends S.Class<ProcessEmailOptions>($I`ProcessEmailOptions`)(
  {
    html: S.String,
    shouldLoadImages: S.Boolean,
    theme: ProcessEmailOptionsTheme,
  },
  $I.annotations("ProcessEmailOptions", {
    description: "The options for processing an email",
  })
) {}

export const sanitizeConfig: SanitizeHtml.SanitizeOptions = {
  allowedTags: SanitizeHtml.defaults.allowedTags.concat(
    BS.HtmlTag.pickOptions("img", "title", "details", "summary", "style")
  ),
  allowedAttributes: {
    "*": BS.HtmlAttribute.pickOptions(
      "class",
      "style",
      "align",
      "valign",
      "width",
      "height",
      "cellpadding",
      "cellspacing",
      "border",
      "bgcolor",
      "colspan",
      "rowspan"
    ),
    a: BS.HtmlAttribute.pickOptions("href", "name", "target", "rel", "class", "style"),
    img: BS.HtmlAttribute.pickOptions("src", "alt", "width", "height", "class", "style"),
  },
  allowedSchemes: BS.AllowedScheme.pickOptions("http", "https", "mailto", "tel", "data", "cid"),
  allowedSchemesByTag: {
    img: BS.AllowedScheme.pickOptions("http", "https", "data", "cid"),
  },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        target: attribs.target || "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};
