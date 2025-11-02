import { Iconify } from "@beep/ui/atoms";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  type DialogProps,
  DialogTitle,
  dialogClasses,
  IconButton,
} from "@mui/material";
import type { ReactNode } from "react";

// import { useFormContext } from "@beep/ui/form";
interface AccountFormDialogProps extends DialogProps {
  readonly handleDialogClose: () => void;
  readonly subtitle?: ReactNode | undefined;
  readonly handleDiscard?: (() => void) | undefined;
  readonly handleRemove?: (() => void) | undefined;
}

export const AccountFormDialog = (props: AccountFormDialogProps) => {
  const { open, handleDialogClose, title, subtitle, handleDiscard, handleRemove, children, sx } = props;

  // const { handleSubmit, reset,  } = useFormContext();

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={false}
      component="form"
      onSubmit={() => {
        // handleSubmit
      }}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          overflow: "visible",
          ...sx,
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
        {title}
        <IconButton onClick={handleDialogClose}>
          <Iconify icon="material-symbols:close" width={20} height={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        {subtitle && (
          <DialogContentText variant="body2" sx={{ color: "text.secondary", mb: 2, textWrap: "pretty" }}>
            {subtitle}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          justifyContent: "flex-start",
        }}
      >
        {handleRemove && (
          <Button color="error" onClick={handleRemove}>
            Remove
          </Button>
        )}
        <Button
          variant="soft"
          color="neutral"
          onClick={() => {
            if (handleDiscard) {
              handleDiscard();
              return;
            }
            handleDialogClose();
            // reset();
          }}
          sx={{ ml: "auto !important" }}
        >
          Discard
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
