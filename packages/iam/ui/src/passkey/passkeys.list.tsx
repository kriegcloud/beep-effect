"use client";
import { useUpdatePasskeyForm } from "@beep/iam-sdk";
import type { PasskeyView } from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { PasskeyItem } from "@beep/iam-ui/passkey/passkey.item";
import { Form } from "@beep/ui/form";
import { useBoolean } from "@beep/ui/hooks";
import { SearchNotFound } from "@beep/ui/messages/search-not-found/search-not-found";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import * as A from "effect/Array";

type PasskeyUpdateDialogProps = {
  readonly passkey: PasskeyView.Type;
  readonly updateDialogOpen: boolean;
  readonly closeUpdateDialog: () => void;
};
const PasskeyUpdateDialog = ({ passkey, updateDialogOpen, closeUpdateDialog }: PasskeyUpdateDialogProps) => {
  const { form } = useUpdatePasskeyForm({
    defaultValues: passkey,
    onDone: closeUpdateDialog,
  });
  return (
    <Form onSubmit={form.handleSubmit}>
      <Dialog open={updateDialogOpen}>
        <DialogTitle>Update Passkey</DialogTitle>
        <DialogContent>
          <form.AppField name={"name"} children={(field) => <field.Text />} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              closeUpdateDialog();
              form.reset();
            }}
          >
            Cancel
          </Button>
          <form.AppForm>
            <form.Submit variant={"contained"}>Update Passkey</form.Submit>
          </form.AppForm>
        </DialogActions>
      </Dialog>
    </Form>
  );
};

type Props = {
  readonly passkeys: Array<PasskeyView.Type>;
  readonly onDelete: (passkey: PasskeyView.Type) => void;
};

export const PasskeysList = ({ passkeys, onDelete }: Props) => {
  const { value: updateDialogOpen, setValue: setUpdateDialogOpen } = useBoolean();

  return (
    <List>
      {A.match(passkeys, {
        onEmpty: () => <SearchNotFound />,
        onNonEmpty: (passkeys) =>
          A.map(passkeys, (passkey) => (
            <>
              <PasskeyUpdateDialog
                passkey={passkey}
                updateDialogOpen={updateDialogOpen}
                closeUpdateDialog={() => setUpdateDialogOpen(false)}
              />
              <PasskeyItem
                key={passkey.id}
                passkey={passkey}
                onUpdate={() => {
                  setUpdateDialogOpen(true);
                }}
                onDelete={onDelete}
              />
            </>
          )),
      })}
    </List>
  );
};
