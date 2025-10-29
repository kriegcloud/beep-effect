"use client";
import { AnimateBorder } from "@beep/ui/animate";
import { Iconify, Label } from "@beep/ui/atoms";
import { useBoolean, usePathname } from "@beep/ui/hooks";
import { Scrollbar } from "@beep/ui/molecules";
import { useAuthAdapterProvider } from "@beep/ui/providers";
import { RouterLink } from "@beep/ui/routing";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { AccountButton } from "./account-button";
import { UpgradeBlock } from "./nav-upgrade";
import { SignOutButton } from "./sign-out-button";

export type AccountDrawerProps = IconButtonProps & {
  readonly data?: {
    readonly label: string;
    readonly href: string;
    readonly icon?: React.ReactNode;
    readonly info?: React.ReactNode;
    readonly onClick?: () => void;
  }[];
};

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();

  const {
    session: { user },
  } = useAuthAdapterProvider();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderAvatar = () => (
    <AnimateBorder
      sx={{ mb: 2, p: "6px", width: 96, height: 96, borderRadius: "50%" }}
      slotProps={{
        primaryBorder: { size: 120, sx: { color: "primary.main" } },
      }}
    >
      <Avatar src={user?.image ?? ""} alt={user?.name} sx={{ width: 1, height: 1 }}>
        {user?.name?.charAt(0).toUpperCase()}
      </Avatar>
    </AnimateBorder>
  );

  const renderList = () => (
    <MenuList
      disablePadding
      sx={[
        (theme) => ({
          py: 3,
          px: 2.5,
          borderTop: `dashed 1px ${theme.vars.palette.divider}`,
          borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
          "& li": { p: 0 },
        }),
      ]}
    >
      {data.map((option) => {
        const rootLabel = pathname.includes("/dashboard") ? "Home" : "Dashboard";
        const rootHref = pathname.includes("/dashboard") ? "/" : `/dashboard`;

        return (
          <MenuItem key={option.label}>
            <Link
              component={RouterLink}
              href={option.label === "Home" ? rootHref : option.href}
              color="inherit"
              underline="none"
              onClick={option.onClick ?? onClose}
              sx={{
                p: 1,
                width: 1,
                display: "flex",
                typography: "body2",
                alignItems: "center",
                color: "text.secondary",
                "& svg": { width: 24, height: 24 },
                "&:hover": { color: "text.primary" },
              }}
            >
              {option.icon}

              <Box component="span" sx={{ ml: 2 }}>
                {option.label === "Home" ? rootLabel : option.label}
              </Box>

              {option.info && (
                <Label color="error" sx={{ ml: 1 }}>
                  {option.info}
                </Label>
              )}
            </Link>
          </MenuItem>
        );
      })}
    </MenuList>
  );

  return (
    <>
      <AccountButton onClick={onOpen} photoURL={user?.image ?? ""} displayName={user?.name} sx={sx} {...other} />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 320 } },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: "absolute",
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Box
            sx={{
              pt: 8,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            {renderAvatar()}

            <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
              {user?.username}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }} noWrap>
              {user?.email}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              gap: 1,
              flexWrap: "wrap",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/*{Array.from({ length: 3 }, (_, index) => (*/}
            {/*  <Tooltip*/}
            {/*    key={_mock.fullName(index + 1)}*/}
            {/*    title={`Switch to: ${_mock.fullName(index + 1)}`}*/}
            {/*  >*/}
            {/*    <Avatar*/}
            {/*      alt={_mock.fullName(index + 1)}*/}
            {/*      src={_mock.image.avatar(index + 1)}*/}
            {/*      onClick={() => {}}*/}
            {/*    />*/}
            {/*  </Tooltip>*/}
            {/*))}*/}

            <Tooltip title="Add account">
              <IconButton
                sx={[
                  (theme) => ({
                    bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
                    border: `dashed 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.32)}`,
                  }),
                ]}
              >
                <Iconify icon="mingcute:add-line" />
              </IconButton>
            </Tooltip>
          </Box>

          {renderList()}

          <Box sx={{ px: 2.5, py: 3 }}>
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
