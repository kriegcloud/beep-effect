import "./styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ProfessionalAtomProvider } from "./runtime/ProfessionalAtomProvider.tsx";
import { WorkbenchThemeProvider } from "./theme/WorkbenchThemeProvider.tsx";

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <WorkbenchThemeProvider>
        <ProfessionalAtomProvider>
          <App />
        </ProfessionalAtomProvider>
      </WorkbenchThemeProvider>
    </StrictMode>
  );
}
