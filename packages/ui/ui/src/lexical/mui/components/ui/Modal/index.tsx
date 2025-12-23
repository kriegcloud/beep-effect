import { Box, Divider, Modal, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";

export const ModalWrapper = ({
  open,
  onClose,
  children,
  title,
}: PropsWithChildren<{ readonly open: boolean; readonly title: string; readonly onClose: () => void }>) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
        }}
      >
        <Typography sx={{ px: 1 }} id="modal-modal-title" variant="h6" component="h2">
          {title}
        </Typography>
        <Divider />
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    </Modal>
  );
};
