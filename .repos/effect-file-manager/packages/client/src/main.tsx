import { RegistryProvider } from "@effect-atom/atom-react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import "./index.css";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RegistryProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </RegistryProvider>
  </React.StrictMode>,
);
