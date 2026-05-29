import { Progress, ProgressLabel, ProgressValue } from "@beep/ui/components/progress";
import { expect, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * `Progress` wraps Base UI's accessible progress bar into a single component that renders
 * the track and the filled indicator for you. Drive completion with `value` (use `null`
 * for an indeterminate bar), rescale with `min` and `max`, and format the announced value
 * with `format` and `locale`. Compose `ProgressLabel` and `ProgressValue` as children to
 * surface a caption and a live readout above the bar.
 *
 * Imported from `@beep/ui/components/progress`.
 */
const meta = {
  title: "Components/Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Current value of the bar. The bar is indeterminate when `value` is `null`.",
      table: { defaultValue: { summary: "null" } },
    },
    min: {
      control: "number",
      description: "Minimum value and the origin for the filled indicator.",
      table: { defaultValue: { summary: "0" } },
    },
    max: {
      control: "number",
      description: "Maximum value that represents full completion.",
      table: { defaultValue: { summary: "100" } },
    },
    format: {
      control: false,
      description: "`Intl.NumberFormatOptions` used to format the value announced to assistive tech.",
    },
    locale: {
      control: false,
      description: "Locale passed to `Intl.NumberFormat` when formatting the value.",
    },
    getAriaValueText: {
      control: false,
      description: "Returns a human-readable text alternative for the current value.",
    },
    children: {
      control: false,
      description: "Composition slot for `ProgressLabel` and `ProgressValue`.",
    },
  },
  args: {
    value: 60,
    min: 0,
    max: 100,
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default determinate bar. Its accessible value reflects the `value` prop. */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    expect(bar).toBeVisible();
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    return Promise.resolve();
  },
};

/** Just started: a near-empty bar showing low completion. */
export const LowProgress: Story = {
  args: { value: 15 },
};

/** Fully complete: the indicator fills the entire track. */
export const Complete: Story = {
  args: { value: 100 },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    return Promise.resolve();
  },
};

/** Indeterminate state for unknown-duration work; `value` is `null` and no value is announced. */
export const Indeterminate: Story = {
  args: { value: null },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    expect(bar).toBeVisible();
    expect(bar).not.toHaveAttribute("aria-valuenow");
    return Promise.resolve();
  },
};

/** A custom scale: `value` is interpreted against non-default `min` and `max` bounds. */
export const CustomRange: Story = {
  args: { value: 3, min: 0, max: 5 },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    return Promise.resolve();
  },
};

/** A complete composition with a `ProgressLabel` caption and a live `ProgressValue` readout. */
export const WithLabelAndValue: Story = {
  args: { value: 72 },
  render: (renderArgs) => (
    <Progress {...renderArgs} className="w-80">
      <ProgressLabel>Uploading files</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText("Uploading files")).toBeVisible();
    expect(canvas.getByText("72%")).toBeVisible();
    return Promise.resolve();
  },
};

/** Formatted readout using `format` to render the value as a currency-style amount. */
export const FormattedValue: Story = {
  args: {
    value: 1250,
    max: 5000,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  render: (renderArgs) => (
    <Progress {...renderArgs} className="w-80">
      <ProgressLabel>Funding goal</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
};
