import { Iconify } from "@beep/ui/atoms";

import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import ButtonBase from "@mui/material/ButtonBase";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

type LargeBlockProps = React.ComponentProps<typeof LargeBlockRoot> & {
  title: string;
  tooltip?: string;
  canReset?: boolean;
  onReset?: () => void;
};

const LargeBlockRoot = styled("div")(({ theme }) => ({
  display: "flex",
  position: "relative",
  flexDirection: "column",
  padding: theme.spacing(4, 2, 2, 2),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)}`,
}));

const LargeLabel = styled("span")(({ theme }) => ({
  top: -12,
  lineHeight: "22px",
  borderRadius: "22px",
  position: "absolute",
  alignItems: "center",
  display: "inline-flex",
  padding: theme.spacing(0, 1.25),
  fontSize: theme.typography.pxToRem(13),
  color: theme.vars.palette.common.white,
  fontWeight: theme.typography.fontWeightSemiBold,
  backgroundColor: theme.vars.palette.text.primary,
  ...theme.applyStyles("dark", {
    color: theme.vars.palette.grey[800],
  }),
}));

export function LargeBlock({ sx, title, tooltip, children, canReset, onReset, ...other }: LargeBlockProps) {
  return (
    <LargeBlockRoot sx={sx ?? {}} {...other}>
      <LargeLabel>
        {canReset && (
          <ButtonBase disableRipple onClick={onReset} sx={{ ml: -0.5, mr: 0.5 }}>
            <Iconify width={14} icon="solar:restart-bold" sx={{ opacity: 0.64 }} />
          </ButtonBase>
        )}
        {title}
        {tooltip && (
          <Tooltip title={tooltip} placement="right" arrow>
            <Iconify width={14} icon="eva:info-outline" sx={{ ml: 0.5, mr: -0.5, opacity: 0.48, cursor: "pointer" }} />
          </Tooltip>
        )}
      </LargeLabel>

      {children}
    </LargeBlockRoot>
  );
}

type SmallBlockProps = React.ComponentProps<typeof SmallBlockRoot> & {
  label: string;
  canReset?: boolean;
  onReset?: () => void;
};

const SmallBlockRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

const SmallLabel = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !["canReset", "sx"].includes(prop),
})<{ canReset?: boolean }>(({ theme }) => ({
  cursor: "default",
  lineHeight: "16px",
  pointerEvent: "none",
  alignSelf: "flex-start",
  gap: theme.spacing(0.25),
  fontSize: theme.typography.pxToRem(11),
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
  transition: theme.transitions.create(["color"]),
  variants: [
    {
      props: { canReset: true },
      style: {
        cursor: "pointer",
        pointerEvent: "auto",
        color: theme.vars.palette.text.primary,
        fontWeight: theme.typography.fontWeightBold,
        "&:hover": {
          color: theme.vars.palette.primary.main,
        },
      },
    },
  ],
}));

export function SmallBlock({ label, canReset, onReset, sx, children, ...other }: SmallBlockProps) {
  return (
    <SmallBlockRoot sx={sx ?? {}} {...other}>
      <SmallLabel disableRipple canReset={Boolean(canReset)} onClick={canReset ? onReset : undefined}>
        {canReset && <Iconify width={14} icon="solar:restart-bold" />}
        {label}
      </SmallLabel>
      {children}
    </SmallBlockRoot>
  );
}

export type OptionButtonProps = ButtonBaseProps & {
  selected?: boolean;
};

export function OptionButton({ selected, sx, children, ...other }: OptionButtonProps) {
  return (
    <ButtonBase
      disableRipple
      sx={[
        (theme) => ({
          width: 1,
          borderRadius: 1.5,
          lineHeight: "18px",
          color: "text.disabled",
          border: `solid 1px transparent`,
          fontWeight: "fontWeightSemiBold",
          fontSize: theme.typography.pxToRem(13),
          ...(selected && {
            color: "text.primary",
            bgcolor: "background.paper",
            borderColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
            boxShadow: `-8px 8px 20px -4px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)}`,
            ...theme.applyStyles("dark", {
              boxShadow: `-8px 8px 20px -4px ${rgbaFromChannel(theme.vars.palette.common.blackChannel, 0.12)}`,
            }),
            "& svg": {
              color: "primary.main",
            },
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </ButtonBase>
  );
}
