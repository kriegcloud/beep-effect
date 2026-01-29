import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Tests/Typography",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const TypeScale: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground text-sm">text-xs (12px)</p>
        <p className="text-xs">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-sm (14px)</p>
        <p className="text-sm">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-base (16px)</p>
        <p className="text-base">
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-lg (18px)</p>
        <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-xl (20px)</p>
        <p className="text-xl">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-2xl (24px)</p>
        <p className="text-2xl">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-3xl (30px)</p>
        <p className="text-3xl">The quick brown fox jumps over the lazy dog.</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">text-4xl (36px)</p>
        <p className="text-4xl">The quick brown fox jumps over the lazy dog.</p>
      </div>
    </div>
  ),
};

export const FontWeights: Story = {
  render: () => (
    <div className="space-y-4 text-xl">
      <p className="font-thin">font-thin (100)</p>
      <p className="font-light">font-light (300)</p>
      <p className="font-normal">font-normal (400)</p>
      <p className="font-medium">font-medium (500)</p>
      <p className="font-semibold">font-semibold (600)</p>
      <p className="font-bold">font-bold (700)</p>
      <p className="font-extrabold">font-extrabold (800)</p>
    </div>
  ),
};
