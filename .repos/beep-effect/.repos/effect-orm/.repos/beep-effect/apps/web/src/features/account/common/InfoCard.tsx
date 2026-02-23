import type { PaperProps } from "@mui/material";
import { Paper } from "@mui/material";
import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

interface InfoCardProps extends PaperProps {
  readonly setOpen?: undefined | (Dispatch<SetStateAction<boolean>> | null);
  readonly onClick?: (() => void) | undefined;
}

export const InfoCard = ({ sx, setOpen, onClick, children, ...props }: PropsWithChildren<InfoCardProps>) => {
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
                bgcolor: "background.paper",
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
