/**
 * Browser entrypoint for the V2T app.
 *
 * @module
 * @since 0.0.0
 */
import { $V2TId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { AppThemeProvider } from "@beep/ui/themes";
import { RouterProvider } from "@tanstack/react-router";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import ReactDOM from "react-dom/client";
import "@beep/ui/styles/globals.css";
import "./styles.css";
import { router } from "./router.tsx";
import "@mui/material-pigment-css/styles.css";

const $I = $V2TId.create("main");

/**
 * Error raised when the V2T app root element is missing.
 *
 * @example
 * ```ts
 * import { MissingRootElementError } from "@beep/v2t/main"
 *
 * const error = new MissingRootElementError({
 *   message: "Missing #root element.",
 * })
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export class MissingRootElementError extends TaggedErrorClass<MissingRootElementError>($I`MissingRootElementError`)(
  "MissingRootElementError",
  {
    message: S.String,
  },
  $I.annote("MissingRootElementError", {
    description: "Missing the root element for V2T app bootstrap.",
  })
) {}

const root = O.fromNullishOr(document.getElementById("root"));

if (O.isNone(root)) {
  throw new MissingRootElementError({
    message: "Missing #root element for V2T app bootstrap.",
  });
}

ReactDOM.createRoot(root.value).render(
  <AppThemeProvider>
    <RouterProvider router={router} />
  </AppThemeProvider>
);
