import ButtonBase from "@mui/material/ButtonBase";

import SvgIcon from "@mui/material/SvgIcon";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import type { EditorToolbarItemProps } from "../types";

// ----------------------------------------------------------------------

export function ToolbarItem({ sx, icon, label, active, disabled, ...other }: EditorToolbarItemProps) {
  const ariaLabel = other["aria-label"];

  const renderItem = () => (
    <ItemRoot disableRipple disableTouchRipple disabled={disabled} active={active} sx={sx} {...other}>
      {icon && <SvgIcon sx={{ fontSize: 18 }}>{icon}</SvgIcon>}
      {label && label}
    </ItemRoot>
  );

  if (ariaLabel) {
    return <Tooltip title={ariaLabel}>{renderItem()}</Tooltip>;
  }

  return renderItem();
}

// ----------------------------------------------------------------------

const ItemRoot = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !["active", "disabled", "sx"].includes(prop),
})<Pick<EditorToolbarItemProps, "active">>(({ theme }) => ({
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
      props: (props) => !!props.active,
      style: {
        backgroundColor: theme.vars.palette.action.selected,
        border: `solid 1px ${theme.vars.palette.action.hover}`,
      },
    },
    {
      props: (props) => !!props.disabled,
      style: {
        opacity: 0.48,
        cursor: "default",
        pointerEvents: "none",
      },
    },
  ],
}));
