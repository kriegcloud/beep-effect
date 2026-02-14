import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import { ListIcon } from "@phosphor-icons/react";

export function MenuButton({ sx, ...other }: IconButtonProps) {
  return (
    <IconButton sx={sx ?? {}} {...other}>
      <ListIcon size={24} weight="duotone" />
    </IconButton>
  );
}
