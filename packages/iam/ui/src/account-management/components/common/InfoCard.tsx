import Paper, { type PaperProps } from "@mui/material/Paper";
import type React from "react";

interface InfoCardProps extends PaperProps {
  readonly setOpen?: React.Dispatch<React.SetStateAction<boolean>> | null;
  readonly onClick?: () => void;
}

export const InfoCard: React.FC<React.PropsWithChildren<InfoCardProps>> = ({
  sx,
  setOpen,
  onClick,
  children,
  ...props
}) => {
  return (
    <Paper
      {...props}
      variant="elevation"
      elevation={0}
      role="button"
      onClick={() => {
        if (setOpen) {
          setOpen(true);
        } else {
          onClick?.();
        }
      }}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        px: 3,
        py: 2,
        border: "0 !important",
        ...sx,
        ...(setOpen || onClick
          ? {
              "&:hover": {
                cursor: "pointer",
                bgcolor: "background.elevation2",
                "& .iconify": {
                  visibility: "visible",
                },
              },
            }
          : {}),
      }}
    >
      {children}
    </Paper>
  );
};
