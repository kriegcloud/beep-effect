import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { router } from "./router.tsx";
import "./styles.css";
import * as P from "effect/Predicate";

const root = document.getElementById("root");

if (P.isNull(root)) {
  throw new Error("Missing #root element for desktop app bootstrap.");
}

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
