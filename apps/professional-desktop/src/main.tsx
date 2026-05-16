import "@beep/ui/styles/globals.css";
import { AppThemeProvider, ThemeMode } from "@beep/ui/themes";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";

const root = document.getElementById("root");

if (root !== null) {
  createRoot(root).render(
    <StrictMode>
      <AppThemeProvider defaultMode={ThemeMode.Enum.light}>
        <App />
      </AppThemeProvider>
    </StrictMode>
  );
}
