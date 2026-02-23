import { $SharedClientId } from "@beep/identity/packages";
import type { BS } from "@beep/schema";
import { Effect } from "effect";
import * as O from "effect/Option";

const $I = $SharedClientId.create("atom/files/services/FilePicker");

export class Service extends Effect.Service<Service>()($I`Service`, {
  scoped: Effect.gen(function* () {
    const fileRef = yield* Effect.acquireRelease(
      Effect.sync(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.style.display = "none";
        document.body.appendChild(input);
        return input;
      }),
      (input) => Effect.sync(input.remove)
    );

    return {
      open: Effect.async<O.Option<BS.FileFromSelf.Type>>((resume) => {
        const changeHandler = (e: Event) => {
          const selectedFile = (e.target as HTMLInputElement).files?.[0];
          resume(Effect.succeed(O.fromNullable(selectedFile)));
          fileRef.value = "";
        };

        const cancelHandler = () => {
          resume(Effect.succeed(O.none()));
        };

        fileRef.addEventListener("change", changeHandler, { once: true });
        fileRef.addEventListener("cancel", cancelHandler, { once: true });
        fileRef.click();

        return Effect.sync(() => {
          fileRef.removeEventListener("change", changeHandler);
          fileRef.removeEventListener("cancel", cancelHandler);
        });
      }),
    };
  }),
}) {}

export const layer = Service.Default;
