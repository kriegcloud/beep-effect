import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@beep/ui/components/accordion";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Accordion` is a vertically stacked set of collapsible panels built on Base UI's accessible
 * accordion primitive. Compose the root `Accordion` (which owns expansion state) with one
 * `AccordionItem` per section, each pairing an `AccordionTrigger` (the clickable header with its
 * caret indicator) and an `AccordionContent` (the collapsible panel). By default a single item is
 * open at a time; set `multiple` to allow several open simultaneously, or `defaultValue` to seed
 * the initially expanded item(s). Each `AccordionItem` takes a unique `value` used to track and
 * control which panels are open.
 *
 * Imported from `@beep/ui/components/accordion`.
 */
const meta = {
  title: "Components/Layout/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    multiple: {
      control: "boolean",
      description: "Whether multiple items can be open at the same time.",
      table: { defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables interaction with every item and dims the accordion.",
      table: { defaultValue: { summary: "false" } },
    },
    orientation: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "Visual orientation; controls whether roving focus uses up/down or left/right arrow keys.",
      table: { defaultValue: { summary: "vertical" } },
    },
    loopFocus: {
      control: "boolean",
      description: "Whether arrow-key focus loops from the last item back to the first.",
      table: { defaultValue: { summary: "true" } },
    },
    keepMounted: {
      control: "boolean",
      description: "Whether closed panels remain in the DOM instead of being unmounted.",
      table: { defaultValue: { summary: "false" } },
    },
    hiddenUntilFound: {
      control: "boolean",
      description: "Allows the browser's in-page search to find and expand closed panels.",
      table: { defaultValue: { summary: "false" } },
    },
    defaultValue: {
      control: false,
      description: "Uncontrolled value(s) of the item(s) that should be initially expanded.",
    },
    value: {
      control: false,
      description: "Controlled value(s) of the expanded item(s); pair with `onValueChange`.",
    },
    onValueChange: {
      control: false,
      description: "Callback fired with the next array of expanded item values when an item toggles.",
    },
  },
  args: {
    multiple: false,
    disabled: false,
    onValueChange: fn(),
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default single-open accordion. The play test confirms the first panel starts collapsed, then
 * clicks its trigger to expand it and asserts `onValueChange` fires.
 */
export const Default: Story = {
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="shipping">
        <AccordionTrigger>How fast is shipping?</AccordionTrigger>
        <AccordionContent>Orders placed before 2pm ship the same business day via standard courier.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>What is the return policy?</AccordionTrigger>
        <AccordionContent>Unused items can be returned within 30 days for a full refund.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>How do I contact support?</AccordionTrigger>
        <AccordionContent>Reach our team any time through the in-app chat or by emailing support.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "How fast is shipping?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    return userEvent.click(trigger).then(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(args.onValueChange).toHaveBeenCalled();
    });
  },
};

/**
 * With `multiple` enabled, expanding a second panel leaves the first open. The play test opens two
 * triggers and asserts both report `aria-expanded="true"`.
 */
export const Multiple: Story = {
  args: { multiple: true },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="overview">
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>A high-level summary of the product and what it does.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="pricing">
        <AccordionTrigger>Pricing</AccordionTrigger>
        <AccordionContent>Transparent monthly plans with no hidden fees.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="security">
        <AccordionTrigger>Security</AccordionTrigger>
        <AccordionContent>End-to-end encryption and SOC 2 Type II compliance.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("button", { name: "Overview" });
    const second = canvas.getByRole("button", { name: "Pricing" });
    return userEvent
      .click(first)
      .then(() => userEvent.click(second))
      .then(() => {
        expect(first).toHaveAttribute("aria-expanded", "true");
        expect(second).toHaveAttribute("aria-expanded", "true");
      });
  },
};

/**
 * Seeds an initially expanded panel in uncontrolled mode via `defaultValue`. The play test asserts
 * the seeded panel is already open on first render without any interaction.
 */
export const DefaultExpanded: Story = {
  args: { defaultValue: ["pricing"] },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="overview">
        <AccordionTrigger>Overview</AccordionTrigger>
        <AccordionContent>A high-level summary of the product and what it does.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="pricing">
        <AccordionTrigger>Pricing</AccordionTrigger>
        <AccordionContent>Transparent monthly plans with no hidden fees.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="security">
        <AccordionTrigger>Security</AccordionTrigger>
        <AccordionContent>End-to-end encryption and SOC 2 Type II compliance.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "Pricing" })).toHaveAttribute("aria-expanded", "true");
    expect(canvas.getByRole("button", { name: "Overview" })).toHaveAttribute("aria-expanded", "false");
    return Promise.resolve();
  },
};

/**
 * A disabled accordion ignores user interaction. The play test asserts the trigger is disabled and
 * stays collapsed after a click, and that `onValueChange` never fires.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="locked">
        <AccordionTrigger>This section is locked</AccordionTrigger>
        <AccordionContent>You cannot expand this panel while the accordion is disabled.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="also-locked">
        <AccordionTrigger>So is this one</AccordionTrigger>
        <AccordionContent>All items inherit the disabled state from the root.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "This section is locked" });
    expect(trigger).toHaveAttribute("aria-disabled", "true");
    return userEvent.click(trigger).then(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(args.onValueChange).not.toHaveBeenCalled();
    });
  },
};

/**
 * A single item can be disabled while its siblings remain interactive by setting `disabled` on the
 * `AccordionItem`.
 */
export const DisabledItem: Story = {
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="available">
        <AccordionTrigger>Available plan</AccordionTrigger>
        <AccordionContent>This plan is open for sign-ups today.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="coming-soon" disabled>
        <AccordionTrigger>Coming soon</AccordionTrigger>
        <AccordionContent>This plan is not yet available.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Rich panel content renders formatted copy and links. The styles target paragraphs and anchors
 * inside `AccordionContent` for readable long-form sections.
 */
export const RichContent: Story = {
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="docs">
        <AccordionTrigger>Where can I find the docs?</AccordionTrigger>
        <AccordionContent>
          <p>Our documentation covers installation, configuration, and advanced usage.</p>
          <p>
            Start with the <a href="#getting-started">getting started guide</a> for a quick walkthrough of the basics.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="api">
        <AccordionTrigger>Is there an API reference?</AccordionTrigger>
        <AccordionContent>
          <p>
            Yes. The full <a href="#api">API reference</a> lists every endpoint with request and response examples.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

/**
 * Collapsing an already-open panel hides its content. The play test seeds an open item, clicks its
 * trigger to collapse it, and asserts the trigger reports `aria-expanded="false"`.
 */
export const Collapsing: Story = {
  args: { defaultValue: ["faq"] },
  render: (args) => (
    <Accordion {...args} className="max-w-md">
      <AccordionItem value="faq">
        <AccordionTrigger>Frequently asked questions</AccordionTrigger>
        <AccordionContent>Click the header again to collapse this panel.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="more">
        <AccordionTrigger>More information</AccordionTrigger>
        <AccordionContent>Additional details live in a second collapsible panel.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Frequently asked questions" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    return userEvent.click(trigger).then(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  },
};
