"use client";
import { withEnvLogging } from "@beep/errors/client";
import { runClientPromise, useRuntime } from "@beep/runtime-client";
import { NativeFileInstance } from "@beep/schema/integrations/files";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { UploadFileService } from "@/features/upload";
import { componentBoxStyles, FormActions, FormGrid } from "./components";
import { ComponentBox } from "./layout";

export const OtherSchema = S.Struct({
  singleUpload: S.NullOr(NativeFileInstance),
  multiUpload: S.Array(NativeFileInstance),
});

export function OtherDemo() {
  const runtime = useRuntime();
  const form = useAppForm({
    ...makeFormOptions({
      schema: OtherSchema,
      defaultValues: {
        singleUpload: null,
        multiUpload: [],
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ value }) => {
      const program = Effect.gen(function* () {
        // Validate form value via schema
        const decoded = yield* S.decode(OtherSchema)(value);
        // Collect files from both single and multi upload fields
        const files = [...(decoded.singleUpload ? [decoded.singleUpload] : []), ...(decoded.multiUpload ?? [])];
        if (files.length === 0) {
          return { successes: [], errors: [] } as const;
        }
        const upload = yield* UploadFileService;
        const { successes, errors } = yield* upload.processFiles({ files, config: { maxSizeBytes: 3_145_728 } });
        // Summary
        // Detailed per-file output

        return { successes, errors };
      });

      await runClientPromise(
        runtime,
        program.pipe(withEnvLogging, Effect.provide(UploadFileService.Default)),
        "upload.form.submit"
      );
    },
  });

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
