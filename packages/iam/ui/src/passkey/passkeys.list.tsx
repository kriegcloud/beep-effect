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
import React from "react";

type Props = {
  readonly passkeys: ReadonlyArray<PasskeyView.Type>;
};

export const PasskeysList = ({ passkeys }: Props) => {
  const { value: passkeyDialogOpen, setValue: setPasskeyDialogOpen } = useBoolean();
  const setCurrentPasskey = useAtomSet(editingPasskeyAtom);
  const { deletePasskey } = usePasskeyCRUD();
  const confirm = useConfirm();
  const runtime = useRuntime();
  const runDelete = makeRunClientPromise(runtime, "passkey.delete");

  const handleDelete = async (passkey: PasskeyView.Type) =>
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
              deletePasskey({ id: passkey.id });
              setPasskeyDialogOpen(false);
            }),
            Match.orElse(() => {
              setPasskeyDialogOpen(false);
            })
          )
        );
      })
    );

  return A.match(passkeys, {
    onEmpty: () => <PasskeysEmpty onAdd={() => setPasskeyDialogOpen(true)} />,
    onNonEmpty: (passkeys) => (
      <List>
        {A.map(passkeys, (passkey) => (
          <React.Fragment key={passkey.id}>
            <PasskeyForm passkeyDialogOpen={passkeyDialogOpen} setPasskeyDialogOpen={setPasskeyDialogOpen} />
            <PasskeyItem
              key={passkey.id}
              passkey={passkey}
              onUpdate={(passkey) => {
                setCurrentPasskey(passkey);
                setPasskeyDialogOpen(true);
              }}
              onDelete={async (passkey) => handleDelete(passkey)}
            />
          </React.Fragment>
        ))}
      </List>
    ),
  });
};
