import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { router } from "./router.tsx";
import "./styles.css";

const root = document.getElementById("root");

if (root === null) {
  throw new Error("Missing #root element for editor app bootstrap.");
}

ReactDOM.createRoot(root).render(<RouterProvider router={router} />);
