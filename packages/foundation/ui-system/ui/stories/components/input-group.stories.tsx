import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@beep/ui/components/input-group";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `InputGroup` is a compound container that wraps an editable control with leading and
 * trailing affordances. Compose it from `InputGroupInput` or `InputGroupTextarea` for the
 * control, `InputGroupAddon` to anchor adornments (use `align` for `inline-start`,
 * `inline-end`, `block-start`, or `block-end`), `InputGroupText` for inline labels, and
 * `InputGroupButton` for inline actions. The group reacts to the control's focus, disabled,
 * and `aria-invalid` states, and clicking an addon focuses the inner control.
 *
 * Imported from `@beep/ui/components/input-group`.
 */
const meta = {
  title: "Components/Forms/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional utility classes merged onto the group container.",
    },
    children: {
      control: false,
      description: "The composed control and addons, e.g. `InputGroupInput` plus `InputGroupAddon`.",
    },
  },
  args: {},
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default group: a search field with a leading icon addon. Typing fires `onChange`. */
export const Default: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="Search…" onChange={fn()} />
      <InputGroupAddon>@</InputGroupAddon>
    </InputGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector("[data-slot=input-group]");
    expect(group).toBeVisible();
    const input = canvas.getByRole("textbox");
    return userEvent.type(input, "report").then(() => {
      expect(input).toHaveValue("report");
    });
  },
};

/** A leading addon anchored with `align="inline-start"` sits before the control. */
export const InlineStartAddon: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon align="inline-start">
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" />
    </InputGroup>
  ),
};

/** A trailing addon anchored with `align="inline-end"` sits after the control. */
export const InlineEndAddon: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="username" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@beep.dev</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** Leading and trailing addons combine to frame the control on both sides. */
export const BothSides: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon align="inline-start">$</InputGroupAddon>
      <InputGroupInput placeholder="0.00" type="number" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>USD</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** An `InputGroupButton` inline action; clicking it fires its `onClick` handler. */
export const WithButton: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="Enter a password" type="password" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={fn()}>Show</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Show" });
    expect(button).toBeVisible();
    return userEvent.click(button).then(() => {
      expect(button).toHaveAttribute("data-size", "xs");
    });
  },
};

/** An icon-sized `InputGroupButton` using the `icon-xs` size for a compact circular action. */
export const IconButton: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="Search…" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Submit search">
          @
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

/** A textarea control with a `block-end` addon row holding actions beneath the input. */
export const TextareaWithBlockEnd: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupTextarea placeholder="Ask, search, or chat…" />
      <InputGroupAddon align="block-end">
        <InputGroupButton variant="outline" size="icon-xs" aria-label="Add attachment">
          +
        </InputGroupButton>
        <InputGroupText className="ml-auto">52% used</InputGroupText>
        <InputGroupButton variant="default" size="icon-xs" aria-label="Send">
          ↑
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeVisible();
    return userEvent.type(textarea, "Summarize this thread").then(() => {
      expect(textarea).toHaveValue("Summarize this thread");
    });
  },
};

/** A `block-start` addon places a label row above the control. */
export const BlockStartLabel: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupAddon align="block-start">
        <InputGroupText>To</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="recipient@example.com" type="email" />
    </InputGroup>
  ),
};

/** Disabled state dims the entire group and rejects input. */
export const Disabled: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput placeholder="Search…" disabled onChange={fn()} />
      <InputGroupAddon>@</InputGroupAddon>
    </InputGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toBeDisabled();
    return userEvent.type(input, "x").then(() => {
      expect(input).not.toHaveValue("x");
    });
  },
};

/** Invalid state driven by `aria-invalid`, applying destructive ring styling to the group. */
export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args}>
      <InputGroupInput aria-invalid defaultValue="not-an-email" type="email" />
      <InputGroupAddon align="inline-end">!</InputGroupAddon>
    </InputGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    return Promise.resolve();
  },
};
