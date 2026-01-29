import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { Buffer } from "buffer";
import "../../../packages/ui/ui/src/styles/globals.css";

// Polyfill Buffer for browser environment
if (typeof window !== "undefined") {
  (window as any).Buffer = Buffer;
}

const preview: Preview = {
  decorators: [
    // Use withThemeByClassName to match Tailwind's dark mode selector (.dark class)
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "dark",
    }),
  ],
  parameters: {
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global theme",
      defaultValue: "dark",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
