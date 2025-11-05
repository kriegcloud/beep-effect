import ButtonBase from "@mui/material/ButtonBase";

import SvgIcon from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import type { EditorToolbarItemProps } from "../types";

export function ToolbarItem({ sx, icon, label, active, disabled, ...other }: EditorToolbarItemProps) {
  return (
    <ItemRoot active={active} disabled={Boolean(disabled)} sx={sx ?? {}} {...other}>
      {icon && <SvgIcon sx={{ fontSize: 18 }}>{icon}</SvgIcon>}
      {label && label}
    </ItemRoot>
  );
}

const ItemRoot = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !["active", "disabled", "sx"].includes(prop),
})<Pick<EditorToolbarItemProps, "active" | "disabled">>(({ theme }) => ({
  ...theme.typography.body2,
  width: 28,
  height: 28,
  padding: theme.spacing(0, 0.75),
  borderRadius: Number(theme.shape.borderRadius) * 0.75,
  "&:hover": {
    backgroundColor: theme.vars.palette.action.hover,
  },
  variants: [
    {
      props: { active: true },
      style: {
        backgroundColor: theme.vars.palette.action.selected,
        border: `solid 1px ${theme.vars.palette.action.hover}`,
      },
    },
    {
      props: { disabled: true },
      style: {
        opacity: 0.48,
        pointerEvents: "none",
        cursor: "not-allowed",
      },
    },
  ],
}));
