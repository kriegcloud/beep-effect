import { Button } from "@beep/ui/components/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@beep/ui/components/button-group";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `ButtonGroup` clusters related actions into a single seamless control, collapsing the
 * inner radii and borders of its children so adjacent `Button`s read as one segmented unit.
 * Set `orientation` to lay the cluster out horizontally or vertically, and compose with
 * `ButtonGroupText` for inline labels and `ButtonGroupSeparator` to divide logical sections.
 * Nest `ButtonGroup`s to add spacing between sub-clusters.
 *
 * Imported from `@beep/ui/components/button-group`.
 */
const meta = {
  title: "Components/Forms/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the grouped children; collapses shared radii along this axis.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    className: {
      control: "text",
      description: "Additional utility classes merged onto the group container.",
    },
    children: {
      control: false,
      description: "The grouped controls, typically `Button`, `ButtonGroupText`, or `ButtonGroupSeparator`.",
    },
  },
  args: {
    orientation: "horizontal",
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default horizontal cluster of three outline buttons. Clicking the first fires its handler. */
export const Default: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" onClick={fn()}>
        Archive
      </Button>
      <Button variant="outline">Report</Button>
      <Button variant="outline">Snooze</Button>
    </ButtonGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group");
    expect(group).toBeVisible();
    const archive = canvas.getByRole("button", { name: "Archive" });
    return userEvent.click(archive).then(() => {
      expect(archive).toHaveAttribute("data-slot", "button");
    });
  },
};

/** A vertical stack that collapses top and bottom radii so the buttons read as one column. */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

/** Pairs a leading `ButtonGroupText` label with a control, useful for prefixed inputs. */
export const WithText: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>https://</ButtonGroupText>
      <Button variant="outline">example.com</Button>
    </ButtonGroup>
  ),
};

/** Uses `ButtonGroupSeparator` to divide a destructive action from the rest of the cluster. */
export const WithSeparator: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">Copy</Button>
      <Button variant="outline">Paste</Button>
      <ButtonGroupSeparator />
      <Button variant="destructive">Delete</Button>
    </ButtonGroup>
  ),
};

/** Icon-only buttons form a compact toolbar; each still needs an accessible name. */
export const IconToolbar: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline" size="icon" aria-label="Bold">
        B
      </Button>
      <Button variant="outline" size="icon" aria-label="Italic">
        I
      </Button>
      <Button variant="outline" size="icon" aria-label="Underline">
        U
      </Button>
    </ButtonGroup>
  ),
};

/** Nested `ButtonGroup`s add spacing between logical sub-clusters within a single toolbar. */
export const NestedGroups: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroup>
        <Button variant="outline">Archive</Button>
        <Button variant="outline">Report</Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button variant="outline">Snooze</Button>
        <Button variant="outline" size="icon" aria-label="More options">
          ...
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};

/** A split-button pattern: a primary action paired with a separated dropdown trigger. */
export const SplitButton: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Save</Button>
      <ButtonGroupSeparator />
      <Button size="icon" aria-label="More save options">
        v
      </Button>
    </ButtonGroup>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByRole("button", { name: "Save" });
    const more = canvas.getByRole("button", { name: "More save options" });
    expect(primary).toBeVisible();
    expect(more).toBeVisible();
    return userEvent.click(more).then(() => {
      expect(more).toHaveAttribute("data-slot", "button");
    });
  },
};
