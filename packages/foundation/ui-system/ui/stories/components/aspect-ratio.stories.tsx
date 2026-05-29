import { AspectRatio } from "@beep/ui/components/aspect-ratio";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `AspectRatio` constrains its content to a fixed width-to-height ratio using the
 * CSS `aspect-ratio` property, driven by the numeric `ratio` prop (for example
 * `16 / 9`). It is a thin layout wrapper around a `div`, so it forwards all native
 * div props and can hold any content — images, video, maps, or placeholders.
 *
 * Imported from `@beep/ui/components/aspect-ratio`.
 */
const meta = {
  title: "Components/Layout/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {
    ratio: {
      control: { type: "number", min: 0.1, step: 0.1 },
      description: "Width-to-height ratio applied via CSS `aspect-ratio`, e.g. `16 / 9` for widescreen.",
    },
    className: {
      control: "text",
      description: "Additional classes merged onto the wrapper div.",
    },
    children: {
      control: false,
      description: "Content sized to the ratio. Typically fills the box with `h-full w-full`.",
    },
  },
  args: {
    ratio: 16 / 9,
    className: "w-96 overflow-hidden rounded-lg bg-muted",
    children: (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">16 : 9</div>
    ),
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default widescreen `16 / 9` box. The wrapper renders with the `aspect-ratio` slot. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByText("16 : 9");
    expect(box).toBeVisible();
    return Promise.resolve();
  },
};

/** A perfectly square `1 / 1` box, common for avatars and thumbnails. */
export const Square: Story = {
  args: {
    ratio: 1,
    children: <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">1 : 1</div>,
  },
};

/** A portrait `3 / 4` box, useful for poster or card imagery. */
export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
    className: "w-72 overflow-hidden rounded-lg bg-muted",
    children: <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">3 : 4</div>,
  },
};

/** A wide cinematic `21 / 9` box for ultrawide banners. */
export const Ultrawide: Story = {
  args: {
    ratio: 21 / 9,
    children: (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">21 : 9</div>
    ),
  },
};

/** A realistic composition: an image fully fills the ratio box and is clipped by `overflow-hidden`. */
export const WithImage: Story = {
  args: {
    ratio: 16 / 9,
    children: (
      <img
        src="https://images.unsplash.com/photo-1535025183041-0991a977e25b?w=800&dpr=2&q=80"
        alt="Landscape framed to a 16:9 ratio"
        className="h-full w-full object-cover"
      />
    ),
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = canvas.getByRole("img", { name: "Landscape framed to a 16:9 ratio" });
    expect(image).toBeVisible();
    return Promise.resolve();
  },
};
