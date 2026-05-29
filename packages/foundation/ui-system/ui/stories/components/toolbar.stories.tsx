import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarSplitButton,
  ToolbarSplitButtonPrimary,
  ToolbarSplitButtonSecondary,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "@beep/ui/components/toolbar";
import { expect, fn, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Toolbar` is a container that groups a set of related controls — buttons, toggle groups, split
 * buttons, links, and separators — into a single accessible, keyboard-navigable surface built on
 * Base UI's toolbar primitive. The root manages roving focus across its items (arrow keys move
 * between controls) and exposes `orientation`, `loopFocus`, and `disabled`.
 *
 * Compose it from the dedicated sub-parts: `ToolbarButton` for actions or two-state toggles (pass
 * `pressed` to make it a toggle), `ToolbarToggleGroup` + `ToolbarToggleItem` for mutually related
 * toggles, `ToolbarSplitButton` (with `ToolbarSplitButtonPrimary` and `ToolbarSplitButtonSecondary`)
 * for a primary action paired with a dropdown affordance, `ToolbarLink` for inline links, `ToolbarGroup`
 * to visually cluster controls, and `ToolbarSeparator` to divide regions.
 *
 * Imported from `@beep/ui/components/toolbar`.
 */
const meta = {
  title: "Components/Navigation/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Layout direction of the toolbar and the arrow-key navigation axis.",
      table: { defaultValue: { summary: "horizontal" } },
    },
    loopFocus: {
      control: "boolean",
      description: "When true, keyboard navigation wraps focus to the other end once an edge is reached.",
      table: { defaultValue: { summary: "true" } },
    },
    disabled: {
      control: "boolean",
      description: "Disables the entire toolbar and dims its controls.",
      table: { defaultValue: { summary: "false" } },
    },
  },
  args: {
    orientation: "horizontal",
    loopFocus: true,
  },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default horizontal toolbar mixing action buttons, a toggle group, and a separator. Clicking an
 * action button fires its `onClick` once.
 */
export const Default: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton onClick={fn()}>Undo</ToolbarButton>
      <ToolbarButton onClick={fn()}>Redo</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="multiple" defaultValue={["bold"]} onValueChange={fn()}>
        <ToolbarToggleItem value="bold" aria-label="Bold">
          B
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic">
          I
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" aria-label="Underline">
          U
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const undo = canvas.getByRole("button", { name: "Undo" });
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    expect(undo).toBeVisible();
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(italic).then(() => {
      expect(italic).toHaveAttribute("aria-pressed", "true");
      expect(bold).toHaveAttribute("aria-pressed", "true");
    });
  },
};

/**
 * Action buttons render via `ToolbarButton` without a `pressed` prop. Each click fires its own
 * `onClick` once.
 */
export const ActionButtons: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton onClick={fn()}>Save</ToolbarButton>
      <ToolbarButton onClick={fn()}>Export</ToolbarButton>
      <ToolbarButton variant="outline" onClick={fn()}>
        Share
      </ToolbarButton>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Save" });
    const share = canvas.getByRole("button", { name: "Share" });
    expect(save).toBeVisible();
    expect(share).toBeVisible();
    return userEvent.click(save).then(() => {
      expect(save).toBeEnabled();
    });
  },
};

/**
 * A `ToolbarToggleGroup` with `type="single"` keeps exactly one item pressed at a time, ideal for
 * mutually exclusive alignment choices. Pressing another item moves the selection.
 */
export const SingleToggleGroup: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarToggleGroup type="single" defaultValue="left" onValueChange={fn()}>
        <ToolbarToggleItem value="left" aria-label="Align left">
          L
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" aria-label="Align center">
          C
        </ToolbarToggleItem>
        <ToolbarToggleItem value="right" aria-label="Align right">
          R
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole("button", { name: "Align left" });
    const center = canvas.getByRole("button", { name: "Align center" });
    expect(left).toHaveAttribute("aria-pressed", "true");
    expect(center).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(center).then(() => {
      expect(center).toHaveAttribute("aria-pressed", "true");
      expect(left).toHaveAttribute("aria-pressed", "false");
    });
  },
};

/**
 * With `type="multiple"`, several toggle items can be pressed at once, as with text-formatting marks.
 * Pressing an unpressed item adds it without clearing the others.
 */
export const MultipleToggleGroup: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarToggleGroup type="multiple" defaultValue={["bold", "underline"]} onValueChange={fn()}>
        <ToolbarToggleItem value="bold" aria-label="Bold">
          B
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" aria-label="Italic">
          I
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" aria-label="Underline">
          U
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    const underline = canvas.getByRole("button", { name: "Underline" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(underline).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");
    return userEvent.click(italic).then(() => {
      expect(italic).toHaveAttribute("aria-pressed", "true");
      expect(bold).toHaveAttribute("aria-pressed", "true");
    });
  },
};

/**
 * `ToolbarSeparator` divides distinct regions of controls; here it splits history actions from
 * formatting toggles.
 */
export const WithSeparator: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton onClick={fn()}>Cut</ToolbarButton>
      <ToolbarButton onClick={fn()}>Copy</ToolbarButton>
      <ToolbarButton onClick={fn()}>Paste</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" defaultValue="grid" onValueChange={fn()}>
        <ToolbarToggleItem value="grid" aria-label="Grid view">
          Grid
        </ToolbarToggleItem>
        <ToolbarToggleItem value="list" aria-label="List view">
          List
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
};

/**
 * A `ToolbarSplitButton` pairs a primary action (`ToolbarSplitButtonPrimary`) with a secondary
 * dropdown affordance (`ToolbarSplitButtonSecondary`). Clicking the primary half fires `onClick`
 * while the caret half stops propagation for its own menu.
 */
export const SplitButton: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarSplitButton variant="outline" onClick={fn()}>
        <ToolbarSplitButtonPrimary variant="outline">Publish</ToolbarSplitButtonPrimary>
        <ToolbarSplitButtonSecondary variant="outline" aria-label="More publish options" />
      </ToolbarSplitButton>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const primary = canvas.getByText("Publish");
    expect(primary).toBeVisible();
    return Promise.resolve();
  },
};

/**
 * `ToolbarLink` renders an underlined inline link while keeping toolbar focus semantics, useful for
 * jumping to docs or related pages.
 */
export const WithLink: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton onClick={fn()}>Format</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarLink href="#docs">Documentation</ToolbarLink>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "Documentation" });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", "#docs");
    return Promise.resolve();
  },
};

/**
 * `ToolbarGroup` visually clusters related controls and renders a trailing separator between groups,
 * producing clear segments within one toolbar.
 */
export const GroupedControls: Story = {
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarGroup>
        <ToolbarButton onClick={fn()}>Undo</ToolbarButton>
        <ToolbarButton onClick={fn()}>Redo</ToolbarButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarButton onClick={fn()}>Zoom in</ToolbarButton>
        <ToolbarButton onClick={fn()}>Zoom out</ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("button", { name: "Undo" })).toBeVisible();
    expect(canvas.getByRole("button", { name: "Zoom out" })).toBeVisible();
    return Promise.resolve();
  },
};

/**
 * A vertical toolbar stacks its controls and navigates with up/down arrow keys, fitting side rails
 * and floating panels.
 */
export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Toolbar {...args} className="flex-col items-stretch">
      <ToolbarButton onClick={fn()}>Top</ToolbarButton>
      <ToolbarButton onClick={fn()}>Middle</ToolbarButton>
      <ToolbarButton onClick={fn()}>Bottom</ToolbarButton>
    </Toolbar>
  ),
};

/**
 * A disabled toolbar dims its controls and prevents interaction across every item.
 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Toolbar {...args}>
      <ToolbarButton disabled onClick={fn()}>
        Save
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" disabled defaultValue="left" onValueChange={fn()}>
        <ToolbarToggleItem value="left" aria-label="Align left">
          L
        </ToolbarToggleItem>
        <ToolbarToggleItem value="center" aria-label="Align center">
          C
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const save = canvas.getByRole("button", { name: "Save" });
    expect(save).toHaveAttribute("aria-disabled", "true");
    expect(save).toHaveAttribute("data-disabled");
    return Promise.resolve();
  },
};
