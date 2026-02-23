import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview, ReactRenderer } from "@storybook/react-vite";
import type { DecoratorFunction } from "storybook/internal/types";
import { themes } from "storybook/theming";
import "./preview.css";

/**
 * Wraps each story in a container that inherits the theme's background
 * and text colors, overriding Storybook's default white canvas.
 */
const withThemeBackground: DecoratorFunction<ReactRenderer> = (Story) => (
  <div className="bg-background text-foreground min-h-screen p-6">
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [
    withThemeBackground,
    withThemeByClassName({
      themes: {
        light: "",
        dark: "dark",
      },
      defaultTheme: "light",
    }),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      theme: themes.dark,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
