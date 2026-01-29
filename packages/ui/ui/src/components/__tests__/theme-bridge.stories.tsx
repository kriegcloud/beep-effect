import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Tests/Theme Bridge",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

/**
 * Verifies that MUI CSS variables are correctly mapped to Tailwind tokens.
 * The globals.css bridges these in the @theme inline block.
 */
export const CSSVariableBridge: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">MUI CSS Variable Bridge</h2>
        <p className="text-muted-foreground mb-4">
          These boxes should change color when you toggle the theme.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg"
            style={{
              backgroundColor:
                "rgb(var(--mui-palette-primary-mainChannel, 34 197 94))",
            }}
          >
            <span className="text-white font-medium">
              --mui-palette-primary-mainChannel
            </span>
          </div>
          <div className="bg-primary p-4 rounded-lg">
            <span className="text-primary-foreground font-medium">
              Tailwind: bg-primary
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Background Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor:
                "rgb(var(--mui-palette-background-defaultChannel, 255 255 255))",
            }}
          >
            <span>--mui-palette-background-defaultChannel</span>
          </div>
          <div className="bg-background p-4 rounded-lg border">
            <span>Tailwind: bg-background</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Text Colors</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4">
            <span
              style={{
                color: "rgb(var(--mui-palette-text-primaryChannel, 0 0 0))",
              }}
            >
              --mui-palette-text-primaryChannel
            </span>
          </div>
          <div className="p-4">
            <span className="text-foreground">Tailwind: text-foreground</span>
          </div>
        </div>
      </section>
    </div>
  ),
};

/**
 * Verify data-color-scheme attribute changes on theme toggle.
 */
export const DataAttributeCheck: Story = {
  render: () => {
    return (
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Theme Attribute Verification</h2>
        <p className="mb-4">
          Current <code>data-color-scheme</code> attribute:
        </p>
        <pre className="bg-muted p-4 rounded">
          html[data-color-scheme="
          {typeof window !== "undefined"
            ? document.documentElement.getAttribute("data-color-scheme")
            : "..."}
          "]
        </pre>
        <p className="mt-4 text-muted-foreground">
          Toggle the theme in the Storybook toolbar and observe the change.
        </p>
      </div>
    );
  },
};
