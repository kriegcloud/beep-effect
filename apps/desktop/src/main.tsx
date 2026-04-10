import { $I } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { RouterProvider } from "@tanstack/react-router";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { router } from "./router.tsx";

const $DesktopId = $I.create("apps/desktop/src/main");

class MissingRootElementError extends TaggedErrorClass<MissingRootElementError>($DesktopId`MissingRootElementError`)(
  "MissingRootElementError",
  {
    message: S.String,
  },
  $DesktopId.annote("MissingRootElementError", {
    description: "Missing the root element for desktop app bootstrap.",
  })
) {}

const root = O.fromNullishOr(document.getElementById("root"));

if (O.isNone(root)) {
  throw MissingRootElementError.new({
    message: "Missing #root element for desktop app bootstrap.",
  });
}

ReactDOM.createRoot(root.value).render(<RouterProvider router={router} />);
