import { AnimateBorder, transitionTap, varHover, varTap } from "@beep/ui/animate";
import Avatar from "@mui/material/Avatar";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import { m } from "framer-motion";

export type AccountButtonProps = IconButtonProps & {
  photoURL: string;
  displayName: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  return (
    <IconButton
      component={m.button}
      whileTap={varTap(0.96)}
      whileHover={varHover(1.04)}
      transition={transitionTap()}
      aria-label="Account button"
      sx={[{ p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      <AnimateBorder
        sx={{ p: "3px", borderRadius: "50%", width: 40, height: 40 }}
        slotProps={{
          primaryBorder: {
            size: 60,
            width: "1px",
            sx: { color: "primary.main" },
          },
          secondaryBorder: { sx: { color: "warning.main" } },
        }}
      >
        <Avatar src={photoURL} alt={displayName} sx={{ width: 1, height: 1 }}>
          {displayName?.charAt(0).toUpperCase()}
        </Avatar>
      </AnimateBorder>
    </IconButton>
  );
}
