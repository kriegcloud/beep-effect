import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Tests/Color Palette",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const ColorSwatch = ({
  name,
  className,
}: {
  name: string;
  className: string;
}) => (
  <div className="flex items-center gap-4">
    <div className={`w-16 h-16 rounded-lg border ${className}`} />
    <div>
      <p className="font-mono text-sm">{name}</p>
      <p className="text-muted-foreground text-xs">{className}</p>
    </div>
  </div>
);

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ColorSwatch name="Background" className="bg-background" />
          <ColorSwatch name="Foreground" className="bg-foreground" />
          <ColorSwatch name="Primary" className="bg-primary" />
          <ColorSwatch name="Secondary" className="bg-secondary" />
          <ColorSwatch name="Muted" className="bg-muted" />
          <ColorSwatch name="Accent" className="bg-accent" />
          <ColorSwatch name="Destructive" className="bg-destructive" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card and Popover</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ColorSwatch name="Card" className="bg-card" />
          <ColorSwatch name="Popover" className="bg-popover" />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Border and Ring</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <ColorSwatch name="Border" className="bg-border" />
          <ColorSwatch name="Ring" className="bg-ring" />
        </div>
      </section>
    </div>
  ),
};

export const StateColors: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Interactive States</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80">
            Secondary Button
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90">
            Destructive Button
          </button>
        </div>
      </section>
    </div>
  ),
};
