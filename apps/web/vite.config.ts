import { createTheme } from "@mui/material/styles";
import { pigment } from "@pigment-css/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const pigmentConfig = {
  theme: createTheme({
    cssVariables: true,
    colorSchemes: { light: true, dark: true },
  }),
  transformLibraries: ["@mui/material"],
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [pigment(pigmentConfig), react()],
  build: {
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
    },
  },
  optimizeDeps: {
    include: ["prop-types", "react-is", "hoist-non-react-statics"],
  },
});
