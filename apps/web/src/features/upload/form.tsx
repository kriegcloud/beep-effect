"use client";
import { withEnvLogging } from "@beep/errors/client";
import { BS } from "@beep/schema";
import { Form, makeFormOptions, useAppForm } from "@beep/ui/form";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { UploadFileService } from "@/features/upload";
import { useRuntime } from "@/services/runtime/use-runtime";
import { componentBoxStyles, FormActions, FormGrid } from "./components";
import { ComponentBox } from "./layout";

export class HandleSubmitError extends Data.TaggedError("HandleSubmitError")<{
  cause: unknown;
}> {}

export const OtherSchema = S.Struct({
  singleUpload: S.NullOr(BS.FileBase),
  multiUpload: S.Array(BS.FileBase),
});
export type OtherSchema = typeof OtherSchema.Type;

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
          yield* Console.log({ message: "No files selected to process." });
          return { successes: [], errors: [] } as const;
        }
        const upload = yield* UploadFileService;
        const { successes, errors } = yield* upload.processFiles({ files, config: { maxSizeBytes: 3_145_728 } });
        // Summary
        yield* Console.log({ successes: successes.length, errors: errors.length });
        // Detailed per-file output
        for (const s of successes) {
          const { file, validated, basic, exif } = s;
          yield* Console.log({
            file: { name: file.name, type: file.type, size: file.size },
            validated,
            formattedSize: validated.formattedSize,
            basic,
            exif,
          });
        }
        return { successes, errors };
      });

      await runtime.runPromise(program.pipe(withEnvLogging, Effect.provide(UploadFileService.Default)));
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
