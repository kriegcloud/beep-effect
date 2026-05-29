import { Button } from "@beep/ui/components/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@beep/ui/components/field";
import { Input } from "@beep/ui/components/input";
import { Textarea } from "@beep/ui/components/textarea";
import { expect, userEvent, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * The `Field` family composes accessible form layouts. `Field` is the per-control wrapper
 * (a `role="group"`) that arranges a `FieldLabel`, the control itself, and supporting
 * `FieldDescription` / `FieldError` text. Wrap multiple `Field`s in a `FieldGroup`, and
 * group related groups under a `FieldSet` with a `FieldLegend`. Use `orientation` to switch
 * between stacked (`vertical`), inline (`horizontal`), and container-aware (`responsive`)
 * layouts.
 *
 * Imported from `@beep/ui/components/field`.
 */
const meta = {
  title: "Components/Forms/Field",
  component: Field,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
      description: "Layout direction of the field's label, control, and helper text.",
      table: { defaultValue: { summary: "vertical" } },
    },
    children: {
      control: false,
      description: "The composed field contents: a `FieldLabel`, a control, and optional description/error.",
    },
  },
  args: {
    orientation: "vertical",
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single vertical field: label stacked above an input with a helper description. Typing updates the control. */
export const Default: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="field-default-name">Full name</FieldLabel>
      <Input id="field-default-name" placeholder="Evil Rabbit" />
      <FieldDescription>This is the name shown on your profile.</FieldDescription>
    </Field>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText("Full name");
    expect(input).toBeVisible();
    return userEvent.type(input, "Ada Lovelace").then(() => {
      expect(input).toHaveValue("Ada Lovelace");
    });
  },
};

/** Horizontal orientation places the label and control on a single row, ideal for toggles and short inputs. */
export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="field-horizontal-handle">Username</FieldLabel>
      <Input id="field-horizontal-handle" placeholder="@evilrabbit" />
    </Field>
  ),
};

/** Responsive orientation stacks on narrow containers and switches to a row at the `@md` container breakpoint. */
export const Responsive: Story = {
  args: { orientation: "responsive" },
  render: (args) => (
    <Field {...args}>
      <FieldLabel htmlFor="field-responsive-email">Email</FieldLabel>
      <Input id="field-responsive-email" type="email" placeholder="rabbit@example.com" />
    </Field>
  ),
};

/** A field marked invalid via `data-invalid`, rendering a `FieldError` in the destructive color. */
export const Invalid: Story = {
  render: (args) => (
    <Field {...args} data-invalid={true}>
      <FieldLabel htmlFor="field-invalid-email">Email</FieldLabel>
      <Input id="field-invalid-email" type="email" aria-invalid placeholder="rabbit@example.com" />
      <FieldError>Enter a valid email address.</FieldError>
    </Field>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a valid email address.");
    return Promise.resolve();
  },
};

/** `FieldError` can derive its message from an `errors` array, deduping and listing multiple messages. */
export const ErrorList: Story = {
  render: (args) => (
    <Field {...args} data-invalid={true}>
      <FieldLabel htmlFor="field-errorlist-password">Password</FieldLabel>
      <Input id="field-errorlist-password" type="password" aria-invalid />
      <FieldError
        errors={[
          { message: "Must be at least 8 characters." },
          { message: "Must include a number." },
          { message: "Must include a number." },
        ]}
      />
    </Field>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = within(canvas.getByRole("alert")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    return Promise.resolve();
  },
};

/** `FieldContent` separates a title and description from a trailing control in a horizontal field. */
export const WithContent: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <Field {...args}>
      <FieldContent>
        <FieldTitle>Marketing emails</FieldTitle>
        <FieldDescription>Receive product updates and announcements.</FieldDescription>
      </FieldContent>
      <Input id="field-content-toggle" type="checkbox" className="size-4" />
    </Field>
  ),
};

/** A `FieldSet` with a `FieldLegend` groups related fields under a shared heading. */
export const FieldSetGroup: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Profile</FieldLegend>
      <FieldDescription>Tell people a bit about yourself.</FieldDescription>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="field-set-name">Display name</FieldLabel>
          <Input id="field-set-name" placeholder="Evil Rabbit" />
        </Field>
        <Field>
          <FieldLabel htmlFor="field-set-bio">Bio</FieldLabel>
          <Textarea id="field-set-bio" className="resize-none" placeholder="A short bio" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/** `FieldSeparator` divides groups; pass children to render a labeled divider between sections. */
export const Separated: Story = {
  render: () => (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="field-separated-email">Email</FieldLabel>
        <Input id="field-separated-email" type="email" placeholder="rabbit@example.com" />
      </Field>
      <FieldSeparator>Or continue with</FieldSeparator>
      <Field>
        <FieldLabel htmlFor="field-separated-token">Access token</FieldLabel>
        <Input id="field-separated-token" placeholder="paste a token" />
      </Field>
    </FieldGroup>
  ),
};

/** A realistic complete composition: a multi-section payment form built from the full Field family. */
export const CompleteForm: Story = {
  render: () => (
    <form className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Payment method</FieldLegend>
          <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-card-name">Name on card</FieldLabel>
              <Input id="form-card-name" placeholder="Evil Rabbit" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-card-number">Card number</FieldLabel>
              <Input id="form-card-number" placeholder="1234 5678 9012 3456" required />
              <FieldDescription>Enter your 16-digit card number.</FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Notes</FieldLegend>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-comments">Comments</FieldLabel>
              <Textarea id="form-comments" className="resize-none" placeholder="Add any additional comments" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit">Submit</Button>
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Field>
      </FieldGroup>
    </form>
  ),
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cardName = canvas.getByLabelText("Name on card");
    expect(cardName).toBeVisible();
    expect(canvas.getByRole("button", { name: "Submit" })).toBeVisible();
    return userEvent.type(cardName, "Ada Lovelace").then(() => {
      expect(cardName).toHaveValue("Ada Lovelace");
    });
  },
};
