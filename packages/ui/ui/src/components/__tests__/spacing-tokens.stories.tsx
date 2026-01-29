import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Tests/Spacing Tokens",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const SpacingScale: Story = {
  render: () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Spacing Scale</h2>
      {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-16 text-sm text-muted-foreground">
            spacing-{size}
          </span>
          <div
            className="h-4 bg-primary rounded"
            style={{ width: `${size * 4}px` }}
          />
          <span className="text-sm text-muted-foreground">{size * 4}px</span>
        </div>
      ))}
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Border Radius</h2>
      <div className="flex flex-wrap gap-4">
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-none">
          <span className="text-primary-foreground text-xs">none</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-sm">
          <span className="text-primary-foreground text-xs">sm</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded">
          <span className="text-primary-foreground text-xs">default</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-md">
          <span className="text-primary-foreground text-xs">md</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-lg">
          <span className="text-primary-foreground text-xs">lg</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-xl">
          <span className="text-primary-foreground text-xs">xl</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-2xl">
          <span className="text-primary-foreground text-xs">2xl</span>
        </div>
        <div className="w-24 h-24 bg-primary flex items-center justify-center rounded-full">
          <span className="text-primary-foreground text-xs">full</span>
        </div>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Shadow Scale</h2>
      <div className="flex flex-wrap gap-8 p-8 bg-muted/50 rounded-lg">
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow-sm">
          <span className="text-xs">shadow-sm</span>
        </div>
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow">
          <span className="text-xs">shadow</span>
        </div>
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow-md">
          <span className="text-xs">shadow-md</span>
        </div>
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow-lg">
          <span className="text-xs">shadow-lg</span>
        </div>
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow-xl">
          <span className="text-xs">shadow-xl</span>
        </div>
        <div className="w-24 h-24 bg-card flex items-center justify-center rounded-lg shadow-2xl">
          <span className="text-xs">shadow-2xl</span>
        </div>
      </div>
    </div>
  ),
};
