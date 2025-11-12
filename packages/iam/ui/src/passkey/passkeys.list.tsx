"use client";
import { editingPasskeyAtom, usePasskeyCRUD } from "@beep/iam-sdk";
import type { PasskeyView } from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { PasskeyForm } from "@beep/iam-ui/passkey/passkey.form";
import { PasskeyItem } from "@beep/iam-ui/passkey/passkey.item";
import { PasskeysEmpty } from "@beep/iam-ui/passkey/passkeys.empty";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { useBoolean } from "@beep/ui/hooks";
import { useConfirm } from "@beep/ui/organisms";
import { useAtomSet } from "@effect-atom/atom-react";
import List from "@mui/material/List";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

type Props = {
  readonly passkeys: ReadonlyArray<PasskeyView>;
};

export const PasskeysList = ({ passkeys }: Props) => {
  const { value: passkeyDialogOpen, setValue: setPasskeyDialogOpen } = useBoolean();
  const setCurrentPasskey = useAtomSet(editingPasskeyAtom);
  const { deletePasskey } = usePasskeyCRUD();
  const confirm = useConfirm();
  const runtime = useRuntime();
  const runDelete = makeRunClientPromise(runtime, "passkey.delete");

  const handleDelete = async (passkey: PasskeyView) =>
    runDelete(
      Effect.gen(function* () {
        const confirmResult = yield* Effect.tryPromise(() =>
          confirm({
            title: "Are you sure?",
            description: "Are you sure you want to delete this passkey?",
          })
        );

        return yield* Effect.sync(() =>
          Match.value(confirmResult).pipe(
            Match.when({ reason: "confirm" }, () => {
              deletePasskey({ passkey });
              setPasskeyDialogOpen(false);
            }),
            Match.orElse(() => {
              setPasskeyDialogOpen(false);
            })
          )
        );
      })
    );

  return (
    <>
      <PasskeyForm passkeyDialogOpen={passkeyDialogOpen} setPasskeyDialogOpen={setPasskeyDialogOpen} />
      {A.match(passkeys, {
        onEmpty: () => (
          <PasskeysEmpty
            onAdd={() => {
              console.log("on add");
              setPasskeyDialogOpen(true);
            }}
          />
        ),
        onNonEmpty: (passkeys) => (
          <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
            {A.map(passkeys, (passkey) => (
              <PasskeyItem
                key={passkey.id}
                passkey={passkey}
                onUpdate={(passkey) => {
                  setCurrentPasskey(passkey);
                  setPasskeyDialogOpen(true);
                }}
                onDelete={async (passkey) => handleDelete(passkey)}
              />
            ))}
          </List>
        ),
      })}
    </>
  );
};
