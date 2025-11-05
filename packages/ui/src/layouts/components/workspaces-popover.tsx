"use client";

import { Iconify, Label } from "@beep/ui/atoms";
import { usePopover } from "@beep/ui/hooks";
import { Scrollbar } from "@beep/ui/molecules";
import { CustomPopover } from "@beep/ui/organisms";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button, { buttonClasses } from "@mui/material/Button";
import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import type { SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";

export type WorkspacesPopoverProps = ButtonBaseProps & {
  readonly data?:
    | {
        readonly id: string;
        readonly name: string;
        readonly logo: string;
        readonly plan: string;
      }[]
    | undefined;
};

export function WorkspacesPopover({ data = [], sx, ...other }: WorkspacesPopoverProps) {
  const mediaQuery = "sm";

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const [workspace, setWorkspace] = useState(data[0]);

  const handleChangeWorkspace = useCallback(
    (newValue: (typeof data)[0]) => {
      setWorkspace(newValue);
      onClose();
    },
    [onClose]
  );

  const buttonBg: SxProps<Theme> = {
    height: 1,
    zIndex: -1,
    opacity: 0,
    content: "''",
    borderRadius: 1,
    position: "absolute",
    visibility: "hidden",
    bgcolor: "action.hover",
    width: "calc(100% + 8px)",
    transition: (theme) =>
      theme.transitions.create(["opacity", "visibility"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
    ...(open && {
      opacity: 1,
      visibility: "visible",
    }),
  };

  const renderButton = () => (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={[
        {
          py: 0.5,
          gap: { xs: 0.5, [mediaQuery]: 1 },
          "&::before": buttonBg,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="img"
        alt={workspace?.name}
        src={workspace?.logo}
        sx={{ width: 24, height: 24, borderRadius: "50%" }}
      />

      <Box
        component="span"
        sx={{
          typography: "subtitle2",
          display: { xs: "none", [mediaQuery]: "inline-flex" },
        }}
      >
        {workspace?.name}
      </Box>

      <Label
        color={workspace?.plan === "Free" ? "default" : "info"}
        sx={{
          height: 22,
          cursor: "inherit",
          display: { xs: "none", [mediaQuery]: "inline-flex" },
        }}
      >
        {workspace?.plan}
      </Label>

      <Iconify width={16} icon="carbon:chevron-sort" sx={{ color: "text.disabled" }} />
    </ButtonBase>
  );

  const renderMenuList = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        arrow: { placement: "top-left" },
        paper: { sx: { mt: 0.5, ml: -1.55, width: 240 } },
      }}
    >
      <Scrollbar sx={{ maxHeight: 240 }}>
        <MenuList>
          {data.map((option) => (
            <MenuItem
              key={option.id}
              selected={option.id === workspace?.id}
              onClick={() => handleChangeWorkspace(option)}
              sx={{ height: 48 }}
            >
              <Avatar alt={option.name} src={option.logo} sx={{ width: 24, height: 24 }} />

              <Typography noWrap component="span" variant="body2" sx={{ flexGrow: 1, fontWeight: "fontWeightMedium" }}>
                {option.name}
              </Typography>

              <Label color={option.plan === "Free" ? "default" : "info"}>{option.plan}</Label>
            </MenuItem>
          ))}
        </MenuList>
      </Scrollbar>

      <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />

      <Button
        fullWidth
        startIcon={<Iconify width={18} icon="mingcute:add-line" />}
        onClick={() => {
          onClose();
        }}
        sx={{
          gap: 2,
          justifyContent: "flex-start",
          fontWeight: "fontWeightMedium",
          [`& .${buttonClasses.startIcon}`]: {
            m: 0,
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        Create workspace
      </Button>
    </CustomPopover>
  );

  return (
    <>
      {renderButton()}
      {renderMenuList()}
    </>
  );
}
