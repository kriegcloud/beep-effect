import { Iconify } from "@beep/ui/atoms";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";

export function MenuButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton sx={sx ?? {}} {...other}>
      <Iconify icon="custom:menu-duotone" width={24} />
    </IconButton>
  );
}
