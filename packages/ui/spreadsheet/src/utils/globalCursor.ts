import { $UISpreadsheetId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $UISpreadsheetId.create("utils/globalCursor");

export class CursorType extends BS.StringLiteralKit(
  "grabbing",
  "resizing-column",
  "resizing-row",
  "scrubbing"
).annotations(
  $I.annotations("CursorType", {
    description: "Cursor type",
  })
) {}

export declare namespace CursorType {
  export type Type = typeof CursorType.Type;
}

export function setGlobalCursor(type: CursorType.Type) {
  document.body.classList.add(type);
}

export function removeGlobalCursor(type: CursorType.Type) {
  document.body.classList.remove(type);
}
