import { Iconify } from "@beep/ui/atoms";
import type { DialogProps } from "@mui/material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  dialogClasses,
  IconButton,
} from "@mui/material";
import type { ReactNode } from "react";
import { useFormContext } from "./useAppForm";
export interface FormDialogProps extends DialogProps {
  readonly handleDialogClose: () => void;
  readonly subtitle?: ReactNode | undefined;
  readonly handleDiscard?: (() => void) | undefined;
  readonly handleRemove?: (() => void) | undefined;
}

const FormDialog: React.FC<React.PropsWithChildren<FormDialogProps>> = (props) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit] as const}>
      {([isSubmitting, canSubmit]) => (
        <Dialog
          open={props.open}
          onClose={props.handleDialogClose}
          maxWidth={props.maxWidth ?? false}
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit(event);
          }}
          sx={{
            [`& .${dialogClasses.paper}`]: {
              overflow: "visible",
              ...props.sx,
            },
          }}
        >
          <DialogTitle
            component="h6"
            sx={{
              pt: 3,
              pb: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {props.title}
            <IconButton onClick={props.handleDialogClose}>
              <Iconify icon="material-symbols:close" width={20} height={20} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pb: 3 }}>
            {props.subtitle && (
              <DialogContentText variant="body2" sx={{ color: "text.secondary", mb: 2, textWrap: "pretty" }}>
                {props.subtitle}
              </DialogContentText>
            )}
            {props.children}
          </DialogContent>
          <DialogActions
            sx={{
              p: 3,
              pt: 0,
              justifyContent: "flex-start",
            }}
          >
            {props.handleRemove && (
              <Button color="error" onClick={props.handleRemove}>
                Remove
              </Button>
            )}
            <Button
              variant="soft"
              color="neutral"
              onClick={() => {
                if (props.handleDiscard) {
                  props.handleDiscard();
                  return;
                }
                props.handleDialogClose();
                form.reset();
              }}
              sx={{ ml: "auto !important" }}
            >
              Discard
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={!canSubmit}>
              {isSubmitting ? <CircularProgress size={16} sx={{ color: "inherit" }} /> : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </form.Subscribe>
  );
};

export default FormDialog;
