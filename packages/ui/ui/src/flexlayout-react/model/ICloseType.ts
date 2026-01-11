import { $UiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { pipe } from "effect";
import * as A from "effect/Array";

const $I = $UiId.create("flexlayout-react/model/ICloseType");

export class ICloseType extends BS.MappedLiteralKit(
  ["Visible", 1], // close if selected or hovered, i.e. when x is visible (will only close selected on mobile, where css hover is not available)
  ["Always", 1], // close always (both selected and unselected when x rect tapped e.g where a custom image has been added for close)
  ["Selected", 1] // close only if selected
).annotations(
  $I.annotations("ICloseType", {
    description:
      "Determines when a tab's close button responds to user interaction based on the tab's selection and hover state.",
    documentation: pipe(
      A.make(
        `["Visible", 1], close if selected or hovered, i.e. when x is visible (will only close selected on mobile, where css hover is not available)`,
        `["Always", 2],  close always (both selected and unselected when x rect tapped e.g where a custom image has been added for close)`,
        `["Always", 2],   close only if selected`
      ),
      A.join("\n")
    ),
  })
) {}

export declare namespace ICloseType {
  export type Type = typeof ICloseType.Type;
  export type Encoded = typeof ICloseType.Encoded;
}
