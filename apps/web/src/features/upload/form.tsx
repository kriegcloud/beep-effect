"use client";
import { BS } from "@beep/schema";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { formOptions } from "@tanstack/react-form";
import * as S from "effect/Schema";
import { componentBoxStyles, FormActions, FormGrid } from "./components";
import { ComponentBox } from "./layout";

export const OtherSchema = S.Struct({
  singleUpload: S.NullOr(BS.FileBase),
  multiUpload: S.Array(BS.FileBase),
});
export type OtherSchema = typeof OtherSchema.Type;
export const OtherFormOptions = formOptions({
  ...makeFormOptions({
    schema: OtherSchema,
    defaultValues: {
      singleUpload: null,
      multiUpload: [],
    },
    validator: "onSubmit",
  }),
  onSubmit: async ({ formApi, value }) => {
    const decoded = S.decodeSync(OtherSchema)(value);
    console.info("DATA: ", decoded);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  },
});

export function OtherDemo() {
  const form = useAppForm(OtherFormOptions);

  return (
    <>
      {form.state.isSubmitting && (
        <Backdrop open sx={[(theme) => ({ zIndex: theme.zIndex.modal + 1 })]}>
          <CircularProgress color="warning" />
        </Backdrop>
      )}

      <Form onSubmit={form.handleSubmit}>
        <FormActions
          loading={form.state.isSubmitting}
          disabled={Object.keys(form.state.errors).length === 0}
          onReset={() => form.reset()}
        />

        <FormGrid
          sx={{
            gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" },
          }}
        >
          <ComponentBox title="Upload" sx={componentBoxStyles}>
            <form.AppField
              name={"singleUpload"}
              children={(field) => (
                <field.Upload maxSize={3145728} onDelete={() => form.setFieldValue("singleUpload", null)} />
              )}
            />
          </ComponentBox>
          <ComponentBox>
            <form.AppField
              name={"multiUpload"}
              children={(field) => (
                <field.Upload
                  multiple
                  maxSize={3145728}
                  onRemove={(inputFile) =>
                    form.setFieldValue(
                      "multiUpload",
                      form.state.values.multiUpload.filter((file) => file !== inputFile)
                    )
                  }
                  onRemoveAll={() => form.setFieldValue("multiUpload", [])}
                  onUpload={() => form.handleSubmit()}
                />
              )}
            />
          </ComponentBox>
        </FormGrid>
      </Form>
    </>
  );
}
