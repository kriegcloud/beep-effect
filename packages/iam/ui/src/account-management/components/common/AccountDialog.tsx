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

interface AccountDialogProps extends DialogProps {
  handleDialogClose: () => void;
  subtitle?: ReactNode;
  handleConfirm?: () => void;
  handleDiscard?: () => void;
}

export const AccountDialog = (props: AccountDialogProps) => {
  const { title, subtitle, children, sx, open, handleDialogClose, handleConfirm, handleDiscard } = props;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      scroll="body"
      maxWidth={false}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: "visible",
          maxWidth: 463,
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
      <DialogContent sx={{ pb: 0 }}>
        {subtitle && (
          <DialogContentText variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {subtitle}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
        }}
      >
        <Button variant="outlined" color="neutral" onClick={handleDiscard}>
          Discard
        </Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
