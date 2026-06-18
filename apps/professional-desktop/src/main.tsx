import "@beep/ui/styles/globals.css";
import { AppThemeProvider, ThemeMode } from "@beep/ui/themes/theme-provider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ProfessionalAtomProvider } from "./runtime/ProfessionalAtomProvider.tsx";

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <AppThemeProvider defaultMode={ThemeMode.Enum.light}>
        <ProfessionalAtomProvider>
          <App />
        </ProfessionalAtomProvider>
      </AppThemeProvider>
    </StrictMode>
  );
}
