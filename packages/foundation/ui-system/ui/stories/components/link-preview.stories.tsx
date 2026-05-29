import { LinkPreview } from "@beep/ui/components/link-preview";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `LinkPreview` wraps inline link text in an accessible tooltip that surfaces rich URL
 * metadata (title, description, favicon, and preview image) on hover. When same-origin,
 * it lazily fetches Open Graph tags once the link scrolls into view; otherwise it falls
 * back to the supplied `metadata` and derived hostname.
 *
 * Imported from `@beep/ui/components/link-preview`.
 */
const meta = {
  title: "Components/Data Display/LinkPreview",
  component: LinkPreview,
  tags: ["autodocs"],
  argTypes: {
    href: {
      control: "text",
      description: "Destination URL; sanitized before use and shown in the preview.",
    },
    children: {
      control: "text",
      description: "Inline link content rendered as the trigger text.",
    },
    className: {
      control: "text",
      description: "Extra classes merged onto the anchor trigger.",
    },
    metadata: {
      control: false,
      description: "Static metadata overrides merged over any fetched values.",
    },
  },
  args: {
    href: "https://effect.website",
    children: "Effect documentation",
    metadata: {
      title: "Effect - The best way to build robust apps in TypeScript",
      description:
        "Effect is a powerful TypeScript library designed to help developers easily create complex, synchronous, and asynchronous programs.",
      websiteName: "effect.website",
      favicon: "https://effect.website/favicon.ico",
      websiteImage: null,
    },
  },
} satisfies Meta<typeof LinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default inline link rendering site metadata in its hover tooltip. */
export const Default: Story = {};

/** A minimal link with no supplied metadata, falling back to the derived hostname. */
export const MinimalMetadata: Story = {
  args: {
    href: "https://github.com/Effect-TS/effect",
    children: "Effect on GitHub",
    metadata: null,
  },
};

/** An invalid URL surfaces an inline error state inside the preview tooltip. */
export const InvalidUrl: Story = {
  args: {
    href: "not-a-valid-url",
    children: "Broken link",
    metadata: null,
  },
};
