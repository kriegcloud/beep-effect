import "./app.css";
import { RegistryProvider } from "@effect/atom-react";
import { RouterProvider } from "@tanstack/react-router";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { router } from "./router.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RegistryProvider>
      <RouterProvider router={router} />
    </RegistryProvider>
  </React.StrictMode>,
);
