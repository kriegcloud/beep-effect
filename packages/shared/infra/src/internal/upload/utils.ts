import { isWindowUndefined } from "@beep/utils";
import { UploadError } from "./error";

export function guardServerOnly() {
  if (isWindowUndefined) {
    throw new UploadError({
      code: "NOT_AVAILABLE_IN_BROWSER",
      message: "This function is not available in the browser",
    });
  }
}
