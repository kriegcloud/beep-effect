import { editingPasskeyAtom, useAddPasskeyForm, useUpdatePasskeyForm } from "@beep/iam-sdk";
import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import { Scrollbar } from "@beep/ui/molecules";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type React from "react";

const PasskeyDialog: React.FC<
  React.PropsWithChildren<{
    readonly passkeyDialogOpen: boolean;
    readonly setPasskeyDialogClosed: () => void;
  }>
> = ({ children, passkeyDialogOpen, setPasskeyDialogClosed }) => {
  const theme = useTheme();
  const currentEditingPasskey = useAtomValue(editingPasskeyAtom);
  const flexStyles: SxProps<Theme> = {
    flex: "1 1 auto",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Dialog
      fullWidth
      maxWidth={"xs"}
      open={passkeyDialogOpen}
      onClose={setPasskeyDialogClosed}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      slotProps={{
        paper: {
          sx: {
            display: "flex",
            overflow: "hidden",
            flexDirection: "column",
            "& form": { ...flexStyles, minHeight: 0 },
          },
        },
      }}
    >
      <DialogTitle sx={{ minHeight: 76 }}>
        {passkeyDialogOpen && <> {currentEditingPasskey?.id ? "Edit" : "Add"} passkey</>}
      </DialogTitle>
      {children}
    </Dialog>
  );
};

type PasskeyFormProps = {
  readonly passkeyDialogOpen: boolean;
  readonly setPasskeyDialogOpen: (value: boolean) => void;
};

export const PasskeyForm = ({ passkeyDialogOpen, setPasskeyDialogOpen }: PasskeyFormProps) => {
  const currentPasskey = useAtomValue(editingPasskeyAtom);
  const setCurrentPasskey = useAtomSet(editingPasskeyAtom);
  const handleClose = (formReset: () => void) => {
    setPasskeyDialogOpen(false);
    formReset();
    setCurrentPasskey(undefined);
  };

  const renderPasskeyFrom = () =>
    F.pipe(
      currentPasskey,
      O.fromNullable,
      O.match({
        onNone: () => {
          const { form } = useAddPasskeyForm({
            onDone: handleClose,
          });

          return (
            <Form onSubmit={form.handleSubmit}>
              <Scrollbar sx={{ p: 3, bgcolor: "background.neutral" }}>
                <Stack spacing={3}>
                  <form.AppField name={"name"} children={(field) => <field.Text label={"Name"} />} />
                </Stack>
              </Scrollbar>
              <DialogActions sx={{ flexShrink: 0 }}>
                <Box component="span" sx={{ flexGrow: 1 }} />
                <Button variant={"outlined"} color={"inherit"} onClick={() => handleClose(form.reset)}>
                  Cancel
                </Button>
                <form.AppForm>
                  <form.Submit variant={"contained"}>Save Changes</form.Submit>
                </form.AppForm>
              </DialogActions>
            </Form>
          );
        },
        onSome: (currentPasskey) => {
          const { form } = useUpdatePasskeyForm({
            defaultValues: currentPasskey,
            onDone: handleClose,
          });
          return (
            <Form onSubmit={form.handleSubmit}>
              <Scrollbar sx={{ p: 3, bgcolor: "background.neutral" }}>
                <Stack spacing={3}>
                  <form.AppField name={"name"} children={(field) => <field.Text label={"Name"} />} />
                </Stack>
              </Scrollbar>
              <DialogActions sx={{ flexShrink: 0 }}>
                <Tooltip title={"delete event"}>
                  <IconButton color={"error"} onClick={() => {}} edge={"start"}>
                    <Iconify icon={"solar:trash-bin-trash-bold"} />
                  </IconButton>
                </Tooltip>
                <Box component="span" sx={{ flexGrow: 1 }} />
                <Button variant={"outlined"} color={"inherit"} onClick={() => handleClose(form.reset)}>
                  Cancel
                </Button>
                <form.AppForm>
                  <form.Submit variant={"contained"}>Create</form.Submit>
                </form.AppForm>
              </DialogActions>
            </Form>
          );
        },
      })
    );

  return (
    <PasskeyDialog passkeyDialogOpen={passkeyDialogOpen} setPasskeyDialogClosed={() => setPasskeyDialogOpen(false)}>
      {renderPasskeyFrom()}
    </PasskeyDialog>
  );
};
