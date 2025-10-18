import { Iconify } from "@beep/ui/atoms";
import { useFormContext } from "@beep/ui/form/useAppForm";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps, dialogClasses } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import type React from "react";

interface AccountFormDialogProps extends DialogProps {
  handleDialogClose: () => void;
  subtitle?: React.ReactNode;
  handleDiscard?: () => void;
  handleRemove?: () => void;
}

export const AccountFormDialog = (props: AccountFormDialogProps) => {
  const { open, handleDialogClose, title, subtitle, handleDiscard, handleRemove, children, sx } = props;

  const { handleSubmit, reset } = useFormContext();

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={false}
      component="form"
      onSubmit={() => handleSubmit()}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
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
          <Iconify icon="material-symbols:close" sx={{ fontSize: 20, color: "neutral.dark" }} />
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
            reset();
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
