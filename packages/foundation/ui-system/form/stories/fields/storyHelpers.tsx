import { Form, makeFormOptions, useAppForm } from "@beep/form";
import * as S from "effect/Schema";
import { expect, userEvent, within } from "storybook/test";

class CountryFormValues extends S.Class<CountryFormValues>("CountryFormValues")(
  { country: S.String },
  {
    description: "Form story state for a single country selection.",
  }
) {}

class UploadFormValues extends S.Class<UploadFormValues>("UploadFormValues")(
  {
    attachments: S.Array(S.Unknown),
    files: S.Array(S.Unknown),
  },
  {
    description: "Form story state for upload preview fields.",
  }
) {}

export const countryOptions = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

export const CountryFieldDemo = (props: { readonly kind: "combobox" | "select" }) => {
  const form = useAppForm(
    makeFormOptions({ schema: CountryFormValues, defaultValues: { country: "" }, validateOn: "change" })
  );
  return (
    <form.AppForm>
      <Form className="flex w-80 flex-col gap-4" onSubmit={() => form.handleSubmit()}>
        <form.AppField name="country">
          {(field) =>
            props.kind === "combobox" ? (
              <field.Combobox label="Country" options={countryOptions} />
            ) : (
              <field.Select label="Country" options={countryOptions} />
            )
          }
        </form.AppField>
      </Form>
    </form.AppForm>
  );
};

export const UploadFieldDemo = (props: { readonly kind: "upload" | "uploadBox" }) => {
  const form = useAppForm(
    makeFormOptions({
      schema: UploadFormValues,
      defaultValues: { attachments: [], files: [] },
      validateOn: "change",
    })
  );
  return (
    <form.AppForm>
      <Form className="flex w-96 flex-col gap-4" onSubmit={() => form.handleSubmit()}>
        <form.AppField name={props.kind === "upload" ? "files" : "attachments"}>
          {(field) =>
            props.kind === "upload" ? <field.Upload label="Documents" /> : <field.UploadBox label="Attachments" />
          }
        </form.AppField>
      </Form>
    </form.AppForm>
  );
};

export const assertCountryLabel = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  await expect(canvas.getByText("Country")).toBeInTheDocument();
};

export const assertUploadedPreview = async (params: {
  readonly canvasElement: HTMLElement;
  readonly fileName: string;
  readonly svg: string;
}) => {
  const { canvasElement, fileName, svg } = params;
  const canvas = within(canvasElement);
  const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
  await expect(input).not.toBeNull();
  if (input !== null) {
    await userEvent.upload(input, new File([svg], fileName, { type: "image/svg+xml" }));
  }
  await expect(canvas.getByAltText(fileName)).toBeInTheDocument();
};
